# 표현 MD 포맷 (gray-matter / Jekyll front-matter 규격)

- 현 폴더 = 타겟표현01 단일 데이터셋 (Sprint 2). 샘플 확장은 별도 팩으로.
- 작성은 `_template.md` 복사부터. 규칙은 `docs/skills/expression-library.md`.

## 데이터 흐름

```text
작성(.md) → parseMD() → validPack() → seal(canonical+sha256, node 일회성)
→ sample-library.clib.json(커밋) → fetch(시작 자동+버튼) → validate/verify
→ upsert → PACKS → localStorage → ALL() → 뷰
통계: registerPass/startSession → cspm-stats-v1 → 기록 탭
```

## 필드 → 탭 매트릭스

| 필드 | 듣기연습 | 폼 | 기록 | 내정보 |
|---|---|---|---|---|
| text | TTS 재생 | 전문·선택기 | — | 목록 |
| ipa | 미사용(휴면) | 미사용(휴면) | — | — |
| chunks.text/hint | 훈련 TTS·스텝 힌트 | 카드+탭재생 | — | — |
| tones[] | 통과 후 5버튼+TTS | — | — | — |
| ccq[] | — | 퀴즈(예/아니오) | — | — |
| id/level | — | — | — | 삭제키·목록 |
- 파일당 1문장. 맨 앞 `---` 펜스 안에 메타(YAML 1단 `key: value`만).
- 본문: `# 문장`, `> IPA`, `## NN` 덩어리 + `text/ipa/hint/image` 필드, `## tones` 톤 목록, `## ccq` 질문 목록.
- 톤 줄 형식: `key | emoji | label | pitch | rate | text` (평서 대신 명령 포함).
- CCQ 줄 형식: `yes | question` 또는 `no | question` (번역 없이 쓰임새 확인, 5세 어휘).
- 파서: 내장 `parseMD()` (외부 의존 없음, 오프라인·`file://` 동작).
- 가져오기: 내정보 탭 → 샘플 버튼(fetch, localhost) / md 파일 선택(FileReader, `file://` 가능) / 텍스트 붙여넣기(MD·JSON 자동 판별).
