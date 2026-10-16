#!/usr/bin/env python3
from __future__ import annotations

import ast
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVICE = ROOT / "services" / "python-reporting"


def remove_caches() -> None:
    for cache in ROOT.rglob("__pycache__"):
        shutil.rmtree(cache, ignore_errors=True)
    for compiled in ROOT.rglob("*.pyc"):
        compiled.unlink(missing_ok=True)


def validate_syntax() -> None:
    for path in sorted([*SERVICE.rglob("*.py"), *ROOT.joinpath("scripts").glob("*.py")]):
        ast.parse(path.read_text(encoding="utf-8"), filename=str(path))


def main() -> int:
    remove_caches()
    try:
        validate_syntax()
    except (OSError, SyntaxError) as error:
        print(f"Python syntax validation failed: {error}", file=sys.stderr)
        return 1

    environment = os.environ.copy()
    environment["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(
        [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"],
        cwd=SERVICE,
        env=environment,
        check=False,
    )
    remove_caches()
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
