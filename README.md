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
<dp-shell>
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

import { desktopMinWidth } from '@iyulab/desktop-patterns/breakpoints' // no elements registered

const shell = document.querySelector('dp-shell')!
const sidebar = document.querySelector('dp-sidebar')!
const toolbar = document.querySelector('dp-toolbar')!
const wide = matchMedia(`(min-width: ${desktopMinWidth}px)`)
let collapsed = false // the consumer's own state: a wide window's sidebar folded to its rail

function sync() {
  sidebar.collapsed = collapsed && wide.matches // a drawer always shows the whole sidebar
  toolbar.expanded = wide.matches ? !collapsed : shell.sidebarOpen
}
wide.addEventListener('change', sync)
sidebar.addEventListener('dp-sidebar-select', () => {
  // consumer owns activeId / routing
})
sidebar.addEventListener('dp-sidebar-activate', () => {
  shell.sidebarOpen = false // a drawer gives way to what was picked — the place already shown included
  sync()
})
toolbar.addEventListener('dp-toolbar-toggle', () => {
  if (wide.matches) collapsed = !collapsed
  else shell.sidebarOpen = !shell.sidebarOpen
  sync()
})
shell.addEventListener('dp-shell-sidebar-close', () => { shell.sidebarOpen = false; sync() }) // backdrop, Escape
```

Below the desktop breakpoint (`desktopMinWidth`, 1024px — `desktopMedia` for a component's styles)
the sidebar is a drawer over the content, open while `sidebar-open` is set; at and above it the
sidebar sits beside the content and `sidebar-open` changes nothing. The same toolbar toggle serves
both widths: in a narrow window it opens the drawer, in a wide one it folds the sidebar to its
collapsed rail (`dp-sidebar` `collapsed`). Give the toggle `expanded` so assistive technology hears
which state it is in. The consumer owns both states — start the drawer closed, close it when the
shell asks (backdrop click, Escape) and when a place is picked, or a narrow window stays covered.

### A list beside the item picked from it

```html
<dp-page fill max-width="full">
  <dp-list-detail>
    <nav slot="list" aria-label="People">…</nav>
    <article>…the person picked…</article>
  </dp-list-detail>
</dp-page>
```

`dp-list-detail` puts the `list` slot beside the default slot, each scrolling on its own, the list
`--dp-list-detail-list-width` wide (by default the sidebar's width — navigation, list and item read as
1:1:rest). Below the desktop breakpoint there is room for one pane: the item while `detail-open` is
set, the list otherwise. The consumer owns `detail-open` — set it when an item is picked, and give
the item a way back that clears it, shown only below `desktopMinWidth`.

### Sidebar items: links, groups, icons, actions

```ts
nav.items = [
  { id: 'overview', icon: '■', label: 'Overview', href: '/overview' }, // href → rendered as <a>
  {
    id: 'work', label: 'Work', collapsed: false,                        // a group: a disclosure over its items
    items: [{ id: 'runs', icon: '▶', label: 'Runs', href: '/runs' }],
  },
]
nav.bottomItems = [{ id: 'sign-out', icon: '⎋', label: 'Sign out' }]  // actions, not places
nav.setAttribute('nav-label', 'Main')                                 // names the navigation landmark
```

- **`href`** renders the item as a link, so a router's link interception (or the browser) does the navigating.
  `dp-sidebar-select` still fires and is cancelable — `preventDefault()` cancels the navigation and keeps the
  active item. A modified click (Ctrl/⌘/Shift/Alt, middle button) opens the link elsewhere and selects nothing.
  Items without `href` stay buttons and the consumer navigates on `dp-sidebar-select`.
- **Groups** (`{ id, label, items, icon?, collapsed? }`) render as a named `role="group"` under a disclosure
  button (`aria-expanded`). A group holding the active item is always open. In the collapsed rail every group's
  items show, separated by a rule.
- **Icons**: each item's icon is a slot named `icon-<id>` whose fallback is the item's `icon` text — slot any icon
  element (`<svg slot="icon-overview">`) to replace it.
- **`dp-sidebar-activate`** fires on every pick of a navigation item, the active one included (after
  `dp-sidebar-select` when the place changes; not when that was cancelled). Close a drawer on it: picking the
  place already shown still means "take me there", and `dp-sidebar-select` does not fire for it.
- **Bottom items are actions**: each click fires `dp-sidebar-action` (`itemId`) — every time, so a failed action can
  be retried — and never moves `aria-current`. (In 0.2.x they fired `dp-sidebar-select` and took the active mark.)

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
`--dp-sidebar-width-collapsed`, `--dp-header-height`, `--dp-list-detail-list-width`). Every component ships with sane fallback
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

## Components

| Component | Description |
|---|---|
| `dp-page` | Scrollable content region with a centered, max-width column — the page-body every view renders into. With `fill` it does not scroll and its column is as tall as the region, for a view that scrolls its own parts (a list beside the item open) |
| `dp-list-detail` | A list beside the item picked from it (master-detail) — each pane scrolls on its own; one pane at a time below 1024px, the item while `detail-open` is set |
| `dp-sidebar` | App-shell navigation rail — expanded/collapsed states, an optional pinned bottom group, a `footer` slot for whatever a consumer wants to anchor there |
| `dp-toolbar` | App-shell header bar — `heading`/`subtitle`, an optional sidebar toggle (drawer in a narrow window, collapse in a wide one), a right-side `actions` slot |
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
