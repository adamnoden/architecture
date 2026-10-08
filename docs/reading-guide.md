---
next:
  text: Preface
  link: /docs/manuscript/preface
---

# How to read this project

House Systems Architecture is a layered research programme rather than a single linear document. Different parts of the site carry different kinds of authority: doctrine states durable propositions, patterns turn them into reusable architectural responses, the Reference House forces those responses into one building, research tests the claims behind them, and delivery material translates mature findings into project requirements.

For a first reading, follow the architectural argument:

**Overview → Preface → Governing principles → The Proposition → Architecture of the Platform → Repose → External maintenance geography → Making and Testing the Platform**

The rest of the site branches from that argument.

## Three routes through the work

### Read the argument

Use this route for the architectural position before its supporting machinery.

1. [Project overview](../README.md)
2. [Preface](manuscript/preface.md)
3. [Governing principles](manuscript/governing-principles.md)
4. [Part I — The Proposition](manuscript/part-i.md)
5. [Part II — Architecture of the Platform](manuscript/part-ii.md)
6. [Repose](manuscript/principle-08-repose.md)
7. [External maintenance geography](manuscript/maintenance-geography-external.md)
8. [Part V — Making and Testing the Platform](manuscript/part-v.md)

### Explore the architecture

Start with the [pattern language](patterns/README.md), then move to the [Reference House](reference-house/README.md).

Patterns describe reusable responses to recurring architectural problems. The Reference House selects among them and coordinates them with a specific grammar, programme, structure, envelope, services and environmental strategy. It is evidence about integration in one project, not proof that its choices are universally correct.

### Audit the work

Use this route to inspect the evidence, uncertainties and implementation machinery behind the argument.

The [research](research/README.md) area contains evidence synthesis, precedent and options work. [Prototypes](prototypes/README.md) record physical test artefacts and results. [Delivery](delivery/README.md) translates mature propositions into requirements for a real design team. [Development](development/README.md) preserves programme controls, migrations and integration records. The [computational track](computational/README.md) formalises the limited set of relationships that benefit from deterministic checking.

## What the document types mean

A **principle** is a durable architectural proposition intended to survive changes in implementation.

A **strategy** is a general way of satisfying one or more principles where materially different physical responses remain possible.

A **pattern** is a reusable response to a recurring architectural problem. It can remain provisional, and a pattern can fail without invalidating the principle it was intended to serve.

The **Reference House** is one coordinated interpretation. It exposes conflicts by forcing decisions into actual plan, section, structure, envelope, services and maintenance geometry.

**Research** supports, qualifies or rejects claims. Detail or evidence alone does not promote a research finding into doctrine.

A **prototype** tests a proposition physically or procedurally. Negative results are useful evidence.

**Delivery** material records what an appointed architect, engineer, specialist or contractor would need to know, decide, verify or hand over.

The **computational track** is subordinate to the architecture. It formalises relationships only where explicit machine checking adds value; it is not the governing model of the project.

## Using the website

The left-hand navigation exposes the full published corpus. The right-hand **On this page** outline shows the structure of the current document. Previous/next links follow the global navigation except where a deliberate reading route overrides them.

The repository remains the source of truth; the website is a reading interface over the same Markdown and figures.

For current maturity, risks and next gates, use [Project status](../STATUS.md).
