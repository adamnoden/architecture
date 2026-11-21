# Independent net floor live load

The current joined structural method applies the authored `freshUniformLiveKPa` to the same actual net RC floor plate independently of the legacy gross-gravity flag. This repairs a real omission: with roof coupling active, that flag is correctly disabled, but the previous load route therefore omitted positive floor live pressure.

## Method and source ownership

`fresh_net_floor_live_load` in [vertical_rc_floor.py](studies/vertical_rc_floor.py) consumes the assembled net plate area, centroid, condensed uniform-load vector and actual frame-port maps. It applies the existing explicit comparison factor **1.5Q**, maps vertical force and eccentric moments to the same coupled frame, and verifies the full six-component source wrench. Characteristic pressure is restricted to finite 0–5 kPa. It adds no physical mass, upper-wall gravity or filled-opening load.

The uniform-pressure multiplier also enters the existing interior particular-displacement recovery. Thus displacement, plate bending and strain-energy/work recovery include Q as well as the displacement induced at the condensed ports. Applying nodal reactions alone would omit this part of the plate response.

The load is combined in the same frame solve with roof, foundation and wall-body actions. It does not create a second solver, foundation reaction file or nearest-head allocation. The existing principal wet-territory reservation and actual opening inventory still bound the known net plate. No claim is made for an unknown floor assembly, unrepresented occupied load, complete load-combination envelope or structural acceptance.

## Evidence and consumers

- [floor_live_load_test.py](studies/floor_live_load_test.py), dispatched by structural CI, independently checks force/first moments, the explicit factor, zero → positive → zero reversal, physical-G preservation, interior particular bending/energy, and invalid inputs or an incomplete port map.
- [vertical_receiver_identity_test.py](studies/vertical_receiver_identity_test.py) checks numeric point identity and physical retained-coordinate stiffness, including an independent uncondensed unit point-load comparison. Retained roof ports must reuse actual assembled plate traces.
- The current [masonry-frame proof](studies/masonry-frame-a-proof.json) supplies the coupled `MASONRY-FRAME-A/net-floor-Q2` control with physical G fixed and the net-Q six-wrench checked against the unchanged case. Its actual source tuple governs applicability; older roof-coupling proofs with orphan retained ports are not interchangeable evidence.
- The saved-design adapter consumes `nativeVertical.floorLiveLoad` under schema `str-independent-net-floor-live-load/1`, validates its area, centroid, pressure, factor and source wrench, and retains the authored revision. The saved-document perturbation/reversal test joins positive floor Q, roof pressure and an opening/body edit through that same public CLI route.

Changes to the owning vertical method invalidate the retained native35 controls and their foundation, court-closure, lower-body and floor-reinforcement derivatives. Those producers must be executed afresh; copying new hashes into previous results is insufficient. The older native30 method/source family is unchanged by this independent load route.

This is a completed computational load route, not a selected house structure or an owner/professional acceptance.
