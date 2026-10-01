"""Tests for collection folder date extraction and metadata matching."""

from datetime import date

import pytest

from server.application.scraping.metadata_resolver import ScraperMetadataResolver
from server.domain.parsing.parser_service import ParserService
from server.domain.parsing.release_date import extract_collection_date
from server.models.tmdb import TMDBEpisode, TMDBSearchResult


@pytest.mark.parametrize(
    "path,expected",
    [
        ("/media/[桜都字幕组]2017年10月合集/title.mp4", (2017, 10)),
        ("/media/TMDB-TEST-2019-12/title.mp4", (2019, 12)),
        ("/media/TMDB-CHS-2018/title.mp4", (2018, None)),
        (r"D:\media\2016年9月合集\title.mp4", (2016, 9)),
    ],
)
def test_extract_collection_date(path, expected):
    assert extract_collection_date(path) == expected


def test_parser_exposes_collection_year_and_month():
    parsed = ParserService().parse(
        "作品名.mp4",
        "/media/[桜都字幕组]2017年10月合集/作品名.mp4",
    )

    assert parsed.year == 2017
    assert parsed.month == 10


def test_select_unique_search_result_by_collection_month():
    results = [
        TMDBSearchResult(id=1, name="A", first_air_date=date(2017, 9, 1), adult=True),
        TMDBSearchResult(id=2, name="B", first_air_date=date(2017, 10, 20), adult=True),
    ]

    selected = ScraperMetadataResolver.select_unique_search_result_by_date(results, 2017, 10)

    assert selected is not None
    assert selected.id == 2


def test_search_date_match_stays_manual_when_ambiguous():
    results = [
        TMDBSearchResult(id=1, name="A", first_air_date=date(2017, 10, 1), adult=True),
        TMDBSearchResult(id=2, name="B", first_air_date=date(2017, 10, 20), adult=True),
    ]

    assert ScraperMetadataResolver.select_unique_search_result_by_date(results, 2017, 10) is None


def test_select_unique_episode_by_collection_month():
    episodes = [
        TMDBEpisode(episode_number=1, name="one", air_date=date(2017, 9, 1)),
        TMDBEpisode(episode_number=2, name="two", air_date=date(2017, 10, 20)),
    ]

    selected = ScraperMetadataResolver.select_unique_episode_by_date(episodes, 2017, 10)

    assert selected is not None
    assert selected.episode_number == 2
