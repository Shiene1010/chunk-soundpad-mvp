# Expression Library Authoring Skill (chunk-soundpad-mvp)

One MD file = one sentence. Parser: built-in `parseMD()` in `app.js` (no deps).

## 1. MD format spec

```md
---
id: snake_case_unique_id
level: beginner
---

# Full English sentence here.

> [full sentence IPA in brackets]

## 01

text: chunk words (keep end punctuation on last chunk only)
ipa: [chunk IPA in brackets]
hint: Korean gloss (마디 suffix, see §2)
```

Rules: front-matter is `---` fence, flat `key: value` lines only. One `# ` line
(sentence), one `> ` line (IPA). Each chunk is `## NN` (zero-padded, 01-up) then
`text:`/`ipa:`/`hint:` lines (`image:` optional, omit when none). No extra keys.
Optional `## tones` section LAST: one line per tone,
`key | emoji | label | pitch | rate | text` (e.g. `imperative | 📢 | 명령 | 1.05 | 1.0 | ...`).
Slot 1 is imperative, never declarative.

## 2. Chunking rules (2–4 chunks)

- Split at breath pauses: subject/opening | verb phrase | ending/cadence.
- Keep verb + object together; never split articles from nouns (`a grubber` stays whole).
- End punctuation lives on the last chunk only; earlier chunks have none.
- Hint = short Korean gloss + one 마디 suffix: opening → `(호흡 시작 마디)`,
  verb/connector → `(동사부 연결마디)`, ending → `(억양 매듭마디)`.

## 3. IPA guidelines (General American, conservative)

- Full-sentence `> ` IPA must equal the chunks' IPAs joined in order.
- Use broad transcription in `[...]`: `ˈ` primary stress, `ˌ` only if needed.
- American vowels: `æ ɛ ɪ ɔː (caught as ɔː) ʊ uː ʌ ɝː/ɜːr → ɜːr`; rhotic `r`;
  flap `ɾ` allowed only intervocalic (`bɛɾər`); otherwise `t/d`.
- No narrow diacritics (no aspiration `ʰ`, no nasalization); `ən` for weak -on.

## 4. Validation procedure (node, app.js is truth)

```sh
node -e 'const fs=require("fs");const a=fs.readFileSync("/Volumes/Crucial X6/Development/workspaces/chunk-soundpad-mvp/app.js","utf8");const g=n=>{const m=a.match(new RegExp("function "+n+"[\\s\\S]*?\\n}\\n"));if(!m)throw new Error(n+" missing");return m[0]};eval(g("parseMD")+g("validPack"));const p=parseMD(fs.readFileSync(process.argv[1],"utf8"));console.log(JSON.stringify({text:p&&p.text,chunks:p?p.chunks.length:0,valid:validPack(p)}));' <pack.md>
```

Pass = prints `{"text":"...","chunks":N,"valid":true}` with N = chunk count.
Also verify `tones:5` with slot 1 `key:imperative` when a `## tones` section exists.
Fail (`null`/`valid:false`) → fix MD, never the parser. Also run `node --check app.js`
(grammar only; app code itself is never edited by authors).

## 5. Chunk-count examples

- 2 chunks: `Actions speak louder / than words.` (verb-front stays whole, tail cadence).
- 3 chunks: `I would have been able to / make it into a grubber / all over again.`
  (opener | verb+object | cadence — the `roald-dahl-01.md` reference).
- 4 chunks (max, long sentences only): opener | verb | object/detail | cadence.

## 6. QA checklist

- [ ] `id` snake_case unique, `level: beginner`; exactly one `# ` and one `> ` line.
- [ ] 2–4 chunks, `## NN` sequential from 01, each with `text`/`ipa`/`hint`.
- [ ] Chunk texts joined with spaces = `# ` sentence exactly.
- [ ] Chunk IPAs joined with spaces = `> ` IPA; brackets present everywhere.
- [ ] Hints Korean + correct 마디 suffix; no English/IPA leaked into hints.
- [ ] Validation one-liner prints `valid:true`; draft saved outside `expressions/`.
