# 표현 MD 포맷 (gray-matter / Jekyll front-matter 규격)

- 현 폴더 = 타겟표현01 단일 데이터셋 (Sprint 2). 샘플 확장은 별도 팩으로.
- 파일당 1문장. 맨 앞 `---` 펜스 안에 메타(YAML 1단 `key: value`만).
- 본문: `# 문장`, `> IPA`, `## NN` 덩어리 + `text/ipa/hint/image` 필드, `## tones` 톤 목록, `## ccq` 질문 목록.
- 톤 줄 형식: `key | emoji | label | pitch | rate | text` (평서 대신 명령 포함).
- CCQ 줄 형식: `yes | question` 또는 `no | question` (번역 없이 쓰임새 확인, 5세 어휘).
- 파서: 내장 `parseMD()` (외부 의존 없음, 오프라인·`file://` 동작).
- 가져오기: 내정보 탭 → 샘플 버튼(fetch, localhost) / md 파일 선택(FileReader, `file://` 가능) / 텍스트 붙여넣기(MD·JSON 자동 판별).
