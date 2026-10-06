# Changelog

All notable changes to `@iyulab/desktop-patterns` are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) (while the version is `0.x`, a minor
release may change the API). Releases up to 0.6.0 are recorded in the git history.

## [Unreleased]

### Added

- `dp-list-detail` `list-collapsed` (`listCollapsed`): at desktop width, folds the list away and gives the item
  the whole width — for reading a wide table. The consumer owns it, with a control that brings the list back.
  Below desktop width it changes nothing; `detail-open` still picks the one pane shown.

### Changed

- `dp-sidebar`: a group without an `icon` reads as a section heading over its items — smaller and quieter than
  they are (`--dp-sidebar-group-size`, default `--dc-font-size-xs`), with no empty icon box, its label flush with
  the items' icons, and its items at the rail's own indent. Before, the heading sat after an empty icon box and its
  items one step further in, so the heading looked indented past its items. A group with an icon keeps reading as
  a parent item with its items one step in.

## [0.8.0] - 2026-10-03

### Added

- `dp-sidebar` `pinnedItems`: places kept at the foot of the rail, inside the navigation landmark and below the
  scrolling list. They select and show as the current page like any other item; `bottomItems` stay actions. A
  settings or help page placed among the bottom actions had no current-page mark while it was shown.

### Fixed

- `dp-page-header` squeezed its heading toward nothing when the actions were wide — a few form fields in the
  `actions` slot left the heading a column one letter wide. The heading now keeps a readable width (about 20em)
  and actions that do not fit beside it wrap under it, at any width rather than only below 480px.

### Changed

- Development: `tsc` (and `npm run typecheck`) is TypeScript 7, installed as `@typescript/native`; `typescript`
  resolves to `@typescript/typescript6`, whose compiler API the declaration build reads. The published files are
  unchanged.

## [0.7.2] - 2026-10-03

### Fixed

- Printing a page laid out in `dp-shell` printed only what fitted in the window: the shell, `dp-list-detail` and a
  `fill` `dp-page` held their content to the window's height. On paper the shell now drops its sidebar and toolbar,
  `dp-list-detail` prints only the item picked, and every scrolling region runs on across pages.

## [0.7.1] - 2026-10-02

### Changed

- The `@iyulab/desktop-compact` peer range takes 0.11.

### Fixed

- `dp-sidebar` shows its header label as given: it no longer turns it to capitals, which changed a name the app put
  there (a folder's or a person's) into a different spelling.

## [0.7.0] - 2026-10-01

### Added

- `dp-page-header`: eyebrow, heading (`<h2>`), description and actions, ruled off below; reads the `--dc-page-*` role tokens

### Changed

- `dp-sidebar` reads `--dp-sidebar-bg`, `--dp-sidebar-item-size`, and `--dc-selection-bg` / `--dc-indicator-color` for the active item; defaults keep its look. The two `--dp-sidebar-*` tokens are declared in `tokens.css` with `@property` (no value at `:root`), so a subtree override of `--dc-color-surface` / `--dc-font-size-sm` still reaches the sidebar

## [0.6.2] - 2026-10-01

### Changed

- The shortcut overlay's key caps read the `--dc-font-mono` token, so an app's fixed-width font applies there too.

## [0.6.1] - 2026-10-01

### Changed

- The peer range of `@iyulab/desktop-compact` takes 0.9 as well.
