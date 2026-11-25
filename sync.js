import { FIREBASE } from "./config.js";

const LS_KEY = "national-day-volunteers-v1";
const CHANNEL = "national-day-volunteers";

let fb = null;
let db = null;
let channel = null;
let live = false;

export function isConfigured() {
  return !!(FIREBASE && FIREBASE.apiKey && FIREBASE.databaseURL);
}

export function localLoad() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}

export function localSave(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked - keep running in memory */
  }
}

function ensureChannel() {
  if (channel !== null) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL);
  } catch {
    channel = false;
  }
  return channel;
}

export function sendLocal(list) {
  const c = ensureChannel();
  if (c) c.postMessage(list);
}

export function listenLocal(fn) {
  const c = ensureChannel();
  if (!c) return;
  c.onmessage = (e) => {
    if (Array.isArray(e.data)) fn(e.data);
  };
}

function describeError(err) {
  const raw = String((err && (err.code || err.message)) || err || "unknown error");
  if (/permission|denied/i.test(raw)) return "permission denied — check the database rules";
  if (/databaseURL|not found|invalid|malformed/i.test(raw)) return "config not accepted — check config.js";
  if (/network|offline|unavailable/i.test(raw)) return "offline — check the connection";
  return raw.length > 64 ? raw.slice(0, 61) + "…" : raw;
}

export async function initSync({ onSnapshot, onMode }) {
  if (!isConfigured()) {
    onMode("local", "");
    return "local";
  }
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js");
    fb = await import("https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js");
    const app = appMod.initializeApp(FIREBASE);
    db = fb.getDatabase(app);
    fb.onValue(
      fb.ref(db, "students"),
      (snap) => {
        const val = snap.val();
        const list =
          val && typeof val === "object"
            ? Object.entries(val).map(([id, s]) => ({ ...s, id }))
            : [];
        onSnapshot(list);
      },
      (err) => {
        console.warn("[sync] listen failed", err);
        onMode("local", describeError(err));
      },
    );
    live = true;
    onMode("live", "");
    return "live";
  } catch (err) {
    console.warn("[sync] live mode unavailable", err);
    onMode("local", describeError(err));
    return "local";
  }
}

export async function pushStudent(student) {
  if (!live) return false;
  const clean = { ...student };
  await fb.set(fb.ref(db, "students/" + clean.id), clean);
  return true;
}

export async function pushAll(list) {
  if (!live) return false;
  const obj = {};
  list.forEach((s) => {
    obj[s.id] = { ...s };
  });
  await fb.set(fb.ref(db, "students"), obj);
  return true;
}
