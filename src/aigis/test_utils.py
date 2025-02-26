import uuid
from contextlib import asynccontextmanager

import jwt
import pytest
from psycopg import AsyncConnection

from aigis.utils import get_search_op, jwt_secret, pg_impersonate, postgres_client


def test_get_search_op():
	assert get_search_op("l2_ops") == "<->"
	assert get_search_op("ip_ops") == "<#>"
	assert get_search_op("cosine_ops") == "<=>"
	assert get_search_op("l1_ops") == "<+>"
	assert get_search_op("bit_hamming_ops") == "<~>"
	assert get_search_op("bit_jaccard_ops") == "<%%>"


@pytest.mark.anyio
@pytest.mark.parametrize("anyio_backend", ["asyncio"])
async def test_pg_impersonate():
	pg: AsyncConnection
	async with asynccontextmanager(postgres_client)(None) as pg:  # pyright: ignore [reportArgumentType]
		auth = jwt.encode(  # pyright: ignore [reportUnknownMemberType]
			{
				"iss": "pytest",
				"aud": "authenticated",
				"sub": str(uuid.uuid5(uuid.NAMESPACE_DNS, "nonexistentuser1")),
			},
			jwt_secret,
			algorithm="HS256",
		)
		await pg_impersonate(pg, auth)
		assert (await (await pg.execute("select current_user;")).fetchone())[  # pyright: ignore [reportOptionalSubscript]
			0
		] == "authenticated"
