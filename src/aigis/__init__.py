import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from aigis.utils import SupabaseDep
from aigis.vector_stores import router as vector_router

app = FastAPI()

origins = [os.environ.get("AIGIS_FRONTEND_URL", "http://localhost:8071")]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(vector_router)


@app.get("/")
async def hello_world(request: Request, _supa: SupabaseDep):
	return request.headers.get("Authorization")
