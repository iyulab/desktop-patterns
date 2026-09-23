# desktop-patterns

App-shell and structural layout patterns assembled on top of
[`desktop-compact`](https://github.com/iyulab/desktop-compact)'s primitives. Framework-neutral custom
elements ([Lit](https://lit.dev)), zero built-in strings, every content region a slot.

Structure only — atomic controls (buttons, inputs, dialogs) belong in `desktop-compact`; native
platform integration (file dialogs, tray, window control) belongs in
[`electron-kit`](https://github.com/iyulab/electron-kit). This package doesn't call any platform API
itself, and knows nothing about any specific consuming application.

## Install

Requires Node ≥22.

```bash
npm install @iyulab/desktop-patterns @iyulab/desktop-compact
```

Import only the components you use — each ships as its own subpath for tree-shaking:

```ts
import '@iyulab/desktop-patterns/shell'
import '@iyulab/desktop-patterns/sidebar'
```

Or import everything via the barrel:

```ts
import '@iyulab/desktop-patterns'
```

## Usage

```html
<dp-shell sidebar-open>
  <dp-sidebar slot="sidebar" active-id="overview" header="My App" id="nav"></dp-sidebar>
  <dp-toolbar slot="toolbar" heading="My App" show-toggle></dp-toolbar>
  <dp-page>
    <h2>Overview</h2>
    <p>Main content.</p>
  </dp-page>
</dp-shell>
```

`items`/`bottomItems` are arrays, so they're set as JS properties (not plain HTML attributes) — same
as any Lit custom element:

```ts
document.querySelector<HTMLElementTagNameMap['dp-sidebar']>('#nav')!.items = [
  { id: 'overview', icon: '■', label: 'Overview' },
]

document.querySelector('dp-sidebar')!.addEventListener('dp-sidebar-select', (e) => {
  // consumer owns activeId / routing
})
document.querySelector('dp-toolbar')!.addEventListener('dp-toolbar-toggle', () => {
  // consumer owns sidebar-open state on dp-shell
})
```

Every component takes its user-facing text as a plain attribute/property or slot — there is no
built-in i18n layer. See each component's Storybook story (`npm run storybook`) for its full API.

## Theming

Import both token sheets once in your app's global stylesheet:

```ts
import '@iyulab/desktop-compact/tokens.css'
import '@iyulab/desktop-patterns/tokens.css'
```

Color/spacing/radius/typography all come from `desktop-compact`'s `--dc-*` tokens — this package adds
only the structural dimensions `desktop-compact` has no concept of (`--dp-sidebar-width`,
`--dp-sidebar-width-collapsed`, `--dp-header-height`). Every component ships with sane fallback
values, so it still renders correctly even without either stylesheet.

## Platform boundary — drag regions

`dp-toolbar` exposes a neutral `drag-region` flag (not the native `draggable`, which already means
something else) but never emits any platform-specific CSS itself. The flag reflects to the host
attribute, but the actual drag surface is a dedicated `part="drag-handle"` spacer between the start
group and the `actions` slot — never the whole host — so the mapping can never reach the toggle
button or slotted actions. Mapping that part to an actual window-drag behavior (e.g.
`-webkit-app-region: drag` in Electron/Chromium-based webviews) is `electron-kit`'s job:

```css
dp-toolbar[drag-region]::part(drag-handle) {
  -webkit-app-region: drag;
}
```

`dp-shell` does not mark any drag region of its own — it has no opinion on what's slotted into
`toolbar`, so ownership of the drag handle stays entirely with whatever renders there (typically
`dp-toolbar`).

## Components (v1 — complete, 5/5)

| Component | Description |
|---|---|
| `dp-page` | Scrollable content region with a centered, max-width column — the page-body every view renders into |
| `dp-sidebar` | App-shell navigation rail — expanded/collapsed states, an optional pinned bottom group, a `footer` slot for whatever a consumer wants to anchor there |
| `dp-toolbar` | App-shell header bar — `heading`/`subtitle`, an optional collapse toggle, a right-side `actions` slot |
| `dp-shell` | Top-level layout composing `sidebar`/`toolbar`/`banner`/main-content regions, with a responsive drawer (backdrop + overlay sidebar) below a 1024px breakpoint |
| `dp-shortcut-overlay` | Display-only keyboard-shortcuts help panel — a `shortcuts` list + `open` flag; no registration/binding infrastructure (that stays the consumer's) |

Run `npm run storybook` to browse every component interactively, including `dp-shell` composing real
`dp-sidebar`+`dp-toolbar`+`dp-page` together.

## Accessibility

Every component ships with an axe accessibility test as part of its test suite (`npm test`). Landmarks
follow ARIA APG conventions — `dp-sidebar` uses a semantic `<nav>` (no redundant host-level role),
`dp-shortcut-overlay` uses `role="dialog"` with `aria-labelledby` pointing at its visible heading.

## Development

```bash
npm install
npm test              # @web/test-runner, real Chromium
npm run typecheck
npm run guard          # forge-ignorance + platform-agnosticism scan (this package must stay domain-neutral and platform-neutral)
npm run build          # per-component ESM output, type declarations
npm run storybook      # interactive component browser
```

`@iyulab/desktop-compact` is a **peer** dependency: this package reads its `--dc-*` tokens but never
imports its code, so the consumer installs one copy and both packages share it. A regular dependency
would give a consumer on a newer `desktop-compact` minor a second, unused copy nested under this
package.

## License

MIT
