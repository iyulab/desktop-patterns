import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** One tab in a {@link DpTabStrip}. Only `id` and `label` are required. */
export interface DpTabItem {
  /** Identity of the tab — what every event reports back. */
  id: string
  /** The visible name. */
  label: string
  /** A pinned tab shows no close button and is meant to sit at the start (the host orders the items). */
  pinned?: boolean
  /** The tab's view holds unsaved changes — shown as a dot; the strip never decides what that means. */
  dirty?: boolean
  /** `false` hides the close button and ignores the close key. Default `true`. */
  closable?: boolean
}

export class DpTabSelectEvent extends Event {
  constructor(readonly tabId: string) {
    super('dp-tab-select', { bubbles: true, composed: true })
  }
}

export class DpTabCloseEvent extends Event {
  constructor(readonly tabId: string) {
    super('dp-tab-close', { bubbles: true, composed: true })
  }
}

export class DpTabPinEvent extends Event {
  constructor(readonly tabId: string, readonly pinned: boolean) {
    super('dp-tab-pin', { bubbles: true, composed: true })
  }
}

/**
 * A strip of document tabs — the **container only**: it draws the tabs, reports what the user did
 * (`dp-tab-select`, `dp-tab-close`, `dp-tab-pin`) and never changes `items` or `active-id` itself.
 * What a tab opens, what closing it means, and whether to ask about unsaved changes are the host's
 * decisions — the host answers an event by updating the properties. This component has no opinion
 * on the content below it and no built-in strings: the accessible names come from `label`
 * (the tab list) and `close-label` (prefix of each close button's name).
 *
 * Keyboard (roving tab stop, automatic activation): ArrowLeft/ArrowRight move to the neighbour
 * (wrapping), Home/End jump to the ends, Delete closes the focused closable tab. Pointer: click
 * selects, the close button closes, middle-click closes, double-click toggles pin.
 */
@customElement('dp-tab-strip')
export class DpTabStrip extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-width: 0;
      background: var(--dc-color-surface, #f7f7f8);
      border-bottom: 1px solid var(--dc-color-border, #e2e2e4);
      font-family: var(--dc-font-family, system-ui, sans-serif);
    }
    .list {
      display: flex;
      overflow-x: auto;
      scrollbar-width: thin;
    }
    .tab {
      display: inline-flex;
      align-items: center;
      gap: var(--dc-space-2, 8px);
      flex: 0 0 auto;
      max-width: var(--dp-tab-max-width, 220px);
      box-sizing: border-box;
      padding: var(--dc-space-2, 8px) var(--dc-space-3, 12px);
      border-inline-end: 1px solid var(--dc-color-border, #e2e2e4);
      border-bottom: 2px solid transparent;
      color: var(--dc-color-text-muted, #5f5f68);
      background: transparent;
      cursor: pointer;
      user-select: none;
    }
    .tab[aria-selected='true'] {
      color: var(--dc-color-text, #1a1a1e);
      background: var(--dc-color-bg, #ffffff);
      border-bottom-color: var(--dc-color-accent, #1f5fbf);
    }
    .tab:focus-visible {
      outline: 2px solid var(--dc-color-accent, #1f5fbf);
      outline-offset: -2px;
    }
    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dirty {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      flex: 0 0 auto;
    }
    .close {
      all: unset;
      display: inline-grid;
      place-items: center;
      width: 18px;
      height: 18px;
      border-radius: 4px;
      line-height: 1;
      cursor: pointer;
    }
    .close:hover,
    .close:focus-visible {
      background: var(--dc-color-hover, rgba(0, 0, 0, 0.08));
    }
    .close:focus-visible {
      outline: 2px solid var(--dc-color-accent, #1f5fbf);
    }
  `

  /** The tabs, in display order. A property only (no attribute form). */
  @property({ attribute: false }) items: readonly DpTabItem[] = []

  /** The selected tab's `id`. Empty or unknown selects none (the first tab stays reachable by keyboard). */
  @property({ attribute: 'active-id' }) activeId = ''

  /** Accessible name of the tab list. */
  @property() label = ''

  /** Prefix of each close button's accessible name; the button is named «{close-label} {tab label}». */
  @property({ attribute: 'close-label' }) closeLabel = ''

  private tabs(): HTMLElement[] {
    return [...this.shadowRoot!.querySelectorAll<HTMLElement>('[role="tab"]')]
  }

  private closable(item: DpTabItem): boolean {
    return item.closable !== false && item.pinned !== true
  }

  private select(id: string, focus = false) {
    this.dispatchEvent(new DpTabSelectEvent(id))
    if (focus) {
      void this.updateComplete.then(() => this.tabs().find(t => t.dataset.id === id)?.focus())
    }
  }

  private onKeydown(e: KeyboardEvent, item: DpTabItem) {
    const items = this.items
    const index = items.findIndex(i => i.id === item.id)
    const go = (to: number) => {
      e.preventDefault()
      const target = items[(to + items.length) % items.length]
      if (target) this.select(target.id, true)
    }
    switch (e.key) {
      case 'ArrowRight':
        return go(index + 1)
      case 'ArrowLeft':
        return go(index - 1)
      case 'Home':
        return go(0)
      case 'End':
        return go(items.length - 1)
      case 'Delete':
        if (this.closable(item)) {
          e.preventDefault()
          this.dispatchEvent(new DpTabCloseEvent(item.id))
        }
        return
    }
  }

  protected updated() {
    // Keep the selected tab in view when the strip overflows.
    this.shadowRoot?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  render() {
    const hasActive = this.items.some(i => i.id === this.activeId)
    return html`
      <div class="list" role="tablist" aria-label=${this.label || nothing}>
        ${this.items.map((item, i) => {
          const selected = item.id === this.activeId
          // Roving tab stop: the selected tab, or the first one when nothing is selected.
          const stop = selected || (!hasActive && i === 0)
          return html`
            <div
              class="tab"
              role="tab"
              part=${selected ? 'tab tab-selected' : 'tab'}
              data-id=${item.id}
              aria-selected=${selected ? 'true' : 'false'}
              tabindex=${stop ? '0' : '-1'}
              ?data-pinned=${item.pinned === true}
              ?data-dirty=${item.dirty === true}
              @click=${() => this.select(item.id)}
              @auxclick=${(e: MouseEvent) => {
                if (e.button === 1 && this.closable(item)) {
                  e.preventDefault()
                  this.dispatchEvent(new DpTabCloseEvent(item.id))
                }
              }}
              @dblclick=${() => this.dispatchEvent(new DpTabPinEvent(item.id, item.pinned !== true))}
              @keydown=${(e: KeyboardEvent) => this.onKeydown(e, item)}
            >
              <span class="label">${item.label}</span>
              ${item.dirty ? html`<span class="dirty" part="dirty" aria-hidden="true"></span>` : nothing}
              ${this.closable(item)
                ? html`<button
                    class="close"
                    part="close"
                    type="button"
                    tabindex="-1"
                    aria-label=${`${this.closeLabel} ${item.label}`.trim()}
                    @click=${(e: Event) => {
                      e.stopPropagation()
                      this.dispatchEvent(new DpTabCloseEvent(item.id))
                    }}
                  >×</button>`
                : nothing}
            </div>
          `
        })}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-tab-strip': DpTabStrip
  }
}
