---
next:
  text: Preface
  link: /docs/manuscript/preface
---

# How to read this project

House Systems Architecture is a layered research programme rather than a single linear document. Different parts of the site carry different kinds of authority: doctrine states durable propositions, patterns turn them into reusable architectural responses, architectural grammar defines a selected design language, the Reference House forces those layers into one building, research tests the claims behind them, and delivery material translates mature findings into project requirements.

For a first reading, follow the publication hierarchy rather than the repository folders:

**Overview → Preface → Part I — The Proposition → Part II — Architecture of the Platform → Part III — Pattern Language → Part IV — Reference House → Part V — Making and Testing the Platform**

Developed inserts such as **Design for Repose** and **Maintenance Geography — The Exterior** sit inside that hierarchy. They are not additional Parts.

## Three routes through the work

### Read the argument

Use this route for the architectural position before its supporting machinery.

1. [Project overview](../README.md)
2. [Preface](manuscript/preface.md)
3. [Part I — The Proposition](manuscript/part-i.md), including the [eleven governing principles](manuscript/governing-principles.md) and the developed [Principle 8 — Design for Repose](manuscript/principle-08-repose.md)
4. [Part II — Architecture of the Platform](manuscript/part-ii.md), including [Maintenance Geography — The Exterior](manuscript/maintenance-geography-external.md)
5. [Part III — Pattern Language](patterns/README.md)
6. [Part IV — Reference House](reference-house/README.md)
7. [Part V — Making and Testing the Platform](manuscript/part-v.md)

The [Publication Architecture](manuscript/publication-architecture.md) records the intended book structure in detail.

### Explore the architecture

Start with the [pattern language](patterns/README.md), the [architectural grammar](grammar/README.md) and then the [Reference House](reference-house/README.md).

Patterns describe reusable responses to recurring architectural problems. Architectural grammar describes the selected design language independently of HSA doctrine. The Reference House combines selected patterns and G-01 with a specific programme, site, structure, envelope, services, environmental strategy and project morphology. It is evidence about integration in one project, not proof that its choices are universally correct.

### Audit the work

Use this route to inspect the evidence, uncertainties and implementation machinery behind the argument.

The [research](research/README.md) area contains evidence synthesis, precedent and options work. [Prototypes](prototypes/README.md) record physical test artefacts and results. The [computational track](computational/README.md) formalises the limited set of relationships that benefit from deterministic checking. [Delivery](delivery/README.md) translates mature propositions into requirements for a real design team. [Development](development/README.md) preserves live programme controls together with completed migration and integration records.

## What the document types mean

A **principle** is a durable architectural proposition intended to survive changes in implementation.

A **strategy** is a general way of satisfying one or more principles where materially different physical responses remain possible.

A **pattern** is a reusable response to a recurring architectural problem. It can remain provisional, and a pattern can fail without invalidating the principle it was intended to serve.

An **architectural grammar** defines a selected architectural language: topology, hierarchy, ordering, proportions, element families and related rules. A grammar can be strongly opinionated without becoming HSA doctrine.

The **Reference House** is one coordinated interpretation. It exposes conflicts by forcing doctrine, patterns, grammar and technical decisions into actual plan, section, structure, envelope, services and maintenance geometry.

**Research** supports, qualifies or rejects claims. Detail or evidence alone does not promote a research finding into doctrine.

A **prototype** tests a proposition physically or procedurally. Negative results are useful evidence.

**Delivery** material records what an appointed architect, engineer, specialist or contractor would need to know, decide, verify or hand over.

The **computational track** is subordinate to the architecture. It formalises relationships only where explicit machine checking adds value; it is not the governing model of the project and does not own the architectural grammar.

## Using the website

The top navigation moves between the project's major areas. Within each area, the left-hand **Contents** drawer shows a local reading structure rather than the entire repository. Current and canonical material is shown first; older plans, superseded versions and migration records remain available under local history/provenance groups.

The right-hand **On this page** outline shows the structure of the current document. The repository remains the source of truth; the website is a curated reading interface over the same Markdown and figures.

For current maturity, risks and next gates, use [Project status](../STATUS.md). For the rules governing document placement and navigation, use the [Documentation structure](README.md).