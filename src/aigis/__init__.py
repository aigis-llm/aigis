import os
from typing import Any, AsyncGenerator, Annotated, Coroutine
from fastapi import FastAPI, Request, Depends
from fastapi.responses import PlainTextResponse
from supabase import create_async_client, AsyncClient, AsyncClientOptions


supabase_url: str = os.environ.get("AIGIS_SUPABASE_URL", "http://localhost:8068")
supabase_key: str = os.environ.get(
	"AIGIS_SUPABASE_KEY",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
)
app = FastAPI()


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

SupabaseDep = Annotated[AsyncClient, Depends(supabase_client)]


@app.get("/")
async def hello_world(supa: SupabaseDep):
	return "Hello, World!"
