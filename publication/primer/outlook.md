# Making and testing the platform

House Kernel is a design position before it is a construction system. Its principles are intended to survive changes in material, technology, architectural language and project circumstance. The work downstream exists to test whether those principles can become useful architecture without turning into disproportionate cost, complexity or fragility.

## From proposition to building

The project keeps several kinds of claim separate:

```text
doctrine
    ↓
strategy
    ↓
pattern
    ↓
project-specific implementation
    ↓
evidence, prototype and commissioning
```

A doctrine principle states a durable architectural position. A strategy describes a general way of pursuing it. A pattern records a reusable architectural response with explicit trade-offs. A project then selects an implementation appropriate to its site, programme, construction system and evidence.

That separation matters. A pattern can prove awkward, an implementation can fail a prototype, and a Reference House decision can be rejected without invalidating the principle that led to it.

## Test the awkward parts

Non-standard work should earn repetition. Where an interface, assembly or maintenance proposition carries material risk, the project favours drawing it at useful scale, building it, disassembling it and recording what actually happened.

The point is not to prototype ordinary construction for its own sake. It is to expose hidden sequences, inaccessible fixings, unrealistic tolerances, boundary failures and workmanship demands before they are multiplied through a building.

The same discipline applies after construction. Maintainability is not demonstrated by an access note on a drawing. The completed building must still provide the route, working space, isolation, removal path and information that the design claimed it would.

## A parallel computational track

The project also asks whether selected architectural relationships can be represented explicitly enough to be checked rather than merely described. That work is deliberately subordinate to the architecture.

Its current conceptual chain is:

```text
selected architectural / project intent
    ↓
formal architectural model
    ↓
semantic relationships + invariants
    ↓
derived obligations
    ↓
evidence / determination
    ↓
validity + diagnostics
```

This is not a governing principle, and House Kernel does not depend on software to be meaningful. The computational work is useful only where it makes architectural obligations clearer, catches contradictions or preserves reasoning that would otherwise disappear between documents.

A future design tool may be able to reject an arrangement because a required maintenance route is absent, a service crossing violates an agreed boundary, or a claimed assembly lacks the evidence needed to support it. It should not replace architectural judgement with a catalogue of arbitrary rules.

## What this Primer leaves out

The Primer is intended to provide the complete mental model, not the complete argument. The **Working Edition** remains the authoritative long-form publication. It carries the evidence and qualifications behind the proposition, the full pattern records, strategies and held candidates, detailed Reference House studies, making and procurement work, and the wider research record.

The live project also contains material that is deliberately outside both publications: development history, prototypes, computational experiments and working research. Those records are valuable because they show how claims are being tested, but they should not be mistaken for settled doctrine merely because they exist.

The compact and full editions therefore serve different purposes. The Primer explains what House Kernel is and how its parts fit together. The Working Edition shows the reasoning, evidence and architectural consequences in depth.

[Read the Working Edition](https://adamnoden.github.io/architecture/house-kernel.pdf)
