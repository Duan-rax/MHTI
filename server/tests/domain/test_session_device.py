"""会话设备信息解析测试。

覆盖 point：UA 里 Chromium 系浏览器内嵌 "Chrome/..."，识别顺序一旦把 chrome 排在
前面，Edge / Opera / Samsung 等一律会被误判成 Chrome——线上曾把 Edge 153 显示成
「Windows - Chrome」。这里用真实 UA 串把这些顺序约束固定下来。
"""

from server.domain.identity.session_service import _generate_device_name, _parse_user_agent

CHROME_WIN = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36"
)
EDGE_WIN = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0"
)
FIREFOX_WIN = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
)
SAFARI_MAC = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Safari/605.1.15"
)
OPERA_WIN = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0"
)
IPAD_SAFARI = (
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)
IPHONE_SAFARI = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)


class TestDeviceName:
    """设备名 = 操作系统 - 浏览器。"""

    def test_edge_is_not_reported_as_chrome(self) -> None:
        # Edge 的 UA 内嵌 Chrome/，必须先匹配 Edg/ 才不会误判
        assert _generate_device_name(EDGE_WIN, None) == "Windows - Edge"

    def test_chrome_detected(self) -> None:
        assert _generate_device_name(CHROME_WIN, None) == "Windows - Chrome"

    def test_firefox_detected(self) -> None:
        assert _generate_device_name(FIREFOX_WIN, None) == "Windows - Firefox"

    def test_safari_on_mac(self) -> None:
        assert _generate_device_name(SAFARI_MAC, None) == "macOS - Safari"

    def test_opera_is_not_reported_as_chrome(self) -> None:
        # Opera 的 UA 同样内嵌 Chrome/
        assert _generate_device_name(OPERA_WIN, None) == "Windows - Opera"

    def test_ipad_is_not_reported_as_macos(self) -> None:
        # iPad 的 UA 含 "like Mac OS X"，iOS 系需先于 macOS 匹配
        assert _generate_device_name(IPAD_SAFARI, None) == "iPadOS - Safari"

    def test_unknown_user_agent_falls_back_to_ip(self) -> None:
        assert _generate_device_name(None, "10.0.0.1") == "Unknown Device (10.0.0.1)"


class TestDeviceType:
    """设备类型用于选图标：mobile / tablet / desktop。"""

    def test_ipad_is_tablet(self) -> None:
        assert _parse_user_agent(IPAD_SAFARI) == "tablet"

    def test_iphone_is_mobile(self) -> None:
        assert _parse_user_agent(IPHONE_SAFARI) == "mobile"

    def test_desktop_user_agent(self) -> None:
        assert _parse_user_agent(CHROME_WIN) == "desktop"

    def test_empty_user_agent_defaults_to_desktop(self) -> None:
        assert _parse_user_agent(None) == "desktop"
