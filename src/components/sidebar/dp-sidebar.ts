import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface SidebarItem {
  id: string
  icon: string
  label: string
}

export class DpSidebarSelectEvent extends Event {
  constructor(public readonly itemId: string) {
    super('dp-sidebar-select', { bubbles: true, composed: true })
  }
}

/**
 * App-shell navigation rail: an icon+label list with an expanded/collapsed
 * state, an optional pinned bottom group, and a `footer` slot for whatever
 * the consumer wants to anchor at the bottom — a status badge, a version
 * string, anything; this repo doesn't know what.
 */
@customElement('dp-sidebar')
export class DpSidebar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      width: var(--dp-sidebar-width, 220px);
      background: var(--dc-color-surface, #f7f7f8);
      border-right: 1px solid var(--dc-color-border, #e2e2e4);
      font-family: var(--dc-font-family, system-ui, sans-serif);
    }
    :host([collapsed]) {
      width: var(--dp-sidebar-width-collapsed, 52px);
    }
    .header {
      height: var(--dp-header-height, 52px);
      display: flex;
      align-items: center;
      gap: var(--dc-space-3, 12px);
      padding: 0 var(--dc-space-3, 12px);
      border-bottom: 1px solid var(--dc-color-border, #e2e2e4);
      box-sizing: border-box;
      flex-shrink: 0;
    }
    :host([collapsed]) .header {
      justify-content: center;
      padding: 0;
    }
    .header-label {
      font-size: var(--dc-font-size-xs, 11px);
      font-weight: var(--dc-font-weight-medium, 500);
      color: var(--dc-color-text-secondary, #55555c);
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    nav {
      flex: 1;
      overflow-y: auto;
      padding: var(--dc-space-1, 4px) 0;
    }
    .bottom-group {
      border-top: 1px solid var(--dc-color-border, #e2e2e4);
      padding: var(--dc-space-1, 4px) 0;
    }
    button {
      appearance: none;
      background: none;
      border: none;
      border-left: 2px solid transparent;
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--dc-space-3, 12px);
      padding: var(--dc-space-2, 8px) var(--dc-space-3, 12px);
      font: inherit;
      font-size: var(--dc-font-size-sm, 12px);
      color: var(--dc-color-text-secondary, #55555c);
      text-align: left;
      cursor: pointer;
    }
    :host([collapsed]) button {
      justify-content: center;
      padding: var(--dc-space-3, 12px) 0;
    }
    button[aria-current='page'] {
      border-left-color: var(--dc-color-accent, #2563eb);
      color: var(--dc-color-accent, #2563eb);
      font-weight: var(--dc-font-weight-medium, 500);
    }
    button:hover {
      background: var(--dc-color-surface-hover, #ececed);
    }
    button:focus-visible {
      outline: 2px solid var(--dc-color-accent, #2563eb);
      outline-offset: -2px;
    }
    .icon {
      flex-shrink: 0;
      width: 1.25em;
      text-align: center;
    }
    .footer {
      border-top: 1px solid var(--dc-color-border, #e2e2e4);
    }
  `

  @property({ type: Array })
  items: SidebarItem[] = []

  @property({ type: Array, attribute: 'bottom-items' })
  bottomItems: SidebarItem[] = []

  @property({ attribute: 'active-id' })
  activeId = ''

  @property()
  header = ''

  @property({ type: Boolean, reflect: true })
  collapsed = false

  render() {
    return html`
      <div class="header">
        <slot name="icon"></slot>
        ${!this.collapsed && this.header ? html`<span class="header-label">${this.header}</span>` : nothing}
      </div>
      <nav>${this.items.map((item) => this.#renderItem(item))}</nav>
      ${this.bottomItems.length > 0
        ? html`<div class="bottom-group">${this.bottomItems.map((item) => this.#renderItem(item))}</div>`
        : nothing}
      <div class="footer"><slot name="footer"></slot></div>
    `
  }

  #renderItem(item: SidebarItem) {
    const active = item.id === this.activeId
    return html`
      <button
        title=${this.collapsed ? item.label : nothing}
        aria-current=${active ? 'page' : nothing}
        @click=${() => this.#select(item.id)}
      >
        <span class="icon" aria-hidden="true">${item.icon}</span>
        ${!this.collapsed ? html`<span>${item.label}</span>` : nothing}
      </button>
    `
  }

  #select(id: string) {
    if (id !== this.activeId) {
      this.activeId = id
      this.dispatchEvent(new DpSidebarSelectEvent(id))
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-sidebar': DpSidebar
  }
}
