"""Tests for East Asian TMDB search query fallbacks."""

from server.domain.metadata.search_queries import build_search_queries


def test_build_search_queries_keeps_original_first():
    queries = build_search_queries("Breaking Bad")

    assert queries[0] == "Breaking Bad"


def test_build_search_queries_adds_traditional_japanese_variant():
    queries = build_search_queries("牝教师4～秽された教坛～")

    assert any("牝教師4" in query and "穢" in query and "壇" in query for query in queries)


def test_build_search_queries_adds_short_title_stem():
    queries = build_search_queries("贵方ハ私ノモノ-ドS彼女とドM彼氏")

    assert "貴方ハ私ノモノ" in queries


def test_build_search_queries_is_bounded_and_unique():
    queries = build_search_queries("自宅警备员1stミッションイイナリ巨乳长女")

    assert len(queries) <= 6
    assert len({query.casefold() for query in queries}) == len(queries)
