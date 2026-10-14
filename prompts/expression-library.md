# 표현 라이브러리 제작 프로젝트 — 실행 프롬프트

> 아래 블록을 새 에이전트 세션에 그대로 붙여넣으세요. 대상: Chunk Sound Pad MVP 표현 데이터셋(.md).

```text
당신은 Chunk Sound Pad MVP의 표현 라이브러리 제작 담당입니다.
프로젝트 루트: /Volumes/Crucial X6/Development/workspaces/chunk-soundpad-mvp
먼저 필독: AGENTS.md, docs/plan.md(D9–D23), docs/skills/expression-library.md,
expressions/README.md, expressions/roald-dahl-01.md(정본), expressions/_template.md.

목표: 아래 타겟 표현을 학습용 데이터셋 .md 1개로 만든다.
타겟: I would have been able to make it into a grubber all over again.

출력 형식 (정확히 준수):
---
id: snake_case_unique_id
level: beginner
---

# <영어 문장 전체>

> [문장 전체 IPA, General American broad transcription]

## 01
text: <덩어리 1>
ipa: [<덩어리 1 IPA>]
hint: <짧은 한글 설명> (호흡 시작 마디)

## 02 ... (2–4 덩어리, 끝맺음 부호는 마지막 덩어리에만)
## tones (마지막, 슬롯 1은 명령문, 평서 금지)
imperative | 📢 | 명령 | 1.05 | 1.0 | <명령형 변형>
interrogative | ❓ | 의문 | 1.12 | 0.95 | <의문형 변형>
exclamatory | 🔥 | 감탄 | 1.15 | 1.05 | <감탄형 변형>
surprised | 😲 | 놀람 | 1.25 | 1.15 | <놀람형 변형>
sarcastic | 😏 | 비꼼 | 0.85 | 0.82 | <비꼼형 변형>
## ccq (정확히 3개, yes/no 혼합, 번역 없이 쓰임새만, 5세 어휘)
no|yes | <질문>

규칙:
- 청크 분할: 호흡 끊김 기준 (주어·시작 | 동사부 연결 | 억양 매듭). 관사-명사 분리 금지.
- IPA: broad transcription, 강세 ˈ, chunk IPA를 순서대로 이으면 문장 IPA와 일치.
- CCQ: 번역·문법용어 금지. 각 덩어리당 1문항 권장.
- 검증: app.js의 parseMD()/validPack()을 node one-liner로 실행해
  chunks/tones(5,slot1=imperative)/ccq(3) + valid:true 확인. 실패하면 MD를 고침.
- 저장: 초안은 /tmp에만 (파일명 sample-pack-NN.md). expressions/·앱 코드 수정 금지.
  커밋·푸시 금지. 보고 시 검증 출력 + git status 무수정 증거 첨부.
```
