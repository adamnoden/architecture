import { readFileSync } from 'node:fs'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'
import { compileEngineeringDocument, readEngineeringDocument, readRetainedInletComparisonDocument } from '../compiler/reference-house/current-design/engineering-document.js'

type Compile = ReturnType<typeof prepareCurrentDesignCompile>
type TrialMode = {
  readonly schema: string
  readonly key: string
  readonly name: string
  readonly run: (compile: Compile, value: unknown) => Promise<unknown>
}
const trialModes: Readonly<Record<string, TrialMode>> = {
  '--study-room-kit': {
    schema: 'ias-study-room-kit-request/1', key: 'kit', name: 'Study room kit',
    run: (compile, value) => compile.studyRoomKit(value),
  },
  '--study-draft-room-kit': {
    schema: 'ias-study-draft-request/1', key: 'draftCase', name: 'Study draft room kit',
    run: (compile, value) => compile.studyDraftRoomKit(value),
  },
  '--roof-pitch': {
    schema: 'mat-roof-pitch-request/1', key: 'roof', name: 'roof pitch',
    run: (compile, value) => compile.roofPitch(value),
  },
  '--court-intake': {
    schema: 'rwt-court-intake-request/1', key: 'intake', name: 'court intake',
    run: (compile, value) => compile.courtIntake(value),
  },
  '--structural-successor': {
    schema: 'str-successor-request/1', key: 'successor', name: 'structural successor',
    run: (compile, value) => compile.structuralSuccessorCase(value),
  },
  '--retained-components': {
    schema: 'str-retained-contact-request/1', key: 'retained', name: 'retained components',
    run: (compile, value) => compile.retainedComponentCase(value),
  },
  '--ground-section': {
    schema: 'str-dry-ground-request/1', key: 'ground', name: 'dry ground section',
    run: (compile, value) => compile.groundSectionCase(value),
  },
  '--house-vertical-profile': {
    schema: 'house-vertical-profile-request/1', key: 'profile', name: 'house vertical profile',
    run: (compile, value) => compile.houseVerticalProfileCase(value),
  },
  '--distributed-floor': {
    schema: 'str-distributed-floor-request/1', key: 'floor', name: 'distributed floor',
    run: (compile, value) => compile.distributedFloorCase(value),
  },
  '--joined-rc-floor': {
    schema: 'str-current-rc-floor-request/1', key: 'joined', name: 'joined RC floor',
    run: (compile, value) => compile.joinedRcFloorCase(value),
  },
  '--masonry-frame': {
    schema: 'str-current-masonry-frame-request/1', key: 'masonry', name: 'separate masonry frame',
    run: (compile, value) => compile.masonryFrameCase(value),
  },
  '--vertical-rc-floor': {
    schema: 'str-current-vertical-rc-floor-request/1', key: 'vertical', name: 'vertical RC floor',
    run: (compile, value) => compile.verticalRcFloorCase(value),
  },
  '--structural-case': {
    schema: 'str-structural-case-request/1', key: 'case', name: 'structural',
    run: (compile, value) => compile.structuralCase(value),
  },
  '--structural-interfaces': {
    schema: 'str-interface-request/1', key: 'replay', name: 'structural interfaces',
    run: (compile, value) => compile.structuralInterfaces(value),
  },
  '--north-collector': {
    schema: 'str-north-collector-request/1', key: 'collector', name: 'north collector',
    run: (compile, value) => compile.northCollectorCase(value),
  },
  '--rear-foul-vent': {
    schema: 'mat-rear-foul-vent-request/1', key: 'vent', name: 'rear foul vent',
    run: (compile, value) => compile.rearFoulVent(value),
  },
  '--east-ground-receiving': {
    schema: 'rwt-east-ground-receiving-request/1', key: 'receiving', name: 'east ground receiving',
    run: (compile, value) => compile.eastGroundReceiving(value),
  },
  '--inlet-route': {
    schema: 'had-inlet-route-request/1', key: 'inlet', name: 'inlet route',
    run: (compile, value) => compile.inletRoute(value),
  },
  '--inlet-sill-insert': {
    schema: 'had-inlet-sill-insert-request/1', key: 'insert', name: 'inlet sill insert',
    run: (compile, value) => compile.inletSillInsert(value),
  },
  '--inlet-fault': {
    schema: 'had-inlet-fault-request/1', key: 'fault', name: 'inlet fault envelope',
    run: (compile, value) => compile.inletFault(value),
  },
  '--inlet-cabinet': {
    schema: 'had-copper-cabinet-request/1', key: 'cabinet', name: 'copper inlet cabinet',
    run: (compile, value) => compile.inletCabinetCase(value),
  },
  '--fixed-inlet': {
    schema: 'had-fixed-inlet-request/1', key: 'fixed', name: 'fixed inlet',
    run: (compile, value) => compile.fixedInletCase(value),
  },
  '--inlet-removal': {
    schema: 'had-inlet-removal-request/1', key: 'removal', name: 'inlet removal',
    run: (compile, value) => compile.inletRemoval(value),
  },
  '--inlet-cover': {
    schema: 'had-inlet-cover-request/1', key: 'cover', name: 'inlet cover',
    run: (compile, value) => compile.inletCover(value),
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

async function runGroundedServiceFloor(input: unknown, readCase: boolean) {
  const request = input as Readonly<Record<string, unknown>>
  const keys = readCase ? ['schema', 'design', 'ground'] : ['schema', 'design', 'groundSection', 'serviceFloor']
  const schema = readCase ? 'str-dry-ground-request/1' : 'had-grounded-service-floor-request/1'
  if (!request || typeof request !== 'object' || Array.isArray(request) || Object.keys(request).length !== keys.length
      || request.schema !== schema || keys.some(key => !Object.hasOwn(request, key))) {
    throw new Error(readCase ? 'Expected an explicit versioned ground-section request to read the service floor'
      : 'Expected a grounded service-floor request with authored groundSection and serviceFloor cases')
  }
  const compile = prepareCurrentDesignCompile(request.design)
  const groundCase = readCase ? request.ground : request.groundSection
  const ground = await compile.groundSectionCase(groundCase)
  if (readCase) {
    const floor = await compile.readServiceFloorCase(ground)
    return { schema: 'had-grounded-service-floor-request/1', design: floor.design, groundSection: groundCase, serviceFloor: floor.serviceFloor }
  }
  return compile.serviceFloorCase(request.serviceFloor, ground)
}

const args = process.argv.slice(2)
const modes = [
  '--occupied-services', '--occupied-service-drawings', '--selected-water-event', '--structural-bridge', '--structural-actions',
  '--bundle', '--read-engineering', '--read-retained-inlet-comparison', '--study-assembly', '--study-linings', '--renewable-openings',
  '--read-service-floor', '--service-floor', '--read-vertical-rc-floor', '--read-masonry-frame', '--read-house-vertical-profile',
  '--read-roof-pitch', '--read-court-intake', '--read-inlet-route', '--read-east-ground-receiving',
  '--read-occupied-condensate', '--read-structural-successor', '--read-retained-components', '--read-ground-section', '--read-distributed-floor', '--read-joined-rc-floor', '--read-structural-case', '--read-structural-interfaces',
  '--read-north-collector', '--read-rear-foul-vent', '--read-inlet-sill-insert', '--read-inlet-fault', '--read-fixed-inlet', '--read-inlet-cabinet', '--read-inlet-removal', '--read-inlet-cover', ...Object.keys(trialModes),
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
    } else if (mode === '--read-service-floor' || mode === '--service-floor') {
      process.stdout.write(JSON.stringify(await runGroundedServiceFloor(input, mode === '--read-service-floor'), null, 2) + '\n')
    } else if (mode === '--renewable-openings') {
      if (!input || typeof input !== 'object' || !('schema' in input) || input.schema !== 'renewable-opening-request/1'
        || !('design' in input) || Object.keys(input).some(key => !['schema', 'design', 'study'].includes(key))) {
        throw new Error('Expected a versioned renewable-opening request with an explicit design')
      }
      const compile = prepareCurrentDesignCompile(input.design)
      process.stdout.write(JSON.stringify(await compile.renewableOpenings('study' in input ? input.study : undefined)) + '\n')
    } else if (mode === '--read-retained-inlet-comparison') {
      process.stdout.write(JSON.stringify(await readRetainedInletComparisonDocument(input), null, 2) + '\n')
    } else if (mode === '--read-engineering') {
      process.stdout.write(JSON.stringify(await readEngineeringDocument(input), null, 2) + '\n')
    } else if (mode === '--bundle') {
      const isEngineering = input !== null && typeof input === 'object' && 'schema' in input
        && input.schema === 'current-engineering-document/1'
      const bundle = isEngineering ? await compileEngineeringDocument(input) : await compileCurrentDesignBundle(input)
      process.stdout.write(JSON.stringify(bundle) + '\n')
    } else {
      const compile = prepareCurrentDesignCompile(input)
      if (mode === '--read-distributed-floor') process.stdout.write(JSON.stringify(await compile.readDistributedFloorCase(), null, 2) + '\n')
      else if (mode === '--read-joined-rc-floor') process.stdout.write(JSON.stringify(await compile.readJoinedRcFloorCase(), null, 2) + '\n')
      else if (mode === '--read-masonry-frame') process.stdout.write(JSON.stringify(await compile.readMasonryFrameCase(), null, 2) + '\n')
      else if (mode === '--read-vertical-rc-floor') process.stdout.write(JSON.stringify(await compile.readVerticalRcFloorCase(), null, 2) + '\n')
      else if (mode === '--read-ground-section') process.stdout.write(JSON.stringify(await compile.readGroundSectionCase(), null, 2) + '\n')
      else if (mode === '--read-house-vertical-profile') process.stdout.write(JSON.stringify(await compile.readHouseVerticalProfileCase(), null, 2) + '\n')
      else if (mode === '--read-roof-pitch') process.stdout.write(JSON.stringify(await compile.readRoofPitchCase(), null, 2) + '\n')
      else if (mode === '--read-court-intake') process.stdout.write(JSON.stringify(await compile.readCourtIntakeCase(), null, 2) + '\n')
      else if (mode === '--read-east-ground-receiving') process.stdout.write(JSON.stringify(await compile.readEastGroundReceivingCase(), null, 2) + '\n')
      else if (mode === '--read-inlet-route') process.stdout.write(JSON.stringify(await compile.readInletRouteCases(), null, 2) + '\n')
      else if (mode === '--read-occupied-condensate') process.stdout.write(JSON.stringify(await compile.readOccupiedCondensateCase(), null, 2) + '\n')
      else if (mode === '--read-structural-successor') process.stdout.write(JSON.stringify(await compile.readStructuralSuccessorCase(), null, 2) + '\n')
      else if (mode === '--read-retained-components') process.stdout.write(JSON.stringify(await compile.readRetainedComponentCase(), null, 2) + '\n')
      else if (mode === '--read-structural-case') process.stdout.write(JSON.stringify(await compile.readStructuralCase(), null, 2) + '\n')
      else if (mode === '--read-structural-interfaces') process.stdout.write(JSON.stringify(await compile.readStructuralInterfaces(), null, 2) + '\n')
      else if (mode === '--read-north-collector') process.stdout.write(JSON.stringify(await compile.readNorthCollectorCase(), null, 2) + '\n')
      else if (mode === '--read-rear-foul-vent') process.stdout.write(JSON.stringify(await compile.readRearFoulVentCase(), null, 2) + '\n')
      else if (mode === '--read-inlet-sill-insert') process.stdout.write(JSON.stringify(await compile.readInletSillInsertCase(), null, 2) + '\n')
      else if (mode === '--read-inlet-fault') process.stdout.write(JSON.stringify(await compile.readInletFaultCase(), null, 2) + '\n')
      else if (mode === '--read-inlet-cabinet') process.stdout.write(JSON.stringify(await compile.readInletCabinetCase(), null, 2) + '\n')
      else if (mode === '--read-fixed-inlet') process.stdout.write(JSON.stringify(await compile.readFixedInletCase(), null, 2) + '\n')
      else if (mode === '--read-inlet-removal') process.stdout.write(JSON.stringify(await compile.readInletRemovalCases(), null, 2) + '\n')
      else if (mode === '--read-inlet-cover') process.stdout.write(JSON.stringify(await compile.readInletCoverCases(), null, 2) + '\n')
      else if (mode === '--occupied-services') process.stdout.write((await compile.occupiedServices()).schedule)
      else if (mode === '--occupied-service-drawings') process.stdout.write(JSON.stringify(await compile.occupiedServiceDrawings()) + '\n')
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
