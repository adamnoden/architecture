import {execFileSync, spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'

// Keep this launcher free of repository imports. Each attempt must load the
// programme and its guard in a NEW process after selecting its immutable source.
const freshnessError = 'Briefing requires clean canonical main sources; only generated projection advances are tolerated'
const git = args => execFileSync('git', args, {encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'pipe']}).trim()
const clean = () => !git(['status', '--porcelain', '--untracked-files=no'])
const dependencyIdentity = () => createHash('sha256').update(JSON.stringify(
  ['package.json', 'package-lock.json', '.npmrc'].map(path => [path, existsSync(path) ? readFileSync(path, 'utf8') : null])
)).digest('hex')
const isAncestor = (before, after) => {
  try {git(['merge-base', '--is-ancestor', before, after]); return true}
  catch {return false}
}

function report() {
  const root = git(['rev-parse', '--show-toplevel'])
  if (process.env.GITHUB_ACTIONS !== 'true' || resolve(process.env.GITHUB_WORKSPACE ?? '') !== root) {
    throw new Error('Fresh reporting requires the disposable GitHub Actions checkout at GITHUB_WORKSPACE')
  }
  if (!clean()) throw new Error('Fresh reporting refuses a dirty source checkout')
  const nodeRequest = readFileSync('.nvmrc', 'utf8')
  let installed = dependencyIdentity()

  for (let attempt = 1; attempt <= 3; attempt++) {
    git(['fetch', 'origin', 'main', '--quiet'])
    const previous = git(['rev-parse', 'HEAD'])
    const source = git(['rev-parse', 'refs/remotes/origin/main'])
    if (!clean() || !isAncestor(previous, source)) {
      throw new Error('Fresh reporting refuses dirty or divergent source history')
    }
    git(['checkout', '--detach', source])
    if (readFileSync('.nvmrc', 'utf8') !== nodeRequest) {
      throw new Error('Node requirement changed during setup; start a new report job with the current toolchain')
    }
    const dependencies = dependencyIdentity()
    if (dependencies !== installed) {
      console.log('Main dependency inputs changed; installing their exact locked tree before reporting')
      execFileSync('npm', ['ci', '--no-audit', '--no-fund'], {stdio: 'inherit', timeout: 300000})
      installed = dependencies
    }
    if (!clean()) throw new Error('Dependency setup changed tracked source files; refusing report')
    console.log(`Reporting from ${source}, attempt ${attempt}/3`)
    const child = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/control-operations.ts', 'brief', ...process.argv.slice(2)], {
      encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024
    })
    if (child.error) throw child.error
    if (child.stdout) process.stdout.write(child.stdout)
    if (child.status === 0) {
      if (child.stderr) process.stderr.write(child.stderr)
      return 0
    }

    // Never retry an unknown-claims report, transport failure or generic error.
    // The existing guard is unchanged; the runner retries only a proved advance.
    if (child.status === 1 && child.stderr.includes(freshnessError) && clean()) {
      git(['fetch', 'origin', 'main', '--quiet'])
      const advanced = git(['rev-parse', 'refs/remotes/origin/main'])
      if (advanced !== source && isAncestor(source, advanced) && attempt < 3) {
        console.log(`Main advanced to ${advanced}; retrying with a freshly loaded source process`)
        continue
      }
    }
    if (child.stderr) process.stderr.write(child.stderr)
    return child.status ?? 1
  }
  throw new Error('Fresh report retry bound exhausted')
}

try {process.exitCode = report()}
catch (error) {console.error(String(error)); process.exitCode = 1}
