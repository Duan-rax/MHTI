"""HTTP 工具 - 共享内核，被各层引用。"""

from starlette.requests import Request


def get_client_ip(request: Request) -> str:
    """从 X-Forwarded-For 或连接信息提取客户端 IP。"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
