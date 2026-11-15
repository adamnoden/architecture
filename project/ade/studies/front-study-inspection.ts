import { inspectGeorgianFrontStudyBay } from '../../../compiler/reference-house/construction-bay/opening-inspection.js'

const { schema, purpose, source, units, datum, model, row, technicalBayApplicability, references } = inspectGeorgianFrontStudyBay()
process.stdout.write(`${JSON.stringify({ schema, purpose, source, units, datum, cutout: model.cutout, row, technicalBayApplicability, references }, null, 2)}\n`)
