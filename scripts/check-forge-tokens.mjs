#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// forge-ignorance (same list as desktop-compact — this repo must not know forge
// domain concepts either).
const FORGE_PATTERNS = [
  /forge/i,
  /license/i,
  /telemetry/i,
  /\.fex\b/i,
  /engine:/i,
  /guard/i,
]

// platform-agnosticism — desktop-patterns exposes a neutral `draggable` flag
// only; the actual platform mapping (-webkit-app-region, ipcRenderer, etc.)
// belongs to electron-kit. See docs/superpowers/specs/2026-09-02-desktop-patterns-design.md
// "플랫폼 API 경계".
const PLATFORM_PATTERNS = [
  /electron/i,
  /ipcRenderer/i,
  /webkit-app-region/i,
]

export const FORBIDDEN_PATTERNS = [...FORGE_PATTERNS, ...PLATFORM_PATTERNS]

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
    console.error('forge-ignorance/platform-agnosticism guard failed — forbidden tokens found in src/:\n')
    violations.forEach((v) => console.error('  ' + v))
    process.exit(1)
  }
  console.log('forge-ignorance/platform-agnosticism guard passed — no forbidden tokens in src/.')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
