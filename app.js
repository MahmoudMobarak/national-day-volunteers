import { DUTY_SPOTS, TIMETABLE, SEED_STUDENTS } from "./data.js";
import {
  initSync,
  isConfigured,
  pushAll,
  pushStudent,
  localLoad,
  localSave,
  listenLocal,
  sendLocal,
} from "./sync.js";

const listEl = document.getElementById("list");
const statsEl = document.getElementById("stats");
const chipsEl = document.getElementById("filters");
const syncEl = document.getElementById("syncStatus");
const searchEl = document.getElementById("search");
const addBtn = document.getElementById("addBtn");
const addDialog = document.getElementById("addDialog");
const addForm = document.getElementById("addForm");
const addSpot = document.getElementById("addSpot");
const replaceDialog = document.getElementById("replaceDialog");
const replaceWho = document.getElementById("replaceWho");
const replaceClose = document.getElementById("replaceClose");
const replaceSearch = document.getElementById("replaceSearch");
const replaceList = document.getElementById("replaceList");

let students = [];
let query = "";
let filter = "all";
let mode = "local";
let replacingId = null;
let seededRemote = false;
let syncNote = "";

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

function normalize(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name || "Unnamed"),
    spot: DUTY_SPOTS.includes(raw.spot) ? raw.spot : DUTY_SPOTS[0],
    batch: raw.batch === 1 || raw.batch === 2 ? raw.batch : null,
    phone: typeof raw.phone === "string" ? raw.phone : "",
    onDuty: !!raw.onDuty,
    onShift: !!raw.onShift,
    at: DUTY_SPOTS.includes(raw.at) ? raw.at : "",
    coveringFor: raw.coveringFor ? String(raw.coveringFor) : null,
  };
}

function seedStudents() {
  return SEED_STUDENTS.map((s) =>
    normalize({ ...s, onDuty: false, onShift: false, at: "", phone: "", coveringFor: null }),
  );
}

const statusOf = (s) => (!s.onDuty ? "off" : s.onShift ? "duty" : "offshift");

const STATUS_LABEL = { duty: "On duty", offshift: "Off shift", off: "Not on duty" };

function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/* ------------------------------------------------------------------ render */

function render() {
  renderStats();
  renderChips();
  renderList();
  renderSync();
}

function renderStats() {
  const counts = { duty: 0, offshift: 0, off: 0 };
  students.forEach((s) => counts[statusOf(s)]++);
  statsEl.innerHTML = `
    <div class="stat duty"><b>${counts.duty}</b><span>On shift</span></div>
    <div class="stat offshift"><b>${counts.offshift}</b><span>Off shift</span></div>
    <div class="stat"><b>${counts.off}</b><span>Not on duty</span></div>
    <div class="stat"><b>${students.length}</b><span>Volunteers</span></div>`;
}

function renderChips() {
  const counts = { duty: 0, offshift: 0, off: 0 };
  students.forEach((s) => counts[statusOf(s)]++);
  const opts = [
    ["all", "All", students.length],
    ["duty", "On shift", counts.duty],
    ["offshift", "Off shift", counts.offshift],
    ["off", "Not on duty", counts.off],
  ];
  chipsEl.innerHTML = opts
    .map(
      ([key, label, n]) =>
        `<button type="button" class="chip${filter === key ? " active" : ""}" data-filter="${key}">${label} <span>${n}</span></button>`,
    )
    .join("");
}

function renderSync() {
  syncEl.className = "sync " + (mode === "live" ? "is-live" : "is-local");
  let text = "Local only · saved on this device";
  if (mode === "live") text = "Live · updates for everyone";
  else if (syncNote) text = "Sync error · " + syncNote;
  syncEl.innerHTML = `<span class="dot"></span>${esc(text)}`;
}

function cardHTML(s) {
  const st = statusOf(s);
  const meta = [s.spot, s.batch ? `Batch ${s.batch}` : "No batch"].join(" · ");
  const covering = s.coveringFor ? students.find((x) => x.id === s.coveringFor) : null;
  const cover = students.find((x) => x.coveringFor === s.id);

  const foot = [];
  if (covering) foot.push(`<span class="note">Covering for ${esc(covering.name)}</span>`);
  if (cover) foot.push(`<span class="note">Covered by ${esc(cover.name)}</span>`);
  if (s.coveringFor) foot.push(`<button type="button" class="btn tiny ghost" data-act="endcover">End cover</button>`);
  if (!s.onDuty && !cover)
    foot.push(`<button type="button" class="btn tiny" data-act="replace">Assign replacement</button>`);

  return `
  <article class="card ${st}" data-id="${esc(s.id)}">
    <div class="card-top">
      <div class="avatar">${esc(initials(s.name))}</div>
      <div class="who">
        <h3>${esc(s.name)}</h3>
        <p class="meta">${esc(meta)}</p>
      </div>
      <span class="pill ${st}">${STATUS_LABEL[st]}</span>
    </div>
    <div class="fields">
      <label class="switch">
        <input type="checkbox" data-act="duty" ${s.onDuty ? "checked" : ""} aria-label="On duty" />
        <span class="track"></span><span class="lbl">On duty</span>
      </label>
      <label class="switch">
        <input type="checkbox" data-act="shift" ${s.onShift ? "checked" : ""} aria-label="On shift" />
        <span class="track"></span><span class="lbl">On shift</span>
      </label>
      <label class="field">
        <span class="flabel">Location</span>
        <select data-act="spot" ${s.onDuty ? "" : "disabled"} aria-label="Where they are">
          <option value="" ${s.at ? "" : "selected"}>— pick spot —</option>
          ${DUTY_SPOTS.map((p) => `<option value="${esc(p)}" ${s.at === p ? "selected" : ""}>${esc(p)}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span class="flabel">Phone</span>
        <input type="tel" inputmode="tel" data-act="phone" value="${esc(s.phone)}" placeholder="Add number" aria-label="Phone number" />
      </label>
    </div>
    <div class="card-foot">${foot.join("")}</div>
  </article>`;
}

function renderList() {
  const q = query.trim().toLowerCase();
  const rows = students.filter((s) => {
    if (filter !== "all" && statusOf(s) !== filter) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.spot.toLowerCase().includes(q) ||
      (s.at || "").toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  listEl.innerHTML = rows.length
    ? rows.map(cardHTML).join("")
    : `<p class="empty">No volunteers match${q ? ` “${esc(query.trim())}”` : ""}.</p>`;
}

/* ------------------------------------------------------------------- write */

function commit(student) {
  const i = students.findIndex((x) => x.id === student.id);
  if (i === -1) students.push(student);
  else students[i] = student;

  localSave(students);
  if (mode === "live") pushStudent(student).catch((e) => console.warn("[write]", e));
  else sendLocal(students);

  render();
}

/* ------------------------------------------------------------------ events */

listEl.addEventListener("change", (e) => {
  const el = e.target.closest("[data-act]");
  const card = e.target.closest(".card");
  if (!el || !card) return;
  const s = students.find((x) => x.id === card.dataset.id);
  if (!s) return;

  switch (el.dataset.act) {
    case "duty":
      s.onDuty = el.checked;
      if (s.onDuty) {
        if (!s.at) s.at = s.spot;
      } else {
        s.onShift = false;
        s.coveringFor = null;
      }
      break;
    case "shift":
      s.onShift = el.checked;
      if (s.onShift) {
        s.onDuty = true;
        if (!s.at) s.at = s.spot;
      }
      break;
    case "spot":
      s.at = el.value;
      if (s.at) s.onDuty = true;
      break;
    case "phone":
      s.phone = el.value.trim();
      break;
    default:
      return;
  }
  commit(s);
});

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const card = btn.closest(".card");
  const s = students.find((x) => x.id === card.dataset.id);
  if (!s) return;

  if (btn.dataset.act === "replace") openReplace(s);
  if (btn.dataset.act === "endcover") {
    s.coveringFor = null;
    s.onDuty = false;
    s.onShift = false;
    commit(s);
  }
});

chipsEl.addEventListener("click", (e) => {
  const chip = e.target.closest("[data-filter]");
  if (!chip) return;
  filter = chip.dataset.filter;
  render();
});

searchEl.addEventListener("input", (e) => {
  query = e.target.value;
  renderList();
});

/* ------------------------------------------------------------- replacement */

function openReplace(s) {
  replacingId = s.id;
  replaceWho.textContent = `${s.name} · ${s.spot}`;
  replaceSearch.value = "";
  renderReplaceList("");
  replaceDialog.showModal();
  setTimeout(() => replaceSearch.focus(), 40);
}

function renderReplaceList(text) {
  const q = text.trim().toLowerCase();
  const candidates = students
    .filter((s) => s.id !== replacingId && s.name.toLowerCase().includes(q))
    .sort((a, b) => Number(a.onDuty) - Number(b.onDuty) || a.name.localeCompare(b.name));

  replaceList.innerHTML = candidates.length
    ? candidates
        .map(
          (s) => `
      <button type="button" class="pick" data-pick="${esc(s.id)}">
        <span class="avatar sm">${esc(initials(s.name))}</span>
        <span class="pick-txt">
          <b>${esc(s.name)}</b>
          <em>${esc(s.onDuty ? `On duty · ${s.at || s.spot}` : "Not on duty")}${
            s.batch ? ` · Batch ${s.batch}` : ""
          }</em>
        </span>
        <span class="pick-go">Cover</span>
      </button>`,
        )
        .join("")
    : `<p class="empty">No one found.</p>`;
}

function assignReplacement(candidateId) {
  const original = students.find((x) => x.id === replacingId);
  const cand = students.find((x) => x.id === candidateId);
  if (!original || !cand) return;

  cand.onDuty = true;
  cand.onShift = true;
  cand.at = original.at || original.spot;
  cand.coveringFor = original.id;
  commit(cand);
  replaceDialog.close();
}

replaceSearch.addEventListener("input", (e) => renderReplaceList(e.target.value));
replaceList.addEventListener("click", (e) => {
  const pick = e.target.closest("[data-pick]");
  if (pick) assignReplacement(pick.dataset.pick);
});
replaceClose.addEventListener("click", () => replaceDialog.close());

/* --------------------------------------------------------------- add person */

addSpot.innerHTML = DUTY_SPOTS.map((p) => `<option value="${esc(p)}">${esc(p)}</option>`).join("");

addBtn.addEventListener("click", () => {
  addForm.reset();
  addDialog.showModal();
});

addForm.addEventListener("submit", (e) => {
  // The Cancel button carries value="cancel" - let the browser just close the sheet.
  if (e.submitter && e.submitter.value !== "save") return;
  e.preventDefault();

  const f = addForm.elements;
  const name = f.name.value.trim();
  if (!name) {
    f.name.focus();
    return;
  }

  const student = normalize({
    id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    spot: f.spot.value,
    batch: f.batch.value ? Number(f.batch.value) : null,
    phone: f.phone.value.trim(),
  });

  students.push(student);
  addDialog.close();
  commit(student);
});

/* ------------------------------------------------------- bulk phone numbers */

const phonesDialog = document.getElementById("phonesDialog");
const phonesBtn = document.getElementById("phonesBtn");
const phonesInput = document.getElementById("phonesInput");
const phonesResult = document.getElementById("phonesResult");
const phonesSave = document.getElementById("phonesSave");

function normName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePhoneLines(text) {
  const rows = [];
  String(text)
    .split(/\r?\n/)
    .forEach((raw) => {
      const line = raw.trim();
      if (!line) return;
      // Skip a pasted header row such as "Name  Phone".
      if (/^(name|student|volunteer)\b/i.test(line) && /\b(phone|number|mobile|contact)\b/i.test(line)) return;

      let name = "";
      let phone = "";
      const hasDigits = (cell) => (cell.match(/\d/g) || []).length >= 6;

      if (line.includes("\t")) {
        const cells = line.split("\t").map((c) => c.trim()).filter(Boolean);
        name = cells[0] || "";
        phone = cells.slice(1).find(hasDigits) || "";
      } else if (line.includes(",")) {
        const i = line.indexOf(",");
        name = line.slice(0, i);
        phone = line.slice(i + 1);
      } else {
        const m = line.match(/(\+?\d[\d\s().-]{5,})$/);
        if (m) {
          phone = m[1];
          name = line.slice(0, m.index);
        } else {
          name = line;
        }
      }

      phone = phone.replace(/\s+/g, " ").trim();
      name = name.replace(/\s+/g, " ").replace(/^["']|["']$/g, "").trim();
      if (!name && !phone) return;
      rows.push({ name, phone });
    });
  return rows;
}

function findStudentByName(name) {
  const target = normName(name);
  if (!target) return null;

  const exact = students.find((s) => normName(s.name) === target);
  if (exact) return exact;

  const partial = students.find((s) => {
    const n = normName(s.name);
    return n.startsWith(target) || target.startsWith(n);
  });
  if (partial) return partial;

  const tokens = target.split(" ");
  return students.find((s) => tokens.every((t) => normName(s.name).includes(t))) || null;
}

function showPhonesResult(html, kind) {
  phonesResult.hidden = false;
  phonesResult.className = "result " + kind;
  phonesResult.innerHTML = html;
}

function importPhones() {
  const rows = parsePhoneLines(phonesInput.value);
  if (!rows.length) {
    showPhonesResult("Nothing to import yet — paste two columns from your sheet.", "warn");
    return;
  }

  const saved = [];
  const unknown = [];
  const noNumber = [];

  rows.forEach(({ name, phone }) => {
    const match = findStudentByName(name);
    if (!match) {
      unknown.push(name || phone);
      return;
    }
    if (!phone) {
      noNumber.push(match.name);
      return;
    }
    match.phone = phone;
    saved.push(match);
  });

  if (saved.length) {
    localSave(students);
    if (mode === "live") saved.forEach((s) => pushStudent(s).catch((e) => console.warn("[phones]", e)));
    else sendLocal(students);
    render();
    phonesInput.value = "";
  }

  const parts = [`<b>${saved.length} number${saved.length === 1 ? "" : "s"} saved</b>`];
  if (unknown.length) {
    parts.push(
      `<div>${unknown.length} name${unknown.length === 1 ? "" : "s"} not found in the roster:</div><ul>${unknown
        .map((n) => `<li>${esc(n)}</li>`)
        .join("")}</ul>`,
    );
  }
  if (noNumber.length) {
    parts.push(`<div>No number on the line for: ${esc(noNumber.join(", "))}</div>`);
  }
  if (!unknown.length && !noNumber.length) parts.push("<div>All names matched.</div>");

  showPhonesResult(parts.join(""), unknown.length || noNumber.length ? "warn" : "ok");
}

phonesBtn.addEventListener("click", () => {
  phonesResult.hidden = true;
  phonesResult.innerHTML = "";
  phonesDialog.showModal();
});
document.getElementById("phonesClose").addEventListener("click", () => phonesDialog.close());
document.getElementById("phonesCancel").addEventListener("click", () => phonesDialog.close());
phonesSave.addEventListener("click", importPhones);

/* -------------------------------------------------------------------- boot */

document.getElementById("timetable").innerHTML = TIMETABLE.map(
  ([time, who]) => `<li><span>${esc(time)}</span><b>${esc(who)}</b></li>`,
).join("");

async function boot() {
  const cached = localLoad();
  students = (Array.isArray(cached) && cached.length ? cached : seedStudents()).map(normalize);
  render();

  listenLocal((list) => {
    if (mode === "live") return;
    students = list.map(normalize);
    render();
  });

  mode = await initSync({
    onMode(next, detail) {
      mode = next;
      syncNote = next === "live" ? "" : detail || "";
      renderSync();
    },
    onSnapshot(list) {
      if (mode !== "live") return;
      if (!list.length) {
        if (!seededRemote) {
          seededRemote = true;
          pushAll(students).catch((e) => console.warn("[seed]", e));
        }
        return;
      }
      students = list.map(normalize);
      localSave(students);
      render();
    },
  });

  if (mode === "live") localSave(students);
  renderSync();
  if (!isConfigured()) console.info("[sync] Firebase config empty - running in local mode.");
}

boot();
