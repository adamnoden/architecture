import { readFileSync } from 'node:fs'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'

const args = process.argv.slice(2)
const modes = ['--occupied-services', '--selected-water-event', '--structural-bridge', '--structural-actions',
  '--bundle', '--read-court-intake', '--court-intake', '--study-assembly']
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
    if (mode === '--court-intake') {
      if (!input || typeof input !== 'object' || Object.keys(input).length !== 3 ||
        !('schema' in input) || input.schema !== 'rwt-court-intake-request/1' ||
        !('design' in input) || !('intake' in input)) {
        throw new Error('Expected a versioned court intake request with an explicit design and case')
      }
      const compile = prepareCurrentDesignCompile(input.design)
      process.stdout.write(JSON.stringify(await compile.courtIntake(input.intake)) + '\n')
    } else if (mode === '--bundle') {
      process.stdout.write(JSON.stringify(await compileCurrentDesignBundle(input)) + '\n')
    } else {
      const compile = prepareCurrentDesignCompile(input)
      if (mode === '--read-court-intake') process.stdout.write(JSON.stringify(await compile.readCourtIntakeCase(), null, 2) + '\n')
      else if (mode === '--occupied-services') process.stdout.write((await compile.occupiedServices()).schedule)
      else if (mode === '--selected-water-event') process.stdout.write((await compile.selectedWaterEvent()).event)
      else if (mode === '--structural-bridge') process.stdout.write(JSON.stringify(await compile.structuralBridge()) + '\n')
      else if (mode === '--structural-actions') process.stdout.write(JSON.stringify(await compile.structuralActions()) + '\n')
      else if (mode === '--study-assembly') process.stdout.write(JSON.stringify(await compile.studyAssembly()) + '\n')
      else process.stdout.write(JSON.stringify(compile.plans()) + '\n')
    }
  }
} catch (error) {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n')
  process.exitCode = 1
}
