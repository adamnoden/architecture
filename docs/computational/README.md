# Computational Track

**Status:** research programme — concept and formalisation only  
**Implementation status:** deliberately deferred

This directory records the computational expression of the Long-Life House.

The architectural doctrine remains primary. The purpose of this track is to discover which parts of that doctrine, together with structure, construction, regulation and evidence, can be represented strongly enough that a house can eventually be **compiled rather than merely drawn and checked afterwards**.

> **The program should compile a habitat.**

## Canonical documents

1. [Executable Architecture](executable-architecture.md)  
   The canonical concept paper: what the proposition is, why a compiler is different from a checker, the intended product form, the proof boundary and the relationship to the architectural doctrine.

2. [Research Programme](research-programme.md)  
   The master programme and grand TODO register. This is the document to consult before starting any new computational work.

3. [Formal Architectural Model](formal-architectural-model.md)  
   First conceptual model of the building as overlapping semantic graphs rather than a collection of geometry.

4. [Validity and Obligations](validity-and-obligations.md)  
   Defines what kinds of validity exist, what a compile failure means, how obligations are discharged and what a successful compile may legitimately claim.

5. [Compiler Targets](compiler-targets.md)  
   Defines the versioned regulatory/normative environment against which compilation occurs, beginning conceptually with England.

6. [Prior Art Map](prior-art-map.md)  
   Initial map of relevant work in IFC/openBIM, machine-readable information requirements, automated compliance checking, ontologies, shape grammars and automated planning.

## Working dependency order

~~~text
ARCHITECTURAL DOCTRINE
        │
        ▼
FORMAL ARCHITECTURAL MODEL
        │
        ├──────────────► ARCHITECTURAL GRAMMAR
        │
        ▼
VALIDITY + OBLIGATION MODEL
        │
        ├──────────────► EVIDENCE / PROVENANCE MODEL
        │
        ▼
COMPILER TARGET MODEL
        │
        ▼
SUPPORTED-DOMAIN DEFINITION
        │
        ▼
PAPER COMPILATION OF REFERENCE HOUSE
        │
        ▼
FORMAL GRAMMAR / LANGUAGE DESIGN
        │
        ▼
IMPLEMENTATION
~~~

The arrows are dependencies, not a schedule.

## Current rule

**Do not start implementation because an implementation idea is exciting.**

Before code, the project should be able to answer:

- what things exist in the model;
- what relationships between them matter;
- what is impossible to express;
- what is expressible but invalid;
- what is merely undesirable;
- what obligations a design creates;
- what counts as evidence that an obligation has been discharged;
- what the compiler target means;
- what lies outside the supported domain;
- exactly what a successful compile claims;
- how the claim survives versioning and later alteration.

Until those questions are substantially answered, software would mostly fossilise premature assumptions.
