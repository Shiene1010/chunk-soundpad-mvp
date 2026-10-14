# Sprint 1 — 컴포넌트 폴리시 (F7 차용)

> 범위: Toast + Badge + Sheet + Toggle + Icons 평가. 무빌드 유지, 패턴만 이식.

## T0. Icons 평가 (선행, S)
- F7 Icons vs lucide vs 이모지 비교: 라이선스·용량·iOS 질감·오프라인.
- 산출: `docs/plan.md`에 결정 1줄 (D8). 교체는 후속 스프린트.
- 완료: 결정 기록됨.

## T1. Toast (S)
- `showToast(msg)`: 탭바 위 1줄, 1.6s 자동 소멸, `prefers-reduced-motion` 시 즉시 표시.
- 적용: `busy()` 안내, 임포트 결과, 잠금 힌트. 기존 `#heard` 텍스트는 유지(스크린리더용).
- 파일: `app.js`, `style.css`, `index.html` (컨테이너 1개).
- 완료: 3개 호출부에서 토스트+heard 동시 동작.

## T2. Badge (S)
- 듣기연습 탭에 `n/6` 뱃지, 통과 탭 ✓ 도트. F7 뱃지 스펙(둥근 알약, 숫자).
- 파일: `index.html`, `style.css`, `app.js` (`render()` 탭 갱신부).
- 완료: 패스마다 뱃지 갱신, 6/6 시 ✓ 전환.

## T3. Tone Sheet (M)
- 톤 섹션을 `<dialog>` 바텀시트로: grabber + `::backdrop` + detent(반/전개) + backdrop 탭 닫기.
- 6패스 시 자동 `showModal()`, 닫아도 잠금 유지. `@starting-style` 진입 애니메이션.
- 파일: `index.html`, `style.css`, `app.js`.
- 완료: 헤드리스 콘솔 에러 0, ESC·backdrop 닫기 동작.

## T4. Toggle + 모바일 기반 (S)
- 내정보 토글 F7 외형, `100dvh`·`safe-area`·`touch-action: manipulation`·`prefers-reduced-motion` 감사 후 미비분 반영.
- 파일: `style.css`为主.
- 완료: 체크리스트 4항목 전부 충족.

## T5. 검증·푸시 (S)
- `node --check`, 헤드리스 콘솔 0에러, 서빙 200, `.env` 미추적, 커밋·푸시.
- 순서: T0 → T1·T2 → T3 → T4 → T5. 의존성: T3는 T0 결정 참조(아이콘).
