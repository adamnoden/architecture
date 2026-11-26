# Rear arch/slab tie API checkpoint

Work is deliberately paused while the ordinary perimeter frame/cage is primary. No helper is implemented or validated.

Read sources at890e6a65c113e4e1135cf82edd06cc8af2d15343:

| Source | Git blob |
|---|---|
|finite_joint_membrane_trace.py|f7765c95ef9a11a65600eb605bdc09dc8bf5bda7|
|vertical_rc_floor.py|841cf4075fcee0e536a1dac62b5e530f480ec13a|
|vertical_floor_plate.py|62c108491b153e171af7773acdb12f0a3655b04a|
|joined_successor_kernel.py|bbf1e80933260d0182db34d777427b68a361b2f0|

The existing compile_point_trace_floor wrapper partitions actual source rectangles without changing their union and retains CST u/v point work. That alone cannot transfer a horizontal tie at3170 from the CST midplane3270: the missing100mm lever needs real MITC4 rotations.

The unchanged assemble_vertical_plate API accepts explicit boundary_terms for coordinates0(w),1(theta_x),2(theta_y). Its assembled pointTerms/freePointDofs identify actual participating rotations. A source-owned wrapper can promote the two rotations at each real tie mesh point into retained ports, reassemble the SAME cells/law and condense with condense_vertical_plate. Existing external traces must be preserved. RetainedPointReceivers in build_vertical_rc_floor currently retains only scalarW at free slab points; adding an equal-XY frame node after condensation does not recover rotations.

The rebuild must REPLACE the existing plate energy AND source selfG condensation. Adding another plate operator would duplicate stiffness/mass. The old assembler/kernels need no edits, and current source identities/receipts must not be rewritten to imply a fresh case.

For dz=-100mm, u_x(3170)=u_CST_x-100theta_y(rad), u_y(3170)=u_CST_y+100theta_x(rad). If following native mrad port scaling these coefficients are-.1 and+.1; the port-to-frame maps convert back to physical radians. The transpose must deliver -100Fx/+100Fy kNmm, published as-.1Fx/+.1Fy kNm. A CST-only tie silently loses those moments.

Each restraint is a finite RELATIVE axial member between the actual wall point and actual slab work trace. No world-fixed node, gauge, ideal base key or fake rigid footprint. Pierbase UX/UY/Rz remain free. Two separatedX ties and oneY tie must pass actual material participation, action/reaction force-and-moment balance, rigid motion, finite compliance and exact work/units adverses before assembly into a house case. Compression-only real pier beds and the visible30mm arch tension tie have separate duties. Their capacities, source locations and complete system response remain unqualified.
