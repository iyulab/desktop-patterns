import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findForbiddenTokens } from './check-forge-tokens.mjs'

test('findForbiddenTokens returns no violations for clean source', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dp-guard-'))
  writeFileSync(join(dir, 'clean.ts'), 'export const x = 1\n')
  const violations = findForbiddenTokens(dir)
  assert.deepEqual(violations, [])
  rmSync(dir, { recursive: true, force: true })
})

test('findForbiddenTokens flags a forge-domain token with file and line', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dp-guard-'))
  writeFileSync(join(dir, 'bad.ts'), 'export const licenseTier = "free"\n')
  const violations = findForbiddenTokens(dir)
  assert.equal(violations.length, 1)
  assert.match(violations[0], /bad\.ts:1/)
  rmSync(dir, { recursive: true, force: true })
})

test('findForbiddenTokens flags a platform-specific token (electron)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dp-guard-'))
  writeFileSync(join(dir, 'bad.ts'), "import { ipcRenderer } from 'electron'\n")
  const violations = findForbiddenTokens(dir)
  assert.equal(violations.length, 2)
  rmSync(dir, { recursive: true, force: true })
})

test('findForbiddenTokens flags a hardcoded -webkit-app-region', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dp-guard-'))
  writeFileSync(join(dir, 'bad.ts'), "const style = '-webkit-app-region: drag'\n")
  const violations = findForbiddenTokens(dir)
  assert.equal(violations.length, 1)
  rmSync(dir, { recursive: true, force: true })
})

test('findForbiddenTokens ignores non-.ts files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dp-guard-'))
  writeFileSync(join(dir, 'notes.md'), 'this mentions forge and electron freely\n')
  const violations = findForbiddenTokens(dir)
  assert.deepEqual(violations, [])
  rmSync(dir, { recursive: true, force: true })
})

test('findForbiddenTokens recurses into subdirectories', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dp-guard-'))
  const nested = join(dir, 'components', 'widget')
  writeFileSync(join(dir, 'clean.ts'), 'export const x = 1\n')
  mkdirSync(nested, { recursive: true })
  writeFileSync(join(nested, 'bad.ts'), '// telemetry hook here\n')
  const violations = findForbiddenTokens(dir)
  assert.equal(violations.length, 1)
  assert.match(violations[0], /bad\.ts:1/)
  rmSync(dir, { recursive: true, force: true })
})
