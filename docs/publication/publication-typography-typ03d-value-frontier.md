<!-- nav-exclude: redirect -->
# TYP-03D — affordability and value frontier

Status: **active TYP-03 constraint refinement**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Depends on: TYP-03A specimen harness + TYP-03B licence boundary + TYP-03C physical review protocol

## 1. Trigger

The publication should use a type system that is not only excellent and beautiful but **free or genuinely inexpensive unless a paid alternative earns a clear physical advantage**.

This is a real project constraint, not a procurement note to consider after typography is chosen.

TYP-03D therefore adds affordability to the selection boundary without weakening the aesthetic ambition and without reopening TYP-02 into an unbounded free-font search.

---

## 2. Governing value rule

Typography is still chosen first by actual reading and physical aesthetic quality. Price must not bias the anonymous first reading pass.

After candidate identities are revealed, apply this rule:

> **If a zero-cost/open candidate is physically equivalent or only marginally weaker than a paid candidate, choose the zero-cost candidate. A paid candidate may win only when the difference is clear, repeatable and important enough that choosing the free system would visibly diminish the book.**

This deliberately creates a burden of proof for expenditure.

“Paid” is not automatically disqualifying. A modest one-off cost can be justified if the font is materially better. Recurring subscriptions, complicated deployment rights, hosted-build uncertainty or expensive multi-family licensing count against a candidate even if the nominal desktop price appears tolerable.

No arbitrary monetary threshold is invented here. The intended posture is **zero first, minimal second, expensive only for an obvious result**.

---

## 3. Controlled candidate field

TYP-03 now admits five finalist systems plus the before-state baseline:

1. **Lyon Text + Atlas Grotesk** — proprietary aesthetic benchmark;
2. **Tiempos Text + Söhne** — proprietary editorial/performance benchmark;
3. **Scala Pro + Scala Sans Pro** — proprietary humanist benchmark;
4. **Source Serif 4 + Source Sans 3** — zero-cost/open neutral control;
5. **Newsreader + Source Sans 3** — zero-cost/open aesthetic challenger;
6. **Georgia + Arial** — before-state only, not a finalist.

The fifth system is a deliberate bounded addition caused by the new affordability requirement. It does **not** reopen TYP-02 to dozens of Google Fonts or an endless open-source catalogue.

No sixth finalist is authorised unless the physical review identifies a specific defect shared by both open candidates that the current proprietary benchmarks solve.

---

## 4. Why Newsreader + Source Sans 3

Newsreader is included because it can test whether the free field can have genuine editorial character rather than serving only as an operational control.

Current upstream facts:

- Newsreader is led by Production Type and distributed under **SIL Open Font License 1.1**;
- its upstream project ships it as a variable font;
- it is explicitly intended for continuous reading;
- Source Sans 3 is an Adobe open-source family under **OFL-1.1** and already belongs to the controlled Source comparison system.

Upstream references:

- `https://github.com/productiontype/Newsreader`
- `https://github.com/adobe-fonts/source-sans`

These facts make the pairing operationally attractive, not aesthetically proven.

### Risks that must be tested rather than wished away

Newsreader may:

- feel too soft or mannered beside the architectural material;
- reproduce too delicately at the eventual black-only book size;
- have a page colour that is excellent on screen but less convincing on warm uncoated stock;
- pair imperfectly with Source Sans 3 in temperature or proportion;
- lose to a commercial text face once several pages are read continuously.

Source Sans 3 may also remain too generic for headings/furniture even if Newsreader wins the body-text question. TYP-03 decides the body system; later hierarchy and TYP-06 may still expose pairing consequences.

---

## 5. Cost cannot rig the blind review

The TYP-03C protocol remains authoritative with one refinement:

1. first-round physical sheets are anonymous;
2. reading/aesthetic observations are written **before** price/licensing complexity is considered;
3. identity is revealed only after the reading judgement exists;
4. affordability then acts as a value discriminator among candidates that are genuinely viable.

This prevents two bad outcomes:

- buying an expensive face because prestige or foundry reputation contaminates the aesthetic judgement;
- forcing a merely adequate free face through because it costs nothing.

The objective is the most beautiful system worth paying for, with a strong presumption that the answer should cost nothing or very little.

---

## 6. What counts as a material paid-font win

A paid candidate earns purchase consideration only if physical review finds a clear advantage in one or more central book qualities such as:

- substantially calmer sustained reading;
- materially better page colour across several pages;
- a clearly superior italic voice used by the real manuscript;
- a serif/sans relationship that makes the publication noticeably more coherent;
- superior small-size reproduction relevant to captions or later shared typography;
- distinctive character that is native to Ovid’s House without becoming conspicuous styling.

A tiny preference in isolated glyphs, a prettier specimen heading, foundry prestige or novelty is insufficient.

If the final judgement is “both are excellent, but I slightly prefer the paid one,” the open system wins.

---

## 7. Build / licence implications

The existing TYP-03 custody boundary remains in force.

- Proprietary evaluation fonts stay local unless their licences explicitly permit otherwise.
- No proprietary font binaries are committed.
- The specimen harness uses exact local file fingerprints as identity evidence.
- Open-source status does not remove the requirement to use the exact upstream licence correctly.
- `newsreader-source` is admitted as a harness candidate id.
- A Newsreader/Source run may declare `TYP03_FONT_RIGHTS=pdf-embed-ok` only after the operator has verified the applicable OFL licence for the exact supplied files.

Later production integration should prefer vendored, fingerprinted font assets or another deterministic local-build mechanism rather than a network font service.

---

## 8. TYP-03D freeze

TYP-03D freezes these decisions:

1. Zero-cost typography is strongly preferred, but not at the cost of a visibly inferior book.
2. A paid system bears the burden of showing a **material**, not marginal, physical advantage.
3. Cost is hidden during the blind reading/aesthetic pass and considered after identity reveal.
4. Source Serif 4 + Source Sans 3 remains the open neutral control.
5. Newsreader + Source Sans 3 is admitted as the single open aesthetic challenger.
6. The candidate field does not otherwise reopen.
7. The commercial systems remain useful benchmarks even if the likely purchase decision ultimately rejects them on value.
8. No production typography changes in this packet.
9. No typeface winner is declared until the TYP-03 physical proof is actually read.

---

## 9. Next action

Prepare the five anonymous candidate systems plus baseline under the existing conservative B5 common envelope, then perform the TYP-03C reading review.

The desired outcome is not “best free font.” It is:

> **the best Ovid’s House typography whose improvement is actually worth its cost.**
