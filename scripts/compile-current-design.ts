import { readFileSync } from 'node:fs'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'

const args = process.argv.slice(2)
const mode = ['--occupied-services', '--selected-water-event', '--bundle'].includes(args[0]) ? args.shift() : undefined
const [argument, ...extra] = args
try {
  if (!argument || extra.length || (mode && argument === '--read-georgian-source')) {
    throw new Error('Usage: compile-current-design.ts --read-georgian-source | [--occupied-services | --selected-water-event | --bundle] INPUT.json|-')
  }
  if (argument === '--read-georgian-source') {
    process.stdout.write(JSON.stringify(readGeorgianDesignSnapshot()) + '\n')
  } else {
    const text = readFileSync(argument === '-' ? 0 : argument, 'utf8')
    const input: unknown = JSON.parse(text)
    if (mode === '--bundle') {
      process.stdout.write(JSON.stringify(await compileCurrentDesignBundle(input)) + '\n')
    } else {
      const compile = prepareCurrentDesignCompile(input)
      if (mode === '--occupied-services') process.stdout.write((await compile.occupiedServices()).schedule)
      else if (mode === '--selected-water-event') process.stdout.write((await compile.selectedWaterEvent()).event)
      else process.stdout.write(JSON.stringify(compile.plans()) + '\n')
    }
  }
} catch (error) {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n')
  process.exitCode = 1
}
