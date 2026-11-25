import {
  connect, configMissing, db, ref, onValue, set, update, get, remove, runTransaction, onDisconnect,
  now, MASCOTS, mascotById, escapeHTML, makeId, store, recall
} from "./shared.js";

const $ = id => document.getElementById(id);
const app = $("app");

let code = null;
let tid = null;
let room = null;
let unsub = null;
let viewKey = "";
let chosenMascot = null;
let takenUnsub = null;
const truthWarned = {};

const R = path => ref(db, `rooms/${code}${path ? "/" + path : ""}`);
const promptHTML = p => escapeHTML(p || "").replace(/_{3,}/, '<span class="blank">&nbsp;</span>');
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

if (configMissing()) {
  app.innerHTML = `<div class="panel card"><h1 class="display">Not set up yet</h1><p>Ask your teacher to add the Firebase settings to config.js.</p></div>`;
} else {
  connect(on => {
    $("conn").className = "dot " + (on ? "on" : "off");
    if (on && code && tid) markOnline();
  });
  const saved = recall("ftt_player");
  const urlRoom = (new URLSearchParams(location.search).get("room") || "").toUpperCase();
  if (saved && (!urlRoom || urlRoom === saved.code)) {
    get(ref(db, `rooms/${saved.code}/teams/${saved.tid}`)).then(s => {
      if (s.exists()) { code = saved.code; tid = saved.tid; listen(); }
      else { store("ftt_player", null); showJoin(urlRoom); }
    }).catch(() => showJoin(urlRoom));
  } else {
    showJoin(urlRoom);
  }
}

// ── Join screen ──────────────────────────────────────────────
function showJoin(prefill = "", message = "") {
  viewKey = "join";
  setHeader(null);
  app.innerHTML = `
    <div class="panel card">
      <h1 class="display">Join the table</h1>
      ${message ? `<p class="warn">${escapeHTML(message)}</p>` : ""}
      <div class="field">
        <label for="jCode">Room code</label>
        <input id="jCode" class="code" maxlength="4" autocomplete="off" autocapitalize="characters" value="${escapeHTML(prefill)}" placeholder="ABCD">
      </div>
      <div class="field">
        <label for="jName">Team name</label>
        <input id="jName" maxlength="18" autocomplete="off" placeholder="The Hungry Foxes">
      </div>
      <div class="field">
        <label>Pick your team animal</label>
        <div id="mascots" class="mascots"></div>
      </div>
      <button id="jBtn" class="btn wide">Join the game</button>
      <p id="jErr" class="err" role="alert"></p>
    </div>`;
  renderMascots({});
  const codeIn = $("jCode");
  codeIn.addEventListener("input", () => { codeIn.value = codeIn.value.toUpperCase().replace(/[^A-Z]/g, ""); watchTaken(codeIn.value); });
  watchTaken(prefill);
  $("jBtn").onclick = join;
}

function renderMascots(taken) {
  const box = $("mascots");
  if (!box) return;
  if (chosenMascot && taken[chosenMascot]) chosenMascot = null;
  box.innerHTML = MASCOTS.map(m =>
    `<button type="button" data-id="${m.id}" aria-pressed="${chosenMascot === m.id}" ${taken[m.id] ? "disabled" : ""} aria-label="${m.name}">${m.emoji}<span>${m.name}</span></button>`
  ).join("");
  box.querySelectorAll("button").forEach(b => b.onclick = () => { chosenMascot = b.dataset.id; renderMascots(taken); });
}

function watchTaken(c) {
  if (takenUnsub) { takenUnsub(); takenUnsub = null; }
  if (!c || c.length !== 4) { renderMascots({}); return; }
  takenUnsub = onValue(ref(db, `rooms/${c}/mascots`), s => renderMascots(s.val() || {}));
}

async function join() {
  const err = $("jErr");
  const c = $("jCode").value.trim().toUpperCase();
  const name = $("jName").value.trim().replace(/\s+/g, " ");
  if (c.length !== 4) { err.textContent = "Type the 4-letter code from the big screen."; return; }
  if (!name) { err.textContent = "Give your team a name."; return; }
  if (!chosenMascot) { err.textContent = "Pick a team animal."; return; }
  const mascot = chosenMascot;
  $("jBtn").disabled = true;
  err.textContent = "";
  if (takenUnsub) { takenUnsub(); takenUnsub = null; }
  try {
    const st = await get(ref(db, `rooms/${c}/state`));
    if (!st.exists()) { err.textContent = `There's no game with the code ${c}. Check the big screen.`; $("jBtn").disabled = false; watchTaken(c); return; }
    const newId = makeId();
    const claim = await runTransaction(ref(db, `rooms/${c}/mascots/${mascot}`), cur => cur ? undefined : newId);
    if (!claim.committed) { err.textContent = "Another team just took that animal. Pick a different one."; $("jBtn").disabled = false; watchTaken(c); return; }
    await set(ref(db, `rooms/${c}/teams/${newId}`), { name, mascot, score: 0, lastDelta: 0, joinedAt: Date.now(), online: true });
    if (takenUnsub) { takenUnsub(); takenUnsub = null; }
    code = c; tid = newId;
    store("ftt_player", { code, tid });
    buzz(60);
    listen();
  } catch (e) {
    err.textContent = "Couldn't join. Check the Wi-Fi and try again.";
    $("jBtn").disabled = false;
    watchTaken(c);
  }
}

function markOnline() {
  const r = R(`teams/${tid}/online`);
  get(R(`teams/${tid}`)).then(s => {
    if (!s.exists()) return;
    set(r, true);
    onDisconnect(r).set(false);
  }).catch(() => {});
}

// ── Listen to the game ───────────────────────────────────────
function listen() {
  markOnline();
  if (unsub) unsub();
  unsub = onValue(R(""), snap => {
    room = snap.val();
    if (!room || !room.state) { leave("That game has ended."); return; }
    if (!room.teams || !room.teams[tid]) { leave("Your team was removed. You can join again."); return; }
    render();
  });
}

function leave(msg) {
  if (unsub) { unsub(); unsub = null; }
  const c = code;
  store("ftt_player", null);
  code = null; tid = null; room = null;
  showJoin(c || "", msg);
}

function setHeader(me) {
  if (!me) { $("me").innerHTML = `<span class="display">Fool the Table</span>`; $("myScore").textContent = ""; return; }
  const m = mascotById(me.mascot);
  $("me").innerHTML = `<span class="em">${m.emoji}</span><span class="nm">${escapeHTML(me.name)}</span>`;
  $("myScore").textContent = (me.score || 0).toLocaleString();
}

function render() {
  const me = room.teams[tid];
  setHeader(me);
  const s = room.state;
  const q = s.qNum;
  const phase = s.phase;

  if (phase === "lobby") {
    view("lobby", () => {
      const m = mascotById(me.mascot);
      return `<div class="panel card center">
        <h1 class="display">You're in!</h1>
        <div class="big-face">${m.emoji}</div>
        <p>Watch the big screen. The game starts soon.</p>
        <p class="muted">Get ready to write fake answers that sound real.</p>
      </div>`;
    });
  }

  else if (phase === "write") {
    const a = room.answers && room.answers[q] && room.answers[q][tid];
    if (a && a.truth) {
      truthWarned[q] = true;
      remove(R(`answers/${q}/${tid}`));
      buzz([80, 60, 80]);
      return;
    }
    if (a && a.ok) {
      view(`write-locked-${q}`, () => `
        <div class="panel card locked">
          <h2 class="display">Locked in! 🤫</h2>
          <p>Your fake answer:</p>
          <div class="yours">${escapeHTML(a.text)}</div>
          <p class="muted">Don't let the other teams see your screen!</p>
        </div>`);
    } else if (a) {
      view(`write-sending-${q}`, () => `<div class="panel card center"><h2 class="display">Sending…</h2></div>`);
    } else {
      const key = `write-input-${q}-${truthWarned[q] ? "w" : ""}`;
      if (viewKey !== key) {
        view(key, () => `
          ${s.double ? `<div class="dbl">🍗 Double points round!</div>` : ""}
          <div class="ptimer" id="pTimer"></div>
          <div class="panel card">
            <p class="prompt">${promptHTML(s.prompt)}</p>
          </div>
          ${truthWarned[q] ? `<div class="warn">Wow, that's actually the REAL answer! Keep it secret and write a fake one instead.</div>` : ""}
          <div class="panel card">
            <div class="field">
              <label for="fake">Your fake answer</label>
              <input id="fake" maxlength="30" autocomplete="off" placeholder="Something that sounds true…">
            </div>
            <button id="sendFake" class="btn wide">Lock in my fake</button>
            <p id="fErr" class="err" role="alert"></p>
          </div>`);
        const input = $("fake");
        const send = () => {
          const text = input.value.trim().replace(/\s+/g, " ");
          if (!text) { $("fErr").textContent = "Type a fake answer first."; return; }
          $("sendFake").disabled = true;
          set(R(`answers/${q}/${tid}`), { text, at: Date.now() }).catch(() => {
            $("sendFake").disabled = false;
            $("fErr").textContent = "Didn't send. Check the Wi-Fi and try again.";
          });
          buzz(40);
        };
        $("sendFake").onclick = send;
        input.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
      }
    }
  }

  else if (phase === "vote") {
    const opts = (room.options && room.options[q]) || {};
    const myVote = room.votes && room.votes[q] && room.votes[q][tid];
    if (myVote && opts[myVote]) {
      view(`vote-locked-${q}`, () => `
        <div class="panel card locked">
          <h2 class="display">Vote locked! 🗳️</h2>
          <p>You think the real answer is:</p>
          <div class="yours">${escapeHTML(opts[myVote].text)}</div>
          <p class="muted">Watch the big screen for the results.</p>
        </div>`);
    } else {
      const list = Object.entries(opts)
        .filter(([, o]) => !(o.owners && o.owners[tid]))
        .sort((a, b) => a[1].order - b[1].order);
      const key = `vote-list-${q}-${list.map(([id]) => id).join(",")}`;
      if (viewKey !== key) {
        view(key, () => `
          <div class="ptimer" id="pTimer"></div>
          <div class="panel card"><p class="prompt">${promptHTML(s.prompt)}</p></div>
          <p class="center display" style="font-size:1.3rem;margin:0">Which one is the REAL answer?</p>
          <div class="choices">
            ${list.map(([id, o]) => `<button class="choice" data-id="${id}">${escapeHTML(o.text)}</button>`).join("")}
          </div>
          <p class="muted center">Your own fake isn't on your list.</p>`);
        app.querySelectorAll(".choice").forEach(b => b.onclick = () => {
          app.querySelectorAll(".choice").forEach(x => { x.disabled = true; });
          set(R(`votes/${q}/${tid}`), b.dataset.id).catch(() => {
            app.querySelectorAll(".choice").forEach(x => { x.disabled = false; });
          });
          buzz(40);
        });
      }
    }
  }

  else if (phase === "reveal") {
    view(`reveal-${q}`, () => `
      <div class="panel card center">
        <div class="big-face">👀</div>
        <h2 class="display">Eyes on the big screen!</h2>
        <p>Who got fooled? Let's find out…</p>
      </div>`);
  }

  else if (phase === "scores") {
    const teams = Object.values(room.teams).sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = teams.findIndex(t => t === me) + 1 || teams.indexOf(room.teams[tid]) + 1;
    view(`scores-${q}`, () => `
      <div class="panel card center">
        <p>This round</p>
        <p class="plus">${me.lastDelta ? "+" + me.lastDelta.toLocaleString() : "+0"}</p>
        <p>Total score</p>
        <p class="bigstat">${(me.score || 0).toLocaleString()}</p>
        <p>You're in <b>${ordinal(rank)}</b> place out of ${teams.length}.</p>
      </div>`);
  }

  else if (phase === "end") {
    const teams = Object.values(room.teams).sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = teams.indexOf(me) + 1;
    const aw = s.awards || {};
    const mine = [];
    if (aw.fooler && aw.fooler.tid === tid) mine.push("🤥 Master Fooler");
    if (aw.detective && aw.detective.tid === tid) mine.push("🔍 Truth Detective");
    if (aw.bestFake && aw.bestFake.owners && aw.bestFake.owners[tid]) mine.push("🎭 Best Fake");
    const medal = ["🥇", "🥈", "🥉"][rank - 1] || mascotById(me.mascot).emoji;
    if (viewKey === "end") return;
    view("end", () => `
      <div id="endWait" class="panel card center">
        <div class="big-face">🥁</div>
        <h2 class="display">Look at the big screen!</h2>
        <p>Who won? Find out in a few seconds…</p>
      </div>
      <div id="endResult" class="panel card center endcard hidden">
        <div class="big-face">${medal}</div>
        <h1 class="display">${rank === 1 ? "You won! 👑" : `${ordinal(rank)} place!`}</h1>
        <p class="bigstat">${(me.score || 0).toLocaleString()}</p>
        <p>points</p>
        ${mine.length ? `<div class="myawards">${mine.map(a => `<span>${a}</span>`).join("")}</div>` : ""}
        <p class="muted">Happy Thanksgiving! 🦃</p>
      </div>`);
    setTimeout(() => {
      const w = $("endWait"), r = $("endResult");
      if (w && r) { w.classList.add("hidden"); r.classList.remove("hidden"); buzz(rank === 1 ? [100, 60, 100, 60, 200] : 80); }
    }, 6500);
  }
}

function view(key, html) {
  if (viewKey === key) return;
  viewKey = key;
  app.innerHTML = html();
  tickTimer();
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function tickTimer() {
  const el = $("pTimer");
  if (!el || !room || !room.state || !room.state.deadline) { if (el) el.textContent = ""; return; }
  const secs = Math.max(0, Math.ceil((room.state.deadline - now()) / 1000));
  el.textContent = `⏱ ${secs}`;
  el.classList.toggle("urgent", secs <= 5);
}
setInterval(tickTimer, 300);
