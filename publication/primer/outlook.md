# Making and proving the platform

Ovid’s House is a design position before it is a construction system. Its principles are intended to survive changes in material, technology, architectural language and project circumstance. The work downstream exists to test whether those principles can become useful architecture without turning into disproportionate cost, complexity or fragility.

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

A prototype is allowed to kill an idea. If a non-standard assembly cannot beat excellent conventional construction on the claims that justified its complexity, the correct result may be to simplify the building.

## A bounded computational track

Selected architectural relationships are also represented explicitly where deterministic checking adds something useful. That work is subordinate to the architecture rather than a second source of architectural authority.

Its conceptual chain is:

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

The current compiler can check a bounded set of plan relationships, qualitative structural and service topology, envelope obligations and selected versioned calculations. It can expose missing relationships, invalid crossings, unsupported evidence and internal contradictions without inventing the information needed to make them pass.

Those checks do not prove structural capacity, building-physics performance, MEP adequacy or regulatory compliance. A machine-checked weak assumption remains a weak assumption.

Ovid’s House does not depend on software to be meaningful. Computation earns a place only where it makes a real architectural obligation clearer, preserves traceable reasoning or catches an error that prose and drawings might otherwise conceal.

## From Primer to Working Edition

The Primer carries the complete mental model in compact form. The **Working Edition** develops the argument in depth: evidence and qualifications, the full pattern set, strategies and held candidates, the worked Reference House, proportionality and governance, physical proof, computation, the Reference House ordeal and the implementation questions that remain open. Its final part is reserved for the resolved house once architectural and technical synthesis has genuinely earned that conclusion.

Detailed development history, superseded options, pre-test build scripts and compiler gate records are retained separately for audit and recovery. They are not part of the resolved architectural argument merely because they were useful while producing it.

The two editions therefore serve different purposes. The Primer explains what Ovid’s House is and how its parts fit together. The Working Edition shows the reasoning, evidence and architectural consequences in full.

[Read the Working Edition](https://adamnoden.github.io/architecture/ovids-house.pdf)
