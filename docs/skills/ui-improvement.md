# UI Improvement Skill — chunk-soundpad-mvp

North star: 한 번 말하기. Every UI change must shorten time-to-first-utterance.

## 1. 4-tab semantics + view router
- Tabs: `listen` 듣기연습 / `form` 형태 / `history` 기록 / `me` 내정보 (`VIEW_TITLES`, `index.html` `#view-*`).
- Learning steps are NOT tabs — passes/modes live inside listen. Settings live inside me.
- Router pattern: `showView(v)` sets `state.view`, then `render()` toggles `.hidden` on `.view` sections and `.active` on `.tab` (`app.js` `showView`/`render`). New views must follow this — no parallel show/hide logic.

## 2. 3-section rule
- Max 3 sections per screen. New section → `hidden` toggle + single `render()` update (AGENTS.md §4).
- Listen composes `guidance` → `orb-zone` → `passes` → `commands` → `tones`; empty state hides all but CTA (`#empty-cta-wrap`). Prefer hiding over adding.

## 3. Blind-first + speak-once copy
- Target English/IPA hidden until 6 passes or peek — Korean hint only (`#cue-text`, D1).
- Fixed decks: TEST entry `틀려도 돼요. 들은 대로 말해보세요` (`beginTest`); first pass `🎉 첫 소리 성공! 틀려도 잘했어요` (`registerPass`). Keep `틀려도 돼요` verbatim.
- First-pass fanfare (tone `seq`, not TTS — avoids `SELF_VOICE` self-trigger). No perfectionism cues, no score shaming.

## 4. Toast vs heard-line
- `#heard` (`.heard`, `aria-live=polite`): screen-reader channel — state narration via `say()`. Every mode change speaks here.
- `#toast` (`.toast`, `role=status`): transient visual confirmation via `showToast()` (import results, busy guard). Never put critical state only in toast.
- Error coaching is text-only in `#heard` (e.g. `소리가 작아요…`) — no TTS spam on errors.

## 5. Badge / pulse / done
- Tab badge `#tab-badge-listen`: `n/6` while passing, `✓` + `.done` (green) when mastered, hidden at 0.
- Next action: `.is-next` on one of `#btn-play/#btn-test/#btn-train` (`nextPulse` keyframe) — order PLAY→TEST→TRAIN via `didPlay/pass/didTrain`.
- Done: `.is-done` swaps `.step-badge` number for `✓` (`style.css`). Dots: `.pass-dot.is-complete`. Recommend only — never lock buttons.

## 6. Sheets + transitions
- `showView` wraps `render()` in `document.startViewTransition()` with try/catch fallback (`app.js`). Keep the fallback.
- `<dialog>` sheet pattern is APPROVED-PENDING (`plan.md` §3) — not in code yet. Use it for future sheets/covers; do not invent a div-overlay pattern.

## 7. Mobile CSS checklist
- Container: `max-width:420px`, `.wrap min-height:100svh` (+`body 100vh`); `viewport-fit=cover`.
- `safe-area`: `tabbar` padding and `.toast` bottom use `env(safe-area-inset-bottom)`.
- `prefers-reduced-motion`: kill `.toast` transition + `.is-next` animation; `showToast` uses 0ms hide.
- NOT YET in code: `100dvh` (uses `100svh`), `touch-action:manipulation` — add both when touching mobile CSS.

## 8. Before → after (repo history)
- Blind-first cover (`6cea700`): target text rendered openly → covered until 6 passes; Korean hint + `#cue-text` carry the cue.
- Mic-first overlay (`de7e70d`): idle-first start → `#start-overlay` + `requestMic()` up front, `#btn-skip` manual fallback.
- Single import button (`c5d85b5`, D11): 4-path import UI + dead code → one `#btn-get-expressions` + autoload `loadBundled()` (−103/+4 lines).

## 8. Component system (containers + base reuse)

Containers (static HTML, named): AppShell = `header` sticky + `.view` VScroll views
(one visible via `showView`) + `.tabbar` fixed + `#start-overlay` cover + `#toast`.
TabViews: `view-listen` (sound only) / `view-form` (cards+CCQ) / `view-history`
(rows) / `view-me` (settings+library). Views never render each other.

Base (JS factory `h(tag, cls, text)` — direct `createElement` only inside `h`):
`dot-wrap`/`pass-dot` (listen) · `tone-button` (listen post-pass) · `pick` (form)
· `form-card` (form) · `hist-row` (history+me) · `ccq-card`/`ccq-ans` (form quiz)
· `cover-line`+CTA (empty states). Static shells stay in HTML; dynamic
lists/cards always via `h()`. New dynamic UI must reuse these, not invent.

## 9. Verify
- `node --check app.js` + headless Chrome console 0 errors (`--headless=new --dump-dom` + `CONSOLE` grep) + `localhost:8080` serve 200. Grammar check alone is insufficient (TDZ precedent `0aecda5`).

## Do not
- No hard locks or gates on learning actions (recommend via pulse, never disable).
- No TTS on errors (text-only escalation: silent×2 coaching, network×2 manual switch).
- No NEW emojis in chrome (tab icons predate D8 lucide plan — don't add more).
- No new deps — vanilla HTML/CSS/JS, single `app.js`, no build.
