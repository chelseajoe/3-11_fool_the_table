import {
  connect, configMissing, db, ref, onValue, set, update, get,
  now, mascotById, normalize, escapeHTML, makeId, makeRoomCode,
  sleep, store, recall, sfx, setMuted, muted
} from "./shared.js";
import { QUESTIONS, SETTINGS } from "./questions.js";

const $ = id => document.getElementById(id);
const SCREENS = ["setup", "start", "lobby", "write", "vote", "reveal", "fact", "scores", "end"];
let current = null;
function show(name) {
  SCREENS.forEach(s => $("s-" + s).classList.toggle("hidden", s !== name));
  current = name;
}

let code = null;        // room code
let room = null;        // latest copy of the room data
let unsub = null;
let gameOrder = null;
let advancing = false;
let revealRunning = false;
let skipReveal = false;
let lastTick = null;
let optKey = "";
let seenPlates = new Set();
let prevDone = 0;
let prevTeams = 0;
let qrFor = null;

const R = path => ref(db, `rooms/${code}${path ? "/" + path : ""}`);
const st = () => (room && room.state) || {};
const getOrder = () => (room && room.qOrder) || gameOrder;
const teamList = () =>
  Object.entries((room && room.teams) || {})
    .map(([id, t]) => ({ id, ...t }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
const currentQ = () => { const o = getOrder(); return o ? QUESTIONS[o[st().qNum]] : null; };
const acceptSet = q => new Set([q.answer, ...(q.accept || [])].map(normalize));

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function tidy(t) {
  t = String(t || "").trim().replace(/\s+/g, " ").slice(0, 40);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function promptHTML(p) {
  return escapeHTML(p || "").replace(/_{3,}/, '<span class="blank">&nbsp;</span>');
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), 2800);
}
function face(m) {
  return `<div class="face" style="background:${m.color}26">${m.emoji}</div>`;
}
function chipHTML(t) {
  const m = mascotById(t.mascot);
  return `<div class="chip">${face(m)}<div class="nm">${escapeHTML(t.name)}</div></div>`;
}

// ── Start up ─────────────────────────────────────────────────
$("ptTruth").textContent = `+${SETTINGS.truthPoints.toLocaleString()}`;
$("ptFool").textContent = `+${SETTINGS.foolPoints.toLocaleString()}`;
for (let n = 1; n <= QUESTIONS.length; n++) {
  const o = document.createElement("option");
  o.value = n; o.textContent = n === QUESTIONS.length ? `${n} (all)` : n;
  if (n === 7) o.selected = true;
  $("qCount").appendChild(o);
}

$("muteBtn").onclick = () => { setMuted(!muted); $("muteBtn").textContent = muted ? "🔇" : "🔊"; };

if (configMissing()) {
  show("setup");
} else {
  connect(on => { $("conn").className = "dot " + (on ? "on" : "off"); if (!on && code) toast("Connection lost. Trying to reconnect…"); });
  show("start");
  const saved = recall("ftt_host_room");
  if (saved) {
    get(ref(db, `rooms/${saved}/state`)).then(s => {
      if (s.exists()) {
        $("resumeBtn").textContent = `Continue game ${saved}`;
        $("resumeBtn").classList.remove("hidden");
      }
    }).catch(() => {});
  }
  $("newRoomBtn").onclick = () => createRoom().catch(e => toast("Couldn't create a room: " + e.message));
  $("resumeBtn").onclick = () => openRoom(saved);
}

async function createRoom() {
  let c;
  for (let i = 0; i < 8; i++) {
    c = makeRoomCode();
    const s = await get(ref(db, `rooms/${c}/state`));
    if (!s.exists()) break;
  }
  await set(ref(db, `rooms/${c}`), { createdAt: Date.now(), state: { phase: "lobby" } });
  openRoom(c);
}

function openRoom(c) {
  code = c;
  store("ftt_host_room", c);
  $("roomTag").textContent = c;
  $("roomTag").classList.remove("hidden");
  current = null;
  seenPlates = new Set();
  if (unsub) unsub();
  unsub = onValue(R(""), snap => { room = snap.val() || {}; render(); });
}

// ── Render on every data change ──────────────────────────────
function render() {
  runAI();
  const s = st();
  const phase = s.phase || "lobby";
  $("progress").textContent = (phase !== "lobby" && phase !== "end" && s.total) ? `Question ${s.qNum + 1} of ${s.total}` : "";
  renderTable(phase);

  if (phase === "lobby") {
    if (current !== "lobby") { setupLobby(); show("lobby"); }
    renderLobby();
  } else if (phase === "write") {
    if (current !== "write") enterWrite();
    checkAnswers();
  } else if (phase === "vote") {
    if (current !== "vote") { optKey = ""; $("vPrompt").innerHTML = promptHTML(s.prompt); show("vote"); }
    renderVoteOptions();
  } else if (phase === "reveal") {
    if (!revealRunning && current !== "reveal" && current !== "fact") runReveal();
  } else if (phase === "scores") {
    if (current !== "scores") enterScores();
  } else if (phase === "end") {
    if (current !== "end") enterEnd();
  }
}

function renderTable(phase) {
  const teams = teamList();
  const row = $("tableRow");
  row.classList.toggle("hidden", teams.length === 0 || phase === "end");
  const s = st();
  const ans = (room.answers && room.answers[s.qNum]) || {};
  const votes = (room.votes && room.votes[s.qNum]) || {};
  let done = 0;
  row.innerHTML = teams.map(t => {
    const m = mascotById(t.mascot);
    let isDone = false, badge = "";
    if (phase === "write") { isDone = !!(ans[t.id] && ans[t.id].ok); badge = isDone ? "✓" : "✍️"; }
    if (phase === "vote") { isDone = votes[t.id] != null; badge = isDone ? "✓" : "🤔"; }
    if (isDone) done++;
    const isNew = !seenPlates.has(t.id);
    seenPlates.add(t.id);
    const cls = ["plate", isDone ? "done" : "", t.online === false ? "offline" : "", phase === "lobby" ? "kickable" : "", isNew ? "new" : ""].join(" ");
    return `<div class="${cls}" data-id="${t.id}" ${phase === "lobby" ? 'title="Click to remove this team"' : ""}>
      ${badge ? `<span class="badge">${badge}</span>` : ""}
      ${face(m)}
      <div class="tn">${escapeHTML(t.name)}</div>
      <div class="sc">${(t.score || 0).toLocaleString()}</div>
    </div>`;
  }).join("");
  if ((phase === "write" || phase === "vote") && done > prevDone) sfx.lock();
  prevDone = (phase === "write" || phase === "vote") ? done : 0;
}

$("tableRow").addEventListener("click", async e => {
  const p = e.target.closest(".plate");
  if (!p || st().phase !== "lobby") return;
  const t = room.teams && room.teams[p.dataset.id];
  if (!t || !confirm(`Remove the team "${t.name}"?`)) return;
  await update(R(""), { [`teams/${p.dataset.id}`]: null, [`mascots/${t.mascot}`]: null });
});

// ── Lobby ────────────────────────────────────────────────────
function joinURL() {
  const u = new URL("index.html", location.href);
  u.searchParams.set("room", code);
  return u.toString();
}
function setupLobby() {
  const base = new URL("index.html", location.href).toString();
  $("joinUrl").textContent = base.replace(/^https?:\/\//, "").replace(/index\.html$/, "");
  $("roomCode").textContent = code;
  if (qrFor !== code) {
    $("qr").innerHTML = "";
    if (window.QRCode) new window.QRCode($("qr"), { text: joinURL(), width: 190, height: 190 });
    else $("qr").classList.add("hidden");
    qrFor = code;
  }
}
function renderLobby() {
  const n = teamList().length;
  $("startBtn").disabled = n < 2;
  $("aiBtn").textContent = aiInGame() ? "🤖 Remove the AI team" : "🤖 Add the AI team";
  $("lobbyHint").textContent = n < 2 ? "Waiting for at least 2 teams…" : `${n} teams at the table. Click a team below to remove it.`;
  if (n > prevTeams) sfx.join();
  prevTeams = n;
}
$("startBtn").onclick = () => advance(startGame);

// ── AI team ──────────────────────────────────────────────────
const AI_ID = "ai-team";
const aiPlanned = new Set();
const rand = (a, b) => a + Math.random() * (b - a);
const aiInGame = () => !!(room && room.teams && room.teams[AI_ID]);

$("aiBtn").onclick = async () => {
  if (st().phase !== "lobby") return;
  if (aiInGame()) {
    await update(R(""), { [`teams/${AI_ID}`]: null, "mascots/robot": null });
  } else {
    await update(R(""), {
      [`teams/${AI_ID}`]: { name: "AI", mascot: "robot", score: 0, lastDelta: 0, joinedAt: Date.now(), online: true, bot: true },
      "mascots/robot": AI_ID
    });
  }
};

// Runs on every update: makes the AI write a fake and vote, like a real team
function runAI() {
  if (!aiInGame()) return;
  const s = st();
  const q = currentQ();
  if (!q) return;
  const key = `${code}|${s.phase}|${s.qNum}`;
  if (aiPlanned.has(key)) return;

  if (s.phase === "write") {
    const ans = room.answers && room.answers[s.qNum] && room.answers[s.qNum][AI_ID];
    if (ans) return;
    aiPlanned.add(key);
    const latest = Math.max(1500, (s.deadline || 0) - now() - 4000);
    setTimeout(() => {
      const cur = st();
      if (cur.phase !== "write" || cur.qNum !== s.qNum) return;
      const acc = acceptSet(q);
      const taken = new Set(Object.values((room.answers && room.answers[s.qNum]) || {}).map(a => normalize(a && a.text)));
      const usable = list => (list || []).filter(t => !acc.has(normalize(t)) && !taken.has(normalize(t)));
      const choices = usable(q.ai).length ? usable(q.ai) : usable(q.decoys).length ? usable(q.decoys) : (q.ai || q.decoys || []);
      const pick = choices[Math.floor(Math.random() * choices.length)];
      if (pick) set(R(`answers/${s.qNum}/${AI_ID}`), { text: pick, at: Date.now() });
    }, Math.min(rand(9000, 20000), latest));
  }

  if (s.phase === "vote") {
    const v = room.votes && room.votes[s.qNum] && room.votes[s.qNum][AI_ID];
    if (v) return;
    aiPlanned.add(key);
    const latest = Math.max(1500, (s.deadline || 0) - now() - 3000);
    setTimeout(() => {
      const cur = st();
      if (cur.phase !== "vote" || cur.qNum !== s.qNum) return;
      const opts = (room.options && room.options[s.qNum]) || {};
      const truth = room.secret && room.secret[s.qNum];
      const mine = id => opts[id] && opts[id].owners && opts[id].owners[AI_ID];
      const ok = Object.keys(opts).filter(id => !mine(id));
      const fakes = ok.filter(id => id !== truth);
      const goTruth = ok.includes(truth) && (Math.random() < (SETTINGS.aiSmartness ?? 0.55) || !fakes.length);
      const pick = goTruth ? truth : fakes[Math.floor(Math.random() * fakes.length)];
      if (pick) set(R(`votes/${s.qNum}/${AI_ID}`), pick);
    }, Math.min(rand(5000, 12000), latest));
  }
}

async function startGame() {
  const n = Math.min(+$("qCount").value || 7, QUESTIONS.length);
  gameOrder = shuffle([...QUESTIONS.keys()]).slice(0, n);
  const upd = { qOrder: gameOrder, answers: null, votes: null, options: null, secret: null, scored: null };
  teamList().forEach(t => { upd[`teams/${t.id}/score`] = 0; upd[`teams/${t.id}/lastDelta`] = 0; });
  await update(R(""), upd);
  await startQuestion(0, n);
}

async function startQuestion(qNum, total) {
  const q = QUESTIONS[getOrder()[qNum]];
  lastTick = null;
  await set(R("state"), {
    phase: "write", qNum, total,
    prompt: q.prompt,
    double: total > 1 && qNum === total - 1,
    deadline: now() + SETTINGS.writeSeconds * 1000
  });
}

// ── Write phase ──────────────────────────────────────────────
function enterWrite() {
  const s = st();
  $("wPrompt").innerHTML = promptHTML(s.prompt);
  $("doubleBanner").classList.toggle("hidden", !s.double);
  show("write");
}

// Checks each team's fake. If they typed the REAL answer, their phone asks for a new one.
function checkAnswers() {
  const q = currentQ();
  if (!q) return;
  const acc = acceptSet(q);
  const s = st();
  const ans = (room.answers && room.answers[s.qNum]) || {};
  for (const [tid, a] of Object.entries(ans)) {
    if (!a || a.truth || a.ok) continue;
    if (acc.has(normalize(a.text))) update(R(`answers/${s.qNum}/${tid}`), { truth: true });
    else update(R(`answers/${s.qNum}/${tid}`), { ok: true });
  }
}
$("wSkip").onclick = () => advance(startVote);

// ── Vote phase ───────────────────────────────────────────────
async function startVote() {
  const s = st();
  if (s.phase !== "write") return;
  const q = currentQ();
  const acc = acceptSet(q);
  const ans = (room.answers && room.answers[s.qNum]) || {};
  const map = new Map();
  for (const [tid, a] of Object.entries(ans)) {
    if (!a || a.truth) continue;
    const key = normalize(a.text);
    if (!key || acc.has(key)) continue;
    if (!map.has(key)) map.set(key, { text: tidy(a.text), owners: {} });
    map.get(key).owners[tid] = true;
  }
  const items = [...map.values()];
  for (const d of shuffle([...(q.decoys || [])])) {
    if (items.length + 1 >= SETTINGS.minOptions) break;
    const key = normalize(d);
    if (map.has(key) || acc.has(key)) continue;
    const it = { text: d, house: true };
    items.push(it); map.set(key, it);
  }
  const truthId = "o" + makeId(6);
  const all = shuffle([...items.map(it => ({ ...it, id: "o" + makeId(6) })), { id: truthId, text: q.answer }]);
  const options = {};
  all.forEach((o, i) => {
    options[o.id] = { text: o.text, order: i };
    if (o.owners) options[o.id].owners = o.owners;
    if (o.house) options[o.id].house = true;
  });
  await update(R(""), { [`options/${s.qNum}`]: options, [`secret/${s.qNum}`]: truthId });
  lastTick = null;
  await update(R("state"), { phase: "vote", deadline: now() + SETTINGS.voteSeconds * 1000 });
}

function renderVoteOptions() {
  const s = st();
  const opts = (room.options && room.options[s.qNum]) || {};
  const list = Object.entries(opts).sort((a, b) => a[1].order - b[1].order);
  const key = list.map(([id]) => id).join(",");
  if (key === optKey) return;
  optKey = key;
  $("vOptions").innerHTML = list.map(([id, o], i) =>
    `<div class="placecard" style="animation-delay:${i * 90}ms">${escapeHTML(o.text)}<button class="rm" data-id="${id}" title="Remove this answer" aria-label="Remove this answer">✕</button></div>`
  ).join("");
}

// Teacher can remove an inappropriate fake (hover a card, click ✕)
$("vOptions").addEventListener("click", async e => {
  const b = e.target.closest(".rm");
  if (!b) return;
  const s = st();
  const id = b.dataset.id;
  if (room.secret && room.secret[s.qNum] === id) { toast("This answer can't be removed."); return; }
  if (!confirm("Remove this answer from the game?")) return;
  const upd = { [`options/${s.qNum}/${id}`]: null };
  Object.entries((room.votes && room.votes[s.qNum]) || {}).forEach(([tid, v]) => { if (v === id) upd[`votes/${s.qNum}/${tid}`] = null; });
  await update(R(""), upd);
});
$("vSkip").onclick = () => advance(startReveal);

// ── Reveal ───────────────────────────────────────────────────
async function startReveal() {
  if (st().phase !== "vote") return;
  await update(R("state"), { phase: "reveal", deadline: null });
}

async function runReveal() {
  revealRunning = true;
  skipReveal = false;
  show("reveal");
  const s = st();
  const q = currentQ();
  const mult = s.double ? 2 : 1;
  $("rPrompt").innerHTML = promptHTML(s.prompt);
  const opts = (room.options && room.options[s.qNum]) || {};
  const votes = (room.votes && room.votes[s.qNum]) || {};
  const truthId = room.secret && room.secret[s.qNum];
  const byId = Object.fromEntries(teamList().map(t => [t.id, t]));
  const votersOf = id => Object.entries(votes).filter(([tid, v]) => v === id && byId[tid]).map(([tid]) => byId[tid]);
  const lies = Object.entries(opts)
    .filter(([id]) => id !== truthId)
    .map(([id, o]) => ({ id, ...o, voters: votersOf(id) }))
    .filter(o => o.voters.length > 0)
    .sort((a, b) => a.voters.length - b.voters.length);

  const stage = $("rStage");
  const wait = ms => skipReveal ? Promise.resolve() : sleep(ms);

  for (const o of lies) {
    if (skipReveal) break;
    stage.innerHTML = `<div class="placecard reveal-card">${escapeHTML(o.text)}</div><div class="voters"></div>`;
    sfx.pop();
    await wait(1200);
    const vEl = stage.querySelector(".voters");
    for (const t of o.voters) { vEl.insertAdjacentHTML("beforeend", chipHTML(t)); sfx.pop(); await wait(450); }
    await wait(800);
    stage.insertAdjacentHTML("beforeend", `<div class="verdict lie">FAKE! 🤥</div>`);
    sfx.lie();
    vEl.querySelectorAll(".chip").forEach(c => c.classList.add("fooled"));
    await wait(1000);
    const authors = Object.keys(o.owners || {}).map(id => byId[id]).filter(Boolean);
    const by = authors.length
      ? `Written by ${authors.map(a => `${mascotById(a.mascot).emoji} ${escapeHTML(a.name)}`).join(" and ")}: +${(SETTINGS.foolPoints * mult * o.voters.length).toLocaleString()}${authors.length > 1 ? " each" : ""}`
      : `That was the game's own fake! 🏠`;
    stage.insertAdjacentHTML("beforeend", `<div class="byline">${by}</div>`);
    await wait(2800);
  }

  if (!skipReveal) {
    const tv = votersOf(truthId);
    stage.innerHTML = `<div class="placecard reveal-card">${escapeHTML((opts[truthId] && opts[truthId].text) || q.answer)}</div><div class="voters"></div>`;
    sfx.pop();
    await wait(1500);
    const vEl = stage.querySelector(".voters");
    for (const t of tv) { vEl.insertAdjacentHTML("beforeend", chipHTML(t)); sfx.pop(); await wait(450); }
    await wait(700);
    stage.insertAdjacentHTML("beforeend", `<div class="verdict truth">THE TRUTH! ✅</div>`);
    sfx.truth();
    if (tv.length) confetti(18);
    vEl.querySelectorAll(".chip").forEach(c => c.classList.add("happy"));
    await wait(900);
    stage.insertAdjacentHTML("beforeend", `<div class="byline">${tv.length
      ? `+${(SETTINGS.truthPoints * mult).toLocaleString()} for each team that found it`
      : "Nobody found the real answer! 😱"}</div>`);
    await wait(3200);
  }

  $("fAnswer").textContent = q.answer;
  $("fText").textContent = q.fact;
  show("fact");
  revealRunning = false;
}
$("rSkip").onclick = () => { skipReveal = true; };

$("fNext").onclick = () => advance(async () => {
  await applyScores();
  await update(R("state"), { phase: "scores" });
});

function computeDeltas() {
  const s = st();
  const mult = s.double ? 2 : 1;
  const opts = (room.options && room.options[s.qNum]) || {};
  const votes = (room.votes && room.votes[s.qNum]) || {};
  const truthId = room.secret && room.secret[s.qNum];
  const d = {};
  for (const [tid, v] of Object.entries(votes)) {
    if (v === truthId) d[tid] = (d[tid] || 0) + SETTINGS.truthPoints * mult;
    else {
      const o = opts[v];
      if (!o) continue;
      Object.keys(o.owners || {}).forEach(oid => { if (oid !== tid) d[oid] = (d[oid] || 0) + SETTINGS.foolPoints * mult; });
    }
  }
  return d;
}

async function applyScores() {
  const s = st();
  if (room.scored && room.scored[s.qNum]) return; // never count a question twice
  const deltas = computeDeltas();
  const upd = { [`scored/${s.qNum}`]: true };
  teamList().forEach(t => {
    const d = deltas[t.id] || 0;
    upd[`teams/${t.id}/score`] = (t.score || 0) + d;
    upd[`teams/${t.id}/lastDelta`] = d;
  });
  await update(R(""), upd);
}

// ── Scores ───────────────────────────────────────────────────
function enterScores() {
  const s = st();
  const teams = teamList().sort((a, b) => (b.score || 0) - (a.score || 0));
  const max = Math.max(1, ...teams.map(t => t.score || 0));
  $("scoreList").innerHTML = teams.map((t, i) => {
    const m = mascotById(t.mascot);
    return `<div class="scorerow" style="animation-delay:${i * 120}ms">
      <div class="rank">${i + 1}</div>
      ${face(m)}
      <div><div class="tn">${i === 0 && (t.score || 0) > 0 ? "👑 " : ""}${escapeHTML(t.name)}</div><div class="bar" style="width:0" data-w="${Math.round((t.score || 0) / max * 100)}%"></div></div>
      <div class="pts">${(t.score || 0).toLocaleString()}${t.lastDelta ? `<span class="delta">+${t.lastDelta.toLocaleString()}</span>` : ""}</div>
    </div>`;
  }).join("");
  show("scores");
  setTimeout(() => document.querySelectorAll(".scorerow .bar").forEach(b => { b.style.width = b.dataset.w; }), 120);
  $("nextQBtn").textContent = s.qNum + 1 >= s.total ? "See the final results" : "Next question";
}
$("nextQBtn").onclick = () => advance(async () => {
  const s = st();
  if (s.qNum + 1 >= s.total) await update(R("state"), { phase: "end", awards: computeAwards() });
  else await startQuestion(s.qNum + 1, s.total);
});

// ── End ──────────────────────────────────────────────────────
function computeAwards() {
  const s = st();
  const fooled = {}, found = {};
  let best = null;
  for (let q = 0; q < (s.total || 0); q++) {
    const opts = (room.options && room.options[q]) || {};
    const votes = (room.votes && room.votes[q]) || {};
    const truth = room.secret && room.secret[q];
    const perOpt = {};
    for (const [tid, v] of Object.entries(votes)) {
      if (v === truth) { found[tid] = (found[tid] || 0) + 1; continue; }
      const o = opts[v];
      if (!o || !o.owners) continue;
      perOpt[v] = (perOpt[v] || 0) + 1;
      Object.keys(o.owners).forEach(oid => { if (oid !== tid) fooled[oid] = (fooled[oid] || 0) + 1; });
    }
    for (const [id, n] of Object.entries(perOpt)) {
      if (!best || n > best.count) best = { text: opts[id].text, owners: opts[id].owners, count: n };
    }
  }
  const top = m => { const e = Object.entries(m).sort((x, y) => y[1] - x[1])[0]; return e ? { tid: e[0], count: e[1] } : null; };
  return { fooler: top(fooled), detective: top(found), bestFake: best };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
function teamLabel(id) {
  const t = room.teams && room.teams[id];
  return t ? `${mascotById(t.mascot).emoji} ${escapeHTML(t.name)}` : null;
}
function awardsHTML(aw) {
  const cards = [];
  if (aw.fooler && teamLabel(aw.fooler.tid)) cards.push(["🤥", "Master Fooler", `${teamLabel(aw.fooler.tid)} fooled ${plural(aw.fooler.count, "team")}`]);
  if (aw.detective && teamLabel(aw.detective.tid)) cards.push(["🔍", "Truth Detective", `${teamLabel(aw.detective.tid)} found ${plural(aw.detective.count, "real answer")}`]);
  if (aw.bestFake) {
    const by = Object.keys(aw.bestFake.owners || {}).map(teamLabel).filter(Boolean).join(" and ");
    if (by) cards.push(["🎭", "Best Fake", `“${escapeHTML(aw.bestFake.text)}” by ${by} fooled ${plural(aw.bestFake.count, "team")}`]);
  }
  return cards.map(([ic, at, ad]) => `<div class="award"><div class="ic">${ic}</div><div><div class="at">${at}</div><div class="ad">${ad}</div></div></div>`).join("");
}
function podiumHTML(t, cls) {
  const m = mascotById(t.mascot);
  const medal = { p1: "🥇", p2: "🥈", p3: "🥉" }[cls];
  return `<div class="step ${cls} wait">
    ${cls === "p1" ? '<div class="burst" aria-hidden="true"></div><div class="crown" aria-hidden="true">👑</div>' : ""}
    <div class="face" style="background:${m.color}26">${m.emoji}</div>
    <div class="tn">${escapeHTML(t.name)}</div>
    <div class="ts">${(t.score || 0).toLocaleString()} points</div>
    <div class="block">${medal}</div>
  </div>`;
}

let endRun = 0;
async function enterEnd() {
  const run = ++endRun;
  const teams = teamList().sort((a, b) => (b.score || 0) - (a.score || 0));
  show("end");
  const k = $("endKicker");
  k.textContent = "Final results";
  k.classList.remove("drum");
  $("podium").innerHTML = [[teams[1], "p2"], [teams[0], "p1"], [teams[2], "p3"]]
    .map(([t, c]) => t ? podiumHTML(t, c) : `<div class="step empty"></div>`).join("");
  $("awards").innerHTML = awardsHTML(st().awards || {});
  $("restList").innerHTML = teams.slice(3).map((t, i) =>
    `<span>${i + 4}. ${mascotById(t.mascot).emoji} ${escapeHTML(t.name)}: ${(t.score || 0).toLocaleString()}</span>`).join("");
  ["awards", "restList", "endActions"].forEach(id => $(id).classList.remove("show"));
  const reveal = cls => { const el = $("podium").querySelector("." + cls); if (el) { el.classList.remove("wait"); el.classList.add("in"); } };
  const alive = () => run === endRun && current === "end";

  await sleep(800); if (!alive()) return;
  if (teams[2]) { reveal("p3"); sfx.pop(); await sleep(1500); if (!alive()) return; }
  if (teams[1]) { reveal("p2"); sfx.pop(); await sleep(1500); if (!alive()) return; }
  k.textContent = "And the winner is…";
  k.classList.add("drum");
  sfx.drum();
  await sleep(2300); if (!alive()) return;
  k.classList.remove("drum");
  k.textContent = "Happy Thanksgiving! 🦃";
  reveal("p1");
  sfx.fanfare();
  confetti();
  await sleep(1500); if (!alive()) return;
  ["awards", "restList", "endActions"].forEach(id => $(id).classList.add("show"));
}

function confetti(count = 70) {
  const box = $("confetti");
  const bits = ["🍗", "🥧", "🌽", "🍂", "🦃", "🍁", "🎉", "⭐"];
  for (let i = 0; i < count; i++) {
    const sp = document.createElement("span");
    sp.textContent = bits[i % bits.length];
    sp.style.left = Math.random() * 100 + "vw";
    sp.style.animationDuration = 3 + Math.random() * 3 + "s";
    sp.style.animationDelay = Math.random() * 1.5 + "s";
    box.appendChild(sp);
    setTimeout(() => sp.remove(), 8000);
  }
}
$("againBtn").onclick = () => advance(() => update(R("state"), { phase: "lobby" }));
$("freshBtn").onclick = () => { if (confirm("Start a new room? Teams will need to join again.")) createRoom(); };

// ── Timer loop: counts down and moves the game forward ───────
async function advance(fn) {
  if (advancing) return;
  advancing = true;
  try { await fn(); }
  catch (e) { console.error(e); toast("Something went wrong: " + e.message); }
  finally { setTimeout(() => { advancing = false; }, 700); }
}

setInterval(() => {
  if (!room || advancing) return;
  const s = st();
  if (s.phase !== "write" && s.phase !== "vote") return;
  const totalMs = (s.phase === "write" ? SETTINGS.writeSeconds : SETTINGS.voteSeconds) * 1000;
  const left = Math.max(0, (s.deadline || 0) - now());
  const secs = Math.ceil(left / 1000);
  const el = $(s.phase === "write" ? "wTimer" : "vTimer");
  el.textContent = secs;
  el.style.setProperty("--p", Math.min(1, left / totalMs));
  el.classList.toggle("urgent", secs <= 5 && left > 0);
  if (secs <= 5 && secs > 0 && lastTick !== secs) { lastTick = secs; sfx.tick(); }

  const teams = teamList();
  if (s.phase === "write") {
    const ans = (room.answers && room.answers[s.qNum]) || {};
    const allIn = teams.length > 0 && teams.every(t => ans[t.id] && ans[t.id].ok);
    if (left <= 0 || allIn) advance(startVote);
  } else {
    const votes = (room.votes && room.votes[s.qNum]) || {};
    const allIn = teams.length > 0 && teams.every(t => votes[t.id] != null);
    if (left <= 0 || allIn) advance(startReveal);
  }
}, 250);
