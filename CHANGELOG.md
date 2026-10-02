# Changelog

All notable changes to `@iyulab/desktop-patterns` are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) (while the version is `0.x`, a minor
release may change the API). Releases up to 0.6.0 are recorded in the git history.

## [Unreleased]

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
