# G-01 D6 Mutation Run 01 — Danson Principal-Room Shortcut

**Mutation ID:** D6-M01  
**Case:** G01-DAN — Danson House  
**Status:** completed topological mutation evaluation v0.1  
**Purpose:** test whether the grammar model distinguishes connectivity from architectural sequence using a historically documented change rather than an invented geometry.  
**Rule status:** modelling result only; no Georgian architectural invariant promoted.

## 1. Why this is a strong first mutation

The fabric research supplies both conditions.

On the original principal floor, the four principal rooms formed a circuit around the central stair:

- Entrance Hall — north;
- Dining Room — east;
- Saloon — south;
- Library — west.

The report states that the Saloon was reached through the Dining Room or Library. The passage east of the stair that later linked Entrance Hall directly to Saloon was originally a closet and did not cut through.

This gives a controlled historical mutation:

```text
ORIGINAL

        ENTRANCE HALL
        /           \
   DINING           LIBRARY
        \           /
             SALOON

LATER GRAPH EDIT

        ENTRANCE HALL
        /     |     \
   DINING     |     LIBRARY
        \     |     /
             SALOON
```

The mutation adds one edge. No room needs to move for the topological question to be tested.

## 2. Evidence

Primary research source:

- Historic England / English Heritage fabric research, *The House and Park at Danson, London Borough of Bexley: The Anatomy of a Georgian Suburban Estate*.

The report describes the principal floor as a compact plan around an elliptical top-lit stair and identifies the four rooms as a “circuit”. It records that the east-of-stair passage between Entrance Hall and Saloon was originally a closet and did not cut through.

Public source:

https://www.bexley.gov.uk/sites/default/files/2022-12/the-house-and-park-at-danson-london-borough-of-bexley-the-anatomy-of-a-georgian-suburban-estate.pdf

## 3. Frozen graph

Use only the relationships necessary for this mutation.

### Original graph `DAN-P-G0`

Nodes:

- `H` — Entrance Hall;
- `D` — Dining Room;
- `S` — Saloon;
- `L` — Library.

Edges:

- `H—D`;
- `D—S`;
- `S—L`;
- `L—H`.

This is a four-node cycle.

### Mutated graph `DAN-P-G1`

Retain all original edges and add:

- `H—S`.

No other relation is changed for this test.

## 4. Quantitative topological effect

| Measure | Original | With shortcut | Consequence |
|---|---:|---:|---|
| H → S shortest depth | 2 transitions | 1 transition | Saloon becomes directly accessible from Hall |
| shortest H → S routes | 2 | 1 direct shortest route | Dining/Library cease to be necessary intermediaries |
| Hall degree | 2 | 3 | Hall becomes more connected |
| Saloon degree | 2 | 3 | Saloon becomes more connected |
| Dining degree | 2 | 2 | unchanged physically, reduced intermediary role |
| Library degree | 2 | 2 | unchanged physically, reduced intermediary role |
| mean shortest-path length, four-room graph | 1.333 | 1.167 | graph becomes more efficient/shallower |

The numerical result is intentionally modest. The architectural consequence is larger than the graph-size change suggests because the added edge removes a **mandatory intermediate-room condition** between arrival and Saloon.

## 5. Connectivity and sequence diverge

The mutation improves connectivity in a conventional graph-theoretic sense:

- one more edge;
- shorter average paths;
- direct Hall–Saloon access.

But it changes a different property at the same time:

### Original

To move from Entrance Hall to Saloon, a person must pass through either:

```text
Hall → Dining → Saloon
```

or:

```text
Hall → Library → Saloon
```

### Shortcut condition

The shortest route becomes:

```text
Hall → Saloon
```

The earlier two routes still physically exist, but they are no longer structurally required by the graph.

Therefore:

> **A route can remain available while ceasing to define the architectural sequence.**

That is the core mutation result.

## 6. What the model must represent

A single adjacency relation is insufficient.

At minimum, the grammar machinery needs to distinguish:

1. **connectivity** — can A reach B directly?;
2. **route class** — what kind of movement path is this?;
3. **sequence obligation/preference** — is passage through an intermediate space required or privileged?;
4. **route depth** — how many transitions separate architectural states?;
5. **alternative paths** — are there several equivalent/competing sequences?

This confirms the modelling part of candidate `G01-CAND-02`.

It does **not** confirm that Georgian houses must use Danson’s original sequence.

## 7. What this mutation does not establish

The run cannot legitimately say:

- the original condition was more beautiful;
- the later shortcut was an architectural mistake;
- through-room circulation is generally superior;
- Georgian principal rooms must form a circuit;
- shorter circulation is architecturally worse.

Those would require architectural judgement, wider corpus evidence and contextual evaluation.

What the run establishes is narrower and stronger:

> **Adding connectivity can alter architectural sequence even when no room moves and no previous route disappears.**

A computational model that treats “more connected” as simply “better” would erase an architecturally material distinction.

## 8. Candidate-rule consequence

### Promote the modelling correction

`G01-CAND-02` currently combines an M0 modelling claim with an M1 architectural hypothesis.

This run supports promotion of the M0 component:

> **Connectivity, route role and sequence must be representable as distinct relationships.**

### Do not promote the Georgian architectural claim

No hard rule such as:

> `Hall must not connect directly to principal Saloon`

is justified.

That remains morphology/case-specific until wider evidence and mutation review support it.

## 9. Compiler consequence

A future authoring operation such as “add door between Hall and Saloon” should be able to report two truths simultaneously:

```text
CONNECTIVITY
PASS / IMPROVED

DECLARED PRINCIPAL SEQUENCE
CHANGED
```

If the selected grammar declared the intermediate sequence as invariant, it might fail. If it declared it a preference, it might warn. If no such sequence were declared, the graph edit could simply pass.

The model should not infer the authority merely from the topology.

## 10. Relation to HSA doctrine

This result belongs primarily to architectural grammar, not HSA doctrine.

HSA may care about:

- accessible movement;
- maintenance routes;
- privacy;
- service geography;
- fire/escape obligations.

Those can favour additional connectivity for their own reasons.

The architectural grammar may simultaneously value a particular spatial sequence.

The two systems are allowed to disagree and negotiate. That is precisely why they must remain separate authorities.

## 11. Mutation verdict

```text
D6-M01 DANSON SEQUENCE MUTATION

SOURCE CONTROL                         PASS
ONE-VARIABLE TOPOLOGICAL MUTATION      PASS
CONNECTIVITY/SEQUENCE DISTINCTION      CONFIRMED
G01 HARD SEQUENCE RULE                 NOT PROMOTED
M0 MODELLING CORRECTION                PROMOTE
```

## 12. Next mutation

Do **not** immediately run another topology mutation simply because this one succeeded.

The next high-information test should attack a different part of the model:

- `DAN-M02` blind-window exterior regularisation — attribute-specific plan/elevation coupling; or
- `MHH-M01B` Marble Hill sectional flattening — hierarchy carried by section.

Both require a controlled graphical representation before architectural evaluation. D6-M01 is complete because its material variable is topology itself.
