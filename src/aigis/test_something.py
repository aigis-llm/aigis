from contextlib import asynccontextmanager

import pytest
from httpx import ASGITransport, AsyncClient
from psycopg import AsyncConnection

from aigis import app
from aigis.utils import postgres_client

pytestmark = [pytest.mark.anyio, pytest.mark.parametrize("anyio_backend", ["asyncio"])]


@pytest.fixture
async def server():
	server = AsyncClient(
		transport=ASGITransport(app=app), base_url="http://localhost:8070"
	)
	yield server
	await server.aclose()


async def test_root(server: AsyncClient):
	response = await server.get("/")
	assert response.status_code == 200
	assert response.text == "null"


async def test_postgres():
	pg: AsyncConnection
	async with asynccontextmanager(postgres_client)(None) as pg:  # pyright: ignore [reportArgumentType] # noqa: F841
		pass
