// Chunk Sound Pad MVP — ported from Shiene1010/ayoung-ilgchunksoundpad src/routes/index.tsx
// Static, no build. Browser-native Web Speech + Web Audio only.
"use strict";

const SENTENCES = [
  {
    id: "roald_dahl_chunk_01",
    text: "I would have been able to make it into a grubber all over again.",
    ipa: "[aɪ wʊd həv bɪn ˈeɪbəl tu meɪk ɪt ˈɪntu ə ˈɡrʌbər ɔːl ˈoʊvər əˈɡen]",
    chunks: [
      { text: "I would have been able to", ipa: "[aɪ wʊd həv bɪn ˈeɪbəl tu]", hint: "내가 ~할 수 있었을 텐데 (호흡 시작 마디)" },
      { text: "make it into a grubber", ipa: "[meɪk ɪt ˈɪntu ə ˈɡrʌbər]", hint: "그것을 제과점으로 변모시키는 것을 (동사부 연결마디)" },
      { text: "all over again.", ipa: "[ɔːl ˈoʊvər əˈɡen]", hint: "처음부터 완전히 다시 (억양 매듭마디)" },
    ],
    tones: [
      { key: "declarative", emoji: "😐", label: "평서", pitch: 1, rate: 1 },
      { key: "interrogative", emoji: "❓", label: "의문", pitch: 1.12, rate: 0.95, text: "Would I have been able to make it into a grubber all over again?" },
      { key: "exclamatory", emoji: "🔥", label: "감탄", pitch: 1.15, rate: 1.05, text: "Yes! I would have been able to make it into a grubber all over again!" },
      { key: "surprised", emoji: "😲", label: "놀람", pitch: 1.25, rate: 1.15, text: "Oh my! I would have been able to make it into a grubber all over again?!" },
      { key: "sarcastic", emoji: "😏", label: "비꼼", pitch: 0.85, rate: 0.82, text: "Oh, sure... I would have been able to make it into a grubber all over again..." },
    ],
  },
];

const COMMAND_TEXT = { idle: "Let's play it now", tts: "재생 중입니다", train: "Let's train it now", stt: "문장을 소리 내어 말해보세요", mastered: "아래 5가지 톤을 눌러보세요" };
const LABELS = { idle: "학습자 명령어 듣기 대기중...", tts: "티티엣이 말한다...", train: "뒤에서부터 소리를 잇는 중...", stt: "안 보고 말하기 테스트 중...", mastered: "여섯 번의 소리가 연결됐어요" };
const VIEW_TITLES = { listen: "듣기연습", form: "형태", history: "기록", me: "내정보" };
const PATTERNS = [
  { command: "play", pattern: /\b(pl[ae]y|플레이|pray|plei)\b/ },
  { command: "train", pattern: /\b(tr[ae]in|트레인|drain|crain)\w*\b/ },
  { command: "test", pattern: /\b(te[sz]t|테스트|taste|text)\w*\b/ },
];
const WHISPERS = ["One", "Two", "Three", "Four", "Five", "Six"];

const state = { mode: "idle", pass: 0, step: null, tone: null, sentence: 0, audioReady: false, listening: false, fallback: false, started: false, guided: false, noTts: false, didPlay: false, didTrain: false, peeked: false, view: "listen", slow: false, guideVoice: true };
let audioCtx = null;
let rec = null;
let restarting = false;
// 에러 카운터: 연속 무음·네트워크 실패가 임계를 넘으면 수동 모드로 전환
const err = { nospeech: 0, net: 0 };
// TTS 자기 목소리 오인식 방지: 앱이 말한 단어는 패스로 치지 않음
const SELF_VOICE = ["one", "two", "three", "four", "five", "six", "well done", "well done you did it"];
// 북극성 지표 저장소 (기록 탭 재료): firstPassAt, totalPasses, sessions
const STATS_KEY = "cspm-stats-v1";
const PACKS_KEY = "cspm-packs-v1";
function loadStats() { try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch { return {}; } }
function saveStats(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch { /* private mode */ } }
function loadPacks() { try { const p = JSON.parse(localStorage.getItem(PACKS_KEY)); return Array.isArray(p) ? p : []; } catch { return []; } }
function savePacks(p) { try { localStorage.setItem(PACKS_KEY, JSON.stringify(p)); } catch { /* private mode */ } }
let PACKS = [];
try { PACKS = loadPacks(); } catch { PACKS = []; }
const ALL = () => SENTENCES.concat(PACKS);

const $ = (id) => document.getElementById(id);
const S = () => ALL()[state.sentence] || SENTENCES[0];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function matchCommand(t) {
  const n = t.toLowerCase().replace(/[.,!?'"“”]/g, " ").replace(/\s+/g, " ").trim();
  for (const { command, pattern } of PATTERNS) if (pattern.test(n)) return command;
  return null;
}

async function ensureAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") await audioCtx.resume();
  state.audioReady = true;
  return audioCtx;
}

async function tone(freq, ms, vol = 0.12) {
  const ctx = await ensureAudio();
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
  o.connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + ms / 1000);
}

async function seq(freqs, ms, vol) {
  for (const f of freqs) { await tone(f, ms, vol); await delay(ms); }
}

async function heartbeat() {
  const ctx = await ensureAudio();
  if (!ctx) return;
  const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = 200; fl.type = "lowpass"; fl.frequency.value = 250;
  g.gain.setValueAtTime(0.11, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  o.connect(fl).connect(g).connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + 0.06);
}

function speak(text, { pitch = 1, rate = 0.92, volume = 1 } = {}) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // 한글 안내는 한국어 음성으로, 영어 문장은 영어 음성으로
    u.lang = /[가-힣]/.test(text) ? "ko-KR" : "en-US";
    u.pitch = pitch; u.rate = rate; u.volume = volume;
    u.onend = () => resolve(); u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

async function requestMic() {
  // 시작 오버레이에서 1회: 명시적 권한 팝업으로 마이크 확보, 스트림은 즉시 반납
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

async function startSession(skipMic = false) {
  await ensureAudio();
  state.noTts = !("speechSynthesis" in window);
  const granted = skipMic ? false : await requestMic();
  $("start-overlay").classList.add("hidden");
  state.started = true;
  const st0 = loadStats(); st0.sessions = (st0.sessions || 0) + 1; saveStats(st0);
  if (!granted) state.fallback = true;
  if (state.noTts) say("이 브라우저는 소리 재생이 안 돼요. 글을 보고 연습하세요.");
  else if (!granted) say("마이크가 안 돼서 버튼으로 인증하세요.");
  else say("준비됐어요. 아래 명령을 누르거나 직접 말해보세요");
  render();
  if (!state.guided && !state.noTts && state.guideVoice) {
    state.guided = true;
    if (granted) await speak("준비됐어요. 문장은 가려져 있어요. 먼저 소리로 들어보세요.");
    else await speak("마이크가 안 돼서 버튼으로 인증하세요.");
  }
}

function stopRec() {
  restarting = false;
  try { rec && rec.abort(); } catch { /* noop */ }
  rec = null;
}

function showView(v) {
  state.view = v;
  const apply = () => render();
  if (document.startViewTransition) { try { document.startViewTransition(apply); return; } catch { /* fallback */ } }
  apply();
}

function render() {
  const isMastered = state.pass >= 6 || state.mode === "mastered";
  const revealed = state.noTts || state.peeked || state.pass >= 6 || state.mode === "mastered";
  $("view-title").textContent = VIEW_TITLES[state.view] || "듣기연습";
  document.querySelectorAll(".view").forEach((s) => s.classList.toggle("hidden", s.id !== "view-" + state.view));
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
  if (state.view === "form") renderForm();
  if (state.view === "history") renderHistory();
  if (state.view === "me") renderMe();
  if (state.view !== "listen") return;
  $("cmd-text").textContent = `“${COMMAND_TEXT[state.mode]}”`;
  $("cue-text").textContent = !isMastered && state.mode === "idle" ? "🙈 문장은 가려져 있어요. 소리로 먼저 들어보세요:" : state.mode === "idle" ? "🗣️ 위 문장 전체 소리를 들으려면 이렇게 말해보세요:" : "🎧 지금은 이 안내를 따라가세요:";
  $("guidance").style.display = isMastered ? "none" : "";
  $("orb").className = `orb state-${state.mode}${state.listening ? " is-listening" : ""}`;
  $("pip").className = `pip${state.mode === "stt" || state.listening ? " is-live" : ""}`;
  $("status").textContent = state.listening ? "듣고 있어요... 말씀하세요" : LABELS[state.mode];
  $("tap-hint").style.display = state.mode === "idle" && !state.listening ? "" : "none";
  $("target-label").textContent = `Target / 0${state.sentence + 1}`;
  $("chunk-board").classList.toggle("is-blind", state.mode === "stt");
  $("blind-cover").classList.toggle("hidden", state.mode !== "stt");
  $("pass-num").textContent = String(state.pass);
  $("btn-play").classList.toggle("is-active", state.mode === "tts" && state.step === null);
  $("btn-train").classList.toggle("is-active", state.mode === "train");
  $("btn-test").classList.toggle("is-active", state.mode === "stt");
  // 흐름 안내: 듣기→말하기→연결. 잠그지 않고 권장만 표시
  const nextCmd = !state.didPlay ? "btn-play" : state.pass === 0 ? "btn-test" : !state.didTrain ? "btn-train" : (!isMastered ? "btn-test" : null);
  ["btn-play", "btn-train", "btn-test"].forEach((id) => $(id).classList.toggle("is-next", id === nextCmd));
  $("btn-play").classList.toggle("is-done", state.didPlay);
  $("btn-train").classList.toggle("is-done", state.didTrain);
  $("btn-test").classList.toggle("is-done", isMastered);
  $("btn-manual").classList.toggle("hidden", state.mode !== "stt");
  $("btn-peek").classList.toggle("hidden", revealed);
  $("tone-lock").textContent = isMastered ? "✨" : "🔒";
  $("tone-note").style.display = isMastered ? "none" : "";
  $("cafe-link").classList.toggle("hidden", !isMastered);

  const dots = $("dots");
  dots.innerHTML = "";
  WHISPERS.forEach((_, i) => {
    const w = document.createElement("div");
    w.className = "dot-wrap";
    const d = document.createElement("span");
    d.className = `pass-dot${i < state.pass ? " is-complete" : ""}`;
    const n = document.createElement("span");
    n.textContent = `0${i + 1}`;
    w.append(d, n); dots.append(w);
  });

  const body = $("board-body");
  body.innerHTML = "";
  const steps = backwardSteps();
  if (!revealed && state.step !== null && steps[state.step]) {
    // 블라인드 퍼스트: 훈련 중에도 영어 텍스트·IPA 미공개, 단계+한글 힌트만
    const s = steps[state.step];
    const tag = document.createElement("div");
    tag.innerHTML = `<span class="step-tag">${s.step}</span><span class="kicker">뒤에서부터 연결</span>`;
    const cover = document.createElement("p");
    cover.className = "cover-line";
    cover.textContent = "🙈 소리로 먼저 들으세요";
    const hint = document.createElement("p");
    hint.className = "ipa"; hint.textContent = s.hint;
    const box = document.createElement("div");
    box.append(tag, cover, hint); body.append(box);
  } else if (!revealed) {
    // 블라인드 퍼스트: 타겟 문장 가리고 시작, 통과 후 공개
    const cover = document.createElement("p");
    cover.className = "cover-line";
    cover.textContent = "🙈 문장이 가려져 있어요. 소리로 먼저 들어보세요";
    const hints = document.createElement("div");
    hints.className = "hints";
    S().chunks.forEach((c, i) => {
      const h = document.createElement("p");
      h.innerHTML = `<span>0${i + 1}</span>`;
      h.append(document.createTextNode(c.hint || c.text));
      hints.append(h);
    });
    body.append(cover, hints);
  } else if (state.step !== null && steps[state.step]) {
    const s = steps[state.step];
    const tag = document.createElement("div");
    tag.innerHTML = `<span class="step-tag">${s.step}</span><span class="kicker">뒤에서부터 연결</span>`;
    const p = document.createElement("p");
    p.className = "sentence"; p.style.fontSize = "25px"; p.textContent = s.text;
    const ipa = document.createElement("p");
    ipa.className = "ipa"; ipa.textContent = s.ipa;
    const box = document.createElement("div");
    box.append(tag, p, ipa); body.append(box);
  } else {
    const p = document.createElement("p");
    p.className = "sentence"; p.textContent = S().text;
    const hints = document.createElement("div");
    hints.className = "hints";
    S().chunks.forEach((c, i) => {
      const h = document.createElement("p");
      h.innerHTML = `<span>0${i + 1}</span>`;
      h.append(document.createTextNode(c.hint || c.text));
      hints.append(h);
    });
    body.append(p, hints);
  }

  const grid = $("tone-grid");
  grid.innerHTML = "";
  (S().tones || []).forEach((t) => {
    const b = document.createElement("button");
    b.type = "button"; b.disabled = !isMastered;
    b.className = `tone-button${state.tone === t.key ? " is-active" : ""}`;
    b.setAttribute("aria-label", `${t.label} 톤으로 듣기`);
    b.innerHTML = `<span style="font-size:24px">${t.emoji}</span><span>${t.label}</span>`;
    b.addEventListener("click", () => void playEmotion(t));
    grid.append(b);
  });
}

function renderForm() {
  const s = S();
  const picker = $("sentence-picker");
  picker.innerHTML = "";
  ALL().forEach((item, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `pick${i === state.sentence ? " is-on" : ""}`;
    b.textContent = `문장 0${i + 1}`;
    b.title = item.text;
    b.addEventListener("click", () => { state.sentence = i; state.pass = 0; state.step = null; state.didPlay = false; state.didTrain = false; state.peeked = false; if (state.mode !== "idle") { stopRec(); state.mode = "idle"; } render(); });
    picker.append(b);
  });
  const box = $("form-cards");
  box.innerHTML = "";
  const full = document.createElement("p");
  full.className = "form-full"; full.textContent = s.text;
  box.append(full);
  s.chunks.forEach((c, i) => {
    const card = document.createElement("button");
    card.type = "button"; card.className = "form-card";
    card.innerHTML = `<span class="step-badge">0${i + 1}</span>`;
    const t = document.createElement("p"); t.className = "form-text"; t.textContent = c.text;
    const ipa = document.createElement("p"); ipa.className = "ipa"; ipa.textContent = c.ipa || "";
    const hint = document.createElement("p"); hint.className = "form-hint"; hint.textContent = c.hint || "";
    card.append(t, ipa, hint);
    card.addEventListener("click", () => void speak(c.text, { rate: state.slow ? 0.65 : 0.85 }));
    box.append(card);
  });
}

function renderHistory() {
  const st = loadStats();
  const box = $("history-body");
  box.innerHTML = "";
  const rows = [
    ["첫 말하기", st.firstPassAt ? new Date(st.firstPassAt).toLocaleString() + " 🎉" : "아직 없어요. 첫 소리를 내보세요"],
    ["통산 발화", String(st.totalPasses || 0) + "회"],
    ["세션", String(st.sessions || 0) + "회"],
  ];
  rows.forEach(([k, v]) => {
    const r = document.createElement("div"); r.className = "hist-row";
    const a = document.createElement("span"); a.textContent = k;
    const b = document.createElement("b"); b.textContent = v;
    r.append(a, b); box.append(r);
  });
}

function renderMe() {
  const slow = $("set-slow"), guide = $("set-guide");
  slow.textContent = state.slow ? "켬" : "끔";
  slow.setAttribute("aria-pressed", String(state.slow));
  guide.textContent = state.guideVoice ? "켬" : "끔";
  guide.setAttribute("aria-pressed", String(state.guideVoice));
  const list = $("pack-list");
  list.innerHTML = "";
  if (PACKS.length === 0) {
    const p = document.createElement("p"); p.className = "tone-note"; p.textContent = "가져온 표현이 없어요";
    list.append(p);
  }
  PACKS.forEach((p, i) => {
    const r = document.createElement("div"); r.className = "hist-row";
    const a = document.createElement("span"); a.textContent = (p.text || "").slice(0, 28) + "…";
    const del = document.createElement("button"); del.type = "button"; del.className = "peek"; del.textContent = "삭제";
    del.addEventListener("click", () => {
      PACKS.splice(i, 1); savePacks(PACKS);
      if (state.sentence >= SENTENCES.length + PACKS.length) state.sentence = 0;
      render();
    });
    r.append(a, del); list.append(r);
  });
}

function backwardSteps() {
  const s = S();
  const n = s.chunks.length;
  const last = s.chunks[n - 1], prev = s.chunks[n - 2];
  return [
    { text: last.text, ipa: last.ipa, step: "01", hint: last.hint },
    { text: `${prev ? prev.text + " " : ""}${last.text}`, ipa: `${prev ? (prev.ipa || "") + " " : ""}${last.ipa || ""}`, step: "02", hint: `${prev ? prev.hint + " + " : ""}${last.hint}` },
    { text: s.text, ipa: s.ipa, step: "03", hint: "전체 문장 소리" },
  ];
}

function say(msg) { $("heard").textContent = msg; }

async function registerPass() {
  if (state.pass >= 6) return;
  state.pass += 1;
  const st = loadStats();
  st.totalPasses = (st.totalPasses || 0) + 1;
  if (!st.firstPassAt) st.firstPassAt = new Date().toISOString();
  saveStats(st);
  const first = state.pass === 1;
  say(first ? "🎉 첫 소리 성공! 틀려도 잘했어요" : `${state.pass}번째 소리를 받았어요`);
  render();
  if (first) await seq([392, 523.25, 659.25], 120, 0.12); // 첫 발화 전용 팡파레 (TTS 아님: 자기인식 방지)
  await tone(1046.5, 300, 0.14);
  const w = WHISPERS[state.pass - 1];
  if (w) await speak(w, { pitch: 0.9, rate: 0.74, volume: 0.45 });
  if (state.pass === 6) {
    stopRec();
    state.mode = "mastered"; state.fallback = false;
    render();
    await seq([523.25, 659.25, 784, 1046.5], 100, 0.14);
    await speak("Well done, you did it!", { pitch: 1.08, rate: 0.92 });
  }
}

function newRecognizer() {
  const C = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = "en-US"; r.continuous = false; r.interimResults = false;
  return r;
}

function startTestRec() {
  const r = newRecognizer();
  if (!r) { state.fallback = true; say("이 브라우저에서는 마이크 대신 수동 인증을 사용해 주세요"); render(); return; }
  stopRec();
  rec = r; restarting = true;
  let done = false;
  r.onresult = (e) => {
    const t = e.results[0]?.[0]?.transcript ?? "";
    const norm = t.toLowerCase().replace(/[.,!?'"“”]/g, " ").replace(/\s+/g, " ").trim();
    if (norm && SELF_VOICE.includes(norm)) return; // 앱 TTS 자기 목소리 무시
    say(t ? `들린 소리 · ${t}` : "소리를 받았어요");
    // 빈 결과로는 카운트하지 않고, 실제 transcript가 있을 때만 통과
    if (state.mode === "stt" && !done && t.trim()) { done = true; err.nospeech = 0; err.net = 0; void registerPass(); }
    else if (state.mode === "stt" && !done && !t.trim()) say("소리가 너무 작았어요. 다시 말해보세요");
  };
  r.onspeechend = () => { try { r.stop(); } catch { /* noop */ } };
  r.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      restarting = false; state.fallback = true;
      say("마이크 권한이 없어 수동 인증을 열었어요"); render();
    } else if (e.error === "network") {
      err.net += 1;
      if (err.net >= 2) {
        restarting = false; state.fallback = true;
        say("인식이 계속 안 돼요. 버튼으로 계속하세요."); render();
      }
    } else if (e.error === "no-speech") {
      err.nospeech += 1;
      if (err.nospeech === 2) say("소리가 작아요. 크게 말해보세요.");
    }
  };
  r.onend = () => {
    rec = null;
    if (state.mode === "stt" && state.pass < 6 && restarting) setTimeout(startTestRec, 400);
  };
  try { r.start(); say("마이크가 듣고 있어요"); }
  catch { state.fallback = true; render(); }
}

async function playSentence() {
  stopRec();
  state.mode = "tts"; state.step = null; say("전체 문장을 들려드릴게요"); render();
  await ensureAudio(); await delay(500);
  await seq([261.63, 329.63, 392], 100);
  await speak(S().text, { rate: state.slow ? 0.65 : 0.92 });
  state.didPlay = true;
  state.mode = "idle"; say("다시 듣거나, 뒤에서부터 연결해 보세요"); render();
}

async function trainBackward() {
  stopRec();
  state.mode = "train"; say("마지막 소리부터 앞으로 붙입니다"); render();
  const steps = backwardSteps();
  for (let i = 0; i < steps.length; i++) {
    state.step = i; render();
    await speak(steps[i].text, { rate: state.slow ? 0.7 : 0.92 });
    if (i < steps.length - 1) { await heartbeat(); await delay(1200); }
  }
  state.didTrain = true;
  state.mode = "idle"; say("세 덩어리가 하나로 연결됐어요"); render();
}

async function beginTest() {
  stopRec();
  state.mode = "stt"; state.step = null;
  say("틀려도 돼요. 들은 대로 말해보세요"); render();
  await ensureAudio(); await delay(300);
  await seq([880, 1200], 40, 0.1);
  startTestRec();
}

function resetSession() {
  stopRec();
  state.listening = false;
  err.nospeech = 0; err.net = 0;
  window.speechSynthesis && window.speechSynthesis.cancel();
  if (audioCtx && audioCtx.state !== "closed") audioCtx.close().catch(() => undefined);
  audioCtx = null;
  state.mode = "idle"; state.pass = 0; state.step = null; state.tone = null;
  state.didPlay = false; state.didTrain = false; state.peeked = false;
  state.fallback = false; state.audioReady = false;
  say("화면을 한 번 터치해 소리를 깨워주세요");
  render();
}

async function playEmotion(t) {
  state.tone = t.key; state.mode = "tts"; render();
  await speak(t.text || S().text, { pitch: t.pitch, rate: t.rate, volume: t.key === "exclamatory" ? 1 : 0.94 });
  state.mode = "mastered"; state.tone = null; render();
}

function handleOrbTap() {
  if (state.mode !== "idle" && state.mode !== "mastered") return;
  void ensureAudio();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0; u.rate = 10;
    window.speechSynthesis.speak(u);
  }
  const r = newRecognizer();
  if (!r) { state.fallback = true; say("이 브라우저에서는 마이크 대신 아래 버튼을 눌러 주세요"); render(); return; }
  try { rec && rec.abort(); } catch { /* noop */ }
  rec = r;
  let handled = false;
  r.onresult = (e) => {
    const t = (e.results[e.results.length - 1]?.[0]?.transcript || "").toLowerCase();
    say(t ? `들은 명령 · ${t}` : "소리를 받았어요");
    const c = matchCommand(t);
    if (c && !handled) {
      handled = true;
      if (c === "play") void playSentence();
      else if (c === "train") void trainBackward();
      else if (c === "test") void beginTest();
    }
  };
  r.onerror = (e) => {
    state.listening = false; render();
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      state.fallback = true; say("마이크 권한이 없어 수동 인증을 열었어요");
    } else if (!handled) say("잘 듣지 못했어요. 오브를 다시 탭하고 말해보세요");
    render();
  };
  r.onend = () => { rec = null; state.listening = false; render(); };
  try { r.start(); state.listening = true; say("듣고 있어요... 말씀하세요"); }
  catch { state.listening = false; say("오브를 다시 탭하고 말해보세요"); }
  render();
}

// 재생 중 중복 탭 가드: tts/train 진행 중 명령은 텍스트로만 안내
function busy() {
  if (state.mode === "tts" || state.mode === "train") {
    say("지금은 듣는 중이에요. 끝나면 눌러주세요");
    return true;
  }
  return false;
}

function importPack() {
  const msg = $("import-msg");
  let obj;
  try { obj = JSON.parse($("import-text").value); }
  catch { msg.textContent = "JSON 파싱 실패. 형식을 확인하세요"; return; }
  if (!obj || typeof obj.text !== "string" || !Array.isArray(obj.chunks) || obj.chunks.length === 0 || !obj.chunks.every((c) => c && typeof c.text === "string")) {
    msg.textContent = "필요: {text, chunks:[{text}]} (hint·ipa 선택)";
    return;
  }
  obj.id = "pack_" + Date.now();
  obj.tones = obj.tones || [];
  PACKS.push(obj); savePacks(PACKS);
  $("import-text").value = "";
  msg.textContent = `가져옴: 문장 0${SENTENCES.length + PACKS.length}`;
  render();
}

$("btn-start").addEventListener("click", () => void startSession(false));
$("btn-skip").addEventListener("click", () => void startSession(true));
$("orb").addEventListener("pointerdown", handleOrbTap);
$("btn-play").addEventListener("click", () => { if (!busy()) void playSentence(); });
$("btn-train").addEventListener("click", () => { if (!busy()) void trainBackward(); });
$("btn-test").addEventListener("click", () => { if (!busy()) void beginTest(); });
$("btn-reset").addEventListener("click", resetSession);
$("btn-manual").addEventListener("click", () => void registerPass());
$("btn-peek").addEventListener("click", () => { state.peeked = true; say("글로 확인했어요. 소리로 다시 외워보세요"); render(); });
document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
$("set-slow").addEventListener("click", () => { state.slow = !state.slow; render(); });
$("set-guide").addEventListener("click", () => { state.guideVoice = !state.guideVoice; render(); });
$("btn-import").addEventListener("click", importPack);
$("btn-clear-stats").addEventListener("click", () => { try { localStorage.removeItem(STATS_KEY); } catch { /* noop */ } render(); });
$("app").addEventListener("pointerdown", () => { if (!state.audioReady) void ensureAudio(); });
// 화면 꺼짐·전화 수신 시 인식 중단, 복귀 시 stt면 재개
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopRec();
  else if (state.started && state.mode === "stt" && state.pass < 6 && !state.fallback) startTestRec();
});

render();
