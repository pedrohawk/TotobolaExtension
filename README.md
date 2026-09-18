# Totobola System Filler

A Chrome extension that fills the Totobola betting grid on
[jogossantacasa.pt](https://www.jogossantacasa.pt) from a **reduced
Duplas/Triplas system**, instead of you clicking each of dozens of
bet-line checkboxes by hand.

**It never submits or pays for anything.** It only clicks the 1/X/2 pick
cells and, optionally, the Super14 pick. You always review the filled grid
and click "Adicionar ao Carrinho" / "Apostar Já" yourself.

> **What's a "reduced system"?** Totobola pays out in tiers (1st prize:
> 13/13 correct, 2nd: 12/13, 3rd: 11/13). When you're unsure about a few
> games, you can hedge each one by marking 2 outcomes (a *dupla*) or all 3
> (a *tripla*) — but covering every combination of those hedges gets
> expensive fast (2^N or 3^N bet lines). A reduced system is a
> mathematically constructed subset of far fewer bet lines that still
> **guarantees a minimum prize tier** as long as you don't miss on too many
> of your hedged games. See [CLAUDE.md](CLAUDE.md) for the full
> explanation of the math and where each table in this repo comes from.

## Disclaimer

This is a personal automation tool, not gambling advice. A reduced system
lowers the *cost* of covering your hedged games for a guaranteed minimum
prize tier — it does not improve your odds of guessing correctly, and it
does not guarantee a profit. Play responsibly and only what you can afford
to lose.

## Install (unpacked, for personal use)

1. Open `chrome://extensions` in Chrome.
2. Turn on "Developer mode" (top-right toggle).
3. Click "Load unpacked" and select this folder.
4. Pin the extension (puzzle-piece icon → pin) for quick access.

## Use

1. Open the Totobola betting page: jogossantacasa.pt → Jogar → Totobola.
2. Click the extension icon, then "Refresh page state". It reads the 13
   games straight off the page.
3. For each game, pick: a simple outcome (1 / X / 2), a double (1X, X2, or
   12 — whichever two outcomes you're covering), or a triple.
4. The popup shows which built-in system matches your double/triple count
   (e.g. marking exactly 8 doubles matches "8 Duplas → 14 apostas"). If a
   system has variants (4 Triplas → 9 apostas), pick one. The full list of
   what's supported is shown at the bottom of the popup at all times — see
   "Systems included" below.
5. Optionally set Super14, right below the 13 games.
6. Click "Fill next batch". It fills up to 10 input columns (the site's
   per-ticket limit) and reports the page's own total price so you can
   verify. For most systems that's exactly (columns filled × €0,50); for
   the two "múltiplas" systems (see below) it also shows its own
   independently-computed expected price for that batch, since those don't
   cost a flat €0,50 per column.
7. Review the grid yourself, then submit the ticket on the page as normal.
8. If the system has more than 10 bets, once you've submitted and the grid
   is empty again, click "Fill next batch" again to fill the rest.

## Systems included

The full list is also shown live at the bottom of the popup itself
("Available betting systems" / "Sistemas de aposta disponíveis"), so you
know what to expect before marking any games — that list is generated
straight from `systems.js`, so it can never drift out of sync with what
the popup actually matches against.

| System | Bet lines | Guarantees at least | Source |
|---|---|---|---|
| 8 Duplas | 14 | 3rd prize (better with fewer misses) | [utilitarios.pt](http://utilitarios.pt/totobola.htm) |
| 7 Duplas | 16 | 3rd prize, tolerating 1 wrong double | [utilitarios.pt](http://utilitarios.pt/totobola.htm) |
| 4 Triplas | 9 (9 equivalent variants) | 2nd prize, tolerating 1 wrong triple — mathematically optimal | [utilitarios.pt](http://utilitarios.pt/totobola.htm) |
| 3 Triplas + 3 Duplas | 24 | 3rd prize, tolerating 1 wrong hedge | [utilitarios.pt](http://utilitarios.pt/totobola.htm) |
| **5 Triplas** | **27** | **2nd prize, tolerating 1 wrong triple — proven optimal** | computed for this repo |
| **6 Triplas** | **81** | **2nd prize, tolerating 1 wrong triple — verified, not proven minimal** | computed for this repo |
| 8 Triplas (múltiplas) | 25 input columns → 201 bets | 1st or 2nd prize, depending how many hedged games land `1` | [utilitarios.pt](http://utilitarios.pt/totobola.htm) |
| 6 Triplas (múltiplas) | 15 input columns → 73 bets | some prize, depending how many hedged games land `1` | [utilitarios.pt](http://utilitarios.pt/totobola.htm) |

### The two extra "5/6 Triplas" systems

The four systems above them and the two "múltiplas" systems below are
transcribed verbatim from utilitarios.pt/totobola.htm. **"5 Triplas → 27
apostas" and "6 Triplas → 81 apostas" are not from that source** —
utilitarios.pt doesn't publish tables for those game counts. They were
computed for this repo by solving the underlying combinatorics problem
directly (an exact set-cover / ternary covering-code search, solved with
the HiGHS MIP solver and independently re-verified against all possible
outcomes before being added):

- **5 Triplas → 27 apostas**: proven mathematically optimal — no system
  with fewer than 27 lines can give this guarantee for 5 tripled games.
- **6 Triplas → 81 apostas**: a verified-correct, but not proven-minimal,
  system. The solver found this within its time budget; the true minimum
  is known to be somewhere between 59 and 81 lines, so a smaller valid
  system may exist for 6 triples.

Both guarantee at least a **2nd prize** as long as no more than 1 of the
tripled games comes out different from what you covered.

### The two "múltiplas" systems

"8 Triplas → 201 apostas" and "6 Triplas → 73 apostas" work differently
from the systems above them. Instead of every input column marking
exactly one outcome per game, a column can mark **more than one** outcome
for the same game — jogossantacasa.pt natively multiplies that column's
price by the product of how many outcomes were marked per game (verified
live before shipping this: marking 2 outcomes for one game turns a €0,50
column into €1,00; stacking a second 2-way game on top of that makes it
€2,00 = 2×2×€0,50 — genuinely combinatorial, not additive).

So for these two: mark exactly 8 (or 6) games as "Tripla" — same as any
other system — but "N input column(s)" in the status message (25 or 15)
is *not* the final number of bet-lines; it's how many columns you click,
each internally worth anywhere from 1 to several bet-lines. The popup
computes the expected bet-line count and price for whatever batch you're
about to fill (from `systems.js`'s own data, independently of the page)
and shows it right under the page's own total, so a mismatch is obvious
before you ever submit — this was checked against the systems' published
totals (201 and 73) before being shipped, and matched exactly.

## Language: English / Português (PT-PT)

Click the language button next to the title (top-right of the popup) to
switch. The choice is saved (`chrome.storage.local`) and remembered next
time you open the popup — it defaults to Português on first install.
Switching language never loses your marked games, chosen system, or fill
progress; it only re-renders the text.

Betting-system names themselves (e.g. "8 Duplas → 14 apostas") stay the
same in both languages on purpose — they're the actual Portuguese terms
used on jogossantacasa.pt and utilitarios.pt.

## Progress persists across ticket submissions

Chrome closes (and later recreates from scratch) this popup's JavaScript
every time you click away from it — including the moment you click into the
page to submit a ticket. So the extension saves your marked games, chosen
system, and how many bets you've already filled to `chrome.storage.local`
after every step, and restores it automatically the next time you open the
popup. That's what makes step 8 above actually work: submit ticket → grid
goes empty → reopen the popup → it shows "Restored progress: N of M bets
already filled" and "Fill next batch" continues exactly where it left off,
in the same tab.

Progress is cleared when you either mark a game differently (starting a new
system) or click "Reset progress" — not automatically after finishing, so
it's safe to reopen the popup later and still see "all bets filled" for a
system you already completed.

## Adding your own system

Edit `systems.js`. Every entry needs `requiredDoubles`/`requiredTriples`
(so the popup can auto-match it to what you marked) and `numBets` (how
many input columns to fill, batched ≤10 per ticket), plus a `kind`:

- `"duplas"`: `rows` (one row per doubled game, literal "1"/"X" symbols
  relabeled per game via its actual double type — see `mapper()` in
  `popup.js`).
- `"triplas"`: `variants` (one or more named row-sets, literal "1"/"X"/"2",
  applied directly — no relabeling, since a triple covers all 3 outcomes).
- `"mixed"`: both `tripleRows` and `doubleRows` in the same system.
- `"multiplas"`: `columns` (array of input columns, each an array of
  tokens — one per marked triple game, in ascending order — where a token
  like `"X2"` or `"1X2"` means "mark more than one outcome for this game
  in this column"), plus `totalApostas` for the informational final count.
  Also literal, no relabeling.

No other file needs to change — the picker, matching, batching, and (for
`"multiplas"`) price-verification logic all read from this data generically.

## How it works technically

- `content.js` is injected on the Totobola page. Each pick cell on the page
  is `<li id="a_<column 0-9>_<game 0-12>_<symbol 1|X|2>">`; Super14 is
  `<li id="s_0_0_<symbol>">`. The script calls `.click()` on the exact
  element for each pick — the same DOM event the site's own JS listens
  for, so it behaves identically to a manual click.
- `popup.js` holds the picker UI, matches your marked games against
  `systems.js`, expands the system into a full bet-line table (mapping the
  system's abstract "1"/"X" symbols onto each double's real two outcomes),
  and sends one message per 10-bet batch to `content.js`.
- `i18n.js` holds the English/PT-PT UI strings (a plain lookup table, not
  `chrome.i18n` — this is a manual in-popup toggle, independent of the
  browser's own locale).
- The extension only has `host_permissions` for jogossantacasa.pt and never
  requests broader access.
