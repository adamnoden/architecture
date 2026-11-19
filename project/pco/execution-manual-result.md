# Integrated execution manual

Owner-directed PCO-MANUAL, 29 October 2026. The owner identified agent coordination as delivery-enabling scaffolding and requested one comprehensive, logically located explanation for outside observers and future maintainers.

The audit found usable component documentation but no complete conceptual front door. The control README concentrated on commands; PCO/ACO founding programmes, the runbook, implementation modules and native workflow records supplied other parts. Dated founding examples could be mistaken for current schemas. Three-letter workstreams, canonical/shared packets, hard dependencies and the limits of native automation were not introduced as one coherent system.

Upgrade the existing `project/control/README.md` rather than create another competing manual. It now owns the integrated explanation: purpose and scaffolding, vocabulary, lifecycle/readiness/occupancy, authority/storage map, packet walkthrough, commands/transport pointers, native event wiring, failure/recovery boundaries, maintenance/retirement guidance and current contracts versus retained history. Root README and documentation-ownership entry points link to it. Founding PCO/ACO programmes identify their role and direct readers to the current manual. Exact mailbox/report procedures remain owned by the runbook and executable schemas remain authoritative; no operational protocol or architectural claim is changed.

Cohesion is documented without collapsing authorities: the graph, leases, evidence, maturity and publication remain distinct. The manual is a complete reading map, not a second copy of every wire schema or a generated source for architectural truth. Its operating loop diagram is explicitly distinct from the acyclic task graph.

Validate repository links/README commands and project control; review the conceptual Mermaid graph against the control sources. Require the standard exact-head CI before merge, then verify projection reconciliation, lease release and branch cleanup. Documentation-only edits do not earn additional architectural maturity or require mirrored implementation tests.
