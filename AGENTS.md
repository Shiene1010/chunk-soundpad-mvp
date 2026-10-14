# chunk-soundpad-mvp — Project Agent Guide

> Parent: `/Volumes/Crucial X6/Development/workspaces/MiniMorph/AGENTS.md` 가 최상위 지침서이다.
> 이 파일은 프로젝트固有 규칙만 정의하고, 충돌 시 Parent가 우선한다.

## 1. Path
- Project root: `/Volumes/Crucial X6/Development/workspaces/chunk-soundpad-mvp`
- 금지: `~/Development`, `/Users/mini/...` 내장 경로 사용 금지
- Live serve: `http://localhost:8080` (`python3 -m http.server 8080`)

## 2. Security
- 키는 `.env`에만 저장. `.env.example`은 이름만. 현 프로젝트는 외부 키 사용 없음.
- 커밋 전: `git status --porcelain` + `git check-ignore -v .env` (`.env` 미노출 확인)

## 3. Stack & Layout (무빌드 정적)
- `index.html` — 4탭 셸 (듣기연습/형태/기록/내정보) + 시작 오버레이 + 탭바
- `app.js` — 상태머신·Web Audio·Web Speech·라우터 전부. 단일 파일 유지
- `style.css` — 420px 다크 테마. `100dvh`·`safe-area`·`prefers-reduced-motion` 준수
- `expressions/*.md` — 표현 팩 (아래 §6). `docs/plan.md` (결정·로드맵), `docs/sprint.md` (스프린트)
- stack: vanilla HTML/CSS/JS, no build, no deps → NO_DECL_NO_VENV 정상
- entrypoint: `index.html` (Chrome 권장, `localhost` 서빙. `file://`는 mic·fetch 제한)
- verify: `node --check app.js` + 헤드리스 크롬 콘솔 0에러 + 서빙 200

## 4. UX 불변식 (북극성: 한 번 말하기)
- 블라인드 퍼스트: 영문·IPA는 6패스/엿보기/noTts 전까지 비공개. 한글 힌트만 공개
- 순서: PLAY → TEST → TRAIN (next-pulse·배지·캡션 일치 유지)
- TEST 문턱은 낮게 (어떤 발화든 통과). 정밀 검증은 형태 탭 전담
- 첫 패스 축제 분리, "틀려도 돼요" 문구 유지. 잠금ではなく 권장·제안 (자율 원칙)
- 새 섹션 추가 시: 한 화면 3섹션 이하, `hidden` 토글 + `render()`에서 일괄 갱신

## 5. 오디오/STT 규칙 (실패에서 배움)
- `AudioContext`는 사용자 제스처 후 생성·resume. 무음 발화로 사파리 TTS 잠금 해제
- `speak()`: 한글 포함 → `ko-KR`, 그 외 `en-US` (고정 en-US 금지 — 괴상 발음 원인)
- STT는 transcript 비어 있으면 카운트 금지. 앱 TTS 자기목소리(`SELF_VOICE`) 무시
- `onerror` 에스컬레이션: 무음 2회 코칭(텍스트만), 네트워크 2회 수동 전환
- `render()` 최상단에서 파생 상태(`isMastered`, `revealed`) 선언 — TDZ 크래시 재발 금지
- `node --check`는 문법만 검사. **반드시 헤드리스 크롬 콘솔 확인**:
  `Google Chrome --headless=new --dump-dom` + `CONSOLE` 에러 grep

## 6. 표현 MD 포맷 (gray-matter/Jekyll 규격)
- `---` 메타(`id`, `level`) + `# 문장` + `> IPA` + `## NN` 덩어리(`text/ipa/hint/image`)
- 파서는 내장 `parseMD()`만 사용 (외부 의존 추가 금지)
- 샘플은 `expressions/`에. 가져오기 3경로(샘플fetch/파일선택/붙여넣기) 동작 유지
- `backwardSteps()`는 1~2청크 팩 호환 유지

## 7. Git 워크플로
- `main` 직푸시 (1인 MVP). 커밋 메시지: `<영역>: <내용>` (예: `Sprint1 T0-T2: ...`)
- 푸시 후 `git log --oneline` + `:8080` live 확인. 결정사항은 `docs/plan.md`에 D번호로 기록

## 8. 자가수선 (이 문서의 유지)
- 본 프로젝트 작업 종료 조건: `python3 agents_check.py` → `DRIFT 0`.
- DRIFT 발생 시: 코드/문서 중 틀린 쪽을 고치고(원칙: 코드가 진실, 문서가 뒤따름),
  AGENTS.md·plan.md·sprint.md의 어긋난 서술을 같은 커밋에 반영 후 재검사.
- 새 결정은 D번호로 plan.md에, 새 작업은 sprint 태스크로. 번호 건너뜀·충돌 금지.
- 구조 변경(파일 추가·탭 변경·포맷 변경) 시 §3·§6을 먼저 고치고 코드를 맞춤.
