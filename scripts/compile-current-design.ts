import { readFileSync } from 'node:fs'
import { compileCurrentDesign } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'

const [argument, ...extra] = process.argv.slice(2)
try {
  if (!argument || extra.length) {
    throw new Error('Usage: compile-current-design.ts --read-georgian-source | INPUT.json | -')
  }
  if (argument === '--read-georgian-source') {
    process.stdout.write(JSON.stringify(readGeorgianDesignSnapshot()) + '\n')
  } else {
    const text = readFileSync(argument === '-' ? 0 : argument, 'utf8')
    const compiled = compileCurrentDesign(JSON.parse(text))
    process.stdout.write(JSON.stringify(compiled) + '\n')
  }
} catch (error) {
  process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n')
  process.exitCode = 1
}
