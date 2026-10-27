# RSI — Reference Site Integration

Programme: #891

RSI asks a stronger question of the Reference House:

> How powerful, durable and generous can Ovid's House remain on an unexceptional piece of detached-house land?

The programme keeps three objects distinct:

- **Reference House** — intrinsic building architecture;
- **Reference Site** — canonical synthetic parcel/context;
- **Reference Deployment** — deterministic composition of house + site.

The working direction is a long, relatively narrow ordinary detached-house plot rather than the generous/wide synthetic setting used by earlier DPL work. No new canonical rectangle is frozen by this directory until RSI-02 earns it.

## Current execution boundary

- RSI-00 / #894 — freeze the before-state.
- RSI-01 / #895 — ordinary detached-plot morphology benchmark.
- RSI-02 — author and compare bounded synthetic candidate envelopes from the benchmark.
- RSI-03 — unchanged-house collision test.

PLT #892 has closed via PR #893, so its specific architectural defect packet no longer blocks RSI-03. The resulting B4 plan is nevertheless **provisional coordination**, not a frozen replacement for RH-C1/M3. RSI may use B4 as the best current collision-test input while preserving the controlled historical house identity.

Full PLT completion is not a prerequisite for RSI. DPL #299 and ADE #812 are complete upstream inputs. Final TYP-09 release is not a blocker.

## Owner gates

The successor path has two explicit owner gates recorded on #891:

1. rough-plan concept selection from a small family of materially different ground/first-floor schemes;
2. explicit approval of the resolved final floor plan before any M4/successor freeze.

No compiler, whole-system or PLT migration may promote a successor house before the second gate.

## Records

- `rsi-00-before-state.md` — exact architectural/site/drawing baseline.
- `rsi-01-detached-plot-morphology.md` — bounded morphology evidence and synthesis.
- `data/detached-plot-morphology.json` — machine-readable evidence record.
