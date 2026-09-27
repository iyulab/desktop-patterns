import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

/**
 * One navigation entry. With `href` it renders as a link — a router (or the
 * browser) does the navigating, exactly as it would for any other anchor on
 * the page. Without one it renders as a button and the consumer navigates on
 * `dp-sidebar-select`.
 */
export interface SidebarItem {
  id: string
  /** Text fallback for the `icon-<id>` slot. */
  icon: string
  label: string
  href?: string
}

/** A named set of items under one disclosure. */
export interface SidebarGroup {
  id: string
  /** Text fallback for the `icon-<id>` slot. */
  icon?: string
  label: string
  items: SidebarItem[]
  /** Starts closed. A group holding the active item stays open regardless. */
  collapsed?: boolean
}

export type SidebarEntry = SidebarItem | SidebarGroup

const isGroup = (entry: SidebarEntry): entry is SidebarGroup => Array.isArray((entry as SidebarGroup).items)

/**
 * Fired when a navigation item is chosen. Cancelable: calling
 * `preventDefault()` keeps the active item where it was and, for a link,
 * cancels the navigation too.
 */
export class DpSidebarSelectEvent extends Event {
  constructor(public readonly itemId: string) {
    super('dp-sidebar-select', { bubbles: true, composed: true, cancelable: true })
  }
}

/** Fired on every click of a bottom item — those are actions, not places. */
export class DpSidebarActionEvent extends Event {
  constructor(public readonly itemId: string) {
    super('dp-sidebar-action', { bubbles: true, composed: true })
  }
}

/**
 * App-shell navigation rail: an icon+label list (flat, or grouped under
 * disclosures) with an expanded/collapsed state, an optional pinned group of
 * bottom actions, and a `footer` slot for whatever the consumer wants to
 * anchor at the bottom — a status badge, a version string, anything; this
 * repo doesn't know what.
 *
 * Every item's icon is a slot, `icon-<id>`, whose fallback is the item's
 * `icon` text — so an icon element from any library can stand in for it.
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
    .item {
      appearance: none;
      background: none;
      border: none;
      border-left: 2px solid transparent;
      box-sizing: border-box;
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--dc-space-3, 12px);
      padding: var(--dc-space-2, 8px) var(--dc-space-3, 12px);
      font: inherit;
      font-size: var(--dc-font-size-sm, 12px);
      color: var(--dc-color-text-secondary, #55555c);
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    :host([collapsed]) .item {
      justify-content: center;
      padding: var(--dc-space-3, 12px) 0;
    }
    /* Items inside an open group sit one step in, so the group reads as a set. */
    :host(:not([collapsed])) .group-items .item {
      padding-left: calc(var(--dc-space-3, 12px) * 2);
    }
    /* In the collapsed rail a group has no label to show; a rule marks where it starts. */
    :host([collapsed]) .group + .group,
    :host([collapsed]) .item + .group,
    :host([collapsed]) .group + .item {
      border-top: 1px solid var(--dc-color-border, #e2e2e4);
    }
    /* The rail marker keeps the fill accent - it is a 3px bar, judged as a UI
       component (WCAG 1.4.11, 3:1). The label does not: an accent chosen to be
       read as a *fill* is not necessarily readable as 12px text on the hover
       surface the active row sits on. Measured across seven consuming apps,
       twelve of fourteen app x theme combinations failed AA that way, the worst
       at 1.65:1 - and the active item is the one label a user most needs to
       find. --dc-color-accent-text lets a consumer supply the readable
       variant; falling back to the fill accent keeps every existing consumer
       rendering exactly as before. */
    .item[aria-current='page'] {
      border-left-color: var(--dc-color-accent, #2563eb);
      color: var(--dc-color-accent-text, var(--dc-color-accent, #2563eb));
      font-weight: var(--dc-font-weight-medium, 500);
    }
    .item:hover {
      background: var(--dc-color-surface-hover, #ececed);
    }
    .item:focus-visible {
      outline: 2px solid var(--dc-color-accent, #2563eb);
      outline-offset: -2px;
    }
    .icon {
      flex-shrink: 0;
      width: 1.25em;
      text-align: center;
    }
    .caret {
      margin-left: auto;
      transition: transform 0.15s;
    }
    .group-toggle[aria-expanded='false'] .caret {
      transform: rotate(-90deg);
    }
    .footer {
      border-top: 1px solid var(--dc-color-border, #e2e2e4);
    }
  `

  @property({ type: Array })
  items: SidebarEntry[] = []

  /** Actions, not places — see `DpSidebarActionEvent`. */
  @property({ type: Array, attribute: 'bottom-items' })
  bottomItems: SidebarItem[] = []

  @property({ attribute: 'active-id' })
  activeId = ''

  @property()
  header = ''

  /** Accessible name of the navigation landmark. Unset leaves it unnamed. */
  @property({ attribute: 'nav-label' })
  navLabel = ''

  @property({ type: Boolean, reflect: true })
  collapsed = false

  /** Groups whose open/closed state the user has flipped from their `collapsed` default. */
  @state()
  private toggledGroups = new Set<string>()

  render() {
    return html`
      <div class="header">
        <slot name="icon"></slot>
        ${!this.collapsed && this.header ? html`<span class="header-label">${this.header}</span>` : nothing}
      </div>
      <nav aria-label=${this.navLabel || nothing}>
        ${this.items.map((entry) => (isGroup(entry) ? this.#renderGroup(entry) : this.#renderItem(entry)))}
      </nav>
      ${this.bottomItems.length > 0
        ? html`<div class="bottom-group">${this.bottomItems.map((item) => this.#renderAction(item))}</div>`
        : nothing}
      <div class="footer"><slot name="footer"></slot></div>
    `
  }

  #renderGroup(group: SidebarGroup) {
    const holdsActive = group.items.some((item) => item.id === this.activeId)
    const closedByDefault = group.collapsed === true
    const open = this.collapsed || holdsActive || closedByDefault === this.toggledGroups.has(group.id)
    const itemsId = `group-${group.id}`
    return html`
      <div class="group">
        ${this.collapsed
          ? nothing
          : html`<button
              class="item group-toggle"
              aria-expanded=${open ? 'true' : 'false'}
              aria-controls=${itemsId}
              @click=${() => this.#toggleGroup(group.id)}
            >
              ${this.#renderIcon(group.id, group.icon ?? '')}
              <span class="label">${group.label}</span>
              <span class="caret" aria-hidden="true">▾</span>
            </button>`}
        <div class="group-items" id=${itemsId} role="group" aria-label=${group.label} ?hidden=${!open}>
          ${group.items.map((item) => this.#renderItem(item))}
        </div>
      </div>
    `
  }

  #renderItem(item: SidebarItem) {
    const active = item.id === this.activeId
    const content = html`
      ${this.#renderIcon(item.id, item.icon)} ${!this.collapsed ? html`<span class="label">${item.label}</span>` : nothing}
    `
    return item.href !== undefined
      ? html`<a
          class="item"
          href=${item.href}
          title=${this.collapsed ? item.label : nothing}
          aria-current=${active ? 'page' : nothing}
          @click=${(e: MouseEvent) => this.#onItemClick(e, item)}
          >${content}</a
        >`
      : html`<button
          class="item"
          title=${this.collapsed ? item.label : nothing}
          aria-current=${active ? 'page' : nothing}
          @click=${(e: MouseEvent) => this.#onItemClick(e, item)}
        >
          ${content}
        </button>`
  }

  #renderAction(item: SidebarItem) {
    return html`
      <button
        class="item"
        title=${this.collapsed ? item.label : nothing}
        @click=${() => this.dispatchEvent(new DpSidebarActionEvent(item.id))}
      >
        ${this.#renderIcon(item.id, item.icon)} ${!this.collapsed ? html`<span class="label">${item.label}</span>` : nothing}
      </button>
    `
  }

  #renderIcon(id: string, fallback: string) {
    return html`<span class="icon" aria-hidden="true"><slot name=${`icon-${id}`}>${fallback}</slot></span>`
  }

  #onItemClick(e: MouseEvent, item: SidebarItem) {
    // A modified click on a link opens it elsewhere (new tab/window) — the
    // page the user is on doesn't change, so neither does the selection.
    if (item.href !== undefined && (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) return
    if (item.id === this.activeId) return
    if (!this.dispatchEvent(new DpSidebarSelectEvent(item.id))) {
      e.preventDefault()
      return
    }
    this.activeId = item.id
  }

  #toggleGroup(id: string) {
    const next = new Set(this.toggledGroups)
    if (!next.delete(id)) next.add(id)
    this.toggledGroups = next
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-sidebar': DpSidebar
  }
}
