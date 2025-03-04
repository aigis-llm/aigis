import uuid
from contextlib import asynccontextmanager
from urllib.parse import quote_plus

import jwt
import openai_responses
import pytest
from httpx import ASGITransport, AsyncClient
from openai_responses import OpenAIMock
from psycopg import AsyncConnection

from aigis import app
from aigis.utils import jwt_secret, pg_impersonate, postgres_client
from aigis.vector_stores import ChunkerType, chunk_and_upload

pytestmark = [pytest.mark.anyio, pytest.mark.parametrize("anyio_backend", ["asyncio"])]


@pytest.fixture
async def server():
	server = AsyncClient(
		transport=ASGITransport(app=app), base_url="http://localhost:8070"
	)
	yield server
	await server.aclose()


nonexistentuser1_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, "nonexistentuser1"))


def monkeypatch_setup(monkeypatch: pytest.MonkeyPatch, dimensions: int, binary: bool):
	monkeypatch.setattr("aigis.utils.openai_url", "https://api.openai.com/v1")
	monkeypatch.setattr("aigis.utils.embedding_model", "fake_embeddings")
	monkeypatch.setattr("aigis.utils.embedding_mrl_dimensions", dimensions)
	monkeypatch.setattr("aigis.utils.embedding_binary", binary)
	monkeypatch.setattr("aigis.vector_stores.embedding_binary", binary)
	monkeypatch.setattr("aigis.utils.embedding_tokenizer_model", "cl100k_base")
	monkeypatch.setattr("aigis.utils.embedding_tokenizer_backend", "tiktoken")


auth = jwt.encode(  # pyright: ignore [reportUnknownMemberType]
	{
		"iss": "pytest",
		"aud": "authenticated",
		"sub": nonexistentuser1_uuid,
	},
	jwt_secret,
	algorithm="HS256",
)


async def test_create_store():
	pg: AsyncConnection
	async with asynccontextmanager(postgres_client)(None) as pg:  # pyright: ignore [reportArgumentType]
		await pg_impersonate(pg, auth)
		_ = await pg.execute("select public.create_store('test', 'bit', 4, 'test');")
		await pg.commit()
		assert (
			await (
				await pg.execute(
					"select * from public.stores_list where name = %s;",
					[f"{nonexistentuser1_uuid}_test"],
				)
			).fetchone()
		) == (
			1,
			nonexistentuser1_uuid,
			f"{nonexistentuser1_uuid}_test",
			"bit",
			4,
			None,
			"test",
		)


@openai_responses.mock()
async def test_chunk_and_upload(
	monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock
):
	monkeypatch_setup(monkeypatch, 4, True)
	chunker_id = str(uuid.uuid4())
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 0,
			}
		],
	}
	await chunk_and_upload(
		"Hello World!",
		ChunkerType.recursive,
		nonexistentuser1_uuid,
		f"{nonexistentuser1_uuid}_test",
		auth,
		chunker_id,
	)


@openai_responses.mock()
async def test_search(
	monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock, server: AsyncClient
):
	monkeypatch_setup(monkeypatch, 4, True)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 0,
			}
		],
	}
	response = await server.get(
		f"/stores/{nonexistentuser1_uuid}_test/search?query={quote_plus('Hello World')}",
		headers={"Authorization": f"Bearer {auth}"},
	)
	assert response.json() == ["Hello World!"]
