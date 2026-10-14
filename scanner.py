#!/usr/bin/env python3
"""MiniMorph infra scanner — Mac CLI stdout parsing only.
Root: /Volumes/Crucial X6/Development/workspaces
Outputs: 맥미니현황.md, PROJECT_SKILLS.md (값 노출 없이 키 이름만)
"""
from __future__ import annotations
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/Volumes/Crucial X6/Development/workspaces")
OUT_STATUS = Path(__file__).resolve().parent / "맥미니현황.md"
OUT_SKILLS = Path(__file__).resolve().parent / "PROJECT_SKILLS.md"

BREW_ESSENTIALS = ["git", "python3", "node", "gh", "jq", "uv", "ffmpeg", "ollama"]
SECRET_KEY_RE = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$")
SENSITIVE_RE = re.compile(r"(API[_-]?KEY|SECRET|TOKEN|PASSWORD|PRIVATE)", re.I)


def run(cmd: list[str], cwd: Path | None = None, timeout: int = 15) -> tuple[int, str]:
    """Mac CLI 실행 후 (returncode, stdout+stderr) 반환."""
    try:
        p = subprocess.run(
            cmd, cwd=str(cwd) if cwd else None,
            capture_output=True, text=True, timeout=timeout,
        )
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except FileNotFoundError as e:
        return 127, f"not-found: {e}"
    except subprocess.TimeoutExpired:
        return 124, "timeout"


def mask_value(v: str) -> str:
    v = v.strip().strip('"').strip("'")
    if not v:
        return "(empty)"
    if len(v) <= 4:
        return "****"
    return f"{v[:2]}****{v[-2:]} (len={len(v)})"


def check_cli_tools() -> dict[str, str]:
    out: dict[str, str] = {}
    for tool, ver_cmd in [
        ("python3", ["python3", "--version"]),
        ("git", ["git", "--version"]),
        ("brew", ["brew", "--version"]),
        ("node", ["node", "--version"]),
        ("gh", ["gh", "--version"]),
        ("xcode-select", ["xcode-select", "-p"]),
    ]:
        rc, txt = run(ver_cmd)
        first = next((l for l in txt.strip().splitlines() if l.strip()), "missing")
        out[tool] = f"{'OK' if rc == 0 else 'FAIL(rc=%d)' % rc} — {first[:120]}"
    rc, txt = run(["brew", "list", "--versions"])
    installed: set[str] = set()
    if rc == 0:
        for line in txt.splitlines():
            parts = line.strip().split()
            if parts:
                installed.add(parts[0].lower())
    for b in BREW_ESSENTIALS:
        key = b.lower()
        hit = key in installed or key in txt.lower()
        out[f"brew:{b}"] = "installed" if hit else "missing"
    return out


def scan_env_file(env_path: Path) -> list[tuple[str, str, bool]]:
    """반환: [(KEY, masked, is_sensitive)] — 값 원문은 절대 반환하지 않음."""
    rows: list[tuple[str, str, bool]] = []
    try:
        text = env_path.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        return [("READ_ERROR", str(e)[:80], False)]
    for line in text.splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        m = SECRET_KEY_RE.match(line)
        if not m:
            continue
        k, v = m.group(1), m.group(2)
        rows.append((k, mask_value(v), bool(SENSITIVE_RE.search(k))))
    return rows


def git_remote(cwd: Path) -> str:
    rc, txt = run(["git", "-C", str(cwd), "remote", "-v"], timeout=10)
    if rc != 0:
        first = txt.strip().splitlines()[0][:150] if txt.strip() else "no git repo"
        return first
    lines = [l for l in txt.strip().splitlines() if l.strip()]
    return "; ".join(lines)[:400] if lines else "(no remote)"


def git_ignores_env(cwd: Path) -> str:
    rc, txt = run(["git", "-C", str(cwd), "check-ignore", "-v", ".env"], timeout=10)
    if rc == 0 and txt.strip():
        return f"ignored — {txt.strip().splitlines()[0][:150]}"
    return "NOT ignored (주의: .gitignore에 .env 추가 필요)"


def iter_projects() -> list[Path]:
    if not ROOT.is_dir():
        return []
    out: list[Path] = []
    for p in sorted(ROOT.iterdir()):
        if p.name.startswith(".") or not p.is_dir():
            continue
        out.append(p)
        if len(out) >= 300:
            break
    return out


def classify_skills(p: Path) -> list[str]:
    skills: list[str] = []
    if (p / "requirements.txt").exists() or (p / "pyproject.toml").exists() or (p / ".venv").exists():
        skills.append("python")
    if (p / "package.json").exists():
        skills.append("node")
    if (p / "Dockerfile").exists():
        skills.append("docker")
    if list(p.glob("*.swift")) or (p / "Package.swift").exists() or list(p.glob("*.xcodeproj")):
        skills.append("swift/ios")
    if list(p.glob("*.md")):
        skills.append("docs")
    if (p / ".git").is_dir():
        skills.append("git")
    return skills or ["unknown"]


def main() -> int:
    now = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M %Z")
    tools = check_cli_tools()
    projects = iter_projects()

    status_lines: list[str] = []
    status_lines.append(f"# 맥미니현황 — {now}")
    status_lines.append("")
    status_lines.append(f"- Root: `{ROOT}`")
    status_lines.append(f"- Projects scanned (depth=1): {len(projects)}")
    status_lines.append("")
    status_lines.append("## CLI / Homebrew")
    status_lines.append("")
    status_lines.append("| tool | status |")
    status_lines.append("|---|---|")
    for k, v in tools.items():
        status_lines.append(f"| {k} | {v} |")
    status_lines.append("")
    status_lines.append("## Project Infra (.venv / .env / git)")
    status_lines.append("")
    status_lines.append("| project | .venv | .env (keys only) | .env gitignore | git remote |")
    status_lines.append("|---|---|---|---|---|")

    skills_lines: list[str] = []
    skills_lines.append(f"# PROJECT_SKILLS — {now}")
    skills_lines.append("")
    skills_lines.append(f"- Root: `{ROOT}`")
    skills_lines.append("")
    skills_lines.append("| project | skills | notes |")
    skills_lines.append("|---|---|---|")

    for p in projects:
        venv = "YES" if (p / ".venv").is_dir() else "no"
        env_path = p / ".env"
        if env_path.is_file():
            rows = scan_env_file(env_path)
            env_summary = f"YES ({len(rows)} keys: " + ", ".join(k for k, _, _ in rows[:8]) + (", ..." if len(rows) > 8 else "") + ")"
        else:
            env_summary = "no .env"
        gi = git_ignores_env(p) if (p / ".git").is_dir() else ("no .git" if not env_path.is_file() else git_ignores_env(p))
        remote = git_remote(p)

        def esc(s: str) -> str:
            return s.replace("|", "\\|").replace("\n", " ")
        status_lines.append(f"| {esc(p.name)} | {venv} | {esc(env_summary)} | {esc(gi)} | {esc(remote)} |")

        skills = classify_skills(p)
        notes: list[str] = []
        if venv == "YES":
            notes.append("venv")
        if env_path.is_file():
            notes.append("env-present")
        if "no remote" in remote or "no git repo" in remote:
            notes.append("no-remote")
        skills_lines.append(f"| {esc(p.name)} | {', '.join(skills)} | {', '.join(notes)} |")

    OUT_STATUS.write_text("\n".join(status_lines) + "\n", encoding="utf-8")
    OUT_SKILLS.write_text("\n".join(skills_lines) + "\n", encoding="utf-8")
    print(f"WROTE: {OUT_STATUS} ({len(projects)} projects)")
    print(f"WROTE: {OUT_SKILLS}")
    print("NOTE: .env 값은 출력하지 않음 (키 이름 + 마스킹만).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
