# Outer physical renewal checkpoint

**Unselected comparison. No complete ordinary renewal route is accepted.**

This is the second private checkpoint, following the unchanged original archive and the four canonical source/receipt files adopted at `f49968e96ad7dceb35ea448d87d20c851d337b40`. It adds physical one-root pan/joint inventory, exact finite path failures, the missing relief-head sequence, and the new complete retained-arm corner queries. It does not duplicate a frozen repository tree.

## Reproduce

Use an Architecture checkout containing the exact source hashes recorded in the receipts. The physical geometry and old pressure sensitivity are the reviewed `a9f7fddc`/`f49968e` source state. Neither script writes to that checkout.

```sh
python -B outer-module-inventory.py --repo /path/to/architecture
python -B outer-renewal-path-checks.py --repo /path/to/architecture
python -B native-arm-checks.py
python -B outer-module-inventory.py --repo /path/to/architecture --check
python -B outer-renewal-path-checks.py --repo /path/to/architecture --check
python -B native-arm-checks.py --check
```

`native-arm-inputs.json` contains exactly twelve queried retained-arm corners from each complete 920-query native movement receipt, with its full-source SHA256 and source dependency hashes. This is a compact input extract, not a new native solve. The exact input rows were independently read from the structural review output before this audit was calculated.

## Physical inventory

The first hypothesis enumerates 64 bodies per circuit: 56 straight and eight miter-ended. It explicitly prices 60 straight and four miter joint closures per circuit and a new 10 mm fabrication seam. That seam does **not** inherit the source's 60 mm long-arm thermal-end datum.

| Quantity | Primary | Lower |
|---|---:|---:|
| Largest complete plan length, mm | 956.054 | 1,060.116 |
| Largest moving dry metal inventory, kg | 21.467 | 29.345 |
| Reconciled trial installed stock, kg/m | 48.777 | 46.933 |
| Least clearance in a 1,200 mm wide bay, after 10 mm each side | 111.973 | 59.942 |

The installed totals join the enumerated moving metal to the original fixed-root/apron stock schedule. They include the proposed primary 3 mm crossarm and the priced miter joints. They exclude new corner reinforcement, unpriced rain tools and additional thermal-slide hardware. The original 600 mm head bay fails for both complete pan circuits. The wider body bay remains a plan hypothesis; its grips, site fields, worker, gates, first rest and ground nest have not been joined.

Corner polygons expose additional frame duties. The rails of a released one-root body are cantilevers from its own crossarm; a continuous simply supported rail calculation does not qualify their longer corner cantilevers, end-rib connection or torsion. Scalar mass reserve also does not qualify native radial/longitudinal couples.

The 64-piece control has four head-straddling pans. Its source mean-bed jumps are 30.25 mm at north primary, 51.5 mm at south primary and 57.5 mm at each lower head. They are not planar troughs. A constructive next variant can divide those pans at each actual head station±30 mm, retaining the real 60 mm head-end gap, with separate pieces sharing the existing root. A two-entry turn box, supports and actual native resultant mapping would still be needed. No such variant is selected by this checkpoint.

## Thermal-joint distinction

A sacrificial soldered per-bay strip can belong to a continuous wet liner train whose thermal movement is taken at the original head ends. That requires an actual crown datum and longitudinally sliding capture at every carrier. Longitudinal sliding alone does not imply zero vertical bending or torsion transfer through the seam.

Alternatively, a separately fixed pan needs a real compliant all-metal expansion joint at every seam. Its fold, support, attachment and cyclic movement cannot be inferred from the current 90 mm developed stock allowance. The owning source adds no installed polymer exception. Both alternatives remain open.

## Finite path failures

The proposed closed horizontal rain pickup at Z7200 and R170–625 intersects the retained primary apron, whose actual crossing lies near R216–220. It cannot be introduced before the first opening without a real dry slot or different assembly sequence.

The whole primary apron's folded toe reaches R672.85 after a 400 mm outward move, beyond the intact lower collector's R670 edge. A receiving catch must already be in place. The drawn top/toe line is shorter than the priced and structurally screened 580 mm stock; the missing upper lap and clips cannot be omitted from a complete captured envelope.

A tray at R625–3250, floor5900/rim6025, does not intercept the retained secondary drip at R146. Extending its back to R115 leaves only 5 mm after 10 mm setting beside the source facade projections and only 10 mm behind the lower back edge. Vertical arm clearance does not prove a rain-tight rear wall or horizontal wind/splash capture.

The source 165 mm primary drop leaves only 30 mm nominal rear-to-apron clearance; 161 mm leaves 26 mm. Their old check subtracts only 10 mm. Neither can simply inherit a proposed 50 mm ground-relative movement allowance plus local and setting terms. A genuine local motion/path comparison is required.

## Head and arm comparison

The owning source contains four leader load/ground-lane allowances but only two explicit **normal** head/spool/catch transfer examples. The two relief heads still need removable body/spout geometry, upper spool, retained pipe support, first rest and contained water reception before their own release.

The proposed arm at Z6200 with a 400 mm root drop remains a local candidate. Its local whole-head mass is 72.208 kg and local deflection 5.755 mm. With the proposed 50 native +6 local +10 setting allowance, it leaves 9.275 mm to the lowest lower carrier and 9 mm to the 6025 mm tray rim. The unchanged Z6240 control fails the same lower-carrier comparison.

The newer 280×120×25 collector comparisons include the complete exported inner pressure, independent water, and 134 independent installed outer/head dry-mass intervals. Their actual twelve queried points cover the retained arm, two forks and split plate: R−332.5/1000/1260 and along±125 mm, rooted at the true head station and native Z6600 datum.

| Receiving spring | South absolute range, mm | North absolute range, mm |
|---|---:|---:|
| 40 kN/mm | −19.355 to +28.153 | −28.736 to +41.122 |
| 20 kN/mm | −21.460 to +32.450 | −30.956 to +45.446 |

Both unadmitted sensitivities fit the 50 mm vertical allowance. The softer case leaves 4.554 mm. The old 280×20 centreline interval calculation is retained as a labelled earlier control, not substituted for these full corner queries.

An additional geometric candidate is to lift a captured lower pan100 mm before its main outward draw, after the primary and secondary apron have been removed. This would give 69.275 mm clearance to the original arm after50+6+10, or56.275 mm after additionally reserving8 for the pan and5 for fittings. The first fork release, weight handoff, retained secondary clips and actual vertical corridor remain gates; a safe post-lift position does not establish the preceding path.

An absolute movement allowance applies to a ground-datum controlled transfer position. A guide held at its initially captured deflected height needs the full subsequent movement excursion or a real normalization step. The local arm calculation also does not establish the stiffness of the new pan-handling rig.

## What still prevents adoption

Contained roof and underlay reception must operate **before** the first wet joint or apron weatherlap is opened. Retained neighboring open ends need continuous reception. The complete body, all head types, grips, first rest, worker and gates need one finite forward and reverse route, including every paused state. The source global pressure variants and the new local hardware must agree on all installed/removed mass and retained wind area. This checkpoint preserves these gates explicitly.
