import os
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI

from supabase import AsyncClient, AsyncClientOptions, create_async_client

supabase_url: str = os.environ.get("AIGIS_SUPABASE_URL", "http://localhost:8068")
supabase_key: str = os.environ.get(
	"AIGIS_SUPABASE_KEY",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
)
openai_url = os.environ.get("OPENAI_URL", "https://api.openai.com/v1")
openai_key = os.environ.get("OPENAI_API_KEY", "your_api_key_here")
app = FastAPI()

origins = [os.environ.get("AIGIS_FRONTEND_URL", "http://localhost:8071")]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
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


SupabaseDep = Annotated[AsyncClient, Depends(supabase_client)]
OpenAIDep = Annotated[AsyncOpenAI, Depends(openai_client)]


@app.get("/")
async def hello_world(request: Request, _supa: SupabaseDep):
	return request.headers.get("Authorization")
