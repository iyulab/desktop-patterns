import { LitElement, html, css, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * The top of a page or of a detail pane: a small eyebrow naming where you are, the heading (an
 * `<h2>`), a line describing it, and the page's own actions — ruled off from what follows. It
 * stands on its own rather than being part of `dp-page`, so a pane inside a page can have one.
 * Container-sized: the actions sit beside the heading when there is room and drop under it when not.
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
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      column-gap: var(--dc-space-4, 16px);
      row-gap: var(--dc-space-1, 4px);
      align-items: center;
    }
    .eyebrow {
      grid-column: 1 / -1;
      font-size: var(--dc-page-eyebrow-size, var(--dc-font-size-xs, 11px));
      font-weight: var(--dc-font-weight-semibold, 600);
      letter-spacing: 0.04em;
      color: var(--dc-page-eyebrow-color, var(--dc-color-accent-text, #1d4ed8));
    }
    .title {
      grid-column: 1;
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
      grid-column: 1;
      margin: 0;
      color: var(--dc-page-description-color, var(--dc-color-text-secondary, #55555c));
    }
    .actions {
      grid-column: 2;
      grid-row: 2 / span 2;
      display: flex;
      flex-wrap: wrap;
      gap: var(--dc-space-2, 8px);
      align-items: center;
      justify-content: flex-end;
    }
    :host(:not([eyebrow])) .actions,
    :host([eyebrow='']) .actions {
      grid-row: 1 / span 2;
    }
    @container (max-width: 480px) {
      .actions,
      :host(:not([eyebrow])) .actions,
      :host([eyebrow='']) .actions {
        grid-column: 1;
        grid-row: auto;
        justify-content: flex-start;
        margin-top: var(--dc-space-2, 8px);
      }
    }
  `

  @property({ reflect: true }) eyebrow = ''
  @property() heading = ''
  @property() description = ''

  render() {
    return html`<div class="grid">
      ${this.eyebrow ? html`<span class="eyebrow">${this.eyebrow}</span>` : nothing}
      <div class="title"><h2 part="heading">${this.heading}</h2><slot name="heading-extra"></slot></div>
      ${this.description ? html`<p class="description">${this.description}</p>` : nothing}
      <div class="actions"><slot name="actions"></slot></div>
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-page-header': DpPageHeader
  }
}
