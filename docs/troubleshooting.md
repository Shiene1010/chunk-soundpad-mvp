# 트러블슈팅 (실전 기록)

## TDZ 크래시 — 스크립트 전체 사망 (`0aecda5`)
- 증상: 무음·무반응 전부. 콘솔: `Cannot access 'revealed' before initialization`.
- 원인: `render()`에서 선언 전 참조. `node --check`는 문법만 봐서 못 잡음.
- 처방: 파생 상태는 함수 최상단 선언. 검증은 헤드리스 콘솔 필수.

## 캐시 구버전 — "안 고쳐졌어"
- 증상: HTML 신/JS 구 조합 (버튼 보이나 무반응, 옛 화면).
- 처방: 에셋 `?v=` 상향 (현 `s5`). 릴리스 절차에 포함.

## 무톤 구데이터 — 통과해도 톤 없음 (D20)
- 증상: 6/6인데 톤 그리드 비어 있음.
- 원인: 저장소 옛 팩(text 동일)이 신톤 병합을 막음.
- 처방: `upsertEntries()` 동일문장 승격. 재실행 no-op 확인.

## 가상시간 fetch 미해결
- 증상: headless `--virtual-time-budget`에서 autoload 0건.
- 원인: 가상시계에서 fetch 미해결. 앱 버그 아님.
- 처방: CDP 실측으로만 검증 (스킬 §9).

## resume() 무한대기
- 증상: 시작 후 멈춤 (제스처 미인정 환경).
- 처방: `Promise.race([resume(), delay(1500)])`.
