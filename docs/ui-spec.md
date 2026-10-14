# UI 구현 상세서 (chunk-soundpad-mvp)

> 코드가 진실. 본 문서는 지도. 어긋나면 코드를 고치고 여기를 동기화 (`agents_check.py` DRIFT 0 유지).

## 1. 디자인 토큰
-幅: max-width 420px, 다크 `#121214` / 패널 `#1c1c21` / 선 `#2a2a30`
- 강조: gold `#e0a458` (큐·다음), green `#2ecc71` (통과·활성), mint `#7dd3a8` (IPA·완료), red `#ff453a` (뱃지), amber `#ffb800` (수동)
- 타입: 본문 14~18px, 캡션 10~11px, mono(IPA·카운트)
- safe-area: 탭바·토스트 `env()`. 모션: 200ms 이하, `prefers-reduced-motion` 분기

## 2. AppShell (정적, `index.html`)
- `#start-overlay` (마이크 게이트, fixed) → `header` (sticky top, 리셋+브랜드+뷰제목)
- `.view ×4` (VScroll, 1개만 표시) → `.tabbar` (fixed bottom, 4탭) → `#toast` (fixed)
- 듣기뷰만 flex 컬럼: 오브 중앙(`flex:1`), `#cmd3-wrap` 하단 밀착(`margin-top:auto`)

## 3. TabView 구성
- **듣기연습**: guidance(최소 96px, cue+cmd) → empty-CTA → orb-zone(오브+pip+tap+heard) → passes(헤드+도트+톤그리드) → cmd3(3버튼) → manual → cafe
- **폼**: view-head + sentence-picker + form-full + form-card×N(탭재생) + ccq-sec(질문+예/아니오+스코어)
- **기록**: view-head + hist-sec[history-picker + history-body(hero+sent-card×N+푸터)] + 지우기
- **내정보**: 설정 2행(부제) + lib-card(상태+목록+가져오기)

## 4. 베이스 컴포넌트 (`h()` 팩토리, `app.js`)
| 이름 | 클래스 | 상태 | 사용처 |
|---|---|---|---|
| dot | `pass-dot[.is-complete]` | 22px 라디오형 | 듣기 |
| cmd-btn | `.cmd-btn[.is-next pulse][.is-done]` | 권장만, 잠금 없음 | 듣기 |
| tone-button | `[.is-active]` | 통과 후 표시 | 듣기 |
| pick | `[.is-on]` | 수평 스크롤 공유(`pickButtons`) | 듣기·폼·기록 |
| form-card | 텍스트+힌트, 탭재생 | IPA 없음(D21) | 폼 |
| hist-row | k/v 행 | — | 기록·내정보 |
| sent-card | `[.is-on]` 하이라이트 | 탭→문장 이동 | 기록 |
| ccq-card/ans | `[.is-yes/.is-no]`, disabled | n/3 스코어 | 폼 |
| toast | `.show`, 1.6s | heard 병행 | 전역 |
| badge | `.tab-badge[.done]` | n/6→✓ | 탭바 |

## 5. 상태→UI 매트릭스
- `stt` 전: passes/cmd3 숨김 → TEST 진입 시 passes 표시 → pass>0 유지
- `pass>=6`/mastered: cmd3+카운팅 숨김 → 5톤 → cafe
- empty(표현 없음): orb/버튼 숨김, CTA만. `needSentence()` 가드
- tones/ccq: 데이터 있을 때만 렌더 (빈 그리드·빈 섹션 없음)
- per-sentence: `PROG[id]` 저장·복원, 전환 리셋, ✓·완료수 반영

## 6. 카피덱 (변경 시 UX 리뷰)
- 블라인드: "🙈 문장은 가려져 있어요…", 통과: "🎉 여섯 번 다 했어요…"
- TEST: "틀려도 돼요…", 첫패스: "🎉 첫 소리 성공!…", 없음: "표현이 없어요…"
- TTS는 한국어 안내만 짧게. 에러는 텍스트만.

## 7. 검증
`node --check` + 헤드리스 콘솔 0 + CDP 실측(fetch·탭·통과·톤) + `agents_check` + `:8080` 200.
가상시간 헤드리스로 fetch 검증 금지 (CDP 실측).
