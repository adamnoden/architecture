# BRH-04G — final reviewed-C deletion authorisation

BRH-04G owns the final historical deletion tranche under BRH-04.

## Fresh live lease

- `main`: `552bc8fb84379287a032cd7f7e18cef74c03bcc9`
- namespace at discovery: **23 refs including `main`**
- live programme refs outside history: `drw-05e-principal-section-spread-proof`, `hfi-04b-doors-windows-hardware`
- reviewed historical queue: **20 C refs**
- deletion cap: **25**

The 20 candidates are exactly the BRH-04F remainder. Their heads still match the semantic-review authority and BRH-04F closeout.

Candidate-set SHA-256: `992e7e4703f69c8ff34e5053d1408c2f39ddb509fd657b8081f25b905a7f2e27`.

## Destructive guard

A temporary packet-local workflow may delete the 20 refs only if, immediately before mutation:

1. live `main` is still exactly `552bc8fb84379287a032cd7f7e18cef74c03bcc9`;
2. every candidate exists at its frozen SHA;
3. no candidate is the head of an open PR;
4. the candidate-set hash matches the authorised value;
5. the BRH packet ref still equals the executing workflow head.

Deletion must be a single atomic push with exact-old-SHA `--force-with-lease` guards for every candidate plus no-op leases on `main` and the packet ref. The post-delete proof must show the removed set is exactly the authorised 20. Any unexpected non-candidate removal fails the packet.

The destructive workflow is execution machinery only and must be removed before PR review.

## Expected outcome

After a clean deletion, the historical BRH-04 queue is empty: **A=0 / B=0 / C=0 / D=0 / X=0 pending deletion**. Surviving non-`main` refs should therefore be active programme work plus the BRH-04G packet ref itself, subject to concurrent legitimate activity.

No repository setting change, salvage, merge, cherry-pick or branch rewrite is authorised by this packet.
