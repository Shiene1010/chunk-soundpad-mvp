# Chunk Sound Pad MVP

`Shiene1010/ayoung-ilgchunksoundpad`(`src/routes/index.tsx`)를 참고한 무빌드 정적 MVP.
`index.html`을 브라우저(Chrome 권장)로 열면 실행. 외부 서비스·백엔드 없음.

## Files
- `index.html` — 420px 단일 화면 셸
- `style.css` — orb 상태(`state-idle/tts/train/stt/mastered`), blind-cover, pass-dot
- `app.js` — 상태머신·Web Audio 큐·Web Speech STT/TTS·6패스·5톤

## Flow
PLAY(전체 듣기) → TRAIN(역순 03→02→01) → TEST(블라인드 6회) → 5톤 해제 → 당근카페 링크.

## 원본 대비 변경
- `onspeechend` 무조건 통과 제거: transcript 비어 있으면 카운트 안 함(`app.js` `startTestRec`).
- 문장 배열화: `SENTENCES`에 추가만 하면 `Target / 02...` 확장.
- GA/분석 제거: MVP는 로컬 상태만.

## Run
```sh
cd chunk-soundpad-mvp && python3 -m http.server 8080
# http://localhost:8080
```
