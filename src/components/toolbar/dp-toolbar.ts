import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export class DpToolbarToggleEvent extends Event {
  constructor() {
    super('dp-toolbar-toggle', { bubbles: true, composed: true })
  }
}

/**
 * App-shell header bar: a `heading` (optionally overridden per-view by
 * `subtitle`), an optional collapse/expand toggle, and a right-side
 * `actions` slot. Pure layout — this repo does not call any platform API.
 *
 * Named `heading`, not `title` — matches dc-section-heading's own
 * established convention for this kind of headline text, and avoids
 * shadowing the native HTMLElement.prototype.title (tooltip) accessor with
 * an unrelated meaning, the same reasoning already applied to `drag-region`
 * below.
 *
 * Drag region: the `drag-region` attribute reflects intent only, mirroring
 * dp-shell — this repo never emits any platform-specific CSS itself (see
 * docs/superpowers/specs/2026-09-02-desktop-patterns-design.md, "플랫폼 API
 * 경계"). Named `drag-region`, not the native `draggable` — the platform HTML5
 * Drag-and-Drop attribute already owns that name/IDL property with unrelated
 * semantics (HTMLElement.prototype.draggable); reusing it here would shadow
 * the native accessor on this custom element for a completely different
 * concept (a window-chrome drag handle, not drag-and-drop). This component's
 * original source also hardcoded extra end-padding to reserve room for
 * native window-chrome controls — a platform assumption this repo can't make
 * either. `--dp-toolbar-inset-start`/`--dp-toolbar-inset-end` (default 0)
 * generalize that into a neutral extension point a platform-adapter layer
 * can set.
 *
 * The drag CSS a consumer maps onto `drag-region` must never target the host
 * itself — the host also contains the `.toggle` button and the `actions`
 * slot, both interactive, and neither carries any no-drag exception. Instead
 * a dedicated `part="drag-handle"` spacer sits between the start group and
 * the actions group; it renders no content of its own (nothing is ever
 * slotted into it), so it is structurally impossible for it to overlap an
 * interactive child. Consumers scope the platform CSS to that one part, not
 * to `dp-toolbar[drag-region]` alone — see this package's README (platform
 * boundary — drag regions) for the exact selector.
 */
@customElement('dp-toolbar')
export class DpToolbar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      height: var(--dp-header-height, 52px);
      box-sizing: border-box;
      padding: 0 var(--dc-space-4, 16px);
      padding-inline-start: calc(var(--dc-space-4, 16px) + var(--dp-toolbar-inset-start, 0px));
      padding-inline-end: calc(var(--dc-space-4, 16px) + var(--dp-toolbar-inset-end, 0px));
      background: var(--dc-color-surface, #f7f7f8);
      border-bottom: 1px solid var(--dc-color-border, #e2e2e4);
      font-family: var(--dc-font-family, system-ui, sans-serif);
      flex-shrink: 0;
    }
    .start {
      display: flex;
      align-items: center;
      gap: var(--dc-space-4, 16px);
      min-width: 0;
    }
    .title {
      font-size: var(--dc-font-size-sm, 12px);
      font-weight: var(--dc-font-weight-medium, 500);
      color: var(--dc-color-text, #1a1a1e);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toggle {
      appearance: none;
      background: none;
      border: none;
      padding: 0;
      font-size: var(--dc-font-size-lg, 15px);
      color: var(--dc-color-text-secondary, #55555c);
      cursor: pointer;
      line-height: 1;
    }
    .toggle:hover {
      color: var(--dc-color-text, #1a1a1e);
    }
    .toggle:focus-visible {
      outline: 2px solid var(--dc-color-accent, #2563eb);
      outline-offset: 2px;
    }
    .drag-handle {
      flex: 1;
      align-self: stretch;
      min-width: var(--dc-space-4, 16px);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--dc-space-3, 12px);
    }
  `

  @property()
  heading = ''

  @property()
  subtitle = ''

  @property({ type: Boolean, attribute: 'show-toggle' })
  showToggle = false

  @property({ type: Boolean, reflect: true, attribute: 'drag-region' })
  dragRegion = false

  render() {
    return html`
      <div class="start">
        ${this.showToggle
          ? html`<button
              class="toggle"
              aria-label="Toggle sidebar"
              @click=${() => this.dispatchEvent(new DpToolbarToggleEvent())}
            >
              ☰
            </button>`
          : nothing}
        <span class="title">${this.subtitle || this.heading}</span>
      </div>
      <div class="drag-handle" part="drag-handle"></div>
      <div class="actions"><slot name="actions"></slot></div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-toolbar': DpToolbar
  }
}
