"""架构分层静态断言 - 用 AST 检查 import 方向，防止四层重构被破坏。

规则：
- server/common/         共享内核：禁止任何 server.* 依赖（含函数内嵌套导入）
- server/models/         数据模型：禁止依赖其他层
- server/domain/         基础能力层：禁止依赖 api / application / bootstrap
- server/application/    应用层：禁止依赖 api（允许使用 domain 与 infrastructure）
- server/infrastructure/ 数据层：禁止依赖 api / application / domain

TYPE_CHECKING 块内的导入不参与运行期，跳过检查。
另断言旧目录 core/ 与 services/ 已移除且无残留引用。
"""

import ast
from pathlib import Path

import pytest

SERVER_ROOT = Path(__file__).resolve().parents[1]

RULES: list[tuple[str, tuple[str, ...], str, set[str]]] = [
    ("common", ("server",), "any", set()),
    (
        "models",
        (
            "server.api",
            "server.application",
            "server.bootstrap",
            "server.domain",
            "server.infrastructure",
        ),
        "any",
        set(),
    ),
    ("domain", ("server.api", "server.application", "server.bootstrap"), "any", set()),
    ("application", ("server.api",), "any", set()),
    ("infrastructure", ("server.api", "server.application", "server.domain"), "any", set()),
]

# 拼接构造，避免本文件被自身的遗留扫描命中
_LEGACY_SERVICES = "server." + "services"
_LEGACY_CORE = "server." + "core."


def _matches(module: str, prefix: str) -> bool:
    """按模块路径边界匹配，避免更长模块名误命中前缀。"""
    p = prefix.rstrip(".")
    return module == p or module.startswith(p + ".")


def _is_type_checking(test: ast.expr) -> bool:
    if isinstance(test, ast.Name):
        return test.id == "TYPE_CHECKING"
    if isinstance(test, ast.Attribute):
        return test.attr == "TYPE_CHECKING"
    return False


def _package_of(path: Path) -> str:
    """返回文件所属包的模块路径（如 server.domain）。"""
    rel = path.relative_to(SERVER_ROOT.parent)
    return ".".join(rel.with_suffix("").parts[:-1])


class _ImportCollector(ast.NodeVisitor):
    """收集 server.* 导入；TYPE_CHECKING 块内的导入跳过。"""

    def __init__(self, pkg: str) -> None:
        self._pkg = pkg
        self.imports: list[tuple[int, str]] = []

    def _record(self, lineno: int, module: str) -> None:
        if module == "server" or module.startswith("server."):
            self.imports.append((lineno, module))

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            self._record(node.lineno, alias.name)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        self._record(node.lineno, self._resolve(node))

    def visit_If(self, node: ast.If) -> None:
        if _is_type_checking(node.test):
            for child in node.orelse:
                self.visit(child)
            return
        self.generic_visit(node)

    def _resolve(self, node: ast.ImportFrom) -> str:
        """解析绝对/相对导入为完整模块路径。"""
        if node.level == 0:
            return node.module or ""
        parts = self._pkg.split(".")
        base = ".".join(parts[: len(parts) - (node.level - 1)])
        return f"{base}.{node.module}" if node.module else base


def _collect_module_level(stmts: list[ast.stmt], collector: _ImportCollector) -> None:
    """只收集 import 时就会执行到的导入（不进入函数/类体）。"""
    for node in stmts:
        if isinstance(node, ast.If):
            if _is_type_checking(node.test):
                _collect_module_level(node.orelse, collector)
            else:
                _collect_module_level(node.body, collector)
                _collect_module_level(node.orelse, collector)
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            collector.visit(node)


@pytest.mark.parametrize("subdir,banned,depth,exempt", RULES, ids=[r[0] for r in RULES])
def test_import_direction(
    subdir: str,
    banned: tuple[str, ...],
    depth: str,
    exempt: set[str],
) -> None:
    root = SERVER_ROOT / subdir
    violations: list[str] = []

    for path in sorted(root.rglob("*.py")):
        if path.name in exempt or "__pycache__" in path.parts:
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
        collector = _ImportCollector(_package_of(path))
        if depth == "module":
            _collect_module_level(tree.body, collector)
        else:
            collector.visit(tree)

        for lineno, module in collector.imports:
            for prefix in banned:
                if _matches(module, prefix):
                    violations.append(
                        f"{path.relative_to(SERVER_ROOT).as_posix()}:{lineno} -> {module}"
                    )

    assert not violations, "发现违反分层方向的导入：\n" + "\n".join(violations)


def test_legacy_packages_removed() -> None:
    """旧目录 core/ 与 services/ 必须已删除，且全仓无残留引用。"""
    assert not (SERVER_ROOT / "core").exists(), "server/core 应已删除"
    assert not (SERVER_ROOT / "services").exists(), "server/services 应已删除"

    leftovers: list[str] = []
    for path in sorted(SERVER_ROOT.rglob("*.py")):
        if "__pycache__" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        for legacy in (_LEGACY_SERVICES, _LEGACY_CORE):
            if legacy in text:
                leftovers.append(f"{path.relative_to(SERVER_ROOT).as_posix()} -> {legacy}")

    assert not leftovers, "发现旧包引用残留：\n" + "\n".join(leftovers)
