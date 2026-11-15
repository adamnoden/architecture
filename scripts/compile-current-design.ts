import { readFileSync } from 'node:fs'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'

type Compile = ReturnType<typeof prepareCurrentDesignCompile>
type TrialMode = {
  readonly schema: string
  readonly key: string
  readonly name: string
  readonly run: (compile: Compile, value: unknown) => Promise<unknown>
}
const trialModes: Readonly<Record<string, TrialMode>> = {
  '--court-intake': {
    schema: 'rwt-court-intake-request/1', key: 'intake', name: 'court intake',
    run: (compile, value) => compile.courtIntake(value),
  },
  '--structural-case': {
    schema: 'str-structural-case-request/1', key: 'case', name: 'structural',
    run: (compile, value) => compile.structuralCase(value),
  },
  '--structural-interfaces': {
    schema: 'str-interface-request/1', key: 'replay', name: 'structural interfaces',
    run: (compile, value) => compile.structuralInterfaces(value),
  },
  '--east-ground-receiving': {
    schema: 'rwt-east-ground-receiving-request/1', key: 'receiving', name: 'east ground receiving',
    run: (compile, value) => compile.eastGroundReceiving(value),
  },
  '--inlet-route': {
    schema: 'had-inlet-route-request/1', key: 'inlet', name: 'inlet route',
    run: (compile, value) => compile.inletRoute(value),
  },
  '--occupied-condensate': {
    schema: 'had-condensate-request/1', key: 'condensate', name: 'occupied condensate',
    run: (compile, value) => compile.occupiedCondensate(value),
  },
}

async function runTrial(input: unknown, trial: TrialMode) {
  const request = input as Readonly<Record<string, unknown>>
  if (!request || typeof request !== 'object' || Object.keys(request).length !== 3
      || request.schema !== trial.schema || !Object.hasOwn(request, 'design') || !Object.hasOwn(request, trial.key)) {
    throw new Error(`Expected a versioned ${trial.name} request with an explicit design and case`)
  }
  return trial.run(prepareCurrentDesignCompile(request.design), request[trial.key])
}

const args = process.argv.slice(2)
const modes = [
  '--occupied-services', '--selected-water-event', '--structural-bridge', '--structural-actions',
  '--bundle', '--study-assembly', '--study-linings', '--renewable-openings',
  '--read-court-intake', '--read-inlet-route', '--read-east-ground-receiving',
  '--read-occupied-condensate', '--read-structural-case', '--read-structural-interfaces', ...Object.keys(trialModes),
]
const mode = modes.includes(args[0]) ? args.shift() : undefined
const [argument, ...extra] = args
try {
  if (!argument || extra.length || (mode && argument === '--read-georgian-source')) {
    throw new Error(`Usage: compile-current-design.ts --read-georgian-source | [${modes.join(' | ')}] INPUT.json|-`)
  }
  if (argument === '--read-georgian-source') {
    process.stdout.write(JSON.stringify(readGeorgianDesignSnapshot()) + '\n')
  } else {
    const text = readFileSync(argument === '-' ? 0 : argument, 'utf8')
    const input: unknown = JSON.parse(text)
    if (mode && Object.hasOwn(trialModes, mode)) {
      process.stdout.write(JSON.stringify(await runTrial(input, trialModes[mode])) + '\n')
    } else if (mode === '--renewable-openings') {
      if (!input || typeof input !== 'object' || !('schema' in input) || input.schema !== 'renewable-opening-request/1'
        || !('design' in input) || Object.keys(input).some(key => !['schema', 'design', 'study'].includes(key))) {
        throw new Error('Expected a versioned renewable-opening request with an explicit design')
      }
      const compile = prepareCurrentDesignCompile(input.design)
      process.stdout.write(JSON.stringify(await compile.renewableOpenings('study' in input ? input.study : undefined)) + '\n')
    } else if (mode === '--bundle') {
      process.stdout.write(JSON.stringify(await compileCurrentDesignBundle(input)) + '\n')
    } else {
      const compile = prepareCurrentDesignCompile(input)
      if (mode === '--read-court-intake') process.stdout.write(JSON.stringify(await compile.readCourtIntakeCase(), null, 2) + '\n')
      else if (mode === '--read-east-ground-receiving') process.stdout.write(JSON.stringify(await compile.readEastGroundReceivingCase(), null, 2) + '\n')
      else if (mode === '--read-inlet-route') process.stdout.write(JSON.stringify(await compile.readInletRouteCases(), null, 2) + '\n')
      else if (mode === '--read-occupied-condensate') process.stdout.write(JSON.stringify(await compile.readOccupiedCondensateCase(), null, 2) + '\n')
      else if (mode === '--read-structural-case') process.stdout.write(JSON.stringify(await compile.readStructuralCase(), null, 2) + '\n')
      else if (mode === '--read-structural-interfaces') process.stdout.write(JSON.stringify(await compile.readStructuralInterfaces(), null, 2) + '\n')
      else if (mode === '--occupied-services') process.stdout.write((await compile.occupiedServices()).schedule)
      else if (mode === '--selected-water-event') process.stdout.write((await compile.selectedWaterEvent()).event)
      else if (mode === '--structural-bridge') process.stdout.write(JSON.stringify(await compile.structuralBridge()) + '\n')
      else if (mode === '--structural-actions') process.stdout.write(JSON.stringify(await compile.structuralActions()) + '\n')
      else if (mode === '--study-assembly') process.stdout.write(JSON.stringify(await compile.studyAssembly()) + '\n')
      else if (mode === '--study-linings') process.stdout.write(JSON.stringify(await compile.studyLinings()) + '\n')
      else process.stdout.write(JSON.stringify(compile.plans()) + '\n')
    }
  }
} catch (error) {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n')
  process.exitCode = 1
}
