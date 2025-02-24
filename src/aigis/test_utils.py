from aigis.utils import get_search_op


def test_get_search_op():
	assert get_search_op("l2_ops") == "<->"
	assert get_search_op("ip_ops") == "<#>"
	assert get_search_op("cosine_ops") == "<=>"
	assert get_search_op("l1_ops") == "<+>"
	assert get_search_op("bit_hamming_ops") == "<~>"
	assert get_search_op("bit_jaccard_ops") == "<%%>"
