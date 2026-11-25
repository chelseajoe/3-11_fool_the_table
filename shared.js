import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, onValue, set, update, get, remove, runTransaction, onDisconnect, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./config.js";

export { ref, onValue, set, update, get, remove, runTransaction, onDisconnect, serverTimestamp };

// If the host's tab is closed for this long, phones leave the game automatically
export const HOST_GRACE_MS = 30000;

export function configMissing() {
  return !firebaseConfig.databaseURL ||
    firebaseConfig.apiKey.includes("PASTE") ||
    firebaseConfig.databaseURL.includes("your-project");
}

export let db = null;
let offset = 0;

export function connect(onStatus) {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  onValue(ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
  onValue(ref(db, ".info/connected"), s => onStatus && onStatus(!!s.val()));
  return db;
}

// Server-synced clock so every device's timer matches
export const now = () => Date.now() + offset;

export const MASCOTS = [
  { id: "turkey",   emoji: "🦃", name: "Turkeys",   color: "#C8551B" },
  { id: "fox",      emoji: "🦊", name: "Foxes",     color: "#E8892B" },
  { id: "bear",     emoji: "🐻", name: "Bears",     color: "#7A4A2A" },
  { id: "owl",      emoji: "🦉", name: "Owls",      color: "#6B5B95" },
  { id: "deer",     emoji: "🦌", name: "Deer",      color: "#A0703C" },
  { id: "raccoon",  emoji: "🦝", name: "Raccoons",  color: "#56616B" },
  { id: "squirrel", emoji: "🐿️", name: "Squirrels", color: "#B5482F" },
  { id: "pig",      emoji: "🐷", name: "Pigs",      color: "#D9708A" }
];
export const mascotById = id => MASCOTS.find(m => m.id === id) || { emoji: "❓", name: "?", color: "#888888" };

// Makes "The Bald-Eagle!!" and "bald eagle" count as the same answer
export function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(a|an|the) /, "");
}

export function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function makeId(len = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function makeRoomCode() {
  const chars = "BCDFGHJKLMNPQRSTVWXZ"; // no vowels = no accidental words
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export function store(key, val) {
  try { if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
export function recall(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

// ── Tiny sound effects (no sound files needed) ───────────────
let audioCtx = null;
export let muted = false;
export function setMuted(m) { muted = m; }
function tone(freq, dur = 0.15, type = "sine", when = 0, vol = 0.18) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + when;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  } catch (e) {}
}
export const sfx = {
  join:    () => { tone(523, .1, "triangle"); tone(784, .15, "triangle", .08); },
  lock:    () => tone(880, .08, "square", 0, .08),
  tick:    () => tone(1200, .04, "square", 0, .05),
  pop:     () => tone(660, .07, "triangle", 0, .12),
  lie:     () => { tone(300, .2, "sawtooth", 0, .12); tone(200, .35, "sawtooth", .15, .12); },
  truth:   () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .22, "triangle", i * .09)); },
  drum:    () => { for (let i = 0; i < 24; i++) tone(130 + (i % 2) * 25, .07, "triangle", i * .085, .14); },
  fanfare: () => { [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, .28, "triangle", i * .13, .2)); }
};
