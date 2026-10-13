// Numeric tolerances are classified by operation, not centralised into one global epsilon.
// Preserve these values unless a semantic-change review demonstrates that comparison behaviour should change.
export const BOX_GEOMETRY_EPSILON = 1e-9
export const MODEL_COORDINATE_EPSILON_MM = 1e-6
export const MODEL_AREA_EPSILON_MM2 = 1e-6
