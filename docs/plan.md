# chunk-soundpad-mvp 개선 계획

> 북극성: **한 번 말하기** — 첫 발화까지의 시간 단축. 듣기 우선으로 익히고, 형태 정밀인지는 나중에.

## 1. 결정 기록 (ADR-lite)

- **D1 블라인드 퍼스트** (`6cea700`): 타겟 영문·IPA를 6패스 전까지 가림. 한글 힌트만 공개.
- **D2 마이크 퍼스트** (`de7e70d`): 시작 오버레이에서 `getUserMedia` 권한 선확보. 거부·미지원·스킵 시 수동 모드.
- **D3 에러 에스컬레이션** (`8367416`): 무음 2회 코칭, 네트워크 2회 수동 전환, 재생 중 중복 탭 가드, TTS 자기목소리 무시, 화면 꺼짐 중단·복귀.
- **D4 흐름 맞춤 UI** (`621d5fd`): ①듣기→②연결→③말하기 번호 + 다음 행동 펄스 + 완료 ✓. 잠금 없음(권장만).
- **D5 게이트→자율**: 말하기 문턱을 낮추는 게 목적이므로 TEST는 어떤 발화든 통과. 정밀 검증은 M4로 이관.
- **D6 4탭**: 듣기연습(Speaker) / 형태(Text) / 기록(History) / 내정보(CircleUser). 설정은 내정보 안, 학습 단계는 탭이 아니라 홈 패스/모드 안.
- **D7 5모드**: M1 듣기 → M2 말하기 → M3 조립 → M4 형태 → M5 활용. M2·M3 엔진 통일(오디오 N회+카운트, 설정만 다름).
- **D8 아이콘**: 크롬(탭·버튼)은 lucide 인라인 SVG로 통일, 톤 얼굴 이모지는 콘텐츠라 유지. F7 Icons 차순위(iOS풍이나 세트 중복 회피). 교체는 후속.
- **D9 라이브러리 형식**: 직접 MD/JSON 임포트 금지. `chunk-soundpad-library v1`(.clib.json)만 출입 — 디스크립터+인라인 entries+sha256(Frictionless 축소판). MD는 작성용, 묶기 변환기로 clib화.
- **D10 폴더 단일화**: `expressions/`는 타겟표현01만. 시작 시 `library.clib.json` 자동로드(내장과 텍스트 dedupe, `file://`는 내장 폴백). 공유 입출은 라벨로 구분.
- **D11 단일 버튼**: 임포트는 [표현 가져오기] 1개 → 폴더 `sample-library.clib.json` 로드. 4경로 UI·데드코드 제거.
- **D12 가져오기 상태**: 없음(비어 있음+CTA)/있음(로드 N개+sha) + 확인 중(disabled) + 실패(localhost 안내). sha 저장으로 업데이트 판별.
- **D13 빈 시작**: 내장 문장 제거, 폴더 우선. 표현 없이 실행 → CTA(내정보 이동). 학습 3동작은 가드.
- **D14 제작 스킬**: `docs/skills/expression-library.md` (포맷·청킹·IPA·검증·QA). 초안은 `/tmp`에만, `expressions/` 단일원칙 유지.

## 2. 구현됨

- [x] 원본 포팅 (ayoung-ilgchunksoundpad → 정적 MVP)
- [x] MiniMorph 스캐폴딩 (AGENTS.md, .env, scanner.py, git)
- [x] D1, D2, D3, D4
- [x] Speak-once 5변경: 순서 PLAY→TEST→TRAIN, "틀려도 돼요", 첫 패스 축제+기록, 형태 상시 개방(형태 탭), 기록 저장소(`cspm-stats-v1`)
- [x] 듣기연습 타겟보드 제거: 소리 탭은 소리만. 훈련 스텝은 cue 한 줄, 빈 상태는 CTA (D15)
- [x] 4탭: 듣기연습/형태/기록/내정보 + 탭바 + 뷰 라우터 + 문장 선택기 + 라이브러리 임포트 + 느리게/안내음성 설정
- [x] GitHub Pages 배포 (`https://shiene1010.github.io/chunk-soundpad-mvp/`, main 루트, `.nojekyll`)

## 3. 승인 대기 (스펙 완료)

- [ ] **TTS 안내 시나리오**: 상태별 한국어 대사 + 반복 억제(세션 1회, 이후 단축형).
- [ ] **iOS 패턴 적용**: `<dialog>` 시트/커버, `startViewTransition` 전환, dvh/safe-area/reduced-motion.
- [ ] **4탭 구현**: 탭바 + 뷰 라우터 + M1/M2 리스킨 → M3 → M4 → M5 순.
- [ ] **역순 매트릭스** `[3,2,1]` + 스텝 카운터.
- [ ] **Form 퀴즈** (듣고 고르기 3/3) + 덩어리 그림 `images/`.

## 4. 백로그 (효과/비용 순)

1. 청크 탭 재생 (소) 2. 슬로우 토글 (소) 3. 점진 가림 (소~중)
4. STT 일치율 표시 (중) 5. 문장팩·라이브러리 임포트 (중) 6. 진도 저장 localStorage (소)
7. 내 목소리 녹음·비교 (중) 8. 구간 반복 A-B (중) 9. 틀린 덩어리 분석 (중~대)
10. 교사 모드 (중) 11. 받아쓰기 (중) 12. 섀도잉 모드 (중)
13. 공유 카드 (소~중) 14. 스트릭·칭찬 변주 (소)

## 5. 데이터 메모

- `SENTENCES[]` 팩 구조 유지. 청크 확장 필드(후순위): `image`, `scene`.
- localStorage 키(예정): `firstPassAt`, `totalPasses`, `sessions`, `wrongChunks`, `packs`.
