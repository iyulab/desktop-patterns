import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { desktopMedia } from '../../breakpoints.js'

/**
 * A list beside the item picked from it — the master-detail view of mail, files or records. The
 * `list` slot holds what to pick from, the default slot what was picked. Each pane scrolls on its
 * own, so the list stays where it was while the item is read.
 *
 * At desktop width the list sits at the start, `--dp-list-detail-list-width` wide (by default the
 * sidebar's width, so navigation and list line up as equal columns), and the item takes the rest.
 * Below it there is room for one pane: the item while `detail-open` is set, the list otherwise. The
 * consumer owns `detail-open` — set it when an item is picked and clear it to go back to the list
 * (a back control in the item, which it shows only while narrow).
 *
 * Give the view a definite height — inside `dp-page fill`, or any box with one.
 */
@customElement('dp-list-detail')
export class DpListDetail extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
      height: 100%;
      box-sizing: border-box;
    }
    .list,
    .detail {
      min-width: 0;
      min-height: 0;
      overflow: auto;
      box-sizing: border-box;
    }
    .list {
      flex: 1;
    }
    .detail {
      flex: 1;
      display: none;
    }
    :host([detail-open]) .list {
      display: none;
    }
    :host([detail-open]) .detail {
      display: block;
    }
    @media ${desktopMedia} {
      :host([detail-open]) .list,
      .list {
        display: block;
        flex: 0 0 var(--dp-list-detail-list-width, var(--dp-sidebar-width, 220px));
        border-inline-end: 1px solid var(--dc-color-border, #e2e2e4);
      }
      .detail {
        display: block;
      }
      /* Folded away: the item takes the whole width until the list is wanted again. */
      :host([list-collapsed]) .list,
      :host([list-collapsed][detail-open]) .list {
        display: none;
      }
    }
    /* On paper only the item picked is printed, at its full length. */
    @media print {
      :host {
        display: block;
        height: auto;
      }
      :host([detail-open]) .list,
      .list {
        display: none;
      }
      .detail {
        display: block;
        overflow: visible;
      }
    }
  `

  /** Below desktop width, show the picked item instead of the list. Above it both are always shown. */
  @property({ type: Boolean, reflect: true, attribute: 'detail-open' })
  detailOpen = false

  /**
   * At desktop width, fold the list away and give the item the whole width — for reading a wide item. The
   * consumer owns it, with a control that brings the list back. Below desktop width it changes nothing:
   * `detail-open` already picks the one pane shown.
   */
  @property({ type: Boolean, reflect: true, attribute: 'list-collapsed' })
  listCollapsed = false

  render() {
    return html`
      <div class="list" part="list"><slot name="list"></slot></div>
      <div class="detail" part="detail"><slot></slot></div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-list-detail': DpListDetail
  }
}
