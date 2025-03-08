from contextlib import asynccontextmanager
from enum import Enum
from uuid import uuid4

import jwt
from chonkie import (  # pyright: ignore [reportMissingTypeStubs]
	RecursiveChunker,
	RecursiveRules,
	SDPMChunker,
)
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from openai import AsyncOpenAI
from pgvector.psycopg import Bit, Vector  # pyright: ignore [reportMissingTypeStubs]
from psycopg import AsyncConnection, sql
from starlette.status import (
	HTTP_202_ACCEPTED,
	HTTP_401_UNAUTHORIZED,
	HTTP_403_FORBIDDEN,
)

from aigis.embeddings import AigisEmbeddings, AigisTokenizer, embed
from aigis.utils import (
	BearerDep,
	OpenAIDep,
	PostgresDep,
	embedding_binary,
	embedding_context,
	embedding_retrieval_prompt,
	get_search_op,
	jwt_secret,
	openai_client,
	pg_impersonate,
	postgres_client,
)

router = APIRouter(
	tags=["stores", "chunkers"],
	responses={404: {"description": "Not found"}},
)


class ChunkerType(str, Enum):
	sdpm = "sdpm"
	recursive = "recursive"


chunker_state = {}


async def chunk_and_upload(
	data: str,
	chunker_type: ChunkerType,
	user_id: str,
	store_id: str,
	user_credentials: str,
	chunker_uuid: str,
):
	chunker = None
	if chunker_type == chunker_type.sdpm:
		chunker = SDPMChunker(
			embedding_model=AigisEmbeddings(),
			threshold=0.5,
			chunk_size=embedding_context,
			min_sentences=1,
			skip_window=1,
		)
	elif chunker_type == chunker_type.recursive:
		chunker = RecursiveChunker(
			tokenizer_or_token_counter=AigisTokenizer(AigisEmbeddings().tokenizer),
			chunk_size=embedding_context,
			rules=RecursiveRules(),
			min_characters_per_chunk=12,
		)
	chunker_state[chunker_uuid] = {"status": "chunking", "owner": user_id}
	chunks = chunker.chunk(data)
	chunker_state[chunker_uuid] = {
		"status": "uploading",
		"owner": user_id,
		"chunks": len(chunks),
	}
	async with (
		asynccontextmanager(postgres_client)(None) as pg,  # pyright: ignore [reportArgumentType]
		asynccontextmanager(openai_client)(None) as openai,  # pyright: ignore [reportArgumentType]
	):
		await pg_impersonate(pg, user_credentials)
		acur = pg.cursor()
		for chunk in chunks:
			if embedding_binary:
				embedding = Bit(await embed(openai, chunk.text))
			else:
				embedding = Vector(await embed(openai, chunk.text))
			_ = await acur.execute(
				sql.SQL(
					"insert into vector_stores.{} (embedding, contents) values (%s, %s);"
				).format(sql.Identifier(f"{store_id}")),
				[embedding, chunk.text],
			)
		await pg.commit()
	chunker_state[chunker_uuid] = {
		"status": "done",
		"owner": user_id,
		"chunks": len(chunks),
	}


async def search_store(
	store: str, openai: AsyncOpenAI, pg: AsyncConnection, query: str
):
	acur = pg.cursor()
	store_index_type = (
		await (
			await acur.execute(
				"select index_type from public.stores_list where name = %s;", [store]
			)
		).fetchone()
		or ["THIS SHOULD NEVER HAPPEN"]
	)[0]
	if store_index_type == "THIS SHOULD NEVER HAPPEN":
		raise HTTPException(
			status_code=404,
			detail={"description": f"Store {store} not found"},
		)
	if store_index_type is None:
		if embedding_binary:
			store_index_type = "bit_hamming_ops"
		else:
			store_index_type = "vector_cosine_ops"
	embedding = None
	if embedding_binary:
		embedding = Bit(await embed(openai, embedding_retrieval_prompt + query))
	else:
		embedding = Vector(await embed(openai, embedding_retrieval_prompt + query))
	embedding_similarity_operator = get_search_op(store_index_type)
	return await (
		await acur.execute(
			sql.SQL(
				"select contents from vector_stores.{} order by embedding {} %s limit 5;"
			).format(sql.Identifier(store), sql.SQL(embedding_similarity_operator)),
			[embedding],
		)
	).fetchall()


@router.post("/stores/{store_id}/add-item-text", status_code=HTTP_202_ACCEPTED)
async def add_item_text(
	store_id: str,
	request: Request,
	chunker_type: ChunkerType,
	pg: PostgresDep,
	auth: BearerDep,
	background_tasks: BackgroundTasks,
):
	if auth is None:  # pyright: ignore [reportUnnecessaryComparison] for some reason it thinks this is always false.
		raise HTTPException(  # pyright: ignore [reportUnreachable]
			status_code=HTTP_401_UNAUTHORIZED,
			headers={"WWW-Authenticate": "Bearer"},
			detail="Authentication needed",
		)
	await pg_impersonate(pg, auth.credentials)
	acur = pg.cursor()
	user_id = str(
		jwt.decode(  # pyright: ignore [reportAny, reportUnknownMemberType]
			auth.credentials, jwt_secret, algorithms=["HS256"], audience="authenticated"
		)["sub"]
	)
	if not store_id.startswith(user_id):
		raise HTTPException(
			status_code=HTTP_403_FORBIDDEN,
			detail=f"You are not the owner of store {store_id}",
		)
	store_exists = (
		await (
			await acur.execute(
				"select to_regclass(%s);", [f'vector_stores."{store_id}"']
			)
		).fetchone()
		or []
	)[0] is not None
	if not store_exists:
		raise HTTPException(
			status_code=404,
			detail={"description": f"Store {store_id} for not found"},
		)
	chunker_id = str(uuid4())
	chunker_state[chunker_id] = {"status": "started", "owner": user_id}
	background_tasks.add_task(
		chunk_and_upload,
		data=(await request.body()).decode("UTF-8"),
		chunker_type=chunker_type,
		user_id=user_id,
		store_id=store_id,
		user_credentials=auth.credentials,
		chunker_uuid=chunker_id,
	)
	return {"monitor_url": f"/chunkers/{chunker_id}/chunker-status"}


@router.get("/stores/{store_id}/search")
async def search_store_api(
	store_id: str,
	query: str,
	pg: PostgresDep,
	openai: OpenAIDep,
	auth: BearerDep,
):
	if auth is None:  # pyright: ignore [reportUnnecessaryComparison] for some reason it thinks this is always false.
		raise HTTPException(  # pyright: ignore [reportUnreachable]
			status_code=HTTP_401_UNAUTHORIZED,
			headers={"WWW-Authenticate": "Bearer"},
			detail="Authentication needed",
		)
	await pg_impersonate(pg, auth.credentials)
	user_id = str(
		jwt.decode(  # pyright: ignore [reportAny, reportUnknownMemberType]
			auth.credentials, jwt_secret, algorithms=["HS256"], audience="authenticated"
		)["sub"]
	)
	acur = pg.cursor()
	store_exists = (
		await (
			await acur.execute(
				"select to_regclass(%s);", [f'vector_stores."{store_id}"']
			)
		).fetchone()
		or []
	)[0] is not None
	if not store_exists:
		raise HTTPException(
			status_code=404,
			detail={"description": f"Store {store_id} for not found"},
		)
	if not store_id.startswith(user_id):
		raise HTTPException(
			status_code=HTTP_403_FORBIDDEN,
			detail=f"You are not the owner of store {store_id}",
		)
	search_results = await search_store(store_id, openai, pg, query)
	return [result[0] for result in search_results]


@router.get("/chunkers/{chunker_id}/chunker-status")
async def get_chunker_status(chunker_id: str, auth: BearerDep) -> object:
	if auth is None:  # pyright: ignore [reportUnnecessaryComparison] for some reason it thinks this is always false.
		raise HTTPException(  # pyright: ignore [reportUnreachable]
			status_code=HTTP_401_UNAUTHORIZED,
			headers={"WWW-Authenticate": "Bearer"},
			detail="Authentication needed",
		)
	user_id = str(
		jwt.decode(  # pyright: ignore [reportAny, reportUnknownMemberType]
			auth.credentials, jwt_secret, algorithms=["HS256"], audience="authenticated"
		)["sub"]
	)
	if chunker_state[chunker_id]:
		if chunker_state[chunker_id]["owner"] == user_id:
			return chunker_state[chunker_id]  # pyright: ignore [reportUnknownVariableType]
		else:
			raise HTTPException(
				status_code=HTTP_403_FORBIDDEN,
				detail=f"You are not the owner of chunker {chunker_id}",
			)
	else:
		raise HTTPException(status_code=404, detail=f"No chunker with id {chunker_id}")
