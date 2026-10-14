#!/usr/bin/env python3
"""AGENTS.md self-repair checker — stdlib only, no secrets output.
Checks structural claims (files, syntax, hygiene, doc ids) and reports DRIFT.
The agent fixes drift, updates AGENTS.md/plan.md, and re-runs until PASS.
"""
from __future__ import annotations
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REQUIRED = [
    "index.html", "app.js", "style.css", "AGENTS.md", "README.md",
    ".env", ".env.example", ".gitignore", "scanner.py",
    "docs/plan.md", "docs/sprint.md", "expressions/README.md",
]
PASS, DRIFT = [], []


def note(ok: bool, msg: str) -> None:
    (PASS if ok else DRIFT).append(msg)


def run(cmd: list[str]) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True, timeout=30)
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except FileNotFoundError:
        return 127, "not-found"


def main() -> int:
    for f in REQUIRED:
        note((ROOT / f).is_file(), f"file:{f}")
    rc, _ = run(["node", "--check", "app.js"])
    note(rc == 0, "verify:node --check app.js")
    rc, out = run(["git", "ls-files"])
    tracked = out.split() if rc == 0 else []
    note(".env" not in tracked, "hygiene:.env untracked")
    note(".env.example" in tracked or (ROOT / ".env.example").is_file(), "hygiene:.env.example present")

    plan = (ROOT / "docs/plan.md").read_text(encoding="utf-8") if (ROOT / "docs/plan.md").is_file() else ""
    ds = re.findall(r"\*\*D(\d+)", plan)
    nums = sorted({int(x) for x in ds})
    note(bool(nums) and nums == list(range(1, max(nums) + 1)) and len(ds) == len(nums),
         f"docs:plan D-numbers sequential {nums if nums else 'none'}")

    sprint = (ROOT / "docs/sprint.md").read_text(encoding="utf-8") if (ROOT / "docs/sprint.md").is_file() else ""
    ts = re.findall(r"^## (?:S\d+-)?(T\d+)\.", sprint, re.M)
    sprint_ids = re.findall(r"^## ((?:S\d+-)?T\d+)\.", sprint, re.M)
    note(len(sprint_ids) == len(set(sprint_ids)), f"docs:sprint task ids unique {sprint_ids if sprint_ids else 'none'}")

    mds = sorted((ROOT / "expressions").glob("*.md")) if (ROOT / "expressions").is_dir() else []
    ok_md = True
    for m in mds:
        if m.name == "README.md":
            continue
        t = m.read_text(encoding="utf-8")
        if not (t.startswith("---") and "\n# " in t and "\n## " in t):
            ok_md = False
    note(ok_md, f"data:expressions format ({len([m for m in mds if m.name != 'README.md'])} packs)")

    agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8") if (ROOT / "AGENTS.md").is_file() else ""
    for kw in ["MiniMorph/AGENTS.md", "북극성", "자가수선", "node --check", "check-ignore"]:
        note(kw in agents, f"agents:mentions {kw}")

    print(f"PASS {len(PASS)} / DRIFT {len(DRIFT)}")
    for m in PASS:
        print("  ok:", m)
    for m in DRIFT:
        print("  DRIFT:", m)
    return 1 if DRIFT else 0


if __name__ == "__main__":
    sys.exit(main())
