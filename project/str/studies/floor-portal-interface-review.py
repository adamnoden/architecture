"""Read-only geometric/authority receipt; does not execute or change native kernels.

Usage: python -S floor-portal-interface-review.py --repo PATH [--check]
The 5 mm normal excursion is an authored comparison, not an admitted joint travel.
Authority is replayed at the recorded Git commit. --check also requires the
current physical input files to remain byte-identical; later authority wording
may intentionally withdraw the old claim without rewriting this observation.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess


def calculate(repo, source_ref):
    source_names = [
        "project/control/nodes/structure.ts",
        "project/control/nodes/roof-water.ts",
        "project/str/structural-architecture-programme.md",
        "project/str/provisional-house-handoff.md",
        "project/triad-interface-contract.md",
        "project/str/current-house-structural-reference.md",
        "project/str/studies/reconciled-house-interface.json",
        "project/str/studies/house-corner-rewind.json",
        "project/str/studies/reconciled-corner-portals.py",
        "project/str/studies/current-house-membrane.py",
        "project/str/studies/current-house-floor-stops.py",
        "project/str/studies/current-house-floor-stops.json",
        "project/str/studies/current-house-floor-closure.py",
        "project/str/studies/current-house-roof-bracing.py",
        "project/str/studies/current-house-joined-foundation.py",
        "project/str/studies/reconciled-foundation-join.py",
        "project/str/studies/arch-space-kernel.py",
    ]
    commit = subprocess.check_output(["git", "rev-parse", source_ref], cwd=repo, text=True).strip()
    content = {n: subprocess.check_output(["git", "show", f"{commit}:{n}"], cwd=repo) for n in source_names}
    sources = {n: hashlib.sha256(b).hexdigest() for n, b in content.items()}
    study = lambda name: json.loads(content[f"project/str/studies/{name}"])
    interface = study("reconciled-house-interface.json")
    changes = study("house-corner-rewind.json")["changes"]
    outer = study("current-house-floor-stops.json")["newLoops"]["outer"]
    jt = interface["jambAndTies"]
    normal, along = jt["widthNormalAlong"]
    q0, q1 = jt["portalCoreQ"]
    cq0, cq1 = jt["ordinaryWallCoreQ"]
    width, height = outer["coreWidthDepth"]
    assert (normal, along, width, height) == (180, 205, 140, 750)
    assert [q0, q1, cq0, cq1] == [222.5, 402.5, 262.5, 402.5]
    ztop, zbottom = outer["topBottomZ"]
    along_travel, normal_challenge = 45., 5.
    opening_p = along + 2 * along_travel
    opening_q = [q0 - normal_challenge, q1 + normal_challenge]
    bypass_q = [opening_q[1], opening_q[1] + width]
    datum = (cq0 + cq1) / 2
    rows = []
    for change in changes:
        if change["level"] != "GROUND":
            continue
        for axis in change["jambAxes"]:
            rows.append({
                "face": change["side"], "opening": change["id"], "jambAxisPmm": axis,
                "jambPmm": [axis - along / 2, axis + along / 2],
                "minimumSlidingOpeningPmm": [axis - opening_p / 2, axis + opening_p / 2],
                "minimumSlidingOpeningQmm": opening_q,
                "collectorIntersectionQmm": [cq0, cq1],
                "collectorIntersectionZmm": [zbottom, ztop],
                "unseparatedNominalCollectorJambIntersectionM3": along * width * height / 1e9,
            })
    assert len(rows) == 16
    # Nominal bar coordinates inferred from the source's cover/link/bar schedule.
    # This is a crossing screen, not an issued three-dimensional bar schedule.
    bar_q = [cq0 + 35 + 8 + 6, cq1 - 35 - 8 - 6]
    clearance = min(abs(a - b) - 12 for a in bar_q for b in jt["continuousJambH12Q"])
    return {
        "status": "Upstream topology conflict; neither alternative admitted; no native replay or graph edit.",
        "sourceCommit": commit,
        "authorityObservation": "The pre-correction claim is preserved at this immutable commit; it is not current acceptance after the owning correction.",
        "sourcesSha256": sources,
        "authority": {
            "candidate": interface["candidate"], "adopted": interface["adopted"],
            "heldExplicitly": "Joint/cage/anchorage design, qualification and external acceptance.",
            "notLocated": "Floor-jamb sliding opening and continuous collector bypass.",
            "completionClaim": "STR-RECONCILE internal proposition complete; BCR 002/003 load route resolved.",
            "recommendation": "Register targeted STR-FLOOR-PORTAL depending on historical STR-RECONCILE, with hard ROF/TRIAD dependencies. Explicitly withdraw current SAP-C1 coherence/load-route acceptance; keep the original exit unchanged. Compare monolithic floor-jamb first.",
        },
        "assumptions": {
            "sourceTangentialTravelEachWayMM": along_travel,
            "authoredNormalExcursionEachWayMM": normal_challenge,
            "normalExcursionIsAdmitted": False,
            "openingExcludesSettingsSealsAndRotation": True,
            "bypassIsZeroExtraClearanceGeometricLowerBound": True,
        },
        "geometry": {
            "jambNormalAlongMM": [normal, along], "jambQmm": [q0, q1],
            "collectorQmm": [cq0, cq1], "collectorBottomTopZmm": [zbottom, ztop],
            "collectorDepthMM": height, "collectorAboveFFLmm": ztop - 3450,
            "minimumOpeningAlongNormalMM": [opening_p, opening_q[1] - opening_q[0]],
            "minimumSameWidthInboardBypassQmm": bypass_q,
            "minimumBypassAxisOffsetMM": sum(bypass_q) / 2 - datum,
            "minimumProjectionBeyond429p5FinishedFaceMM": bypass_q[1] - 429.5,
            "minimumAddedSlabEdgeNotchDepthFrom332p5MM": opening_q[1] - datum,
            "occurrences": rows,
        },
        "nominalMonolithicBarCrossingScreen": {
            "sourceJambH12Qmm": jt["continuousJambH12Q"],
            "inferredCollectorH12Qmm": bar_q,
            "minimumOrthogonalBarSurfaceClearanceMM": clearance,
            "result": "Negative: retained source cages need a real local redesign; monolithic is not a ready detail.",
        },
        "kernelBoundary": {
            "existingPortal": "Six DOF members, condensed only at four normal ties per portal; feet retain three translations and free rotations.",
            "existingFloor": "Two-displacement membrane plus edge yaw, condensed to eight L-pier translations; no floor vertical plate stiffness.",
            "existingFloorGravity": "Static short-span/load-route and passive-contact redistribution, not assembled vertical compatibility.",
            "bypassNeeds": "Remesh sixteen openings; route real offset chords/beams and all corner forces; new gravity/torsion and local cage checks.",
            "monolithicNeeds": "Replace 16 floor sliders with located finite joint translations and rotations; add coupled floor vertical/grillage response, loads once, feet/foundation and movement replay.",
            "availableBuildingBlocks": ["current-house-membrane.py basis/reduced/recover", "arch-space-kernel.py SpaceArch.member/point/global_totals", "reconciled-corner-portals.py Portal/house_interfaces", "current-house-joined-foundation.py realState/horizontal", "reconciled-foundation-join.py WindFoundation"],
            "notAValidShortcut": "Set k_tie to infinity or delete the 16 scalar floor ties without adding physical multi-DOF connectivity.",
        },
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--source-ref")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    output = Path(__file__).with_suffix(".json")
    recorded = json.loads(output.read_text()) if args.check else None
    source_ref = args.source_ref or (recorded["sourceCommit"] if recorded else "HEAD")
    result = calculate(args.repo, source_ref)
    rendered = json.dumps(result, indent=2, sort_keys=True) + "\n"
    if args.check:
        assert output.read_text() == rendered, "Source or receipt changed"
        for name, sha in result["sourcesSha256"].items():
            if name.startswith("project/str/studies/"):
                assert hashlib.sha256((args.repo / name).read_bytes()).hexdigest() == sha, f"Current physical input changed: {name}"
    else:
        output.write_text(rendered)
    print("PASS: 16 located collector intersections and source-bound authority receipt reproduced")
