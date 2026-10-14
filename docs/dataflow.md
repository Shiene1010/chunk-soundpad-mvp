# 데이터 흐름 제어 상세서 (chunk-soundpad-mvp)

## 1. 소스
- 저작: `expressions/*.md` (정본, 템플릿 `_template.md` 복사)
- 봉인본: `expressions/sample-library.clib.json` (타겟01), `libraries/*.clib.json` + `manifest.json` (빌더 배치)
- 런타임 저장: `localStorage` (`PACKS`, 통계·진도)

## 2. 파이프라인
```text
작성(.md, 스킬+프롬프트)
→ parseMD() [펜스/제목/IPA/청크/톤/CCQ] (앱·빌더 1:1, canonical 바이트 일치 필수)
→ validPack() [text+chunks≥1] (+ tones 5/ccq 3은 QA·표시 조건]
→ seal: canonicalEntries + sha256 (빌더; JS `1` vs PY `1.0` 정규화 주의)
→ 게시: MVP `expressions/`·`libraries/` 커밋 (구일자 삭제 금지)
→ 로드: manifest→latest + sample 병렬 (same-origin 우선, raw 폴백)
→ validate → verify(sha) → upsert(동일문장 승격, 신규 추가)
→ PACKS 저장 → ALL() → 뷰. 실패 시 문제 1건만 토스트
```

## 3. 저장소 키
| 키 | 내용 | 수명 |
|---|---|---|
| `cspm-packs-v1` | PACKS 배열 | 영구, 삭제 버튼 있음 |
| `cspm-stats-v1` | firstPassAt·totalPasses·sessions | 영구 |
| `cspm-progress-v1` | 문장별 {pass·didPlay·didTrain·completedAt} | 영구, 리셋 시 당문장 초기화 |
| `cspm-lib-sha` | 마지막 로드 sha | 업데이트 판별 |

## 4. 무결성·버전
- 형식 `chunk-soundpad-library v1`: format/version/entries(1~50)/중복금지/200KB/sha(선택)
- sha 불일치·형식 오류 → 거부 + 사유 1줄. 침묵 실패 금지(수동 시)
- 일자 파일 누적, manifest.latest가 진실. 롤백 = 구일자 파일 + manifest 되돌리기

## 5. 실패 모드
| 상황 | 동작 |
|---|---|
| `file://` fetch 불가 | 내장 폴백(없음) → 빈 CTA + localhost 안내 |
| manifest 없음 | sample 단독 로드 |
| 개별 소스 실패 | 건너뛰고 계속, 첫 문제만 표시 |
| 오프라인 STT | 네트워크 2회 → 수동 전환 (앱 에러 흐름) |

## 6. 검증
- 빌드: `parse→validate→sha roundtrip` PASS (D24 절차)
- 앱: CDP 실측 merge N개 + picker N개 + sha 저장
- `agents_check`: expressions 포맷 + D번호 연속성
