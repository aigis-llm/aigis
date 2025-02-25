import os
from collections.abc import AsyncGenerator
from typing import Annotated, LiteralString

from fastapi import Depends, Request
from openai import AsyncOpenAI
from pgvector.psycopg import (  # pyright: ignore [reportMissingTypeStubs]
	register_vector_async,  # pyright: ignore [reportUnknownVariableType]
)
from psycopg import AsyncConnection

from supabase import AsyncClient, AsyncClientOptions, create_async_client

supabase_url: str = os.environ.get("AIGIS_SUPABASE_URL", "http://localhost:8068")
supabase_key: str = os.environ.get(
	"AIGIS_SUPABASE_KEY",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
)
openai_url = os.environ.get("OPENAI_URL", "https://api.openai.com/v1")
openai_key = os.environ.get("OPENAI_API_KEY", "your_api_key_here")
openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o")
embedding_model = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
embedding_dimensions = os.environ.get("AIGIS_EMBEDDING_DIMENSIONS", 1536)
embedding_mrl_dimensions = int(
	os.environ.get("AIGIS_EMBEDDING_MRL_DIMENSIONS", embedding_dimensions)
)
embedding_binary = os.environ.get("AIGIS_EMBEDDING_BINARY", "false") == "true"
embedding_tokenizer_backend = os.environ.get("EMBEDDING_TOKENIZER_BACKEND", "tiktoken")
embedding_tokenizer_model = os.environ.get("EMBEDDING_TOKENIZER_MODEL", "cl100k_base")
embedding_context = int(os.environ.get("EMBEDDING_CONTEXT", "8191"))
embedding_retrieval_prompt = os.environ.get("EMBEDDING_RETRIEVAL_PROMPT", "")
postgres_url = os.environ.get(
	"POSTGRES_URL", "postgresql://postgres:postgres@127.0.0.1:8067/postgres"
)


async def supabase_client(request: Request) -> AsyncGenerator[AsyncClient]:
	supa = await create_async_client(
		supabase_url=supabase_url,
		supabase_key=supabase_key,
		options=AsyncClientOptions(
			headers={
				"Authorization": request.headers.get(
					"Authorization", f"Bearer {supabase_key}"
				)
			}
		),
	)
	try:
		yield supa
	finally:
		pass


async def openai_client(_request: Request) -> AsyncGenerator[AsyncOpenAI]:
	openai = AsyncOpenAI(api_key=openai_key, base_url=openai_url)
	try:
		yield openai
	finally:
		pass


async def postgres_client(_request: Request) -> AsyncGenerator[AsyncConnection]:
	conn = await AsyncConnection.connect(postgres_url)
	await register_vector_async(conn)
	try:
		yield conn
	finally:
		await conn.close()


SupabaseDep = Annotated[AsyncClient, Depends(supabase_client)]
OpenAIDep = Annotated[AsyncOpenAI, Depends(openai_client)]
PostgresDep = Annotated[AsyncConnection, Depends(postgres_client)]


def to_binary(float: float):
	if float <= 0:
		return False
	else:
		return True


def get_search_op(index_type: str) -> LiteralString:
	match index_type:
		case "l2_ops":
			return "<->"
		case "ip_ops":
			return "<#>"
		case "cosine_ops":
			return "<=>"
		case "l1_ops":
			return "<+>"
		case "bit_hamming_ops":
			return "<~>"
		case "bit_jaccard_ops":
			return "<%%>"
		case _:
			raise NotImplementedError(f"No operation for type {index_type}")
