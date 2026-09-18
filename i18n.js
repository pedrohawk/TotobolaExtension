// i18n.js
// Lightweight UI translations (not chrome.i18n — this is a manual runtime
// toggle between English and PT-PT, independent of the browser's locale).
//
// Betting-system names in systems.js (e.g. "8 Duplas → 14 apostas") are left
// untranslated on purpose: "Duplas"/"Triplas"/"apostas" are the actual
// Portuguese terms used on jogossantacasa.pt and utilitarios.pt, and read
// fine in either UI language.

const DEFAULT_LANG = "pt";

const STRINGS = {
  en: {
    title: "Totobola System Filler",
    notice:
      'Fills the grid only. It never clicks "Adicionar ao Carrinho" or "Apostar Já" — you always review and submit the bet yourself.',
    gamesPlaceholder: 'Open the Totobola betting page and click "Refresh page state".',
    matchingSystems: "Matching system(s):",
    markGamesFirst: "Mark games above first.",
    variantLabel: "Variant:",
    super14Label: "Super14 (this concurso's bonus game):",
    super14DontSet: "(don't set)",
    btnRefresh: "Refresh page state",
    btnFillNext: "Fill next batch",
    btnReset: "Reset progress",
    notConnected: "Not connected yet.",
    availableSystemsTitle: "Available betting systems",
    variantsAvailable: (n) => `(${n} variants to choose from)`,
    gameFallback: (i) => `Jogo ${i}`,
    optSimple1: "Simple 1",
    optSimpleX: "Simple X",
    optSimple2: "Simple 2",
    optDouble1X: "Double 1X",
    optDoubleX2: "Double X2",
    optDouble12: "Double 12",
    optTriple: "Triple",
    noMatch: (nd, nt) =>
      `No built-in system matches ${nd} double(s) + ${nt} triple(s) yet. Keep marking games, or add this system to systems.js.`,
    warnIncomplete:
      "Warning: the bet table is incomplete. Double-check every game is marked and matches the system's required double/triple count.",
    systemReady: (label, numBets) =>
      `System ready: ${label}. ${numBets} bet(s) total, filled in batches of up to 10 (the site's per-ticket limit). Click "Fill next batch" to start.`,
    systemReadyMultiplas: (label, numCols, totalApostas) =>
      `System ready: ${label}. ${numCols} input column(s) to fill (in batches of up to 10) — the site's own "múltiplas" pricing then expands them into ${totalApostas} bet-lines total. Click "Fill next batch" to start.`,
    priceCheck: (apostas, price) => `Expected for this batch: ${apostas} bet-line(s) → € ${price}. Check that against the page total above before submitting.`,
    pickFirst: "Pick your games and a system first.",
    notConnectedClick: "Not connected — click Refresh page state first.",
    allFilled: "All bets already filled for this system.",
    fillFailed: (detail) => `Fill failed — ${detail}`,
    betsLeft: (n) =>
      `${n} bet(s) left. Submit this ticket yourself, then reopen this popup once the grid is empty and click "Fill next batch" again.`,
    allBetsFilledAcross: () => `Review and submit the last ticket yourself.`,
    filledBatchStatus: (from, to, total, pageTotal, tail) =>
      `Filled bets ${from}-${to} of ${total}. Page total: € ${pageTotal}.\n${tail}`,
    openPageFirst: "Open the Totobola betting page (jogossantacasa.pt) in this tab, then click Refresh.",
    couldNotRead: (err) => `Could not read the Totobola grid on this page (${err}). Reload the page and try again.`,
    connectedTotal: (total) => `Connected. Current total on page: € ${total}. Mark your games above.`,
    restoredProgress: (label, filled, total, pageTotal, next) =>
      `Restored progress: ${label}. ${filled} of ${total} bet(s) already filled on a previous ticket.\n` +
      `Current page total: € ${pageTotal}. Click "Fill next batch" to continue with bet ${next}.`,
    restoredAllFilled: (total, label, pageTotal) =>
      `Restored: all ${total} bet(s) for "${label}" were already filled. Current page total: € ${pageTotal}.`,
    progressReset: "Progress reset. Pick your games and a system, then fill again.",
    variantOption: (v) => `${v}º Sistema`,
    langToggleTitle: "Switch to Português (PT-PT)",
  },

  pt: {
    title: "Preenchedor de Sistemas Totobola",
    notice:
      'Esta extensão apenas preenche a grelha de apostas. Nunca clica em "Adicionar ao Carrinho" nem em "Apostar Já" — a revisão e submissão da aposta são sempre suas.',
    gamesPlaceholder: 'Abra a página de apostas do Totobola e clique em "Atualizar estado da página".',
    matchingSystems: "Sistema(s) correspondente(s):",
    markGamesFirst: "Marque primeiro os jogos acima.",
    variantLabel: "Variante:",
    super14Label: "Super14 (jogo bónus deste concurso):",
    super14DontSet: "(não definir)",
    btnRefresh: "Atualizar estado da página",
    btnFillNext: "Preencher próximo lote",
    btnReset: "Reset",
    notConnected: "Ainda não ligado.",
    availableSystemsTitle: "Sistemas de aposta disponíveis",
    variantsAvailable: (n) => `(${n} variantes à escolha)`,
    gameFallback: (i) => `Jogo ${i}`,
    optSimple1: "Simples 1",
    optSimpleX: "Simples X",
    optSimple2: "Simples 2",
    optDouble1X: "Dupla 1X",
    optDoubleX2: "Dupla X2",
    optDouble12: "Dupla 12",
    optTriple: "Tripla",
    noMatch: (nd, nt) =>
      `Nenhum sistema incorporado corresponde a ${nd} dupla(s) + ${nt} tripla(s). Continue a marcar jogos, ou adicione este sistema em systems.js.`,
    warnIncomplete:
      "Aviso: a tabela de apostas está incompleta. Verifique se todos os jogos estão marcados e correspondem ao número de duplas/triplas exigido pelo sistema.",
    systemReady: (label, numBets) =>
      `Sistema pronto: ${label}. ${numBets} aposta(s) no total, preenchidas em lotes de até 10 (limite do site por talão). Clique em "Preencher próximo lote" para começar.`,
    systemReadyMultiplas: (label, numCols, totalApostas) =>
      `Sistema pronto: ${label}. ${numCols} coluna(s) a preencher (em lotes de até 10) — o sistema de "múltiplas" do próprio site expande-as depois em ${totalApostas} apostas no total. Clique em "Preencher próximo lote" para começar.`,
    priceCheck: (apostas, price) => `Esperado para este lote: ${apostas} aposta(s) → € ${price}. Confirme com o total da página acima antes de submeter.`,
    pickFirst: "Marque primeiro os seus jogos e um sistema.",
    notConnectedClick: "Não ligado — clique primeiro em Atualizar estado da página.",
    allFilled: "Todas as apostas deste sistema já foram preenchidas.",
    fillFailed: (detail) => `Falha ao preencher — ${detail}`,
    betsLeft: (n) =>
      `Faltam ${n} aposta(s). Submeta este talão você mesmo e, depois de a grelha ficar vazia, reabra este popup e clique novamente em "Preencher próximo lote".`,
    allBetsFilledAcross: () => `Reveja e submeta o último talão você mesmo.`,
    filledBatchStatus: (from, to, total, pageTotal, tail) =>
      `Apostas ${from}-${to} de ${total} preenchidas. Total na página: € ${pageTotal}.\n${tail}`,
    openPageFirst: "Abra a página de apostas do Totobola (jogossantacasa.pt) nesta aba e clique em Atualizar.",
    couldNotRead: (err) => `Não foi possível ler a grelha do Totobola nesta página (${err}). Recarregue a página e tente novamente.`,
    connectedTotal: (total) => `Ligado. Total atual na página: € ${total}. Marque os seus jogos acima.`,
    restoredProgress: (label, filled, total, pageTotal, next) =>
      `Progresso restaurado: ${label}. ${filled} de ${total} aposta(s) já preenchidas num talão anterior.\n` +
      `Total atual na página: € ${pageTotal}. Clique em "Preencher próximo lote" para continuar na aposta ${next}.`,
    restoredAllFilled: (total, label, pageTotal) =>
      `Restaurado: todas as ${total} aposta(s) de "${label}" já estavam preenchidas. Total atual na página: € ${pageTotal}.`,
    progressReset: "Progresso reposto. Marque os seus jogos e um sistema, depois preencha novamente.",
    variantOption: (v) => `${v}º Sistema`,
    langToggleTitle: "Switch to English",
  },
};
