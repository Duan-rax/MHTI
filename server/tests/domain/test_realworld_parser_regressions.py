"""Regression tests derived from filenames that failed on an MHTI deployment."""

import pytest

from server.domain.parsing.parser_service import ParserService


@pytest.fixture
def parser_service() -> ParserService:
    return ParserService()


@pytest.mark.parametrize(
    "filename,expected_name,expected_episode",
    [
        ("[字幕组][720P][QueenBee]PINKERTON VOL.3.mp4", "PINKERTON", 3),
        ("[字幕组][720P][QueenBee]ImplicityII［东山翔］.mp4", "ImplicityII", None),
        ("[字幕组][720P][Animan]SWAMPSTAMPAnimeEdition.mp4", "SWAMPSTAMP", None),
        (
            "[字幕组][720P][铃木みら乃petit]自宅警备员1stミッションイイナリ巨乳长女.mp4",
            "自宅警备员",
            1,
        ),
        ("[字幕组][720P][EDGE]魔獣浄化少女ウテアsoul.3loveaffair.mp4", "魔獣浄化少女ウテア", 3),
        (
            "[字幕组][720P][Collaborationworks]"
            "気に入った膣にいきなり中出しOKなリゾート岛 part1.mp4",
            "気に入った膣にいきなり中出しOKなリゾート岛",
            1,
        ),
        (
            "[字幕组][720P][铃木みら乃]かぎろひ～勺景～Another 第一夜.mp4",
            "かぎろひ～勺景～Another",
            1,
        ),
        ("[字幕组][720P][GOLDBEAR]龙堂寺士门の淫谋 前编.mp4", "龙堂寺士门の淫谋", 1),
    ],
)
def test_realworld_release_names(parser_service, filename, expected_name, expected_episode):
    parsed = parser_service.parse(filename)

    assert parsed.series_name == expected_name
    assert parsed.episode == expected_episode
