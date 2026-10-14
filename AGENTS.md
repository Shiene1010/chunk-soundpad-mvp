# chunk-soundpad-mvp — Project Agent Guide

> Parent: `/Volumes/Crucial X6/Development/workspaces/MiniMorph/AGENTS.md` 가 최상위 지침서이다.
> 이 파일은 프로젝트固有 규칙만 정의하고, 충돌 시 Parent가 우선한다.

## 1. Path
- Project root: `/Volumes/Crucial X6/Development/workspaces/chunk-soundpad-mvp`
- 금지: `~/Development`, `/Users/mini/...` 내장 경로 사용 금지

## 2. Security
- 키는 `.env`에만 저장. `.env.example`은 이름만.
- 커밋 전: `git status --porcelain` + `git check-ignore -v .env`

## 3. Setup (최초 1회)
```sh
cd "/Volumes/Crucial X6/Development/workspaces/chunk-soundpad-mvp"
cp "/Volumes/Crucial X6/Development/workspaces/MiniMorph/scanner.py" ./scanner.py
git init
git remote -v
```

## 4. Project-specific rules
- stack: static HTML/CSS/JS, no build, no deps → NO_DECL_NO_VENV 정상 (.venv 없음)
- entrypoint: `index.html` (브라우저에서 직접 열기, Chrome 권장)
- serve: `python3 -m http.server 8080` (stdlib only)
- verify command: `node --check app.js`
- reference: `Shiene1010/ayoung-ilgchunksoundpad` `src/routes/index.tsx` 포팅
- audio: `AudioContext`는 첫 터치 제스처 후에만 생성 (자동재생 정책)
- secrets: 사용 없음. GA 등 외부 분석 추가 시 키는 `.env`에만
