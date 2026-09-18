# CLAUDE.md

This file gives Claude (and anyone else reading the repo) the *why* behind
this extension: the betting-math concept it automates, not just the code.
For technical/usage details, see `README.md` — this file is about the
domain concept encoded in `systems.js`.

## What Totobola is

Totobola is Santa Casa's Portuguese football pools bet: pick the outcome
(`1` = home win, `X` = draw, `2` = away win) of 13 fixed games on one
ticket. Prizes are tiered by how many of the 13 you get right:

- 1st prize: 13/13 correct
- 2nd prize: 12/13 correct
- 3rd prize: 11/13 correct

## The problem this extension's math solves

For most of the 13 games you're confident in one outcome. For a few you're
not — you think it's "1 or X" but can't call it. Totobola lets you hedge
a single game by marking more than one outcome for it:

- a **dupla** (double): mark 2 of the 3 outcomes for that game (`1X`, `X2`,
  or `12`) — costs like betting both underlying combinations.
- a **tripla** (triple): mark all 3 outcomes for that game — that game is
  now covered no matter what happens, at the cost of 3× a single game.

If you hedge N games this way and want to be certain of covering the
*actual* outcome no matter which way each hedged game goes, you need every
combination of your hedges: 2^N bet lines for N doubles, 3^N for N triples
(a "sistema completo" / full/plain system). That guarantees the 1st prize
if your single picks are all correct — but it grows explosively. Marking
just 8 doubles "properly" would need 2^8 = 256 lines at once; 8 triples
would need 3^8 = 6561.

## The concept: reduced systems ("sistemas reduzidos")

A **reduced system** is a mathematically constructed subset of that full
combination space — far fewer bet lines — published for exactly this
purpose (most of this repo's tables are transcribed verbatim from
[utilitarios.pt/totobola.htm](http://utilitarios.pt/totobola.htm); two are
not — see below). It trades away the guarantee of the *top* prize for a
much smaller, affordable number of bets, while still **guaranteeing a
lower prize tier** as long as you don't miss too many of your hedged
games — i.e. as long as at most some small number of your doubled/tripled
outcomes turn out "wrong" relative to what you covered. The exact
tolerance and prize level are a property of each table, e.g.:

- **8 Duplas → 14 apostas**: an economical (not "perfect") system —
  guarantees at least a 3rd prize, and better outcomes (2nd, or partial
  1st) depending on exactly how many of the 8 doubles land wrong.
- **7 Duplas → 16 apostas**: a "perfect" system — every pair of its 16
  lines differs by at least 2 symbols, guaranteeing a prize tolerating up
  to 1 wrong double.
- **4 Triplas → 9 apostas**: a "perfect" system over 4 tripled games (9
  near-equivalent variants are published; any one works the same way).
- **3 Triplas + 3 Duplas → 24 apostas**: not a perfect system, but
  economical, tolerating up to 1 wrong hedge across the combined
  triples+doubles.
- **5 Triplas → 27 apostas** and **6 Triplas → 81 apostas**: *not* from
  utilitarios.pt — that source has no published table for 5 or 6 triples.
  These were computed for this repo directly from the underlying math: an
  exact ternary radius-1 covering-code search (a MIP solve with HiGHS),
  independently re-verified to cover every possible outcome of the
  tripled games with at most 1 miss, same guarantee tier as `triplas4_9`
  (min. 2nd prize). The 5-triple table is *proven* optimal (27 is
  mathematically the fewest lines possible for that guarantee — no
  perfect covering code exists at length 5, only at 1, 4, and 13). The
  6-triple table is only a verified-correct upper bound: the search hit
  its time budget at 81 lines with a proven lower bound of 59, so a
  smaller valid system for 6 triples may still exist.
- **8 Triplas → 201 apostas** and **6 Triplas → 73 apostas**: "múltiplas"
  systems — guarantee a prize as long as the number of hedged games that
  come out `1` falls in a specific range (e.g. 3–6 out of 6, or 4–8 out of
  8), taking advantage of the site's native combinatorial column pricing
  (see the big comment above `triplas8_201` in `systems.js` for exactly
  how that pricing works).

The upshot: instead of paying for 256+ combinations to hedge 8 uncertain
games, you pay for 14–24 carefully chosen ones and still walk away with a
2nd/3rd-tier prize in most of the ways those games could actually turn
out. This is the entire reason to play a "system" bet instead of a plain
one — cheaper coverage with a real, published, mathematical guarantee
instead of a hunch.

## What this extension actually does

It does not implement or improve the reduction math — that math already
exists, published on utilitarios.pt, and is transcribed as literal data
tables in `systems.js` (see the comments there for the exact schema:
`duplas` / `triplas` / `mixed` / `multiplas`). The extension's only job is
to remove the tedious, error-prone part: manually clicking dozens of `1`/
`X`/`2` checkboxes per bet line, for every line in the chosen system, on
jogossantacasa.pt's ticket grid.

Concretely: you mark on the page which games you're hedging (as a double
or triple), the popup matches that count against the known systems in
`systems.js`, expands the system's abstract rows into concrete picks for
your specific games, and clicks them into the grid in batches (the site
caps 10 columns per ticket). You still review and submit every ticket
yourself — see `README.md` for the full mechanics, safety notes, and how
to add another published system.
