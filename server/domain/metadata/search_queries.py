"""Build conservative TMDB search fallbacks for East Asian release names."""

from __future__ import annotations

import re
import unicodedata
from functools import lru_cache

try:
    from opencc import OpenCC
except ImportError:  # pragma: no cover - production dependency, fallback keeps upgrades safe
    OpenCC = None  # type: ignore[assignment,misc]


# Small built-in safety net for partially upgraded installations.  OpenCC provides
# the complete conversion table; these are the high-frequency substitutions seen
# in real SakuraTo release names.
_FALLBACK_S2T = str.maketrans(
    {
        "爱": "愛",
        "备": "備",
        "编": "編",
        "场": "場",
        "长": "長",
        "触": "觸",
        "从": "從",
        "达": "達",
        "岛": "島",
        "发": "發",
        "个": "個",
        "关": "關",
        "华": "華",
        "欢": "歡",
        "会": "會",
        "间": "間",
        "洁": "潔",
        "结": "結",
        "剧": "劇",
        "来": "來",
        "炼": "煉",
        "灵": "靈",
        "龙": "龍",
        "乱": "亂",
        "门": "門",
        "谋": "謀",
        "骑": "騎",
        "强": "強",
        "亲": "親",
        "让": "讓",
        "圣": "聖",
        "师": "師",
        "书": "書",
        "说": "說",
        "体": "體",
        "为": "為",
        "卫": "衛",
        "险": "險",
        "乡": "鄉",
        "写": "寫",
        "学": "學",
        "园": "園",
        "员": "員",
        "脏": "髒",
        "战": "戰",
        "贞": "貞",
        "这": "這",
        "职": "職",
        "转": "轉",
        "浊": "濁",
        "总": "總",
        "丽": "麗",
        "梦": "夢",
        "气": "氣",
        "伤": "傷",
        "阴": "陰",
        "阳": "陽",
        "诱": "誘",
        "拥": "擁",
        "忧": "憂",
        "贵": "貴",
        "秽": "穢",
        "坛": "壇",
        "话": "話",
        "后": "後",
        "惊": "驚",
        "张": "張",
        "铃": "鈴",
        "饲": "飼",
        "获": "獲",
    }
)

# Convert characters that differ between Simplified Chinese and Japanese
# shinjitai without over-converting already-correct Japanese characters such
# as 学/国/触 to Traditional Chinese 學/國/觸.
_S2J = str.maketrans(
    {
        "爱": "愛",
        "备": "備",
        "编": "編",
        "场": "場",
        "长": "長",
        "岛": "島",
        "发": "発",
        "关": "関",
        "华": "華",
        "洁": "潔",
        "结": "結",
        "剧": "劇",
        "炼": "煉",
        "灵": "霊",
        "龙": "龍",
        "门": "門",
        "谋": "謀",
        "骑": "騎",
        "强": "強",
        "圣": "聖",
        "师": "師",
        "为": "為",
        "园": "園",
        "员": "員",
        "战": "戦",
        "转": "転",
        "浊": "濁",
        "贵": "貴",
        "秽": "穢",
        "坛": "壇",
        "话": "話",
        "后": "後",
        "惊": "驚",
        "铃": "鈴",
        "饲": "飼",
        "达": "達",
        "诱": "誘",
        "拥": "擁",
        "阴": "陰",
        "忧": "憂",
    }
)

_KNOWN_GLUE_PREFIXES = (
    re.compile(r"^(JKとエロコンビニ店[长長])", re.I),
    re.compile(r"^(ばくあね\d+)", re.I),
    re.compile(r"^([饲飼]育×彼女)", re.I),
    re.compile(r"^(転生剣奴の子作り闘技[场場])", re.I),
    re.compile(r"^(ヌキどきッ!?Revolution～天使と悪魔の搾精バトル～)", re.I),
    re.compile(r"^(Zトン人外アニメーション)", re.I),
    re.compile(r"^(田舎に嫁いできた(?:○|ロ)シア娘とHしまくるお[話话])", re.I),
)

_EPISODE_SUFFIX_RE = re.compile(
    r"(?:[\s._-]*(?:"
    r"第\s*[\d一二三四五六七八九十]+\s*[話话集回章夜巻卷]|"
    r"[＃#♯]\s*\d+|"
    r"(?:vol(?:ume)?|ep(?:isode)?|part|act|soul)\.?\s*\d+|"
    r"\d+(?:st|nd|rd|th)|"
    r"前[編编篇]|後[編编篇]|后[編编篇]|上[巻卷編编]|下[巻卷編编]|中[巻卷編编]"
    r")).*$",
    re.IGNORECASE,
)

_EDITION_SUFFIX_RE = re.compile(
    r"(?:[\s._-]*(?:THE[\s._-]*ANIMATION|ANIME[\s._-]*EDITION|"
    r"DIRECTOR'?S[\s._-]*CUT|ディレクターズカット版|特別[編编篇]|特别[編编篇]|V\d+))+$",
    re.IGNORECASE,
)


@lru_cache(maxsize=1)
def _opencc_converter():
    return OpenCC("s2t") if OpenCC is not None else None


def _traditionalize(value: str) -> str:
    converter = _opencc_converter()
    if converter is not None:
        return converter.convert(value)
    return value.translate(_FALLBACK_S2T)


def _japaneseize(value: str) -> str:
    value = value.translate(_S2J)
    value = re.sub(r"^キどきッ", "ヌキどきッ", value, flags=re.I)
    value = value.replace("○シア娘", "ロシア娘")
    return value


def _normalize(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = value.translate(str.maketrans({"–": "-", "—": "-", "―": "-", "〜": "～"}))
    value = re.sub(r"\s+", " ", value)
    return value.strip(" ._-[]［］")


def _spacing_variant(value: str) -> str:
    value = re.sub(r"(?i)ofthe", "of the", value)
    value = re.sub(r"(?i)SWAMPSTAMP", "SWAMP STAMP", value)
    value = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", value)
    value = re.sub(r"(?<=[A-Za-z])(?=\d)", " ", value)
    value = re.sub(r"(?<=\d)(?=[A-Za-z\u3040-\u30ff\u3400-\u9fff])", " ", value)
    value = re.sub(r"\s*×+\s*", lambda match: f" {match.group().strip()} ", value)
    return re.sub(r"\s+", " ", value).strip()


def _title_stems(value: str) -> list[str]:
    """Return progressively shorter, still meaningful title candidates."""
    stems: list[str] = []

    for pattern in _KNOWN_GLUE_PREFIXES:
        if match := pattern.match(value):
            stems.append(match.group(1))

    roman_suffix = re.sub(r"(?<=[A-Za-z])(?:III|II|IV|VI|IX|V|I)$", "", value, flags=re.I)
    stems.append(roman_suffix)

    without_author = re.sub(r"\s*[\[［][^\]］]{1,24}[\]］]\s*$", "", value).strip()
    without_edition = _EDITION_SUFFIX_RE.sub("", without_author).strip(" ._-")
    without_episode = _EPISODE_SUFFIX_RE.sub("", without_edition).strip(" ._-")
    stems.extend((without_author, without_edition, without_episode))

    # Release subtitles commonly begin with quotes, a parenthetical alias, waves,
    # or one explanatory ASCII hyphen.  These are late fallbacks because the full
    # title is always searched first.
    for candidate in (without_episode, without_edition):
        quoted = re.split(r"[「『]", candidate, maxsplit=1)[0].strip(" ._-")
        stems.append(quoted)

        paren = re.split(r"[（(]", candidate, maxsplit=1)[0].strip(" ._-")
        stems.append(paren)

        wave = re.split(r"[～~]", candidate, maxsplit=1)[0].strip(" ._-")
        stems.append(wave)

        if candidate.count("-") == 1 and not candidate.endswith("-"):
            stems.append(candidate.split("-", 1)[0].strip(" ._-"))

    return stems


def normalize_title_key(value: str) -> str:
    """Normalize a title for conservative fallback-result validation."""
    value = _normalize(_japaneseize(value)).casefold()
    return re.sub(r"[^0-9a-z\u3040-\u30ff\u3400-\u9fff]+", "", value)


def build_search_queries(query: str, max_candidates: int = 10) -> list[str]:
    """Build ordered, de-duplicated TMDB queries without changing the parsed title."""
    ordered: list[str] = []

    def add(value: str) -> None:
        value = re.sub(r"\s+", " ", value).strip(" ._-")
        if len(value) >= 2 and value.casefold() not in {item.casefold() for item in ordered}:
            ordered.append(value)

    original = re.sub(r"\s+", " ", query).strip()
    normalized = _normalize(original)
    japanese = _japaneseize(original)
    japanese_normalized = _normalize(japanese)
    traditional = _traditionalize(original)
    traditional_normalized = _normalize(traditional)

    for value in (
        original,
        normalized,
        japanese,
        japanese_normalized,
        _spacing_variant(japanese_normalized),
        traditional,
        traditional_normalized,
    ):
        add(value)

    for value in (japanese_normalized, normalized, traditional_normalized, original):
        for stem in _title_stems(value):
            add(stem)
            if len(ordered) >= max_candidates:
                return ordered[:max_candidates]

    return ordered[:max_candidates]
