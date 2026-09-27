"""115 cloud configuration models."""

from datetime import datetime

from pydantic import BaseModel


class Cloud115Config(BaseModel):
    """115 cloud login configuration."""

    enabled: bool = False
    app: str = "alipaymini"
    cookies: str = ""
    is_logged_in: bool = False
    updated_at: datetime | None = None


class Cloud115DeviceOption(BaseModel):
    """115 login device option."""

    value: str
    label: str
    group: str = "standard"


class Cloud115Status(BaseModel):
    """115 login status."""

    enabled: bool
    app: str
    is_logged_in: bool
    updated_at: datetime | None = None


class Cloud115Account(BaseModel):
    """115 账号身份（昵称 / 头像 / UID / 已登录设备数）。"""

    user_id: str | None = None
    nickname: str | None = None
    avatar_url: str | None = None
    device_count: int | None = None


class Cloud115Membership(BaseModel):
    """115 会员状态。

    等级名与到期日直接取 115 原文（user_base_info 的 vip / vip_info），本地不做
    会员名映射：115 的等级名会变（年费VIP / 全球VIP / 永久VIP），本地硬编码一份
    映射表必然过期。
    """

    is_vip: bool = False
    level_name: str | None = None
    expire_date: str | None = None
    is_forever: bool = False


class Cloud115Storage(BaseModel):
    """115 容量占用。

    bytes 供前端画进度条，text 直接展示 115 的格式化值（68.34TB），避免本地
    重新格式化后与 115 页面显示不一致。
    """

    used_bytes: int | None = None
    total_bytes: int | None = None
    used_text: str | None = None
    total_text: str | None = None
    used_percent: float | None = None


class Cloud115SessionDevice(BaseModel):
    """当前登录态所在的设备（115 登录设备列表里 is_current 的那台）。"""

    name: str | None = None
    ip: str | None = None
    city: str | None = None
    login_at: datetime | None = None
    is_unusual: bool = False


class Cloud115AccountInfo(BaseModel):
    """115 账号详情：身份 + 会员 + 容量 + 当前设备。

    is_session_valid 是「打开面板时实测的登录态是否仍有效」：True 有效、False 已失效、
    None 未探测（未登录，或读不到——例如网络故障）。前端据此决定是展示账号卡、
    「重新登录」还是「稍后重试」。
    """

    is_logged_in: bool
    is_session_valid: bool | None = None
    message: str = ""
    account: Cloud115Account | None = None
    membership: Cloud115Membership | None = None
    storage: Cloud115Storage | None = None
    device: Cloud115SessionDevice | None = None
    checked_at: datetime | None = None


class Cloud115QrSession(BaseModel):
    """115 QR login session."""

    uid: str
    qrcode_url: str
    app: str


class Cloud115QrStatus(BaseModel):
    """115 QR login polling status."""

    uid: str
    app: str
    status: str
    message: str
    is_logged_in: bool = False
