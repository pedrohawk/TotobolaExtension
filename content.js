// content.js
// Runs on the Totobola betting page. Talks to popup.js via chrome.runtime messages.
// It only ever CLICKS PICK CELLS (li#a_<col>_<game>_<symbol> and li#s_0_0_<symbol>).
// It never touches #btnAdd ("Adicionar ao Carrinho") or #btnBetnow ("Apostar Já").

(function () {
  function getGameName(idx) {
    const rows = document.querySelectorAll(".gameMiddle .row");
    const row = rows[idx];
    if (!row) return null;
    const ems = row.querySelectorAll(".currGame em");
    return ems && ems[1] ? ems[1].textContent.trim() : null;
  }

  function getState() {
    const rows = document.querySelectorAll(".gameMiddle .row");
    const games = [];
    for (let i = 0; i < rows.length; i++) {
      games.push({ index: i, name: getGameName(i) });
    }
    const totalEl = document.querySelector(".totalBet cite");
    const hasSuper14 = !!document.getElementById("s_0_0_1");
    return {
      ok: rows.length === 13,
      numGames: rows.length,
      games,
      hasSuper14,
      total: totalEl ? totalEl.textContent.trim() : null,
    };
  }

  function clickCell(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    if (!el.classList.contains("selected")) el.click();
    return true;
  }

  // columns: array of { "<gameIndex 0-12>": pick, ... } where pick is either
  // a single symbol "1"|"X"|"2" (mark one outcome), or an array of symbols
  // like ["X","2"] (mark MORE THAN ONE outcome for that game in that same
  // column — the site's own "múltiplas" pricing then multiplies the price
  // for that column by the product of marked-outcome-counts across all
  // games, e.g. one 2-way game + one 3-way game = 6x the base price).
  // Fills page column 0, 1, 2, ... in order (the page always exposes columns
  // 0-9 for whatever ticket is currently open — the caller is responsible for
  // mapping logical bet numbers past #10 onto a fresh empty ticket's 0-9).
  function fill(columns, superSymbol) {
    const missing = [];
    columns.forEach((colPicks, colIdx) => {
      for (let g = 0; g < 13; g++) {
        const pick = colPicks[g];
        if (!pick) continue;
        const symbols = Array.isArray(pick) ? pick : [pick];
        symbols.forEach((symbol) => {
          const id = `a_${colIdx}_${g}_${symbol}`;
          if (!clickCell(id)) missing.push(id);
        });
      }
    });
    if (superSymbol) {
      const id = `s_0_0_${superSymbol}`;
      if (!clickCell(id)) missing.push(id);
    }
    const totalEl = document.querySelector(".totalBet cite");
    return {
      ok: missing.length === 0,
      missing,
      total: totalEl ? totalEl.textContent.trim() : null,
    };
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      if (msg.type === "GET_STATE") {
        sendResponse(getState());
      } else if (msg.type === "FILL") {
        sendResponse(fill(msg.columns, msg.superSymbol));
      } else if (msg.type === "CLEAR") {
        // Utility only — clicks the page's own "Limpar" button, which just
        // clears selections. Never touches Adicionar ao Carrinho / Apostar Já.
        const btn = document.getElementById("btnClear");
        if (btn) btn.click();
        sendResponse({ ok: !!btn });
      } else {
        sendResponse({ ok: false, error: "unknown message type" });
      }
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
    return true;
  });
})();
