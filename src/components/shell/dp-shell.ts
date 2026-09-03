import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export class DpShellSidebarCloseEvent extends Event {
  constructor() {
    super('dp-shell-sidebar-close', { bubbles: true, composed: true })
  }
}

/**
 * Top-level app-shell layout: a responsive sidebar region (a fixed
 * backdrop-covered drawer below the desktop breakpoint, static beside the
 * content above it), a toolbar row, an optional banner row, and the main
 * content area. Pure composition — every region is a slot, this component
 * has no opinion on what's inside any of them.
 *
 * The original component this generalizes rendered a fixed status banner
 * unconditionally above its `banner` slot; that hardcoded element is gone
 * here — the existing `banner` slot alone is enough for a consumer to put
 * anything there, and this repo has no business knowing what that banner
 * should be.
 *
 * Drag region: this component does not mark any drag region of its own.
 * The `toolbar-row` wrapper is sized exactly to whatever is slotted into
 * `toolbar` — it has no empty space that is safely distinct from the
 * slotted content's own interactive children, so a wrapper-level flag here
 * could only ever mark the same box `dp-toolbar` already marks (redundant)
 * or, worse, extend the drag region across content this component has no
 * visibility into (unsafe — this component "has no opinion on what's
 * inside any [slot]", per the class doc above). Drag-region ownership
 * belongs entirely to whatever renders into the `toolbar` slot — see
 * `dp-toolbar`'s own `part="drag-handle"`.
 */
@customElement('dp-shell')
export class DpShell extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      box-sizing: border-box;
      background: var(--dc-color-bg, #ffffff);
      color: var(--dc-color-text, #1a1a1e);
      font-family: var(--dc-font-family, system-ui, sans-serif);
    }
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 30;
      background: var(--dc-color-backdrop, rgba(0, 0, 0, 0.4));
    }
    .sidebar-region {
      flex-shrink: 0;
      display: none;
    }
    :host([sidebar-open]) .sidebar-region {
      display: block;
      position: fixed;
      inset-block: 0;
      inset-inline-start: 0;
      z-index: 40;
    }
    @media (min-width: 1024px) {
      /* Must match (or exceed) \`:host([sidebar-open]) .sidebar-region\`'s
         specificity above (0,3,0) — a bare \`.sidebar-region\` here is only
         (0,1,0), so on equal-or-narrower cascades the desktop override would
         lose to the sidebar-open rule regardless of this media query
         matching, leaving the sidebar permanently \`position: fixed\` (full-
         height overlay) at any width once \`sidebar-open\` is set. Repeating
         the \`:host([sidebar-open])\` prefix here, rather than only the bare
         selector, is what actually lets desktop width win. */
      :host([sidebar-open]) .sidebar-region,
      .sidebar-region {
        display: block;
        position: relative;
        inset: auto;
        z-index: auto;
      }
      .backdrop {
        display: none;
      }
    }
    .main-column {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .toolbar-row {
      flex-shrink: 0;
    }
    main {
      flex: 1;
      overflow: auto;
    }
  `

  @property({ type: Boolean, reflect: true, attribute: 'sidebar-open' })
  sidebarOpen = false

  render() {
    return html`
      ${this.sidebarOpen
        ? html`<div class="backdrop" @click=${() => this.dispatchEvent(new DpShellSidebarCloseEvent())}></div>`
        : nothing}
      <div class="sidebar-region"><slot name="sidebar"></slot></div>
      <div class="main-column">
        <div class="toolbar-row">
          <slot name="toolbar"></slot>
        </div>
        <slot name="banner"></slot>
        <main><slot></slot></main>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-shell': DpShell
  }
}
