import numpy as np
import openai_responses
import pytest
from openai_responses import OpenAIMock

from aigis.embeddings import AigisEmbeddings


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
