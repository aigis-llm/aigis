import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from aigis.utils import SupabaseDep

app = FastAPI()

origins = [os.environ.get("AIGIS_FRONTEND_URL", "http://localhost:8071")]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/")
async def hello_world(request: Request, _supa: SupabaseDep):
	return request.headers.get("Authorization")
