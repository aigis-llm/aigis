import numpy as np
import openai_responses
import pytest
from openai import AsyncOpenAI
from openai_responses import OpenAIMock

from aigis.embeddings import AigisEmbeddings, embed


def monkeypatch_setup(monkeypatch: pytest.MonkeyPatch, dimensions: int, binary: bool):
	monkeypatch.setattr("aigis.embeddings.openai_url", "https://api.openai.com/v1")
	monkeypatch.setattr("aigis.embeddings.embedding_model", "fake_embeddings")
	monkeypatch.setattr("aigis.embeddings.embedding_mrl_dimensions", dimensions)
	monkeypatch.setattr("aigis.embeddings.embedding_binary", binary)
	monkeypatch.setattr("aigis.embeddings.embedding_tokenizer_model", "cl100k_base")
	monkeypatch.setattr("aigis.embeddings.embedding_tokenizer_backend", "tiktoken")


@openai_responses.mock()
def test_regular_embed(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 4, False)
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
	embeddings = AigisEmbeddings()
	assert np.all(
		embeddings.embed("Hello") == np.array([0.1, -0.5, 0.4, -0.7], dtype=np.float64)  # pyright: ignore [reportUnknownMemberType, reportAny]
	)


@openai_responses.mock()
def test_mrl_embed(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 2, False)
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
	embeddings = AigisEmbeddings()
	assert np.all(embeddings.embed("Hello") == np.array([0.1, -0.5], dtype=np.float64))  # pyright: ignore [reportUnknownMemberType, reportAny]


@openai_responses.mock()
def test_binary_embed(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
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
	embeddings = AigisEmbeddings()
	assert np.all(
		embeddings.embed("Hello") == np.array([True, False, True, False], dtype=np.bool)  # pyright: ignore [reportUnknownMemberType, reportAny]
	)


@openai_responses.mock()
def test_batch_embed(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 4, False)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 0,
			},
			{
				"object": "embedding",
				"embedding": [0.2, -0.6, 0.5, -0.8],
				"index": 1,
			},
		],
	}
	embeddings = AigisEmbeddings()
	batch_embeddings = embeddings.embed_batch(["Hello", "World"])  # pyright: ignore [reportUnknownMemberType, reportUnknownVariableType]
	assert np.all(
		batch_embeddings[0] == np.array([0.1, -0.5, 0.4, -0.7], dtype=np.float64)  # pyright: ignore [reportAny]
	)
	assert np.all(
		batch_embeddings[1] == np.array([0.2, -0.6, 0.5, -0.8], dtype=np.float64)  # pyright: ignore [reportAny]
	)


@openai_responses.mock()
def test_batch_embed_binary(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 4, True)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 0,
			},
			{
				"object": "embedding",
				"embedding": [0.2, -0.6, 0.5, -0.8],
				"index": 1,
			},
		],
	}
	embeddings = AigisEmbeddings()
	batch_embeddings = embeddings.embed_batch(["Hello", "World"])  # pyright: ignore [reportUnknownMemberType, reportUnknownVariableType]
	assert np.all(
		batch_embeddings[0] == np.array([True, False, True, False], dtype=np.bool)  # pyright: ignore [reportAny]
	)
	assert np.all(
		batch_embeddings[1] == np.array([True, False, True, False], dtype=np.bool)  # pyright: ignore [reportAny]
	)


def test_tokenizer_tiktoken(monkeypatch: pytest.MonkeyPatch):
	monkeypatch_setup(monkeypatch, 4, False)
	embeddings = AigisEmbeddings()
	assert embeddings.count_tokens("hello world") == 2


def test_tokenizer_autotiktokenizer(monkeypatch: pytest.MonkeyPatch):
	monkeypatch_setup(monkeypatch, 4, False)
	monkeypatch.setattr(
		"aigis.embeddings.embedding_tokenizer_model",
		"mixedbread-ai/mxbai-embed-large-v1",
	)
	monkeypatch.setattr(
		"aigis.embeddings.embedding_tokenizer_backend", "autotiktokenizer"
	)
	embeddings = AigisEmbeddings()
	assert embeddings.count_tokens("hello world") == 3


def test_tokenizer_tiktoken_batch(monkeypatch: pytest.MonkeyPatch):
	monkeypatch_setup(monkeypatch, 4, False)
	embeddings = AigisEmbeddings()
	assert embeddings.count_tokens_batch(["hello", "world"]) == [1, 1]


def test_dimension(monkeypatch: pytest.MonkeyPatch):
	monkeypatch_setup(monkeypatch, 4, False)
	embeddings = AigisEmbeddings()
	assert embeddings.dimension == 4


def test_init_error(monkeypatch: pytest.MonkeyPatch):
	monkeypatch_setup(monkeypatch, 4, False)
	monkeypatch.setattr("aigis.embeddings.embedding_tokenizer_backend", "not_a_backend")
	with pytest.raises(
		NotImplementedError, match="Invalid tokenizer backend not_a_backend"
	):
		embeddings = AigisEmbeddings()  # noqa: F841


@openai_responses.mock()
def test_similarity_float(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 4, False)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 0,
			},
			{
				"object": "embedding",
				"embedding": [0.2, -0.6, 0.5, -0.8],
				"index": 1,
			},
		],
	}
	embeddings = AigisEmbeddings()
	batch_embeddings = embeddings.embed_batch(["Hello", "World"])  # pyright: ignore [reportUnknownMemberType, reportUnknownVariableType]
	assert (
		embeddings.similarity(batch_embeddings[0], batch_embeddings[1])  # pyright: ignore [reportUnknownMemberType]
		== 0.9968004013455594
	)


@openai_responses.mock()
def test_similarity_binary(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 4, True)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 0,
			},
			{
				"object": "embedding",
				"embedding": [0.2, -0.6, 0.5, -0.8],
				"index": 1,
			},
		],
	}
	embeddings = AigisEmbeddings()
	batch_embeddings = embeddings.embed_batch(["Hello", "World"])  # pyright: ignore [reportUnknownMemberType, reportUnknownVariableType]
	assert embeddings.similarity(batch_embeddings[0], batch_embeddings[1]) == 1  # pyright: ignore [reportUnknownMemberType]


@openai_responses.mock()
@pytest.mark.anyio
@pytest.mark.parametrize("anyio_backend", ["asyncio"])
async def test_async_embed(monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock):
	monkeypatch_setup(monkeypatch, 4, False)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 1,
			},
		],
	}
	openai = AsyncOpenAI(api_key="", base_url="https://api.openai.com/v1")
	assert (await embed(openai, "Hello")) == [0.1, -0.5, 0.4, -0.7]


@openai_responses.mock()
@pytest.mark.anyio
@pytest.mark.parametrize("anyio_backend", ["asyncio"])
async def test_async_embed_binary(
	monkeypatch: pytest.MonkeyPatch, openai_mock: OpenAIMock
):
	monkeypatch_setup(monkeypatch, 4, True)
	openai_mock.embeddings.create.response = {
		"model": "fake_embeddings",
		"data": [
			{
				"object": "embedding",
				"embedding": [0.1, -0.5, 0.4, -0.7],
				"index": 1,
			},
		],
	}
	openai = AsyncOpenAI(api_key="", base_url="https://api.openai.com/v1")
	assert np.all(
		(await embed(openai, "Hello"))
		== np.array([True, False, True, False], dtype=np.bool)
	)
