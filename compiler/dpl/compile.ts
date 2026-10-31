import { createReferenceHouseSource } from '../reference-house/fixture.js'
import type { DeploymentCaseInput, DeploymentLedger } from './model.js'
import { evaluateDeploymentCase } from './evaluate.js'

/** Existing convenience entry point; evaluation itself takes explicit source authority. */
export const compileDeploymentCase = (input: DeploymentCaseInput): DeploymentLedger =>
  evaluateDeploymentCase(input, createReferenceHouseSource())
