# Information issue profiles

These project profiles define what a package may be **used for**, what it must
contain and who must accept it. They implement the [owner-house delivery plan](https://github.com/adamnoden/architecture/blob/main/project/del/owner-house-delivery-plan.md)
for the eventual house. They do not select a site, appoint a team, adopt a design,
authorise expenditure or confer permission to construct or occupy.

The same drawing can be useful for review and unfit for construction. A complete
index proves neither that its design works nor that the named reviewer has
accepted it. The profiles below are a delivery contract; [ADE](https://github.com/adamnoden/architecture/blob/main/project/ade/construction-information-programme.md)
implements only the bounded checks needed by the selected bay. This document
creates no new issue engine or alternative house model.

## Common issue record

Each package has one issue record and a document/evidence index. Use existing
controlled identities and external references rather than copying design facts.
A repository commit is a source identity; a document revision is its authored
revision; an issue revision identifies the frozen collection. Record all three
where applicable. A later commit does not silently revise an issued collection.

| Required field | Meaning and minimum content |
|---|---|
| Package identity and revision | Stable package ID, issue revision/date, profile below, issuer, intended recipients, purpose and explicit permitted use |
| Scope | Project/study identity; named rooms, bay, systems and interfaces; geographical/site applicability; exclusions and what the package cannot decide |
| Design basis | Exact controlling source revision/commit or controlled external revision, selected option versus candidate, units/datums and applicable project/target references |
| Document index | Stable document ID, title, discipline/owner, authored revision, issue purpose, location, format, scale where relevant and source relationship; include external documents by controlled reference |
| Evidence index | Evidence ID, issuer/author, method/product/document version, exact controlling inputs, result, limitations and applicability to this issue; missing evidence is an explicit record, not a broken or invented link |
| Decision and responsibility register | Required decisions, responsible role/person or explicitly unappointed role, acceptance criteria, current disposition and latest useful decision point; delegated design has a defined scope and interface owner |
| Unknowns and exclusions | Every material unknown names its effect, owner, evidence needed and issue restriction/hold point; reasoned not-applicable entries identify who made that determination |
| Review and authorisation | Prepared/checked/reviewed/accepted/issued are separate dated actions with attributable person/role, scope and evidence. Blank/unappointed is not approval. An agent's repository publication is not a professional sign-off |
| Change and distribution record | Superseded issue, changed source/objects, affected evidence/reviews, recipients and withdrawal/reissue action; actual external distribution requires its own authorisation |

Private household, site, financial and contractual evidence stays in its
appropriate controlled location. The index may carry a restricted reference and
named custodian; a public repository need not contain the sensitive material.
An inaccessible reference for a required recipient must be resolved before that
recipient can accept the package. Privacy is not a reason to pretend evidence is
absent or already reviewed.

## Six purpose profiles

These IDs are local project vocabulary, not claims of compliance with an external
information-management standard. The common record applies to every row. Roles
below are required responsibilities to allocate for the real commission, not
assertions that anyone has been appointed. A narrower package may be issued when
its boundary and interfaces are explicit; a whole-house title must not hide a
single-bay result.

| Profile / audience | Required documents and registers | Evidence and acceptance needed | Tolerable unknowns / stop condition | Responsible issuing authority |
|---|---|---|---|---|
| **IP-01 Concept review** — owner and design team | Brief/source references, alternatives, intelligible plans/sections/elevations, room/use and architectural rationale, broad resource/maintenance consequences, open-decision register | Traceable distinction between confirmed brief, inherited study, authored proposal and evidenced result; design author checks that views describe the same option. Owner preference decisions are separately recorded | Site, cost, product and specialist details may remain open when the proposal does not rely on them as facts. A contradiction that prevents understanding the option must be repaired or explicitly presented as the question | Authorised design author/coordinator for a named study; owner accepts preferences, not implied technical performance |
| **IP-02 Planning preparation** — owner, appointed planning/design advisers and relevant specialist contributors | Site/context and constraint evidence register; location/site/design drawings appropriate to the proposed enquiry; access, landscape, heritage/environmental or other topic inputs as applicable; proposed submission index and validation questions | Actual site and applicable planning process must be established before calling a package submission-ready. Competent project lead checks proposal consistency and required supporting evidence against the actual receiving body's current requirements | Early preparation may include a labelled missing survey or unknown constraint. Missing site identity or a material required assessment prevents a submission-ready claim. This profile itself is not an application or planning decision | Appointed/authorised planning or design lead; actual submission and any statutory decision remain separate attributable actions |
| **IP-03 Coordinated technical review** — architectural, structural, services and relevant specialist reviewers | Located plans/sections/details, assembly/opening/service schedules, selected and candidate status, interfaces and tolerance assumptions, calculations/product evidence or explicit gaps, occupation/maintenance sequences, targeted reviewer questions | Shared input/revision basis, cross-view consistency, known conflicts exposed, evidence applicability and the exact questions reviewers can answer. Record actual responses and dispositions when obtained; preparing the issue is not obtaining review | A missing calculation, test, product datum or unresolved interface may be admitted as the subject of review. It cannot support an affirmative performance claim or instruction to build. An unspecified scope or hidden conflicting source invalidates the review issue | Authorised coordinating design lead for that review scope; competent discipline reviewers accept only their actual reviewed responsibilities |
| **IP-04 Tender / pricing** — authorised cost adviser, tenderers and design/procurement team | Defined pricing scope, coordinated drawings/specification/schedules, quantity basis and exclusions, procurement/design-responsibility allocation, alternatives, risk/assumption schedule, return requirements and relevant programme constraints | Information must support comparable offers for the named scope. Quantity units/inclusions, performance requirements and exclusions agree across documents. Authorised procurement/design lead accepts the basis and actual distribution; prices are actual responses, not generated evidence | Explicit allowances, provisional items or separately priced options are permissible only when their scope and pricing instruction are clear. An unresolved essential design cannot masquerade as a fixed-price, fully designed item. No authority to order or construct follows from a price | Appointed procurement/commercial lead with coordinating and discipline designers responsible for their information; owner authorises the actual procurement commitment |
| **IP-05 Construction issue** — appointed contractor/fabricator, site team and responsible designers | Scope-specific coordinated construction drawings/details; selected specifications and schedules; setting-out/datums, tolerances, support/fixing, services/boundaries; installation and inspection/hold-point requirements; applicable calculations, accepted shop drawings and substitutions; controlled change/release register | Actual commission/site basis and allocated design responsibilities; current applicable technical evidence and required approvals; competent design review and explicit authorised issue for the defined work. Interfaces with excluded/deferred work must be resolved sufficiently to execute this scope safely and correctly | No unresolved essential dimension, support, boundary, product compatibility, statutory prerequisite or evidence dependency may be converted into a construction instruction. Formally allocated specialist design may have a defined hold point before manufacture/work; the issue must not release that held work. A complete index alone is insufficient | The actually appointed and authorised issuing designer/coordinator within their scope, with discipline acceptance and project release authority recorded. Software and repository maintainers cannot supply these appointments or approvals |
| **IP-06 As-built / maintenance handover** — owner/operator, maintainers, appointed team and later designers | Verified installed configuration and deviations; final drawings/schedules and component IDs; actual commissioning/inspection/test records; operating/isolation/failure and maintenance instructions; replacement routes, warranties where applicable, access/control information and outstanding-work register | Installed evidence reconciles design intent with what was built; functional records belong to the actual systems; owner/operator receives usable instructions and any required demonstration/training. Handover acceptance and any separate completion/occupation decision are attributable | A noncritical outstanding item may remain with accepted responsibility, consequence and closure plan. Missing essential safety/operation/commissioning evidence prevents an unqualified handover claim. A design-stage manual or product leaflet alone is not an as-built record | Appointed delivery/commissioning lead and responsible designers/contractor supply verified records; owner/operator acknowledges receipt/use obligations. Receipt does not certify the building or authorise occupation |

A profile is not a linear maturity score. A rejected option can be a complete
IP-01 record; a technically mature component can still lack IP-04 pricing scope.
Changing the issue label cannot change its evidence. Mixed-purpose collections
must label each item's permitted use and state which scope, if any, is released;
otherwise use the most restrictive applicable claim for the collection.

## Machine completeness and human acceptance

ADE may check required fields, resolvable permitted references, stable IDs,
revision consistency, units, duplicate/missing schedule objects, source/evidence
relationships and declared disposition vocabulary. A bounded checker may reject
an essential unresolved record for IP-05 when the applicable rule is explicit.
It must expose unsupported checks rather than silently accepting them. Do not
build a universal approval system merely to implement this document.

A machine cannot establish that a role is competent or appointed, that a review
actually occurred, that a concealed junction was built as drawn, or that a
calculation's supported domain covers a real condition simply because a field
says so. Human acceptance records need actual attributable evidence. Where
external evidence is authoritative, reference its controlled revision and
applicability instead of reimplementing its engineering in the compiler.

Keep these independent dispositions visible:

1. **Record completeness:** complete, incomplete or unsupported for the bounded
   checks applied, with the check implementation/version and result.
2. **Design/evidence disposition:** supported, conditional, unresolved, rejected
   or not applicable, at the actual claim scope.
3. **Review/issue authority:** not sought, pending, accepted within named scope,
   or rejected, with attributable evidence and date when present.
4. **Permitted use:** the named profile and specific restrictions/hold points.

These are proposed record meanings for the bay contract, not a newly implemented
schema. Acceptance of one disposition never fills the others automatically.

[Compiler targets](../computational/compiler-targets.md) remain the versioned
normative environment. Supported-domain profiles say what a method can prove;
project configuration supplies actual site/brief facts. This issue profile is a
process/use contract. It neither chooses a legal target nor treats the identity
of a reviewer as the target. The actual commission must determine its applicable
submission and approval requirements; no universal legal checklist is asserted.

## Worked example: the same wet-suite evidence, two different issue decisions

**Example package `EX-WET-REVIEW-01`, revision A, frozen reference study at
`04212ccdddab5a56b0599061cc6724444e409a08`.** This is a worked
project contract example, not a package sent to a practitioner. Its question is:
*Can the proposed larger Bedroom 4 suite's actual tray/waste, branch and stack
be resolved without hiding floor/support or maintenance conflicts?*

| Example index item | Exact source at this revision | Status and use |
|---|---|---|
| Proposed room and service cabinet | [HAD allocation](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/project/had/had-03-bedroom4-allocation.md) and its [A3 plan](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/project/had/studies/bedroom4-allocation-study.svg) | Unadopted proposal; room/access geometry and maintenance costs, not an installed-system pass |
| Located wet section and alternatives | [IAS section](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/project/ias/ias-03-bedroom4-wet-section.md) and [A3 section](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/project/ias/studies/bedroom4-wet-section.svg) | Corrected manufacturer datum reading; matched support/flange/branch details remain conditional |
| Independent physical challenge | [BCR wet result](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/project/bcr/bcr-wet-result.md) and [A3 investigation](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/project/bcr/studies/wet-feasibility.svg) | Separates cabinet entry from actual stack connection and gross space from fittings/support |
| Current-house identity and adoption ceiling | [Current house basis](https://github.com/adamnoden/architecture/blob/04212ccdddab5a56b0599061cc6724444e409a08/docs/reference-house/current-house-basis.md) | Existing selected source still controls; the proposal is not silently substituted |

All four document groups are indexed at full revision
**`04212ccdddab5a56b0599061cc6724444e409a08`**, with their existing product-source versions and
limitations retained. Resolve each indexed repository path at that immutable commit;
the example links resolve that revision, not a later version of the file. The following essential unknowns are explicit: actual
tray/waste flange seating and matching support kit; real socket/clip and WC
outlet/branch geometry; stack/vent/outfall; supported floor opening and complete
wet boundary. Responsible design owners are IAS, HAD/OAS and the relevant
BCR/structural/services disciplines; actual commission appointments remain open.

For **IP-03**, the collection is **valid as bounded review information**, rather
than an accepted technical solution:
its option is located, the evidence and adverse sensitivities are visible, and
the requested response concerns those specific missing interfaces. Record
completeness for the example index is satisfied; no recipient review has occurred
and no positive physical acceptance is recorded. The actual issue still needs
an authorised issuer, recipients and attributable distribution. It is not a
claim that the full house or every IP-03 technical topic has been coordinated.

For **IP-05**, the **same information is invalid for construction release**.
The essential installation/support/boundary questions are unresolved, the
proposal is unadopted, and an actual site/appointed issuing authority is absent.
Adding every document to an index, changing the cover to “construction” or
passing all source-consistency checks changes none of those facts. A contractor
note saying “verify on site” is not a disposition of these missing design inputs.

A later construction issue would need the resolved/adopted assembly and connected
system, applicable supporting evidence, coordinated geometry and maintenance
sequence, actual commission/site basis and accountable issue/review authority.
It would receive a new issue revision. The historical review example remains
unchanged; it must not acquire an implied approval through later links to main.
