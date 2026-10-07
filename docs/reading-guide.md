# How to read this project

House Systems Architecture is not one document. It is a layered research programme in which different documents do different jobs. The website is organised to make those layers visible without turning the repository into a single linear book.

If you are new to the project, start with the architectural argument. The **preface** explains why the work exists; the **governing principles** state the durable doctrine; the manuscript develops the proposition, the architecture of the platform and the way the system is made and tested.

A useful first reading sequence is:

**Overview → Preface → Governing principles → The Proposition → Architecture of the Platform → Repose → External maintenance geography → Making and Testing the Platform**

From there, the project branches rather than simply continuing.

## Three ways through the work

### Read the argument

Use this route if you want the architectural position before the machinery behind it.

1. [Project overview](../README.md)
2. [Preface](manuscript/preface.md)
3. [Governing principles](manuscript/governing-principles.md)
4. [Part I — The Proposition](manuscript/part-i.md)
5. [Part II — Architecture of the Platform](manuscript/part-ii.md)
6. [Repose](manuscript/principle-08-repose.md)
7. [External maintenance geography](manuscript/maintenance-geography-external.md)
8. [Part V — Making and Testing the Platform](manuscript/part-v.md)

This is the closest thing the project has to a canonical reading order.

### Explore the architecture

Use this route if you want to see how the doctrine turns into design decisions.

Start with the [pattern catalogue](patterns/README.md), then move to the [reference house](reference-house/README.md). Patterns describe reusable responses; the reference house forces many of them to coexist in one architectural and technical proposition. The reference house is therefore a test vehicle, not evidence that the doctrine is universally correct.

### Audit the work

Use this route if you want to inspect the evidence, uncertainties and implementation machinery behind the argument.

The [research](research/README.md) area contains evidence synthesis, precedent and options work. [Delivery](delivery/README.md) translates mature propositions into requirements for a real design team. [Prototypes](prototypes/README.md) contain concrete test artefacts. [Development](development/README.md) records internal integration and migration work. The [computational track](computational/README.md) asks which relationships can be represented explicitly enough to check or compile.

## What the document types mean

A **principle** is intended to survive changes in implementation. It is the strongest public doctrinal layer.

A **pattern** is a reusable response to a recurring architectural problem. It can remain provisional, and a pattern can fail without invalidating the principle it was trying to serve.

The **reference house** is one coordinated interpretation. Its purpose is to expose conflicts between systems and force choices into plan, section, structure, envelope and maintenance geography.

**Research** supports, qualifies or kills claims. A research document is not promoted into doctrine merely because it is detailed or well evidenced.

A **prototype** tests a proposition physically or procedurally. Negative results are useful results.

The **delivery** material asks what an appointed architect, engineer, specialist or contractor would actually need to know, decide, verify or hand over.

The **computational track** is subordinate to the architecture. It formalises only the subset of relationships that benefit from becoming explicit and testable; it is not the project’s governing model.

## Using the website

The left-hand navigation is the map of the whole published corpus. It is intentionally the same on every page. Major branches are collapsible, but every page published by the site appears somewhere in that tree.

The right-hand **On this page** outline describes the structure of the document you are currently reading. Previous/next links at the bottom follow the order of the global tree, so the main manuscript can also be read sequentially.

The repository remains the source of truth. The website is only a curated reading interface over the same Markdown and figures.

For current maturity, risks and next gates, use [Project status](../STATUS.md).