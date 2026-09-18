// popup.js
//
// IMPORTANT: Chrome destroys and recreates this popup's JS every time it
// closes (which happens automatically whenever you click into the page,
// e.g. to submit a ticket). So progress can NEVER live only in a variable
// here — it's saved to chrome.storage.local after every change and
// restored on open, so "Fill next batch" still knows where it left off
// after you've submitted the first ticket and reopened the popup.
//
// UI language (English / PT-PT) is a separate, independently persisted
// preference — see i18n.js for the strings and switchLanguage() below for
// how the popup re-renders in place without losing your picks or progress.

const GAME_COUNT = 13;
const STORAGE_KEY = "totobolaFillerState";
const LANG_STORAGE_KEY = "totobolaFillerLang";

let tabId = null;
let progress = { columnsFilled: 0, table: null, numBets: 0 };
let currentLang = DEFAULT_LANG;
let lastGameNames = null; // array of 13 names once connected, else null

function el(id) {
  return document.getElementById(id);
}

function t(key, ...args) {
  const entry = (STRINGS[currentLang] || STRINGS[DEFAULT_LANG])[key];
  return typeof entry === "function" ? entry(...args) : entry;
}

function setStatus(msg) {
  el("status").textContent = msg;
}

// ---- static text (title, notice, labels, buttons) ----

function applyStaticTexts() {
  document.title = t("title");
  el("titleText").textContent = t("title");
  el("noticeText").textContent = t("notice");
  el("langToggle").textContent = currentLang === "pt" ? "EN" : "PT";
  el("langToggle").title = t("langToggleTitle");

  // Only overwrite the games placeholder if real game rows aren't rendered yet.
  if (!el("games").querySelector("select")) {
    el("gamesPlaceholder").textContent = t("gamesPlaceholder");
  }

  el("super14Label").textContent = t("super14Label");
  el("super14DontSetOpt").textContent = t("super14DontSet");

  el("matchingSystemsLabel").textContent = t("matchingSystems");
  if (!el("systemChoices").querySelector("input")) {
    el("systemChoices").textContent = t("markGamesFirst");
  }

  el("variantLabel").textContent = t("variantLabel");

  el("btnRefresh").textContent = t("btnRefresh");
  el("btnFillNext").textContent = t("btnFillNext");
  el("btnReset").textContent = t("btnReset");

  el("availableSystemsTitle").textContent = t("availableSystemsTitle");
}

function renderAvailableSystems() {
  const ul = el("availableSystemsList");
  ul.innerHTML = "";
  Object.values(SYSTEMS).forEach((sys) => {
    const li = document.createElement("li");
    let text = sys.label;
    if (sys.kind === "triplas" && sys.variants && Object.keys(sys.variants).length > 1) {
      text += " " + t("variantsAvailable", Object.keys(sys.variants).length);
    }
    li.textContent = text;
    ul.appendChild(li);
  });
}

// ---- language switching ----

function loadLang() {
  return new Promise((resolve) => {
    chrome.storage.local.get([LANG_STORAGE_KEY], (res) => resolve(res[LANG_STORAGE_KEY] || DEFAULT_LANG));
  });
}

async function switchLanguage(newLang) {
  if (newLang === currentLang) return;
  currentLang = newLang;
  chrome.storage.local.set({ [LANG_STORAGE_KEY]: newLang });

  // Capture live selections before anything gets rebuilt.
  const picks = lastGameNames ? currentPicks() : null;
  const systemKey = selectedSystemKey();
  const variantVal = el("variantSelect") ? el("variantSelect").value : null;
  const superVal = el("superSelect") ? el("superSelect").value : "";

  applyStaticTexts();
  renderAvailableSystems();

  if (lastGameNames) {
    buildGameRows(lastGameNames);
    if (picks) applyPicks(picks);
    const { doubles, triples } = classify(picks || currentPicks());
    renderSystemChoices(doubles, triples, systemKey);
    if (systemKey) onSystemChosen(false); // relabels the variant dropdown too
    if (variantVal) el("variantSelect").value = variantVal;
  }
  if (superVal) el("superSelect").value = superVal;

  // Re-render the status line in the new language without touching progress.
  if (progress.table) {
    const key = selectedSystemKey();
    const sys = key ? SYSTEMS[key] : null;
    const sysLabel = sys ? sys.label : key;
    const total = await fetchTotalOnly();
    const remaining = progress.numBets - progress.columnsFilled;
    if (progress.columnsFilled === 0 && sys && sys.kind === "multiplas") {
      setStatus(t("systemReadyMultiplas", sysLabel, progress.numBets, sys.totalApostas));
    } else if (progress.columnsFilled === 0) {
      setStatus(t("systemReady", sysLabel, progress.numBets));
    } else if (remaining > 0) {
      setStatus(t("restoredProgress", sysLabel, progress.columnsFilled, progress.numBets, total ?? "?", progress.columnsFilled + 1));
    } else {
      setStatus(t("restoredAllFilled", progress.numBets, sysLabel, total ?? "?"));
    }
  } else if (lastGameNames) {
    const total = await fetchTotalOnly();
    setStatus(t("connectedTotal", total ?? "?"));
  } else {
    setStatus(t("notConnected"));
  }
}

// ---- game picker ----

function buildGameRows(gameNames) {
  lastGameNames = gameNames;
  const container = el("games");
  container.innerHTML = "";
  for (let i = 0; i < GAME_COUNT; i++) {
    const row = document.createElement("div");
    row.className = "row-game";

    const label = document.createElement("div");
    label.className = "label";
    label.title = gameNames && gameNames[i] ? gameNames[i] : "";
    label.textContent = gameNames && gameNames[i] ? `${i + 1}. ${gameNames[i]}` : t("gameFallback", i + 1);

    const select = document.createElement("select");
    select.dataset.game = String(i);
    [
      ["1", t("optSimple1")],
      ["X", t("optSimpleX")],
      ["2", t("optSimple2")],
      ["1X", t("optDouble1X")],
      ["X2", t("optDoubleX2")],
      ["12", t("optDouble12")],
      ["1X2", t("optTriple")],
    ].forEach(([value, text]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = text;
      select.appendChild(opt);
    });
    // Fires only on a real user interaction, never on a programmatic
    // .value assignment (used during restore) — safe to always react here.
    select.addEventListener("change", onPicksChangedByUser);

    row.appendChild(label);
    row.appendChild(select);
    container.appendChild(row);
  }
}

function currentPicks() {
  const selects = document.querySelectorAll("#games select");
  const picks = [];
  selects.forEach((s) => picks.push(s.value));
  return picks; // 13 values: '1' | 'X' | '2' | '1X' | 'X2' | '12' | '1X2'
}

function applyPicks(picks) {
  const selects = document.querySelectorAll("#games select");
  selects.forEach((s, i) => {
    if (picks[i]) s.value = picks[i]; // does NOT fire 'change'
  });
}

function classify(picks) {
  const doubles = [];
  const triples = [];
  const singles = {};
  picks.forEach((v, idx) => {
    if (v === "1X2") triples.push(idx);
    else if (v === "1X" || v === "X2" || v === "12") doubles.push({ game: idx, type: v });
    else singles[idx] = v;
  });
  return { doubles, triples, singles };
}

function matchingSystems(doubles, triples) {
  const nD = doubles.length;
  const nT = triples.length;
  const matches = [];
  for (const [key, sys] of Object.entries(SYSTEMS)) {
    if (sys.requiredDoubles === nD && sys.requiredTriples === nT) matches.push(key);
  }
  return matches;
}

// Renders the "matching systems" radio list only — never touches progress.
function renderSystemChoices(doubles, triples, preselectKey) {
  const matches = matchingSystems(doubles, triples);
  const wrap = el("systemChoices");
  wrap.innerHTML = "";
  if (matches.length === 0) {
    wrap.textContent = t("noMatch", doubles.length, triples.length);
    el("variantWrap").style.display = "none";
    return matches;
  }
  matches.forEach((key) => {
    const sys = SYSTEMS[key];
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "systemChoice";
    radio.value = key;
    if (preselectKey ? key === preselectKey : matches.length === 1) radio.checked = true;
    // Only fires on a real click — safe to always treat as user-triggered.
    radio.addEventListener("change", () => onSystemChosen(true));
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + sys.label));
    wrap.appendChild(label);
  });
  return matches;
}

function selectedSystemKey() {
  const r = document.querySelector("input[name=systemChoice]:checked");
  return r ? r.value : null;
}

// Always rebuilds the variant <option> labels in the current language,
// preserving whichever variant was already selected.
function ensureVariantOptions() {
  const vs = el("variantSelect");
  const prevValue = vs.value;
  vs.innerHTML = "";
  Object.keys(SYSTEMS.triplas4_9.variants).forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = t("variantOption", v);
    vs.appendChild(opt);
  });
  if (prevValue) vs.value = prevValue;
  if (!vs.dataset.listenerAttached) {
    vs.addEventListener("change", buildTableFresh);
    vs.dataset.listenerAttached = "1";
  }
}

// userTriggered=true (a live radio click) rebuilds the table from scratch.
// userTriggered=false is used only while restoring saved state / switching
// language, where the caller sets `progress` explicitly (or leaves it be).
function onSystemChosen(userTriggered) {
  const key = selectedSystemKey();
  const variantWrap = el("variantWrap");
  if (key === "triplas4_9") {
    variantWrap.style.display = "block";
    ensureVariantOptions();
  } else {
    variantWrap.style.display = "none";
  }
  if (userTriggered) buildTableFresh();
}

function mapper(type) {
  if (type === "1X") return { 1: "1", X: "X" };
  if (type === "X2") return { X: "X", 1: "2" };
  if (type === "12") return { 1: "1", X: "2" };
  throw new Error("bad double type " + type);
}

// Every table cell is either a single symbol string ("1"/"X"/"2") for the
// plain systems, or an array of symbols (e.g. ["X","2"]) for "multiplas"
// systems, where more than one outcome is marked for that game in that
// column. perColumnApostas[c] is how many concrete bet-lines column c is
// worth (product of marked-outcome-counts across all 13 games in that
// column) — 1 for every column in a plain system, potentially many for a
// "multiplas" one. Used to independently verify the page's own price.
function computeTable(key, picks, variant) {
  const { doubles, triples, singles } = classify(picks);
  const sys = SYSTEMS[key];
  const numBets = sys.numBets;
  const table = Array.from({ length: GAME_COUNT }, () => new Array(numBets).fill(null));

  if (sys.kind === "duplas") {
    doubles.forEach(({ game, type }, rowIdx) => {
      const m = mapper(type);
      const row = sys.rows[rowIdx];
      for (let c = 0; c < numBets; c++) table[game][c] = m[row[c]];
    });
  } else if (sys.kind === "triplas") {
    const rows = sys.variants[variant || "1"].map((r) => r.split(" "));
    triples.forEach((game, rowIdx) => {
      const row = rows[rowIdx];
      for (let c = 0; c < numBets; c++) table[game][c] = row[c];
    });
  } else if (sys.kind === "mixed") {
    triples.forEach((game, rowIdx) => {
      const row = sys.tripleRows[rowIdx];
      for (let c = 0; c < numBets; c++) table[game][c] = row[c];
    });
    doubles.forEach(({ game, type }, rowIdx) => {
      const m = mapper(type);
      const row = sys.doubleRows[rowIdx];
      for (let c = 0; c < numBets; c++) table[game][c] = m[row[c]];
    });
  } else if (sys.kind === "multiplas") {
    // sys.columns[c] is one input column: an array of tokens, one per
    // marked triple game in ascending order. A token's characters ARE the
    // literal outcomes to mark (no relabeling — these games are always
    // full triples, so "X2" always literally means "mark X and 2").
    triples.forEach((game, rowIdx) => {
      for (let c = 0; c < numBets; c++) table[game][c] = sys.columns[c][rowIdx].split("");
    });
  }

  Object.entries(singles).forEach(([game, symbol]) => {
    const value = sys.kind === "multiplas" ? [symbol] : symbol;
    for (let c = 0; c < numBets; c++) table[Number(game)][c] = value;
  });

  let incomplete = false;
  for (let g = 0; g < GAME_COUNT; g++) {
    for (let c = 0; c < numBets; c++) {
      if (!table[g][c]) incomplete = true;
    }
  }

  const perColumnApostas = new Array(numBets).fill(1);
  if (sys.kind === "multiplas" && !incomplete) {
    for (let c = 0; c < numBets; c++) {
      let product = 1;
      for (let g = 0; g < GAME_COUNT; g++) product *= table[g][c].length;
      perColumnApostas[c] = product;
    }
  }

  return { table, numBets, incomplete, label: sys.label, kind: sys.kind, totalApostas: sys.totalApostas, perColumnApostas };
}

function buildTableFresh() {
  const key = selectedSystemKey();
  if (!key) return;
  const picks = currentPicks();
  const variant = el("variantSelect").value || "1";
  const { table, numBets, incomplete, label, kind, totalApostas, perColumnApostas } = computeTable(key, picks, variant);

  progress = { columnsFilled: 0, table, numBets, perColumnApostas };
  if (incomplete) {
    setStatus(t("warnIncomplete"));
  } else if (kind === "multiplas") {
    setStatus(t("systemReadyMultiplas", label, numBets, totalApostas));
  } else {
    setStatus(t("systemReady", label, numBets));
  }
  saveState();
}

function onPicksChangedByUser() {
  const picks = currentPicks();
  const { doubles, triples } = classify(picks);
  renderSystemChoices(doubles, triples);
  progress = { columnsFilled: 0, table: null, numBets: 0 };
  const matches = matchingSystems(doubles, triples);
  if (matches.length === 1) {
    onSystemChosen(true); // computes the table, saves state
  } else {
    saveState();
  }
}

// ---- content-script messaging ----

async function sendToContent(message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (resp) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(resp);
      }
    });
  });
}

async function fetchTotalOnly() {
  if (!tabId) return null;
  const state = await sendToContent({ type: "GET_STATE" });
  return state && state.ok ? state.total : null;
}

// ---- persistence ----

function saveState() {
  const state = {
    picks: currentPicks(),
    systemKey: selectedSystemKey(),
    variant: el("variantSelect").value || null,
    superValue: el("superSelect").value || "",
    progress,
  };
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => resolve(res[STORAGE_KEY] || null));
  });
}

async function refreshState(restoreSaved) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !/jogossantacasa\.pt\/web\/JogarTotobola/.test(tab.url || "")) {
    setStatus(t("openPageFirst"));
    return;
  }
  tabId = tab.id;
  const state = await sendToContent({ type: "GET_STATE" });
  if (!state || !state.ok) {
    setStatus(t("couldNotRead", state && state.error ? state.error : "unknown"));
    return;
  }
  buildGameRows(state.games.map((g) => g.name));

  const saved = restoreSaved ? await loadState() : null;
  if (saved && saved.picks && saved.progress && saved.progress.table) {
    applyPicks(saved.picks);
    const { doubles, triples } = classify(saved.picks);
    renderSystemChoices(doubles, triples, saved.systemKey);
    if (saved.systemKey) onSystemChosen(false); // builds variant dropdown if needed, doesn't recompute
    if (saved.variant) el("variantSelect").value = saved.variant;
    if (saved.superValue) el("superSelect").value = saved.superValue;
    progress = saved.progress;

    const sysLabel = saved.systemKey && SYSTEMS[saved.systemKey] ? SYSTEMS[saved.systemKey].label : saved.systemKey;
    const remaining = progress.numBets - progress.columnsFilled;
    if (remaining > 0) {
      setStatus(t("restoredProgress", sysLabel, progress.columnsFilled, progress.numBets, state.total, progress.columnsFilled + 1));
    } else {
      setStatus(t("restoredAllFilled", progress.numBets, sysLabel, state.total));
    }
  } else {
    onPicksChangedByUser();
    setStatus(t("connectedTotal", state.total));
  }
}

async function fillNextBatch() {
  if (!progress.table) {
    setStatus(t("pickFirst"));
    return;
  }
  if (!tabId) {
    setStatus(t("notConnectedClick"));
    return;
  }
  const startCol = progress.columnsFilled;
  const remaining = progress.numBets - startCol;
  if (remaining <= 0) {
    setStatus(t("allFilled"));
    return;
  }
  const batchSize = Math.min(10, remaining);
  const columns = [];
  let expectedApostas = 0;
  const perColumnApostas = progress.perColumnApostas || [];
  for (let c = 0; c < batchSize; c++) {
    const tableCol = startCol + c;
    const colPicks = {};
    for (let g = 0; g < GAME_COUNT; g++) colPicks[g] = progress.table[g][tableCol];
    columns.push(colPicks);
    expectedApostas += perColumnApostas[tableCol] || 1;
  }
  // Super14 only needs to be set once — do it on the very first batch.
  const superSymbol = startCol === 0 ? el("superSelect").value || null : null;

  const resp = await sendToContent({ type: "FILL", columns, superSymbol });
  if (!resp || !resp.ok) {
    const detail = resp && resp.missing && resp.missing.length ? "missing cells: " + resp.missing.join(", ") : (resp && resp.error) || "unknown error";
    setStatus(t("fillFailed", detail));
    return;
  }
  progress.columnsFilled += batchSize;
  saveState(); // <-- persists progress immediately, before you submit and the popup closes
  const remainingAfter = progress.numBets - progress.columnsFilled;
  const tail = remainingAfter > 0 ? t("betsLeft", remainingAfter) : t("allBetsFilledAcross", progress.numBets);
  let msg = t("filledBatchStatus", startCol + 1, startCol + batchSize, progress.numBets, resp.total, tail);
  // "múltiplas" systems don't cost a flat €0,50 per column — show the
  // independently-computed expected price for THIS batch next to the
  // page's own total, so a mismatch is obvious before you ever submit.
  if (expectedApostas !== batchSize) {
    const expectedPrice = (expectedApostas * 0.5).toFixed(2).replace(".", ",");
    msg += "\n" + t("priceCheck", expectedApostas, expectedPrice);
  }
  setStatus(msg);
}

// ---- init ----

async function init() {
  currentLang = await loadLang();
  applyStaticTexts();
  renderAvailableSystems();

  el("langToggle").addEventListener("click", () => switchLanguage(currentLang === "pt" ? "en" : "pt"));
  el("btnRefresh").addEventListener("click", () => refreshState(true));
  el("btnFillNext").addEventListener("click", fillNextBatch);
  el("btnReset").addEventListener("click", () => {
    progress = { columnsFilled: 0, table: null, numBets: 0 };
    chrome.storage.local.remove(STORAGE_KEY);
    setStatus(t("progressReset"));
  });

  await refreshState(true);
}

init();
