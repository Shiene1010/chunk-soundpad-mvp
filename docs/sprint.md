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

# Sprint 2 — 폴더 기반 라이브러리 (타겟표현01 단일 데이터셋) [완료]

# Sprint 3 — 폴더 단일버튼 임포트

> 방향: 깃헙 메인(루트) `expressions/`에 샘플 타겟표현 데이터셋만.
> 샘플표현라이브러리 파일 1개에서 불러오기. 메뉴는 표현가져오기 버튼 1개.
> 기존 4경로(다시읽기·파일선택·붙여넣기·묶기/내보내기) 정리.

## S3-T0. 폴더 최종형 (S)
- `expressions/`: `roald-dahl-01.md`(원천) + `sample-library.clib.json`(봉인 로드용) + `README.md`.
- `library.clib.json` → `sample-library.clib.json` 개명. 상수·문서 동기화.
- 완료: 폴더 3파일, `agents_check` 통과.

## S3-T1. 버튼 단일화 (M)
- 내정보 라이브러리 구역 = [표현 가져오기] 1개 + 로드 목록(읽기+삭제).
- 삭제: 다시읽기·파일선택·붙여넣기·묶기·내보내기 UI와 데드코드(`importPack`·`wrapMDToLibrary`·`exportLibrary`·`downloadJSON`·file 핸들러). `parseMD`는 빌드 공용이라 주석 유지.
- 버튼 동작: 폴더 샘플 파일 fetch → 검증 → 병합 → 토스트.
- 완료: 헤드리스 0에러, 버튼 1회로 로드 확인.

## S3-T2. 검증·문서·푸시 (S)
- `node --check`, 헤드리스, `agents_check` DRIFT 0, plan D11, AGENTS §6, 푸시.

> 방향: `expressions/`는 기존 타겟표현01 데이터셋만. 임포트는 이 폴더에서.
> 내장 문장은 `file://` 폴백으로 유지, 폴더본과 텍스트 기준 dedupe.

## S2-T0. 폴더 단일화 (S)
- `expressions/`에 남길 것: `roald-dahl-01.md` (내장 문장과 동일 내용, MD 정본) + `library.clib.json` (봉인 빌드) + `README.md` (포맷).
- 제거: `early-bird-01.md`, `practice-makes-perfect-01.md`, `starter.clib.json` (샘플은 라이브러리 성장 후 별도 팩으로).
- 완료: 폴더 = 타겟01만. `agents_check` 표현식 1팩.

## S2-T1. 폴더 자동로드 (S)
- 시작 시 `fetch('expressions/library.clib.json')` → 검증 → dedupe 병합. 실패 시 조용히 내장만 (`file://` 대응).
- 프리셋 버튼 교체: "폴더 라이브러리 다시 읽기" 1개.
- 파일: `app.js`, `index.html` (프리셋부).
- 완료: localhost에서 폴더본 로드 확인, 중복 없음.

## S2-T2. 사용자 clib 공유 유지 (S)
- 파일 선택·내보내기·MD 묶기는 공유 경로로 유지 (D9 그대로).
- 문구 정리: "공유받기/공유하기"로 라벨 변경해 폴더 임포트와 구분.
- 완료: 두 경로 명칭 충돌 없음.

## S2-T3. 검증·문서·푸시 (S)
- `node --check`, 헤드리스 0에러, `agents_check` DRIFT 0, plan D10 기록, AGENTS §6 동기화, 푸시.
