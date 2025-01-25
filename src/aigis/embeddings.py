from typing import override

import numpy as np
import tiktoken
from autotiktokenizer import (  # pyright: ignore [reportMissingTypeStubs]
	AutoTikTokenizer,
)
from chonkie import BaseEmbeddings  # pyright: ignore [reportMissingTypeStubs]
from openai import OpenAI

from aigis.utils import (
	embedding_binary,
	embedding_model,
	embedding_mrl_dimensions,
	embedding_tokenizer_backend,
	embedding_tokenizer_model,
	openai_key,
	openai_url,
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

	def to_binary(self, float: float):
		if float <= 0:
			return False
		else:
			return True

	@override
	def embed(self, text: str) -> "np.ndarray":  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
		embeddings = np.array(
			self.openai.embeddings.create(model=embedding_model, input=text)
			.data[0]
			.embedding[:embedding_mrl_dimensions]
		)
		if embedding_binary:
			return np.array(list(map(self.to_binary, embeddings)))
		else:
			return embeddings

	@override
	def count_tokens(self, text: str) -> int:
		return len(self.tokenizer.encode(text))

	@override
	def count_tokens_batch(self, texts: list[str]) -> list[int]:
		return [len(tokens) for tokens in self.tokenizer.encode_batch(texts)]

	@override
	def embed_batch(self, texts: list[str]) -> list["np.ndarray"]:  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
		def postprocess(embeddings: "np.ndarray"):  # pyright: ignore [reportUnknownParameterType, reportMissingTypeArgument]
			if embedding_binary:
				return np.array(list(map(self.to_binary, embeddings)), dtype=np.bool)  # pyright: ignore [reportUnknownArgumentType]
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
