#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Platform neutrality — this package exposes neutral intent only (for example the
// `drag-region` flag); mapping it onto a platform (-webkit-app-region, a runtime's IPC)
// belongs to the consumer's platform adapter layer. See the README section
// "Platform boundary — drag regions".
export const FORBIDDEN_PATTERNS = [
  /electron/i,
  /ipcRenderer/i,
  /webkit-app-region/i,
]

export function findForbiddenTokens(rootDir) {
  const violations = []

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        walk(fullPath)
        continue
      }
      if (!entry.endsWith('.ts')) continue
      const content = readFileSync(fullPath, 'utf8')
      content.split('\n').forEach((line, i) => {
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(line)) {
            violations.push(`${fullPath}:${i + 1}: matches ${pattern} — "${line.trim()}"`)
          }
        }
      })
    }
  }

  walk(rootDir)
  return violations
}

function main() {
  const violations = findForbiddenTokens(join(process.cwd(), 'src'))
  if (violations.length > 0) {
    console.error('platform-neutrality guard failed — forbidden tokens found in src/:\n')
    violations.forEach((v) => console.error('  ' + v))
    process.exit(1)
  }
  console.log('platform-neutrality guard passed — no forbidden tokens in src/.')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
