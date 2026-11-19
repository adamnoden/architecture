#!/usr/bin/env python3
"""Reproduce bounded PHY floor-edge scenarios; no product/design acceptance.

Run from any directory. --check compares deterministic JSON/SVG without writing.
Repository geometry is pinned. Loads, seats and RC properties below are declared
study hypotheses, not verified house actions, selected members or tolerances.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
PINS = {
    "project/str/studies/house-supports.json": "f0594e0afd90334d20614330fdbe5ad676f8dc9f4d2aca4fa9fdb2881b6e8388",
    "project/str/studies/house-spine-bearing.json": "472a06415957c752aef97eb67aa037fbfe28bb268a87aeffa099226d7d7bfb2b",
    "project/str/studies/house-riser-trim.json": "73e1f78a590f2daf2dd3a339d74114fdcc06901ce80cdc9150ad20e2d028c323",
    "project/str/studies/house-riser-product.json": "fb0f9d96d50e829683c0bbf4dd6d7a70dfa4c140c6f5de9975c83d13c4d3f299",
    "project/str/studies/span-envelopes.json": "57f40878a9dc2ef74d2e922ea488c7ac72d3ecf7d644102fdae027a332f30499",
    "compiler/reference-house/georgian/section-source.ts": "d363a38721f63e55f940bab9af0999928c83adb0cd9bc45d638526fb88e3197c",
}


def load_sources():
    loaded = {}
    for path, expected in PINS.items():
        raw = (ROOT / path).read_bytes()
        actual = hashlib.sha256(raw).hexdigest()
        if actual != expected:
            raise ValueError(f"Changed source requires review: {path}: {actual}")
        if path.endswith(".json"):
            loaded[Path(path).stem] = json.loads(raw)
    return loaded


def strip(q, clear, seat=0.1):
    """q kN/m on a 1m strip; lengths m. Uniform load includes both end seats.

    Symmetric ideal reaction lines at seat centres; free ends half a seat past
    each line. This reaction model is not a claim about actual bearing stress.
    """
    L, a = clear + seat, seat / 2
    R = q * (L + 2 * a) / 2
    M = q * (L * L / 8 - a * a / 2)
    assert math.isclose(2 * R, q * (clear + 2 * seat), abs_tol=1e-10)
    assert math.isclose(R * L / 2 - q * (L / 2 + a)**2 / 2, M, abs_tol=1e-10)
    return {"reaction_line_span_m": L, "loaded_length_m": L + 2*a,
            "end_overhang_m": a, "R_each_kN_per_m": R,
            "M_mid_kNm_per_m": M, "V_just_inside_support_kN_per_m": q * L / 2,
            "M_at_reaction_line_kNm_per_m": -q*a*a/2}


def point_beam(L, w, P, a):
    """Simply supported line, UDL w kN/m and point P kN at a m."""
    assert 0 <= a <= L and w >= 0 and P >= 0
    ra, rb = w*L/2 + P*(L-a)/L, w*L/2 + P*a/L
    positions = [0, a, L]
    if w:
        for x in [ra/w, (ra-P)/w]:
            if 0 <= x <= L:
                positions.append(x)
    moment = lambda x: ra*x-w*x*x/2-P*max(0, x-a)
    valid = [(x, moment(x)) for x in positions]
    x, maximum = max(valid, key=lambda item: item[1])
    assert math.isclose(ra+rb, w*L+P, abs_tol=1e-10)
    assert math.isclose(moment(L), 0, abs_tol=1e-10)
    return {"L_m": L, "w_kN_per_m": w, "P_kN": P, "P_at_m": a,
            "R_left_kN": ra, "R_right_kN": rb, "M_max_kNm": maximum,
            "M_max_at_m": x}


def rc_section(spacing=200, cover=35, E=33000):
    """First-generation UK method benchmark; N/mm2, mm, mm2, mm4.

    CCIP Worked Examples (Dec2009), pp185-188: rectangular block and shear.
    Adopt its p186 recommended z<=0.95d cap. No anchorage/fire/detail pass.
    E=33 GPa is an authored reference value (source example p174), not a
    measured selected mix. Range 25/33/40 GPa is evaluated separately.
    """
    b, h, dia, fck, fyk, Es = 1000, 200, 12, 30, 500, 200000
    d = h-cover-dia/2
    As = math.pi*dia*dia/4*1000/spacing
    fcd, fyd = .85*fck/1.5, fyk/1.15
    x = As*fyd/(.8*b*fcd)
    z = min(d-.4*x, .95*d)
    k, rho = min(2, 1+math.sqrt(200/d)), min(.02, As/(b*d))
    v = max(.12*k*(100*rho*fck)**(1/3), .035*k**1.5*math.sqrt(fck))
    fctm = .30*fck**(2/3)
    return {"h_mm": h, "b_mm": b, "cover_hypothesis_mm": cover,
            "bar_diameter_mm": dia, "spacing_mm": spacing, "d_mm": d,
            "fck_MPa": fck, "fyk_MPa": fyk, "fcd_MPa": fcd, "fyd_MPa": fyd,
            "E_reference_MPa": E, "Es_MPa": Es, "As_mm2_per_m": As,
            "As_min_mm2_per_m": max(.26*fctm/fyk*b*d, .0013*b*d),
            "x_ultimate_mm": x, "x_over_d": x/d, "z_capped_mm": z,
            "M_Rd_benchmark_kNm_per_m": As*fyd*z/1e6,
            "V_Rdc_benchmark_kN_per_m": v*b*d/1000,
            "fctm_reference_MPa": fctm, "I_gross_mm4": b*h**3/12,
            "M_cr_gross_reference_kNm_per_m": fctm*b*h*h/6/1e6}


def stiffness_case(rc, L_m, q, phi):
    """Uniform-curvature-stiffness sensitivity, not predicted final deflection.

    q kN/m = N/mm for a 1m strip. Gross plain-concrete inertia and transformed
    fully cracked inertia are alternate idealisations. No shrinkage curvature,
    tension stiffening, staged cracking, continuity, overhang or bearing rotation.
    """
    b, d, As = rc["b_mm"], rc["d_mm"], rc["As_mm2_per_m"]
    Eeff = rc["E_reference_MPa"]/(1+phi)
    n = rc["Es_MPa"]/Eeff
    x = (-n*As+math.sqrt((n*As)**2+2*b*n*As*d))/b
    Icr = b*x**3/3+n*As*(d-x)**2
    L = L_m*1000
    delta = lambda I: 5*q*L**4/(384*Eeff*I)
    return {"L_m": L_m, "q_sustained_hypothesis_kN_per_m2": q,
            "phi_hypothesis": phi, "E_initial_MPa": rc["E_reference_MPa"],
            "E_effective_MPa": Eeff, "neutral_axis_cracked_mm": x,
            "I_cracked_mm4": Icr, "I_cracked_over_gross": Icr/rc["I_gross_mm4"],
            "gross_stiffness_delta_mm": delta(rc["I_gross_mm4"]),
            "fully_cracked_stiffness_delta_mm": delta(Icr),
            "L_over_250_diagnostic_mm_not_acceptance": L/250}


def calculations(src):
    support, spine = src["house-supports"], src["house-spine-bearing"]
    fields = [support["field_comparisons"][i] for i in [0, 1, 3]]
    assumptions = {"status": "Authored study hypotheses; not verified house design actions or adopted assemblies",
        "other_G_kN_per_m2": 1.5, "other_G_sensitivity": [1, 1.5, 2],
        "Q_kN_per_m2": 2, "Q_sensitivity": [1.5, 2, 3],
        "ULS_benchmark_gamma_G": 1.35, "ULS_benchmark_gamma_Q": 1.5,
        "QP_reference_psi2": .3, "reinforced_concrete_weight_kN_per_m3": 25,
        "wet_concrete_weight_kN_per_m3": 26, "authored_independent_seat_m": .1,
        "no_composite_action_credit": True, "RC_shear_scope": "prismatic non-prestressed strip; no openings, punching, anchorage or joints",
        "RC_serviceability_scope": "constant alternative stiffnesses, uniform sustained load, phi0-3; not full deflection or vibration design",
        "material_policy": "No whole installed assembly composition, fire or acoustic admission"}
    families = [
        {"id":"HC150", "depth_mm":150, "topping_mm":0, "self_kN_per_m2":2.4},
        {"id":"HC150+75", "depth_mm":150, "topping_mm":75, "self_kN_per_m2":2.4+25*.075},
        {"id":"HC200", "depth_mm":200, "topping_mm":0, "self_kN_per_m2":3.1},
        {"id":"HC200+75", "depth_mm":200, "topping_mm":75, "self_kN_per_m2":3.1+25*.075},
        {"id":"RC200", "depth_mm":200, "topping_mm":0, "self_kN_per_m2":25*.2}]
    reference, sensitivity = [], []
    for f in families:
        f["upper_functions_remaining_mm"] = 350-20-55-15-f["depth_mm"]-f["topping_mm"]
        f["trial_slab_top_mm"] = (3450-20-f["upper_functions_remaining_mm"]-f["topping_mm"]
                                  if f["upper_functions_remaining_mm"] >= 0 else None)
        f["trial_soffit_mm"] = (f["trial_slab_top_mm"]-f["depth_mm"]
                                if f["trial_slab_top_mm"] is not None else None)
        for g_other in assumptions["other_G_sensitivity"]:
            for Q in assumptions["Q_sensitivity"]:
                G = f["self_kN_per_m2"]+g_other
                qd = 1.35*G+1.5*Q
                for field in fields:
                    row = {"family":f["id"],"field":field["id"],
                        "clear_m":field["clear_structural_faces"]/1000,
                        "other_G_kN_per_m2":g_other,"G_kN_per_m2":G,
                        "Q_kN_per_m2":Q,"q_d_kN_per_m2":qd,
                        **strip(qd,field["clear_structural_faces"]/1000)}
                    sensitivity.append(row)
                    if g_other==1.5 and Q==2:reference.append(row)
    rc = rc_section()
    sls = [stiffness_case(rc_section(E=E),f["clear_structural_faces"]/1000+.1,7.1,phi)
           for E in [25000,33000,40000] for f in fields for phi in [0,1,2,3]]
    rc_sensitivity = [rc_section(spacing=s,cover=c) for s in [150,200] for c in [25,35,45]]
    qd = next(x["q_d_kN_per_m2"] for x in reference if x["family"]=="HC150+75")
    clear = fields[0]["clear_structural_faces"]/1000
    R = strip(qd,clear)["R_each_kN_per_m"]
    bearings=[]
    for loss in [0,10,20,30]:
        b=100-loss
        for mode in ["symmetric_contact_loss","back_edge_loss_inner_edge_retained"]:
            e=20 if mode=="symmetric_contact_loss" else 20+loss/2
            bearings.append({"contact_loss_hypothesis_mm":loss,"mode":mode,
                "uniform_contact_width_mm":b,"uniform_contact_centroid_e_mm":e,
                "gross_contact_pressure_MPa":R/b,
                "gross_full_wall_sigma_max_MPa":R/140*(1+6*e/140),
                "gross_full_wall_sigma_min_MPa":R/140*(1-6*e/140),
                "W_over_R_needed_for_middle_third_if_centred":max(0,6*e/140-1)})
    stages=[]
    for name,q in [("bare unit only",2.4),("unit plus wet75 topping",2.4+26*.075),
                   ("same plus authored1 construction UDL",2.4+26*.075+1)]:
        stages.append({"stage":name,"unfactored_q_kN_per_m2":q,**strip(q,clear),
                       "scope":"No construction load/code design or dynamic placement allowance"})
    bay=spine["candidate_full_width_bay"]
    shared={"scope":"Clear-field tributary contributions only, not selected narrow-bearing reaction lines",
            "wet_strip_clear_m":bay["wet_strip_clear_structural_field"]/1000,
            "gallery_clear_m":bay["gallery_clear_structural_field"]/1000}
    for kind in ["wet_strip","gallery"]:
        shared[kind+"_half_field_kN_per_m"]=qd*shared[kind+"_clear_m"]/2
    shared["imbalance_kN_per_m"]=shared["wet_strip_half_field_kN_per_m"]-shared["gallery_half_field_kN_per_m"]
    wall_core=.14*3.1*20
    wall_finish=2*.015*3.1*14.1  # published generic plaster density, not selected finish
    wall=wall_core+wall_finish
    heavy=[]
    for f in fields:
        c=f["clear_structural_faces"]/1000; L=c+.1
        base=strip(qd,c)
        heavy.append({"field":f["id"],"wall_G_kN_per_m":wall,
            "perpendicular_midspan_added_R_kN_per_m":1.35*wall/2,
            "perpendicular_midspan_added_M_kNm_per_m":1.35*wall*L/4,
            "parallel_wall_one1200_panel_added_G_kN_per_m2":wall/1.2,
            "parallel_wall_one1200_panel_R_kN":strip(qd+1.35*wall/1.2,c)["R_each_kN_per_m"]*1.2,
            "parallel_wall_one1200_panel_M_kNm":strip(qd+1.35*wall/1.2,c)["M_mid_kNm_per_m"]*1.2,
            "base_R_kN_per_m":base["R_each_kN_per_m"],"base_M_kNm_per_m":base["M_mid_kNm_per_m"]})
    # Entrance: defined side-patch axes, not source-wall/arch capacities.
    ent=support["entrance"]; patches=ent["finite_side_support_patches"]
    bridge_span=(sum(patches[1])/2-sum(patches[0])/2)/1000
    depth=ent["bridge_depth"]/1000
    L=(ent["short_side_member_support_axes_y"][1]-ent["short_side_member_support_axes_y"][0])/1000
    wp=qd*bridge_span/2; wb=1.35*.5
    entrance={"bridge_between_side_axes_m":bridge_span,"bridge_loaded_depth_m":depth,
        "each_side_member_span_m":L,"side_member_G_hypothesis_kN_per_m":.5,
        "each_side_floor_patch_load_kN_per_m":wp,
        "each_of_four_supports_kN":wp*depth/2+wb*L/2,
        "side_member_M_max_kNm":wp*depth*(2*L-depth)/8+wb*L*L/8,
        "floor_only_total_kN":qd*bridge_span*depth,
        "floor_only_M_between_side_axes_kNm_per_m":qd*bridge_span**2/8,
        "guard_stair_point_loads_included":False}
    assert math.isclose(4*entrance["each_of_four_supports_kN"],entrance["floor_only_total_kN"]+2*wb*L)
    stair=support["stair"]
    trim_x=sum(stair["inner_trimmer_patch_x"])/2
    header_y=sum(stair["short_header_patch_y"])/2
    trim_L=(stair["north_support_axis_y"]-header_y)/1000
    ordinary_centres=support["floor"]["trial_bearing_centres"]
    header_L=(ordinary_centres[1]-ordinary_centres[0])/1000
    header_a=(trim_x-ordinary_centres[0])/1000
    stair_cases=[]
    for trib in [.49,1.0]:
        for Pk in [0,10,20]:
            t=point_beam(trim_L,qd*trib+wb,1.5*Pk,trim_L/2)
            header=point_beam(header_L,wb,t["R_left_kN"],header_a)
            stair_cases.append({"tributary_width_hypothesis_m":trib,
                "additional_variable_point_hypothesis_kN":Pk,"trimmer":t,"header":header,
                "scope":"Not complete landing/stair/guard loading; north panel layout and selfweight unselected"})
    # Riser: header/receivers need individual design; variable P is not cabinet mass.
    riser=[]
    for short_L in [1.5,1.7]:
        for Pk in [0,2,5]:
            total=qd*.8*short_L/2+1.5*Pk
            riser.append({"shortened_unit_span_hypothesis_m":short_L,"cut_field_width_m":.8,
                "extra_variable_point_hypothesis_kN":Pk,"header_total_kN":total,
                "each_receiver_added_point_kN":total/2,
                "header_axis_span_hypothesis_m":.9,"header_central_floor_patch_width_m":.8,
                "header_M_central_patch_plus_central_point_kNm":
                (qd*.8*short_L/2)*(2*.9-.8)/8+(1.5*Pk)*.9/4,
                "scope":"Floor/point contributions only, excludes unknown header selfweight. No Peikko rating; 700mm x dimension is not this y-directed header span. Both receivers/contacts unselected"})
    wet=[{"water_depth_hypothesis_mm":h,"added_water_kN_per_m2":9.81*h/1000,
          "patch_area_hypothesis_m2":1,"volume_litres":h,
          "scope":"Water density1000kg/m3 and g9.81; no tray/overflow capacity or bounded flood level established"} for h in [25,50,100]]
    diaphragm=[]
    for p in [.5,1,1.5]:
        w=p*3.45; total=w*12; V=total/2; M=w*12**2/8
        diaphragm.append({"pressure_hypothesis_kPa":p,"assigned_storey_height_m":3.45,
            "facade_length_m":12,"total_floor_horizontal_kN":total,
            "simple_plan_beam_support_shear_kN":V,"plan_M_kNm":M,
            "chord_separation_hypothesis_m":11.335,"chord_force_kN":M/11.335,
            "wall_connection_spacing_hypothesis_m":1.2,"connection_force_kN":w*1.2,
            "scope":"Equilibrium demand only; assumed lateral supports/chords/collectors not a diaphragm model or site wind"})
    movement=[]
    for alpha in [8,10,12]:
        for temp in [10,20]:
            for shrink in [100,300,600]:
                strain=(alpha*temp+shrink)*1e-6
                movement.append({"alpha_microstrain_per_K":alpha,"cooling_magnitude_hypothesis_K":temp,
                    "shrinkage_hypothesis_microstrain":shrink,
                    "free_same_sign_strain":strain,"local3545_free_mm":strain*3545,
                    "global12000_free_mm":strain*12000,
                    "uncracked_fully_restrained_E33_stress_MPa":33000*strain,
                    "scope":"Same-sign shortening sensitivity, not actual movement, restraint stress or displacement at one joint"})
    return {"status":"Internal preliminary option reduction only; reference design, not released for construction or specimen loading",
        "source_main":"a86ad87950d007f862b6004769bbea56e8bfd946","source_sha256":PINS,
        "units":"Each key gives its units; kN, m, mm, MPa=N/mm2; 1kN/m=1N/mm",
        "assumptions":assumptions,"families":families,"reference_strips":reference,
        "load_sensitivity_strips":sensitivity,"RC_reference":rc,"RC_section_sensitivity":rc_sensitivity,
        "RC_stiffness_sensitivity":sls,"bearing_contact_sensitivity":bearings,
        "construction_stage_unfactored":stages,"shared140_clear_field_contributions":shared,
        "heavy_wall_core_kN_per_m":wall_core,"heavy_wall_two_plaster_faces_kN_per_m":wall_finish,
        "heavy_wall_cases":heavy,"entrance":entrance,"stair_scenarios":stair_cases,
        "riser_scenarios":riser,"wet_water_scenarios":wet,"diaphragm_equilibrium_scenarios":diaphragm,
        "free_movement_scenarios":movement,"inherited_riser_depth_cases":src["house-riser-product"]["depthCases"],
        "authored_untopped200_riser_depth_alternative":{
            "slab_top_mm":3370,"slab_soffit_mm":3170,"ceiling_top_mm":3115,
            "gross_service_space_before_hanger_protection_tolerance_mm":55,
            "upper_functions_mm":60,"finish_mm":20,"FFL_mm":3450,
            "scope":"New conditional assembly, not the accepted fixed3320-top case. Complete untopped diaphragm and upper functions remain to be established; no product pairing or clear service space pass"},
        "ordinary_two_panel_plan_hypothesis_m":[2.4,clear+.2],
        "two_panel_HC150_selfweight_hypothesis_kN":2.4*(clear+.2)*2.4,
        "limits":["No selected HC prestress/section resistance, RC detailing, masonry capacity, steel size or arch thrust-line check",
            "No complete loaded floor, construction sequence, fire, acoustics, vibration, waterproofing or material pass",
            "No actual site actions, products, loads, release criteria or geometry adoption"]}


def summary_svg(d):
    """A3 comparison plate: explicit budgets/data, not construction drawings."""
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188" role="img" aria-labelledby="title desc">',
         '<title id="title">Floor-edge options within the current depth envelope</title>',
         '<desc id="desc">Five unadopted floor assembly comparisons within a 350 mm envelope, with stated scenario demands. The untopped 200 mm hollowcore alternative changes the slab top to 3370 mm. No structural, product, specimen or construction release.</desc>',
         '<rect width="1680" height="1188" fill="#fff"/>',
         '<style>text{font-family:DejaVu Sans,sans-serif;fill:#162b36}.h{font-size:32px;font-weight:700}.s{font-size:19px}.tiny{font-size:17px}.bold{font-weight:700}.line{stroke:#52636b;stroke-width:2}</style>']
    def text(x,y,s,cls='s'):
        out.append(f'<text x="{x}" y="{y}" class="{cls}">{escape(s)}</text>')
    text(55,62,'PHY • Floor-edge internal comparison','h')
    text(55,98,'Declared scenarios on source-bound unadopted STR B; no geometry, member or specimen release.','s')
    text(55,143,'1  The same 350 mm envelope','s bold')
    text(55,172,'20 finish + 55 service reservation + 15 ceiling held; upper functions are unselected.','s')
    colors={'finish':'#bb9560','upper':'#dfe9d5','topping':'#a9b6c0','structure':'#9bafb9','service':'#e9f0f4','ceiling':'#a9a090'}
    top,scale=225,1.2
    for i,f in enumerate(d['families']):
        x=70+i*315; width=250; remaining=f['upper_functions_remaining_mm']
        text(x,207,f['id'],'s bold')
        layers=[('finish',20),('upper',max(0,remaining)),('topping',f['topping_mm']),('structure',f['depth_mm']),('service',55),('ceiling',15)]
        y=top
        for name,h in layers:
            if not h:continue
            out.append(f'<rect x="{x}" y="{y}" width="{width}" height="{h*scale}" fill="{colors[name]}" stroke="#fff"/>')
            if h>=30:text(x+10,y+h*scale/2+7,f'{name} {h} mm','tiny')
            y+=h*scale
        boundary=top+350*scale
        out.append(f'<line x1="{x-8}" y1="{boundary}" x2="{x+width+8}" y2="{boundary}" stroke="#a04c3d" stroke-width="2" stroke-dasharray="7,5"/>')
        text(x,693,f'Weight {f["self_kN_per_m2"]:.3f} kN/m²','tiny')
        text(x,722,(f'Upper reserve {remaining} mm' if remaining>=0 else '15 mm over budget'),'tiny bold')
        text(x,749,(f'Slab top {f["trial_slab_top_mm"]} mm' if remaining>=0 else 'before upper layers'),'tiny')
    text(55,787,'2  Ordinary 3.445 m clear field: equal 100 mm trial seats, 3.545 m reaction lines','s bold')
    text(55,819,'Gother=1.5, Q=2 kN/m²; 1.35G+1.5Q benchmark; end-seat strips included. No HC capacity inferred.','tiny')
    for i,f in enumerate(d['families']):
        row=next(r for r in d['reference_strips'] if r['family']==f['id'] and r['field']=='ordinary outer/court')
        x=70+i*315
        text(x,864,f'R = {row["R_each_kN_per_m"]:.2f} kN/m','s bold')
        text(x,896,f'M = {row["M_mid_kNm_per_m"]:.2f} kNm/m','s')
    text(55,949,'3  Selection consequences','s bold')
    lines=[
        'Direct bearing first; shared 140 mm tied/open-core construction is a separate supplier topology.',
        'Untopped HC200 at authored top 3370 differs from the fixed-top 3320 case; no inherited hanger pass.',
        'Entrance/stair/riser: design finite reactions and stages; RC200 is the separate solid-slab fallback.',
        'Structural joints/ties remain permanent. Renewable ceiling/service closures do not sever them.',
        'Representative assembly observation may earn access/closure evidence; no whole-floor or loaded-test pass.']
    for j,line in enumerate(lines):text(70,987+j*31,line,'s')
    text(55,1163,'Generated by floor-edge-internal.py • Numerical hypotheses and exact source fingerprints in accompanying JSON.','tiny')
    return '\n'.join(out+['</svg>'])+'\n'


def rounded(x):
    if isinstance(x,float):return round(x,9)
    if isinstance(x,dict):return {k:rounded(v) for k,v in x.items()}
    if isinstance(x,list):return [rounded(v) for v in x]
    return x


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    d=calculations(load_sources())
    outputs={HERE/'floor-edge-internal.json':json.dumps(rounded(d),indent=2,ensure_ascii=False)+'\n',
             HERE/'floor-edge-internal.svg':summary_svg(d)}
    for path,body in outputs.items():
        if args.check:
            if not path.exists() or path.read_text()!=body:raise ValueError(f'Stale output: {path}')
        else:path.write_text(body)
    print('Floor-edge source pins, equilibrium identities and deterministic outputs verified.' if args.check else 'Wrote floor-edge scenario JSON and A3 comparison SVG.')


if __name__=='__main__':main()
