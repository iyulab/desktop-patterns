import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * The top of a page or of a detail pane: a small eyebrow naming where you are, the heading (an
 * `<h2>`), a line describing it, and the page's own actions — ruled off from what follows. It
 * stands on its own rather than being part of `dp-page`, so a pane inside a page can have one.
 * The heading keeps a readable width: the actions sit beside it when there is room and wrap under it
 * when not, however wide they are, so a heading is never squeezed to a column of single letters.
 */
@customElement('dp-page-header')
export class DpPageHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      container-type: inline-size;
      padding-bottom: var(--dc-space-4, 16px);
      border-bottom: 1px solid var(--dc-page-rule, var(--dc-color-border, #e2e2e4));
      font-family: var(--dc-font-family, system-ui, sans-serif);
    }
    /* The heading claims a readable width first; actions that do not fit beside it wrap under it. */
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--dc-space-1, 4px) var(--dc-space-4, 16px);
    }
    .main {
      flex: 1 1 20em;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--dc-space-1, 4px);
    }
    .eyebrow {
      display: block;
      margin-bottom: var(--dc-space-1, 4px);
      font-size: var(--dc-page-eyebrow-size, var(--dc-font-size-xs, 11px));
      font-weight: var(--dc-font-weight-semibold, 600);
      letter-spacing: 0.04em;
      color: var(--dc-page-eyebrow-color, var(--dc-color-accent-text, #1d4ed8));
    }
    .title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--dc-space-2, 8px);
      min-width: 0;
    }
    h2 {
      margin: 0;
      font-size: var(--dc-page-title-size, var(--dc-font-size-2xl, 22px));
      font-weight: var(--dc-page-title-weight, var(--dc-font-weight-bold, 700));
      line-height: var(--dc-line-height-tight, 1.3);
      color: var(--dc-color-text, #1a1a1e);
      overflow-wrap: anywhere;
    }
    .description {
      margin: 0;
      color: var(--dc-page-description-color, var(--dc-color-text-secondary, #55555c));
    }
    .actions {
      flex: 0 1 auto;
      margin-inline-start: auto;
      display: flex;
      flex-wrap: wrap;
      gap: var(--dc-space-2, 8px);
      align-items: center;
      justify-content: flex-end;
    }
    @container (max-width: 480px) {
      .actions {
        flex-basis: 100%;
        margin-inline-start: 0;
        justify-content: flex-start;
        margin-top: var(--dc-space-2, 8px);
      }
    }
  `

  @property({ reflect: true }) eyebrow = ''
  @property() heading = ''
  @property() description = ''

  render() {
    return html`${this.eyebrow ? html`<span class="eyebrow">${this.eyebrow}</span>` : nothing}
      <div class="row">
        <div class="main">
          <div class="title"><h2 part="heading">${this.heading}</h2><slot name="heading-extra"></slot></div>
          ${this.description ? html`<p class="description">${this.description}</p>` : nothing}
        </div>
        <div class="actions"><slot name="actions"></slot></div>
      </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-page-header': DpPageHeader
  }
}
