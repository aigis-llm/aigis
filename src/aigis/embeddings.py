from collections.abc import Collection, Set
from typing import Literal, override

import numpy as np
import tiktoken
from autotiktokenizer import (  # pyright: ignore [reportMissingTypeStubs]
	AutoTikTokenizer,
)
from chonkie import BaseEmbeddings  # pyright: ignore [reportMissingTypeStubs]
from openai import AsyncOpenAI, OpenAI
from unidecode import unidecode

from aigis.utils import (
	embedding_binary,
	embedding_model,
	embedding_mrl_dimensions,
	embedding_tokenizer_backend,
	embedding_tokenizer_model,
	openai_key,
	openai_url,
	to_binary,
)


class AigisTokenizer(tiktoken.core.Encoding):
	def __init__(self, base: tiktoken.core.Encoding):  # pyright: ignore [reportMissingSuperCall]
		self.__class__ = type(  # pyright: ignore [reportAttributeAccessIssue, reportUnannotatedClassAttribute]
			"tiktokenEncodingWrapped", (self.__class__, base.__class__), {}
		)
		self.__dict__ = base.__dict__  # pyright: ignore [reportUnannotatedClassAttribute]

	@override
	def encode(
		self,
		text: str,
		*,
		allowed_special: Literal["all"] | Set[str] = set(),  # pyright: ignore [reportCallInDefaultInitializer]
		disallowed_special: Literal["all"] | Collection[str] = "all",
	) -> list[int]:
		return super().encode(
			unidecode(text).lower(),
			allowed_special=allowed_special,
			disallowed_special=disallowed_special,
		)


class AigisEmbeddings(BaseEmbeddings):
	openai: OpenAI
	tokenizer: tiktoken.core.Encoding

	def __init__(self):
		super().__init__()
		self.openai = OpenAI(api_key=openai_key, base_url=openai_url)
		if embedding_tokenizer_backend == "tiktoken":
			self.tokenizer = tiktoken.get_encoding(embedding_tokenizer_model)
		elif embedding_tokenizer_backend == "autotiktokenizer":
			self.tokenizer = AutoTikTokenizer.from_pretrained(embedding_tokenizer_model)
		else:
			raise NotImplementedError(
				f"Invalid tokenizer backend {embedding_tokenizer_backend}"
			)

	@property
	@override
	def dimension(self) -> int:
		return embedding_mrl_dimensions

	@override
	def embed(self, text: str) -> "np.ndarray":  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
		embeddings = np.array(
			self.openai.embeddings.create(model=embedding_model, input=text)
			.data[0]
			.embedding[:embedding_mrl_dimensions]
		)
		if embedding_binary:
			return np.array(list(map(to_binary, embeddings)))
		else:
			return embeddings

	@override
	def count_tokens(self, text: str) -> int:
		return len(self.tokenizer.encode(unidecode(text).lower()))

	@override
	def count_tokens_batch(self, texts: list[str]) -> list[int]:
		return [
			len(tokens)
			for tokens in self.tokenizer.encode_batch(
				[unidecode(text).lower() for text in texts]
			)
		]

	@override
	def embed_batch(self, texts: list[str]) -> list["np.ndarray"]:  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
		def postprocess(embeddings: "np.ndarray"):  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
			if embedding_binary:
				return np.array(list(map(to_binary, embeddings)), dtype=np.bool)  # pyright: ignore [reportUnknownArgumentType]
			else:
				return embeddings  # pyright: ignore [reportUnknownVariableType]

		return [  # pyright: ignore [reportUnknownVariableType]
			postprocess(np.array(embedding.embedding[:embedding_mrl_dimensions]))
			for embedding in self.openai.embeddings.create(
				model=embedding_model, input=texts
			).data
		]

	@override
	def similarity(self, u: "np.ndarray", v: "np.ndarray") -> float:  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
		if embedding_binary:
			return np.count_nonzero(u == v) / embedding_mrl_dimensions  # pyright: ignore [reportAny]
		else:
			return float(
				np.dot(u, v.T) / (np.linalg.norm(u) * np.linalg.norm(v))  # pyright: ignore [reportUnknownArgumentType, reportUnknownMemberType, reportAny]
			)  # cosine similarity

	@override
	def get_tokenizer_or_token_counter(self):
		return self.count_tokens


async def embed(openai: AsyncOpenAI, text: str):
	embed_response = (
		(await openai.embeddings.create(input=text, model=embedding_model))
		.data[0]
		.embedding[:embedding_mrl_dimensions]
	)
	if embedding_binary:
		return np.array(list(map(to_binary, embed_response)))
	else:
		return embed_response
