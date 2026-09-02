import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

export interface ShortcutEntry {
  combo: string
  description: string
}

export class DpShortcutOverlayDismissEvent extends Event {
  constructor() {
    super('dp-shortcut-overlay-dismiss', { bubbles: true, composed: true })
  }
}

let instanceCount = 0

/**
 * Display-only keyboard-shortcuts help panel: a `shortcuts` list + an `open`
 * flag, nothing else. This component owns no registry and no trigger
 * keybinding — the original component this generalizes bound its own
 * `shift+/` shortcut and read from a module-level, framework-hook-specific
 * registry; both are the consumer's responsibility here (see
 * docs/superpowers/specs/2026-09-02-desktop-patterns-design.md, the
 * dp-shortcut-overlay row). This component only dismisses itself (outside
 * click / Escape) by asking — it dispatches `dp-shortcut-overlay-dismiss`
 * rather than setting its own `open` to false, since `open` is the
 * consumer's state to own, not this component's.
 */
@customElement('dp-shortcut-overlay')
export class DpShortcutOverlay extends LitElement {
  static styles = css`
    :host {
      display: contents;
      font-family: var(--dc-font-family, system-ui, sans-serif);
    }
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--dc-color-backdrop, rgba(0, 0, 0, 0.4));
    }
    .panel {
      width: 420px;
      max-height: 70vh;
      overflow-y: auto;
      background: var(--dc-color-surface, #f7f7f8);
      border: 1px solid var(--dc-color-border, #e2e2e4);
      border-radius: var(--dc-radius-lg, 10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--dc-space-3, 12px) var(--dc-space-4, 16px);
      border-bottom: 1px solid var(--dc-color-border, #e2e2e4);
    }
    h2 {
      margin: 0;
      font-size: var(--dc-font-size-sm, 12px);
      font-weight: var(--dc-font-weight-semibold, 600);
      color: var(--dc-color-text, #1a1a1e);
    }
    .close {
      appearance: none;
      background: none;
      border: none;
      padding: 0;
      font-size: var(--dc-font-size-lg, 15px);
      line-height: 1;
      color: var(--dc-color-text-muted, #8a8a92);
      cursor: pointer;
    }
    .close:hover {
      color: var(--dc-color-text, #1a1a1e);
    }
    .close:focus-visible {
      outline: 2px solid var(--dc-color-accent, #2563eb);
      outline-offset: 2px;
    }
    .body {
      padding: var(--dc-space-3, 12px) var(--dc-space-4, 16px);
    }
    .empty {
      margin: 0;
      font-size: var(--dc-font-size-xs, 11px);
      color: var(--dc-color-text-muted, #8a8a92);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--dc-space-1, 4px);
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--dc-space-3, 12px);
      font-size: var(--dc-font-size-xs, 11px);
    }
    kbd {
      padding: 2px 6px;
      border-radius: var(--dc-radius-sm, 4px);
      background: var(--dc-color-surface-hover, #ececed);
      border: 1px solid var(--dc-color-border, #e2e2e4);
      color: var(--dc-color-text-secondary, #55555c);
      font-family: ui-monospace, monospace;
      font-size: 10px;
    }
  `

  @property({ type: Array })
  shortcuts: ShortcutEntry[] = []

  @property({ type: Boolean, reflect: true })
  open = false

  @property()
  heading = 'Keyboard shortcuts'

  @property({ attribute: 'empty-message' })
  emptyMessage = 'No shortcuts registered.'

  @state()
  private headingId = `dp-shortcut-overlay-heading-${++instanceCount}`

  #onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      this.#dismiss()
    }
  }

  updated(changed: Map<string, unknown>) {
    if (!changed.has('open')) return
    if (this.open) {
      window.addEventListener('keydown', this.#onKeydown)
    } else {
      window.removeEventListener('keydown', this.#onKeydown)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this.#onKeydown)
  }

  #dismiss() {
    this.dispatchEvent(new DpShortcutOverlayDismissEvent())
  }

  render() {
    if (!this.open) return nothing
    return html`
      <div class="backdrop" @click=${() => this.#dismiss()}>
        <div
          class="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby=${this.headingId}
          @click=${(e: Event) => e.stopPropagation()}
        >
          <div class="header">
            <h2 id=${this.headingId}>${this.heading}</h2>
            <button class="close" aria-label="Close" @click=${() => this.#dismiss()}>×</button>
          </div>
          <div class="body">
            ${this.shortcuts.length === 0
              ? html`<p class="empty">${this.emptyMessage}</p>`
              : html`
                  <ul>
                    ${this.shortcuts.map(
                      (s) => html`
                        <li>
                          <span>${s.description}</span>
                          <kbd>${s.combo}</kbd>
                        </li>
                      `
                    )}
                  </ul>
                `}
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-shortcut-overlay': DpShortcutOverlay
  }
}
