# Editorial Doctrine

**Status:** v0.3 — current editorial standard  
**Scope:** public-facing manuscript prose, governing principles, pattern prose, reference-house writing and related explanatory material  
**Purpose:** make House Systems Architecture's editorial judgement reproducible without changing its architectural substance

---

## 1. What this document is for

This is not a mood board for prose and not a list of fashionable stylistic preferences. It is an operating standard for writing and rewriting House Systems Architecture.

A future editor — human or machine — should be able to read this document, take an existing section of the manuscript, identify what kind of prose it is, improve how it communicates, and preserve the original claim, evidence, uncertainty and architectural intent.

The publication should be intellectually ambitious without sounding impressed by its own intelligence. It should be technically serious without retreating into professional fog. It should sometimes be beautiful, but beauty should arise from precision, sequence, observation and rhythm rather than from a visible attempt to manufacture profundity.

The primary editorial failure to avoid is **over-shaped prose**: writing in which every paragraph is rhetorically finished, every distinction arrives as an antithesis, every important idea is converted into an aphorism, and the reader can hear the machinery producing significance.

The project should not sound as though it is continuously auditioning sentences for quotation.

---

## 2. Order of priorities

When editing prose, apply these priorities in this order:

1. **Preserve substance.** Do not change the proposition, evidence, degree of certainty, scope, exception, technical requirement or architectural consequence unless the task explicitly includes substantive editing.
2. **Increase precision.** Prefer the exact mechanism, object, action, boundary or failure mode to a broad abstraction.
3. **Improve explanatory sequence.** Put ideas in the order in which the reader can most naturally understand them, not necessarily the order in which they were discovered.
4. **Make the physical reality visible.** Buildings are made, occupied, opened, wetted, heated, moved through, repaired and altered. Return abstract arguments to those realities.
5. **Remove rhetorical machinery.** Cut sentences whose main function is to announce importance, manufacture contrast or make the preceding idea sound profound.
6. **Improve rhythm and economy.** Vary sentence length and paragraph shape according to the argument. Remove repetition that is not doing intellectual work.
7. **Pursue elegance last.** A beautiful sentence is welcome. A sentence distorted in order to become beautiful is not.

If elegance and precision conflict, precision wins.

---

## 3. The target voice

The target voice is that of a writer who has spent long enough with the problem to be calm about it.

It should feel:

- exact without being pedantic;
- confident without pretending uncertainty does not exist;
- curious without becoming whimsical;
- technically literate without using jargon as a membership badge;
- capable of strong judgement without turning the reader into an opponent;
- interested in buildings as physical and lived things, not merely as vehicles for theory;
- willing to explain basic mechanisms when they matter;
- comfortable moving between architecture and other domains where the transfer genuinely clarifies the mechanism;
- occasionally dry or wry, but never performatively clever;
- capable of beauty without adopting a permanently elevated register.

The reader should feel that the author is trying to show them something, not trying to sound like someone who has seen something.

---

## 4. What the admired writers contribute

These writers are influences, not templates. The objective is to borrow useful intellectual and editorial moves, not surface mannerisms.

### Stewart Brand — physical consequence over abstraction

Borrow:

- treating buildings as things that continue to exist after completion;
- explaining ideas through what changes, breaks, gets repaired, becomes obsolete or is adapted;
- moving easily between systems thinking and ordinary physical examples;
- allowing wit to emerge from the observed reality rather than inserting it as decoration.

Do not imitate Brand's period-specific informality or turn every argument into a slogan.

**Editorial test:** after an abstract passage, can the reader picture something actually happening to a building?

### Christopher Alexander — principle as usable thought

Borrow:

- confidence in stating a proposition plainly;
- movement from recurring human or physical problem to a general principle;
- willingness to connect technical arrangement with lived experience;
- propositions that can guide design rather than merely describe it.

Do not imitate the more mystical parts of Alexander's register or treat intuition as evidence where evidence is available.

**Editorial test:** does the proposition help someone see or decide something, or is it merely an attractive statement?

### Ada Louise Huxtable — economy and resistance to professional fog

Borrow:

- strong judgement expressed in ordinary English;
- economy of means;
- intolerance of large words carrying small ideas;
- preference for the building, effect or consequence over theoretical display;
- the confidence to call unnecessary complexity unnecessary.

Huxtable is especially useful as a check against architectural prose that mistakes obscurity for sophistication.

**Editorial test:** could this be said more clearly without losing technical meaning?

### James C. Scott — concrete cases that make the abstraction unavoidable

Borrow:

- building an argument through concrete instances across apparently different domains;
- showing the same mechanism recurring before naming the general model;
- distinguishing the view from above from the reality encountered locally;
- attention to what rational simplification deletes or makes invisible.

Do not import Scott's political programme as doctrine. The transferable editorial method is the important part.

**Editorial test:** where a large principle is asserted, could two or three concrete cases allow the reader to discover it before it is named?

### Venkatesh Rao — cross-domain analogy as an instrument of thought

Borrow:

- finding structural similarities between domains that initially appear unrelated;
- using an outside model to reveal a mechanism hidden by familiar vocabulary;
- moving from concrete phenomenon, to analogy, to mechanism, then back to the original subject with greater resolution;
- coining a term when it genuinely compresses a useful model.

Rao is particularly useful when inherited architectural language prevents a problem from being seen freshly.

Do not borrow digression for its own sake, high rates of neologism, or cleverness that becomes the subject of the passage.

**Editorial test:** if the analogy were removed, would the reader understand the mechanism less well? If not, remove it.

### Patrick McKenzie — technical systems made legible

Borrow:

- beginning from the reader's likely intuitive model;
- showing precisely where that model breaks down;
- replacing it with a more accurate model in manageable steps;
- introducing jargon only when it buys precision, and defining it in place;
- moving comfortably between the system-level model and a familiar transaction or object;
- allowing dry asides without losing the technical thread.

McKenzie is a particularly strong model for services, interfaces, failure paths, procurement, standards and computational material.

**Editorial test:** what does the intelligent non-specialist probably think is happening here, and what actually happens?

### Peter Zumthor — sensory specificity, used rarely

Borrow only where the subject is occupation, atmosphere, material, threshold, light, sound, touch or memory:

- begin with experienced particulars rather than abstract sensory claims;
- let architectural meaning arise from material and spatial observation;
- use the ordinary sensations of a building rather than generic words such as "immersive" or "evocative".

Do not let technical chapters drift into phenomenological perfume.

### Curtis Yarvin / Moldbug — interrogating the premise, not the voice

Borrow:

- willingness to ask whether the inherited framing of a problem is itself the problem;
- the ability to describe a familiar institution or practice from outside its usual vocabulary;
- reconstruction from first principles where conventions have become invisible.

Do not borrow the polemical persona, adversarial relationship with the reader, theatrical provocation, sprawling digression or ironic self-performance.

**Editorial test:** are we improving the inherited answer, or have we checked whether the inherited question is correctly framed?

---

## 5. The core explanatory moves

The manuscript should repeatedly use a small number of strong explanatory forms rather than one uniform essay voice.

### A. Observation → mechanism → principle

Use when the argument begins with something physically observable.

Example shape:

1. A plumber can see the valve through the hatch.
2. The valve cannot be withdrawn because the pipework and surrounding finish leave no working path.
3. Visual access is therefore not maintenance access.
4. Access requires approach, working space, disconnection and withdrawal.

The general proposition is earned by the physical sequence.

### B. Intuitive model → contradiction → better model

Use for technical explanation.

Example shape:

1. A wall is usually spoken of as a single building element.
2. In service it contains layers with very different lives: structure, services, lining, paint, fixings.
3. Treating them as one object couples their replacement cycles.
4. The useful model is therefore not "the wall" but an assembly of lifespan layers and interfaces.

This is the McKenzie move. Use it often.

### C. Case → case → case → abstraction

Use for major doctrine.

A chased cable route, a buried valve and a window frame destroyed during replacement may initially look like separate detailing problems. If the same underlying relationship is present in all three, show the cases before naming it.

This is preferable to opening with a grand abstraction and then searching for examples to decorate it.

### D. Foreign domain → shared mechanism → architectural return

Use for analogy.

The shipping container is useful because it demonstrates interoperability through a standard interface. It is not useful merely because a house can also be described as "modular".

The analogy must survive translation at the level of mechanism.

### E. Failure sequence

Where a doctrine concerns robustness, write the failure as a sequence:

**event → first contact → propagation path → detection → isolation → access → repair → reinstatement**

This is usually clearer than saying that an assembly should be "resilient", "robust" or "maintainable".

---

## 6. Prose modes

The publication should not have one voice everywhere. Choose the mode before editing.

### Mode 1 — Preface / authorial essay

**Purpose:** establish temperament, origin of enquiry, intellectual method and the reader's relationship with the project.

Allowed:

- first person;
- narrative;
- historical examples;
- analogy;
- occasional rhetorical questions;
- occasional aphoristic compression;
- more varied rhythm;
- some humour and personality.

Constraints:

- rhetorical peaks must be sparse;
- do not turn every subsection into a miniature keynote speech;
- an analogy must carry an argument, not merely atmosphere;
- strong sentences should be surrounded by ordinary competent prose, otherwise nothing remains strong;
- do not repeatedly explain why an example "matters" after the example has already shown it.

The preface may have the strongest authorial voice in the book. That privilege should not leak indiscriminately into the technical manuscript.

### Mode 2 — Governing doctrine

**Purpose:** state durable propositions and their architectural consequences.

Voice:

- compact;
- declarative;
- plain;
- technically bounded;
- confident about doctrine, explicit about uncertainty.

Prefer one strong proposition followed by the minimum explanation required to prevent misreading.

Avoid essayistic throat-clearing, extended analogy and decorative historical material.

### Mode 3 — Technical explanation

**Purpose:** make a mechanism understandable without flattening it.

Voice:

- patient;
- sequential;
- concrete;
- comfortable defining terms;
- explicit about actors, flows, loads, tolerances, boundaries and failure states.

This mode should often resemble McKenzie's explanatory structure: begin with what the reader thinks happens, then replace it with what actually happens.

A diagram may do more work than a paragraph. Do not retain prose merely because it has already been written.

### Mode 4 — Pattern catalogue

**Purpose:** make a recurring architectural response inspectable and usable.

Voice:

- compressed;
- structured;
- comparative;
- low-rhetoric;
- explicit about forces and trade-offs.

The pattern should not sell itself. State where it works, where it does not, what it costs, what new boundary debt it creates and what remains uncertain.

### Mode 5 — Reference house

**Purpose:** show one resolved interpretation of the doctrine.

Voice:

- specific;
- project-bound;
- accountable;
- clear about choice among alternatives.

Use dimensions, materials, routes, interfaces and reasons. Avoid turning a project-specific choice into universal doctrine by tone alone.

### Mode 6 — Research and evidence notes

**Purpose:** preserve what is known, what is inferred, what is contested and what remains untested.

Voice:

- neutral;
- evidence-sensitive;
- explicit about source quality;
- willing to be dull where dullness protects accuracy.

This material does not need to sound like the publication. Its first job is epistemic control.

---

## 7. Analogy

Analogy is one of this project's legitimate strengths and one of its easiest routes into self-indulgence.

Use an analogy only when there is a clearly stated shared mechanism.

Good transfer:

> Freight containerisation is relevant to a replaceable building system because independently designed actors can cooperate when the interface is stable and standardised.

Weak transfer:

> A house should be like a ship because both are complex machines.

The second statement produces atmosphere but almost no useful constraint.

### Analogy protocol

Before retaining an analogy, answer:

1. What exactly is being compared?
2. What mechanism is shared?
3. Where does the analogy stop working?
4. What can architecture learn from the foreign case that was harder to see in architectural vocabulary?
5. Can the architectural argument stand after the analogy is removed?

The best analogy produces a new architectural observation and then gets out of the way.

Do not stack analogies. One strong foreign model is normally enough for a passage.

---

## 8. Terminology and coined concepts

The project is entitled to its own vocabulary where ordinary language repeatedly hides a useful distinction. It is not entitled to vocabulary merely because a phrase sounds proprietary.

A coined term should do at least one of the following:

- compress a recurring multi-part concept;
- expose a distinction that existing architectural language blurs;
- allow several apparently different cases to be compared under one model;
- support a repeatable design or review operation.

Current examples with a plausible claim to usefulness include **maintenance geography**, **boundary debt**, **architectural platform** and **external maintenance envelope**. They should still be periodically red-teamed.

When introducing a term:

1. show the problem first where possible;
2. define the term in ordinary language;
3. use it consistently;
4. do not create synonyms for it later for stylistic variety.

Technical terms from architecture, engineering or regulation should be used when they are the precise terms. Define specialist terms when the intended reader may reasonably misunderstand them.

Never replace a precise ordinary word with a more elevated near-synonym merely to improve tone.

---

## 9. Sentence, paragraph and example economy

Good prose does not require visible variety for its own sake, but monotonous rhetorical patterning makes the authorial machinery audible.

### Sentence length

Use short sentences when the thought is genuinely short, when a sequence needs a clean stop, or when compression has been earned.

Do not create a one-line sentence merely to make it feel important.

Longer sentences are often useful for technical relations involving condition, exception and consequence. Do not break them into fragments if doing so obscures the relation between parts.

### Paragraphs

A paragraph should normally perform one intellectual operation: observation, explanation, qualification, consequence, comparison or transition.

Avoid strings of one-sentence paragraphs. They create artificial drama and force every statement to pose as a conclusion.

Avoid the inverse failure too: dense academic blocks that contain several logical moves simply because the subject is technical.

### Example density

Examples should establish a category, not exhaust it.

Once the reader can see the class of thing being described, stop. Two or three representative examples are often stronger than a long inventory. Add further examples only when they expose a genuinely different case, establish scope, or are needed for technical completeness.

This matters especially in domestic prose, where lists of states, objects, materials or conditions can easily continue after the point is already clear. Enumeration should buy understanding, not merely breadth.

### Lists

Use lists where the items are genuinely parallel or where inspection matters.

Do not convert ordinary prose into lists simply because lists look organised. Do not default to three items because three has rhetorical neatness. Do not keep adding examples simply because more examples are available.

### Default compression

The first competent rewrite is often still slightly too long. After meaning and sequence are secure, attempt a modest compression pass — roughly five per cent is a useful calibration, not a quota.

Remove surplus examples, repeated implications, explanatory tails and words that merely smooth the transition. Restore anything whose removal costs precision, rhythm or necessary qualification.

The aim is not terse prose. It is prose with little inert mass.

### Punctuation

No punctuation mark is banned.

Em dashes, semicolons, colons, parentheses and Oxford commas are legitimate tools. The problem is habitual use that gives every paragraph the same polished cadence.

If several consecutive sentences use the same rhetorical punctuation, revise at least some of them unless the repetition serves a clear purpose.

---

## 10. AI-slop failure modes

Recent corpus research has found sharp post-LLM increases in particular evaluative vocabulary, em dashes, list-of-three patterns and negative parallelism. These features are not individually evidence of bad writing. Their value here is diagnostic: they identify habits that language models reach for too easily.

The project should therefore inspect for the following patterns.

### 10.1 Negative parallelism

Pattern:

> not X, but Y  
> not merely X; it is Y  
> X is not simply A. It is B.

This construction is useful when a genuine misconception is being corrected. It becomes slop when used as the default engine of emphasis.

Prefer the direct proposition unless the contrast itself matters.

### 10.2 Manufactured aphorism

Pattern:

> The box mattered. The corner mattered more.

This can work once. Repeated frequently, it sounds as if the prose has been cut into social-media cards.

Ask whether the compressed line expresses an idea more exactly than ordinary prose would. If its main gain is theatricality, flatten it.

### 10.3 Importance signalling

Watch for:

- "This matters because..."
- "Crucially..."
- "It is important to note..."
- "The key insight is..."
- "This distinction is easy to underestimate..."
- "At its core..."
- "The deeper point is..."

Sometimes these are warranted. Often the next sentence can simply state the important thing.

### 10.4 Abstract evaluative vocabulary

Words such as *crucial, pivotal, significant, intricate, interplay, enduring, compelling, powerful, profound* are not prohibited. They are suspicious when they evaluate the thought instead of adding information.

Do not tell the reader that a relationship is intricate if the following explanation can show its parts.

### 10.5 Symmetry addiction

AI prose likes balanced pairs and trios because they sound finished.

Examples:

> support, restraint and movement  
> visible but not exposed; accessible but not intrusive

Keep such structures where the categories are real. Remove them where the taxonomy exists mainly for rhythm.

### 10.6 Repetition with escalating grandeur

A common pattern is:

1. state the idea;
2. restate it more abstractly;
3. restate it as an aphorism.

Keep the strongest version, or retain multiple formulations only where each adds a new layer of explanation.

### 10.7 Paragraph-end morals

Do not assume every section needs a concluding sentence telling the reader what lesson to take from it. Sometimes the evidence should be allowed to stop.

### 10.8 Faux depth through abstraction

Beware phrases that could be attached to almost any ambitious design project:

- "a dialogue between permanence and change";
- "a choreography of movement";
- "the tension between tradition and innovation";
- "a framework for meaningful adaptation";
- "a rich interplay of material, space and time".

If the phrase could survive transplantation into an unrelated architecture brochure, it is probably saying too little.

### 10.9 Enumeration creep

AI-assisted prose often keeps supplying examples after the reader already understands the category.

A sentence beginning with three useful particulars can become six or eight because each additional example is locally plausible. The result feels comprehensive but weakens the prose by delaying the actual point.

Keep the smallest representative set that establishes the class. Continue only when the next example changes the reader's model.

---

## 11. Beauty without performance

The project should not react against AI slop by becoming bloodless.

Beautiful writing remains desirable. The distinction is between **beauty produced by seeing clearly** and **beauty produced by decorating the act of seeing**.

Beauty may come from:

- an exact physical image;
- an unexpected but structurally faithful analogy;
- a sentence whose rhythm matches the process it describes;
- compression after sufficient explanation;
- a plain statement arriving after complexity;
- a historical example that makes the present arrangement newly strange;
- a dry observation that exposes an absurdity without announcing that it is absurd.

Beauty should usually be a consequence of thought well arranged.

---

## 12. Claim fidelity during stylistic revision

A style pass must not silently become a substantive pass.

For every rewritten passage preserve:

- **modality:** *may* is not *will*; *should* is not *must*;
- **scope:** a claim about principal domestic rooms is not a claim about every space;
- **evidence status:** hypothesis, inference, precedent and established evidence are not interchangeable;
- **exceptions:** qualifications must survive even when they interrupt elegant prose;
- **technical relationships:** do not simplify away a load path, boundary condition, tolerance, maintenance sequence or failure mode;
- **defined terms:** do not replace controlled terminology with attractive synonyms;
- **doctrine hierarchy:** principle, strategy, pattern and reference implementation must remain distinct.

When in doubt, preserve the less elegant sentence and flag it for substantive review rather than smoothing away the difficulty.

---

## 13. Examples from the current manuscript

These examples are not verdicts on the underlying thought. They show where the present prose teaches us something about the target style.

### 13.1 Strong thought, over-shaped delivery

Current preface:

> The box mattered.  
> The corner mattered more.

The underlying point is excellent: containerisation depended less on the generic existence of a box than on interoperable interfaces. The problem is not that the lines are bad. The problem is that the preface repeatedly uses this kind of dramatic compression.

A quieter version might be:

> The decisive innovation was not the box alone but the standardised interface that allowed independently owned equipment to handle it.

The quieter sentence should win if the surrounding pages already contain several rhetorical peaks.

### 13.2 Repeated dramatic stepping

Current preface:

> That is one danger.  
> There is another.

This is competent rhetorical pacing, but it announces the architecture of the argument rather than advancing it. In most contexts the second danger can simply begin.

### 13.3 Aphorism that may deserve to survive

Current preface:

> The outsider's privilege is not expertise. It is permission to remain surprised.

This is also negative parallelism and also aphoristic. It should not therefore be deleted automatically. It compresses a real epistemic position that the preceding passage has earned. The editorial question is density: does this remain one of a small number of memorable lines, or one of twenty?

### 13.4 Good evidence-bounded prose

Current repose principle:

> Human vision rapidly extracts support, stability and other physical properties from what it sees. The doctrine therefore prefers principal domestic spaces in which major masses appear plausibly borne and at equilibrium. This is not a claim that cantilevers are harmful, that arches are therapeutic, or that a visible load path must reproduce the engineer's structural diagram.

This is close to the target. It states the evidence, derives a bounded doctrine preference and explicitly blocks overclaiming. It can perhaps be tightened, but the epistemic structure should be preserved.

### 13.5 Good physical correction of an abstraction

Current maintenance principle:

> Access is more than a hatch or nominal clearance. A person needs an approach route, a safe working position, tools and handling space and — where components are replaced — a credible withdrawal and delivery path.

This is strong because "access" is converted from a label into a sequence of physical requirements. Future prose should do more of this.

### 13.6 Useful directness

Current governing principle:

> If a removable floor is noisy, it has failed.

This kind of sentence is effective because it is not trying to become profound. It states a concrete performance consequence in ordinary language. Keep this register available.

### 13.7 Pilot calibration — stop the list when the reader has the category

An early rewrite of the repose principle opened with:

> People are tired, ill, distracted, working, arguing, sleeping badly, cooking, carrying things, listening through walls and opening windows because the weather has changed.

Nothing in that list is wrong. The problem is that the category is established well before the sentence ends.

The calibrated version became:

> People are tired, ill, distracted, working, sleeping badly.

The shorter version does not lose the point. It trusts the reader to generalise from a representative set rather than making the prose perform completeness.

The same pilot benefited from a small overall reduction in word count after the first rewrite was already competent. This is now the default expectation: once substance and sequence are right, look for a modest further cut.

---

## 14. Editing workflow

For a stylistic rewrite, use this sequence.

### Pass 1 — identify the prose mode

Before touching the language, decide whether the material is preface, doctrine, technical explanation, pattern, reference implementation or research note.

### Pass 2 — extract the semantic skeleton

Write down, privately or explicitly where useful:

- principal claim;
- supporting mechanism;
- evidence status;
- exceptions and limits;
- defined terms;
- architectural consequence.

Do not begin rewriting until these are clear.

### Pass 3 — repair explanatory order

Ask whether the reader receives information in the order needed to understand it.

Prefer where appropriate:

**concrete condition → mechanism → generalisation → consequence**

rather than:

**generalisation → significance claim → analogy → mechanism → restatement**.

### Pass 4 — make abstractions pay rent

Underline abstract nouns mentally. For each, ask what object, actor, action or relation it represents.

Do not eliminate abstraction; architecture requires it. Ensure abstraction is anchored often enough that the reader can reconstruct the physical situation.

### Pass 5 — remove visible rhetoric

Inspect for:

- antithesis;
- triads;
- one-line paragraphs;
- repeated em-dash structures;
- importance signalling;
- aphoristic endings;
- unnecessary rhetorical questions;
- repeated restatement.

Keep only the instances that perform intellectual work.

### Pass 6 — test examples and analogies

For examples, stop once the class is clear unless another example adds a distinct case or necessary scope.

For analogies, state the shared mechanism in one plain sentence. If that cannot be done, remove the analogy.

### Pass 7 — claim-fidelity comparison

Compare the rewrite against the source. Check modality, scope, evidence, exceptions and terminology.

### Pass 8 — compression pass

Assume the first competent rewrite may still carry a little inert mass. Try a modest further cut — around five per cent is a useful prompt — without changing substance.

Look first at surplus examples, duplicated implications, explanatory tails and transition words. Do not cut qualification merely because qualification takes space.

### Pass 9 — read for cadence

Look for sentences that all arrive with the same degree of finish. Insert no deliberate roughness, but allow ordinary explanatory prose to remain ordinary.

### Pass 10 — red-team the result

Use the checklist below.

---

## 15. Red-team checklist

Before accepting public-facing prose, ask:

- Has the rewrite changed any claim, qualification or evidence status?
- Can I picture the physical condition being described?
- Does the paragraph explain a mechanism, or merely name an aspiration?
- Is this sentence trying to sound quotable?
- Did I manufacture a contrast because `not X but Y` sounded good?
- Am I telling the reader that something is important instead of showing why?
- Is a list genuinely categorical, or did I choose three items because three sounds complete?
- Have I kept supplying examples after the category was already clear?
- Does an abstract noun conceal a concrete actor, object or action that should be named?
- Has a specialist term been used because it is precise, or because it sounds professional?
- Does the analogy reveal the same mechanism in another domain?
- Have I stated where that analogy stops working?
- Does a coined term buy enough explanatory compression to justify teaching it to the reader?
- Have I repeated the same thought at increasing rhetorical intensity?
- Does every one-sentence paragraph genuinely require isolation?
- Is the conclusion already obvious from the preceding material?
- Could one sentence be deleted with no loss of information or rhythm?
- Could the passage lose roughly five per cent without losing meaning, precision or necessary qualification?
- Would a diagram be clearer than another paragraph?
- Does the passage sound more certain than the evidence permits?
- Does it sound as though the author is trying to impress an architect rather than communicate with one?

If the answer to the last question is yes, rewrite.

---

## 16. A compact instruction for future editors

When context is limited, use this as the compressed form of the doctrine:

> Preserve substance exactly. Identify the prose mode before editing. Prefer physical mechanism, concrete cases and explanatory sequence over abstract significance claims. Use cross-domain analogy only when a shared mechanism can be stated precisely. Introduce terminology only when it buys precision or compression. Keep rhetoric sparse: do not default to antithesis, triads, one-line dramatic paragraphs, aphorisms, importance signalling or polished paragraph morals. Stop enumerating examples once the reader can see the category. Allow ordinary sentences to remain ordinary so that genuinely strong sentences retain force. Technical prose should correct the reader's intuitive model step by step. Doctrine should be compact and bounded. The preface may carry more personality, but not continuous performance. After the first competent rewrite, attempt a modest further compression without sacrificing qualification or mechanism. Then compare modality, scope, evidence status, exceptions and defined terms against the source.

This paragraph is a fallback, not a replacement for the full document.

---

## 17. Reference notes

The stylistic observations above are partly derived from direct reading and partly from research into characteristic LLM prose.

Useful reference points include:

- Pew Research Center, **How Much of the Internet Is Written With AI?** (2026): corpus evidence for increased use of em dashes, Oxford commas, AI-associated vocabulary and negative parallelism in post-ChatGPT web prose.
- Kobak, González-Márquez & Horvát, **Delving into LLM-assisted writing in biomedical publications through excess vocabulary** (*Science Advances*, 2025): large-scale evidence of abrupt increases in style-affecting vocabulary associated with LLM-assisted writing.
- Venkatesh Rao, **A Big Little Idea Called Legibility** (Ribbonfarm, 2010): a strong example of carrying a model from Scott into other domains and testing its fertility.
- Venkatesh Rao, **The Gervais Principle** series (Ribbonfarm): an example of extracting an explanatory model from an apparently unrelated cultural object and developing it beyond the initial analogy.
- Patrick McKenzie, **Bank transfers as a payment method** and **How credit cards make money** (Bits about Money, 2021): strong examples of correcting intuitive models of complex technical systems in ordinary language.
- Ada Louise Huxtable, **The Troubled State of Modern Architecture** (1980) and related criticism: useful resistance to obscure architectural theory and unnecessary verbal complexity.
- Stewart Brand, *How Buildings Learn*.
- Christopher Alexander et al., *A Pattern Language* and Alexander's related writing.
- James C. Scott, *Seeing Like a State*.
- Peter Zumthor, *Thinking Architecture*.

These sources are not a canon the manuscript must imitate. They are evidence for particular editorial moves described above.

---

## 18. Governing editorial principle

The publication should not continually signal that its ideas are important.

It should arrange the evidence, mechanism and language so that the reader can discover their importance for themselves.