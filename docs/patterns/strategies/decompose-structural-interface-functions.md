---
title: Decompose Structural Interface Functions
kind: strategy
state: active
evidence: supported
---

# Strategy — Decompose Structural Interface Functions

**Status:** canonical strategy  
**Evidence:** Supported principle; implementation remains project/engineering specific

## Proposition

Do not treat a structural junction as one undifferentiated “fixed connection”. Separate the functions it must perform and resolve each deliberately.

For a floor-to-wall condition, that may include:

- gravity support;
- anti-roll / anti-unseating restraint;
- wall restraint;
- diaphragm or shear transfer;
- tolerance and movement accommodation;
- fire/acoustic boundary continuity;
- inspection, corrosion and replacement considerations.

The strategy does **not** prescribe a seated floor, hanger, bearing ledge or sliding detail. Those are implementation families to be compared by the structural engineer.

## Why this is a strategy rather than a pattern

The reusable knowledge is analytical: distinguish structural and boundary functions before selecting a connection. The valid physical resolutions differ too much to collapse into one recurring architectural relationship.

The earlier **Seated Floor Structure** work remains valuable because it exposed this stronger abstraction, but the seated connection itself remains an implementation challenger rather than a canonical HSA pattern.

## Use

Apply when a junction is at risk of being over-constrained, under-specified or made opaque by one component being assumed to perform several unrelated duties.

A useful sequence is:

1. list required actions and boundary duties;
2. identify which are continuous, intermittent or conditional;
3. assign each duty to a component/interface deliberately;
4. check whether movement/tolerance is being suppressed without reason;
5. compare conventional certified details before inventing bespoke hardware;
6. document the final load path and boundary reinstatement separately.

## Guardrails

- bounded movement is not a substitute for adequate restraint;
- “demountable” does not override structural robustness, fire or acoustic requirements;
- do not create movement freedom where the actual assembly does not need it;
- conventional certified hardware remains the baseline until a challenger proves a material advantage.

## Evidence / provenance

Extracted during the Phase-6 corpus audit from the earlier **Seated Floor Structure** candidate. The existing engineering research and prototype programme remain the evidence/proving ground for implementation choices.

See:

- [`../reversible-assembly-candidates.md`](../reversible-assembly-candidates.md);
- [`../../research/seated-floor-structure-options.md`](../../research/seated-floor-structure-options.md).

## Does not prove

This strategy does not establish that direct bearing, a seated/captured detail or any bespoke connection is superior to an ordinary engineered hanger. Structural adequacy and project suitability remain engineering decisions.