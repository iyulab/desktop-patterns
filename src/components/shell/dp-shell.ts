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
 * Drag region: the toolbar row carries its own `toolbar-drag-region` flag
 * (default on, matching the original's always-on behavior) so the empty
 * space stays a drag handle even when the slotted toolbar doesn't supply
 * its own — same flag-only boundary as dp-toolbar's `drag-region` (see
 * docs/superpowers/specs/2026-09-02-desktop-patterns-design.md, "플랫폼 API
 * 경계"). No platform-specific CSS is emitted by this component either way.
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

  @property({ type: Boolean, attribute: 'toolbar-drag-region' })
  toolbarDragRegion = true

  render() {
    return html`
      ${this.sidebarOpen
        ? html`<div class="backdrop" @click=${() => this.dispatchEvent(new DpShellSidebarCloseEvent())}></div>`
        : nothing}
      <div class="sidebar-region"><slot name="sidebar"></slot></div>
      <div class="main-column">
        <div class="toolbar-row" ?data-drag-region=${this.toolbarDragRegion}>
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
