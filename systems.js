// systems.js
// Reference "reduced system" tables, transcribed verbatim from
// http://utilitarios.pt/totobola.htm . Each system expands N marked
// double/triple games into a fixed number of concrete bet lines.
//
// kind "duplas": each row uses only literal symbols "1"/"X". Applied to a
//   real double game via a type map (1X / X2 / 12) depending which two
//   outcomes that game's double actually covers (see popup.js: mapper()).
// kind "triplas": each row uses literal "1"/"X"/"2" and is applied directly,
//   since a real triple covers all three outcomes — no relabeling needed.
// kind "mixed": some rows are triple rows (kind triplas) and some are
//   double rows (kind duplas, need the type map), combined in one system.
//
// To add a system: add a new entry below with the same shape, matching the
// exact row/column counts published on utilitarios.pt (or your own source).
// requiredDoubles / requiredTriples is how the popup auto-matches a system
// to what you marked on the grid.

const SYSTEMS = {
  duplas8_14: {
    label: "8 Duplas → 14 apostas",
    kind: "duplas",
    requiredDoubles: 8,
    requiredTriples: 0,
    numBets: 14,
    rows: [
      "X X X X X X X 1 1 1 1 1 1 1",
      "X X X 1 1 1 1 X X X X 1 1 1",
      "X 1 1 X X 1 1 X X 1 1 X X 1",
      "X 1 1 1 1 X X 1 1 X X X X 1",
      "1 X 1 X 1 X 1 X 1 X 1 X 1 X",
      "1 X 1 1 X 1 X 1 X 1 X X 1 X",
      "1 1 X X 1 1 X 1 X X 1 1 X X",
      "1 1 X 1 X X 1 X 1 1 X 1 X X",
    ].map((r) => r.split(" ")),
  },

  duplas7_16: {
    label: "7 Duplas → 16 apostas",
    kind: "duplas",
    requiredDoubles: 7,
    requiredTriples: 0,
    numBets: 16,
    rows: [
      "1 X X 1 1 X X 1 X 1 1 X X 1 1 X",
      "1 X 1 X X 1 X 1 X 1 X 1 1 X 1 X",
      "1 X 1 X 1 X 1 X 1 X 1 X 1 X 1 X",
      "1 1 X X X X 1 1 X X 1 1 1 1 X X",
      "1 1 X X 1 1 X X 1 1 X X 1 1 X X",
      "1 1 1 1 X X X X 1 1 1 1 X X X X",
      "1 1 1 1 1 1 1 1 X X X X X X X X",
    ].map((r) => r.split(" ")),
  },

  triplas4_9: {
    label: "4 Triplas → 9 apostas (choose variant)",
    kind: "triplas",
    requiredDoubles: 0,
    requiredTriples: 4,
    numBets: 9,
    // 9 near-equivalent "perfect" variants — pick any one.
    variants: {
      1: [
        "1 X 2 1 X 2 1 X 2",
        "2 1 X 1 X 2 X 2 1",
        "X 2 1 1 X 2 2 1 X",
        "1 1 1 X X X 2 2 2",
      ],
      2: [
        "1 X 2 1 X 2 1 X 2",
        "1 X 2 2 1 X X 2 1",
        "2 1 X 1 X 2 X 2 1",
        "1 1 1 X X X 2 2 2",
      ],
      3: [
        "1 X 2 1 X 2 1 X 2",
        "2 1 X X 2 1 1 X 2",
        "1 X 2 X 2 1 2 1 X",
        "1 1 1 X X X 2 2 2",
      ],
      4: [
        "1 X 2 1 X 2 1 X 2",
        "1 X 2 X 2 1 2 1 X",
        "1 X 2 2 1 X X 2 1",
        "1 1 1 X X X 2 2 2",
      ],
      5: [
        "1 X 2 1 X 2 1 X 2",
        "X 2 1 2 1 X 1 X 2",
        "2 1 X X 2 1 1 X 2",
        "1 1 1 X X X 2 2 2",
      ],
      6: [
        "1 X 2 1 X 2 1 X 2",
        "2 1 X 1 X 2 X 2 1",
        "2 1 X X 2 1 1 X 2",
        "1 1 1 X X X 2 2 2",
      ],
      7: [
        "1 X 2 1 X 2 1 X 2",
        "1 X 2 X 2 1 2 1 X",
        "X 2 1 1 X 2 2 1 X",
        "1 1 1 X X X 2 2 2",
      ],
      8: [
        "1 X 2 1 X 2 1 X 2",
        "X 2 1 2 1 X 1 X 2",
        "1 X 2 2 1 X X 2 1",
        "1 1 1 X X X 2 2 2",
      ],
      9: [
        "2 1 X X 2 1 1 X 2",
        "1 X 2 X 2 1 2 1 X",
        "1 X 2 1 X 2 1 X 2",
        "1 1 1 X X X 2 2 2",
      ],
    },
  },

  triplas5_27: {
    label: "5 Triplas → 27 apostas",
    kind: "triplas",
    requiredDoubles: 0,
    requiredTriples: 5,
    numBets: 27,
    // Proven-minimum radius-1 ternary covering code (exact MILP solve,
    // HiGHS: status Optimal, not just a time-limit cutoff), independently
    // verified to cover all 3^5 = 243 outcomes with at most 1 wrong pick
    // among the 5 tripled games. No perfect code exists at length 5 (only
    // at 1, 4, 13), so unlike triplas4_9 this isn't a tight 100%-efficient
    // tiling — 27 is still the true minimum, just above the naive
    // sphere-covering bound of 23. Only one variant (the unique solution
    // found), unlike triplas4_9's 9 equivalent ones.
    variants: {
      1: [
        "1 1 1 1 1 1 1 1 1 X X X X X X X X X 2 2 2 2 2 2 2 2 2",
        "1 1 1 X X X 2 2 2 1 1 1 X X X 2 2 2 1 1 1 X X X 2 2 2",
        "1 X X 1 2 2 1 X 2 X 2 2 1 1 X 1 X 2 1 1 2 X X 2 1 X 2",
        "2 1 X X 1 2 1 2 X 2 1 X 1 2 X X 1 2 1 X 2 1 2 X 2 X 1",
        "X 1 2 X X 2 2 1 1 2 2 X 1 1 1 2 X X X 1 1 2 X 2 2 X 1",
      ],
    },
  },

  triplas6_81: {
    label: "6 Triplas → 81 apostas",
    kind: "triplas",
    requiredDoubles: 0,
    requiredTriples: 6,
    numBets: 81,
    // Best feasible radius-1 ternary covering code found by an exact MILP
    // solve (HiGHS) within an 8-minute time budget — NOT proven optimal.
    // The solver hit its time limit with a proven lower bound of only 59,
    // so the true minimum sits somewhere in 59..81; 81 is a verified-valid
    // upper bound (independently re-checked from scratch), not the
    // theoretical best. Still guarantees minimum 2nd prize: covers all
    // 3^6 = 729 outcomes with at most 1 wrong pick among the 6 tripled
    // games. Only one variant, unlike triplas4_9's 9 equivalent ones.
    variants: {
      1: [
        "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 X X X X X X X X X X X X X X X X X X X X X X X X X X X 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2",
        "1 1 1 1 1 1 1 1 1 X X X X X X X X X 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 X X X X X X X X 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 X X X X X X X X X 2 2 2 2 2 2 2 2 2",
        "1 1 1 X X X X 2 2 1 1 1 X X X 2 2 2 1 1 1 X X X 2 2 2 1 1 1 X X X 2 2 2 2 1 1 1 1 X X 2 2 1 1 X X X X 2 2 2 1 1 1 1 X X X 2 2 1 1 X X X X 2 2 2 1 1 1 1 X X 2 2 2",
        "1 X 2 X X 2 2 1 1 1 2 2 1 X 2 1 X X 1 X X 1 1 X 2 2 2 X X 2 1 1 1 X 2 2 2 1 1 X 2 X 2 1 X 1 X X 2 2 2 1 1 X 1 1 X 2 X X 2 1 X X X 1 1 1 1 2 2 2 1 2 2 2 1 X 1 X X",
        "1 X 2 X X 1 1 2 2 1 X X 2 2 2 X 1 1 1 2 2 X X 1 1 X 2 1 1 2 1 1 X 2 1 X X 2 2 2 1 X 1 X 1 X X 1 X 2 2 1 1 2 X X 2 1 2 2 X 1 1 1 X 1 1 X X 2 2 2 2 1 1 X 2 1 2 X X",
        "2 1 2 X 2 1 X 1 X 2 1 X 2 2 2 2 1 X 1 1 X 1 X 2 2 2 2 1 X 2 X 2 1 2 1 1 X 1 X X 2 1 2 2 X 2 2 2 X 1 X 1 X 1 1 X 1 X 1 X 2 2 2 2 2 1 X 1 X 1 X 2 2 1 X 1 2 2 2 1 X",
      ],
    },
  },

  triplas3_duplas3_24: {
    label: "3 Triplas + 3 Duplas → 24 apostas",
    kind: "mixed",
    requiredDoubles: 3,
    requiredTriples: 3,
    numBets: 24,
    tripleRows: [
      "1 X 2 1 X 2 1 X 2 1 X 2 2 1 X X 2 1 2 1 X X 2 1",
      "1 X 2 1 X 2 1 X 2 1 X 2 X 2 1 2 1 X X 2 1 2 1 X",
      "1 X 2 1 X 2 1 X 2 1 X 2 1 X 2 1 X 2 1 X 2 1 X 2",
    ].map((r) => r.split(" ")),
    doubleRows: [
      "1 1 1 1 1 1 X X X X X X 1 1 1 1 1 1 X X X X X X",
      "1 1 1 1 1 1 X X X X X X X X X X X X 1 1 1 1 1 1",
      "1 1 1 X X X X X X 1 1 1 X X X 1 1 1 1 1 1 X X X",
    ].map((r) => r.split(" ")),
  },

  // --- "múltiplas" systems -----------------------------------------------
  // These two use a different mechanism than the systems above: instead of
  // each column marking exactly ONE outcome per game, a column can mark
  // MORE THAN ONE outcome for the same game (token "X2" = mark X and 2;
  // "1X2" = mark all three). jogossantacasa.pt natively multiplies the
  // price for that one column by the product of how many outcomes were
  // marked per game (verified live: marking 2 outcomes for one game turns
  // a €0,50 column into €1,00; a second 2-way game on top of that makes it
  // €2,00 = 2×2×€0,50 — confirmed combinatorial, not additive).
  //
  // So `numBets` here means "how many input columns to click" (still
  // batched ≤10 per ticket like every other system), while `totalApostas`
  // is the informational final line-count the system's name promises
  // (201 / 73) — it's the SUM, across all input columns, of the per-column
  // outcome-count products. popup.js computes that sum itself from
  // `columns` to sanity-check the page's own running total as it fills.
  //
  // `columns[i]` is one input column: an array of tokens, one per marked
  // triple game in ascending game order (row 1 = 1st marked triple game,
  // etc.) — unlike the plain "duplas"/"triplas" kinds above, no type-map
  // relabeling is needed here since every token already names literal
  // outcomes directly.

  triplas8_201: {
    label: "8 Triplas → 201 apostas (múltiplas)",
    kind: "multiplas",
    requiredDoubles: 0,
    requiredTriples: 8,
    numBets: 25,
    totalApostas: 201,
    columns: [
      ["1", "1", "X2", "1", "1", "1X2", "1", "X2"],
      ["1", "1", "X2", "1", "1", "X2", "1X2", "1"],
      ["1", "1", "X2", "X2", "1", "1X2", "1", "1"],
      ["1", "X2", "1X2", "1", "X2", "1", "1", "1"],
      ["X2", "1X2", "1", "1", "X2", "1", "1", "1"],
      ["X2", "X2", "1X2", "1", "1", "1", "1", "1"],
      ["1", "1", "1", "1", "X2", "1", "X2", "X2"],
      ["1", "1", "1", "X2", "1", "1", "X2", "X2"],
      ["1", "1", "1", "X2", "X2", "1", "1", "X2"],
      ["1", "1", "1", "X2", "X2", "1", "X2", "1"],
      ["1", "X2", "1", "1", "1", "1", "X2", "X2"],
      ["1", "X2", "1", "1", "X2", "X2", "1", "1"],
      ["1", "X2", "1", "X2", "1", "1", "1", "X2"],
      ["1", "X2", "1", "X2", "1", "1", "X2", "1"],
      ["X2", "1", "1", "1", "1", "1", "X2", "X2"],
      ["X2", "1", "1", "1", "X2", "X2", "1", "1"],
      ["X2", "1", "1", "X2", "1", "1", "1", "X2"],
      ["X2", "1", "1", "X2", "1", "1", "X2", "1"],
      ["X2", "1", "X2", "1", "X2", "1", "1", "1"],
      ["X2", "X2", "1", "1", "1", "X2", "1", "1"],
      ["1", "1", "1", "1", "1", "X2", "1", "X2"],
      ["1", "1", "1", "1", "1", "X2", "X2", "1"],
      ["1", "1", "1", "X2", "1", "X2", "1", "1"],
      ["1", "1", "X2", "1", "1", "1", "X2", "1"],
      ["1", "1", "1", "1", "1", "1", "1", "1"],
    ],
  },

  triplas6_73: {
    label: "6 Triplas → 73 apostas (múltiplas)",
    kind: "multiplas",
    requiredDoubles: 0,
    requiredTriples: 6,
    numBets: 15,
    totalApostas: 73,
    columns: [
      ["1", "1", "1X2", "1", "1", "1X2"],
      ["1", "1", "1X2", "1", "X2", "1"],
      ["1", "1", "1X2", "X2", "1", "1"],
      ["1", "X2", "1X2", "1", "1", "1"],
      ["X2", "1", "1X2", "1", "1", "1"],
      ["1", "1", "1", "1", "X2", "X2"],
      ["1", "1", "1", "X2", "1", "X2"],
      ["1", "1", "1", "X2", "X2", "1"],
      ["1", "X2", "1", "1", "1", "X2"],
      ["1", "X2", "1", "1", "X2", "1"],
      ["1", "X2", "1", "X2", "1", "1"],
      ["X2", "1", "1", "1", "1", "X2"],
      ["X2", "1", "1", "1", "X2", "1"],
      ["X2", "1", "1", "X2", "1", "1"],
      ["X2", "X2", "1", "1", "1", "1"],
    ],
  },
};
