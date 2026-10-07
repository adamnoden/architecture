# Pattern-Language Phase 6 — Targeted Evidence Review

**Status:** focused evidence note supporting the Phase-6 corpus audit  
**Scope:** only propositions whose classification remained genuinely ambiguous after the first whole-corpus pass

This note is deliberately narrow. It does not attempt to re-research the whole doctrine. Its purpose is to prevent taxonomy decisions from being made solely because an old publication outline happened to contain a plausible name.

---

## 1. Visible leakage / water-failure patterns

### Evidence

Norwegian TEK17 §15-5 requires indoor water installations to be designed for future maintenance/easy replacement and states that leaks must be easy to detect and must not damage other installations or building elements.

Current guidance explicitly recognises several different implementation routes, including pipes in shafts/boxing where leakage is made visible/stopped and pipe-in-pipe systems with watertight manifold cabinets draining to a wet-room floor.

TEK17 §13-15 on wet rooms goes further: leakage water is to be made visible and led to a drain; concealed cistern arrangements must expose/drain leakage so it becomes rapidly visible.

Sources:

- Norwegian Directorate for Building Quality, TEK17 §15-5: <https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/15/ii/15-5/>
- English translation of TEK17 technical regulations: <https://www.dibk.no/globalassets/byggeregler/regulation-on-technical-requirements-for-construction-works--technical-regulations.pdf>
- TEK17 §13-15: <https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15>

### Classification consequence

This evidence strengthens two decisions simultaneously:

1. **`Water-Damage-Safe Service Route` is too broad as one pattern.** The guidance supports a performance strategy while explicitly allowing materially different physical responses.
2. **`Visible Leakage Path` is a strong standalone pattern candidate.** It has a specific physical invariant: credible leakage from concealed/contained risk is deliberately brought to a place where it becomes visible and can be safely managed.

The electronic leak sensor is not the pattern. It may be an implementation layer.

---

## 2. Manifold distribution

### Evidence

The Greater London Authority / Be First small-sites patternbook describes serviced bathroom walls and says manifold and microbore distribution from the utility cupboard should be considered to minimise heat losses.

CIBSE's 2026 Domestic Heating Design Guide includes manifold distribution among advanced system layouts.

Sources:

- GLA / Be First, *Small Sites Patternbook — Assemblies*: <https://www.london.gov.uk/sites/default/files/2025-10/Small%20Sites%20Patternbook_Be%20First%20Design.pdf>
- CIBSE, *Domestic Heating Design Guide 2026*: <https://cibse.org/knowledge-research/knowledge-portal/cibse-domestic-heating-design-guide-2026/>

### Classification consequence

Manifold distribution is mature enough to remain a serious **pattern candidate**, but the evidence does not justify a doctrine-level presumption that every domestic water/heating system should use home-run manifolds.

Working candidate name:

**`Individually Isolatable Manifold Distribution`**

The invariant is network topology + granular isolation, not a particular proprietary manifold product.

Keep outside the canonical set until Phase 7 decides whether the architectural language benefits from this component/network scale.

---

## 3. Compartmented service void

### Evidence

Approved Document B identifies concealed cavities as ready routes for smoke/flame spread and requires cavity barriers to divide cavities and close cavity edges in relevant conditions. This is a fire-safety baseline, not evidence that HSA invented service-void compartmentation.

HSA's source doctrine adds a cross-domain architectural proposition: open service voids should stop at room/zone boundaries while individual services cross through designed interfaces, coordinating fire, acoustic, dust, odour and pest control.

Source:

- Approved Document B, Volume 1: <https://www.gov.uk/government/publications/fire-safety-approved-document-b>

### Classification consequence

**`Compartmented Service Void` remains a strong pattern candidate.**

Its contribution must be stated carefully: not “provide fire barriers”, but “do not let access/service geography silently create one continuous void across boundaries; stop the void and pass the services deliberately.”

That is an architectural composition rule with multi-boundary consequences, rather than a restatement of one fire clause.

---

## 4. Floor/service depth and floor access

### Evidence

London housing MMC guidance includes intermediate-floor assemblies with explicit service zones. This demonstrates that separating structural and service depth is ordinary enough to be credible in housing systems.

CIBSE case-study literature also demonstrates major service distribution in raised-access floor voids, but those examples are predominantly commercial and do not establish domestic desirability.

Sources:

- GLA, housing/MMC guidance with intermediate-floor service-zone examples: <https://www.london.gov.uk/sites/default/files/2025-09/Housing%20site%20identification%20and%20guidance%20on%20the%20use%20of%20Modern%20Methods%20of%20Construction%20for%20housing%20delivery.pdf>
- CIBSE Journal, floor-void coordination precedent: <https://www.cibsejournal.com/case-studies/arriving-on-platform-g-googles-new-kings-cross-office/>

### Classification consequence

The evidence supports **service zones as an implementation technique**, but does not establish either of these as canonical domestic patterns:

- `Local Deep Service Zone`;
- `Selective Floor Access`.

Keep both as **held candidates / design tactics** through Phase 7. The Reference House and physical floor prototype should decide whether one becomes repeatable enough to admit.

Do not generalise commercial raised-access-floor logic into the house merely because it is technically mature elsewhere.

---

## 5. Perimeter dry / inspection zone

### Evidence

Historic England notes that softer landscaping or gravel can absorb water and reduce splashback at wall bases and that perimeter drainage can sometimes help. But it also explicitly warns that gravel-encased French drains near building foundations may concentrate water at the base of walls.

Source:

- Historic England, *Buildings Without Rainwater Goods*: <https://historicengland.org.uk/advice/technical-advice/retrofit-and-energy-efficiency-in-historic-buildings/resilient-rainwater-systems/buildings-without-rainwater-goods/>

### Classification consequence

The current placeholder **`Perimeter Dry Zone` should not be promoted as a pattern**.

It bundles several context-sensitive ideas:

- splashback reduction;
- wall-base inspection;
- drainage;
- drying;
- maintenance access/support territory.

Those can conflict. A gravel margin is not intrinsically a drainage solution, and drainage geometry can make moisture conditions worse.

Phase-6 recommendation:

**DEMOTE the catalogue slot to a project/site strategy question.**

Ground-supported façade access already owns the maintenance-geography part. Rainwater/drainage patterns own water routing. A separate wall-base pattern should be admitted later only if a sharper invariant emerges from envelope research.

---

## 6. Accessible room service routes

### Internal evidence / source logic

The frozen doctrine independently developed:

- removable skirting as low-level horizontal electrical/data infrastructure;
- door architraves / adjacent removable joinery as vertical electrical routes;
- a broader requirement to avoid permanent-wall chasing.

Those are two geometries serving the same recurring room-scale relationship: **local service distribution should occupy removable architectural layers rather than permanent fabric**.

### Classification consequence

Merge the old publication slots `service skirting` and `vertical joinery route` upward into a single pattern candidate:

**`Accessible Room Service Route`**

Implementation variants include:

- serviceable skirting;
- door-surround / architrave route;
- removable wall-side joinery;
- other shallow dry routes that preserve room architecture and required service segregation.

Do not turn every piece of architectural joinery into a service route. The pattern should invoke only where local distribution actually warrants it.

---

# Evidence-review conclusion

The targeted review resolves the main Phase-6 ambiguities as follows:

| Proposition | Phase-6 evidence decision |
|---|---|
| Visible Leakage Path | **strong pattern candidate; admit to Phase-7 migration set** |
| Individually Isolatable Manifold Distribution | **credible pattern candidate; hold outside canonical set pending scope decision** |
| Compartmented Service Void | **strong pattern candidate; admit to Phase-7 migration set** |
| Local Deep Service Zone | **hold as design tactic/candidate** |
| Selective Floor Access | **hold; domestic value unproven** |
| Perimeter Dry / Inspection Zone | **do not admit; demote to context-specific site/envelope strategy** |
| Accessible Room Service Route | **strong merged pattern candidate; admit to Phase-7 migration set** |
| Replaceable Architectural Lining | **classification conceptually strong but promotion remains physically gated** |

The corpus audit can now close without pretending every unresolved construction experiment is a pattern.