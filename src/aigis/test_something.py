import pytest
from httpx import ASGITransport, AsyncClient

from aigis import app

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
