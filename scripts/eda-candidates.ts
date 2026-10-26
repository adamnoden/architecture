/** Non-authoritative EDA inspection. Flags are questions, never editorial verdicts. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { publicationEntries, primerPublicationEntries } from '../publication/publication.js'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { isPublicSource } from '../project/public-surface.js'

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
const ref = process.argv[2] ?? 'HEAD'
const baseline = git('rev-parse', ref).trim()
// Imports must describe the same membership as the requested source snapshot.
for (const path of ['publication/publication.ts', 'publication/adapters.ts', 'project/public-surface.ts', 'project/patterns.ts']) {
  if (git('show', `${baseline}:${path}`) !== readFileSync(path, 'utf8')) throw new Error(`Membership drift: ${path}`)
}
const sources = new Set(git('ls-tree', '-r', '--name-only', baseline).trim().split('\n').filter(p => p.endsWith('.md') && isPublicSource(p)))
for (const entry of [...publicationEntries, ...primerPublicationEntries]) {
  sources.add(entry.source)
  for (const path of dependenciesForAdapter(entry.adapter)) sources.add(path)
}
const files = [...sources].sort().map(source => {
  const text = git('show', `${baseline}:${source}`)
  const candidates: {line: number; flags: string[]; text: string}[] = []
  let offset = 0
  let fenced = false
  // Mask fenced blocks while retaining line positions; notation is not authored prose.
  const masked = text.split('\n').map(line => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return '' }
    return fenced ? '' : line
  }).join('\n')
  for (const block of masked.split(/\n\s*\n/)) {
    const pos = masked.indexOf(block, offset)
    offset = pos + block.length
    const s = block.trim()
    if (!s || /^(#|\||[-*] |>|\[|!|\d+[.)] )/.test(s) || /^[-*_ ]+$/.test(s) || /^\*\*(Status|Scope):/.test(s)) continue
    const plain = s.replace(/\*/g, '')
    const flags: string[] = []
    if ((plain.match(/[.!?](?:\s|$)/g) ?? []).length === 1) flags.push('single-sentence-paragraph')
    if (/^\*\*[^\n]+[.!?]\*\*\s*$/.test(s)) flags.push('sentence-bold')
    if (/\b(The question is|That is|This is)\b/.test(plain)) flags.push('announcement')
    if (plain.includes('?')) flags.push('question')
    if (/\bnot\b.{0,100}\bbut\b/i.test(plain)) flags.push('contrast-candidate')
    if (plain.split(/\s+/).length < 35 && /\n\s*(\* \* \*|---)\s*\n/.test(masked.slice(pos + block.length, pos + block.length + 20))) flags.push('short-before-rule')
    if (plain.split(/(?<=[.!?])\s+/).filter(s => s.split(/\s+/).length <= 9).length >= 3) flags.push('short-declarative-cluster')
    // Block quotations can carry staged emphasis too; these are handled below.
    if (flags.length) candidates.push({line: masked.slice(0,pos).split('\n').length, flags, text:s})
  }
  masked.split('\n').forEach((line, i) => {
    if (/^>\s*\*\*/.test(line)) candidates.push({line:i+1, flags:['bold-block-quotation'], text:line})
  })
  candidates.sort((a,b) => a.line-b.line)
  return {source, sha256:createHash('sha256').update(text).digest('hex'), words:text.trim().split(/\s+/).length, candidates}
})
const result = {baseline, authority:'EDA-01; imported publication manifests, canonical adapter dependencies and public-surface boundary', status:'Candidates only; dispositions require contextual review. Zero candidates is not conformance.', limitations:'Lexical heuristics miss paragraph-end morals, cadence recurrence and page staging. Generated prose is inventoried, not authority to edit projections.', files}
writeFileSync('docs/editorial/eda-02-candidates.json', JSON.stringify(result,null,2)+'\n')
console.log(`${files.length} sources; ${files.reduce((n,f)=>n+f.words,0)} words; ${files.reduce((n,f)=>n+f.candidates.length,0)} candidate paragraphs`)
