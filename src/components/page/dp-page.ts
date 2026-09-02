import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export type PageMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const MAX_WIDTH_PX: Record<PageMaxWidth, string> = {
  sm: '672px',
  md: '768px',
  lg: '896px',
  xl: '1152px',
  full: 'none',
}

/**
 * Scrollable content region with a centered, max-width column — the page-body
 * pattern every view in an app shell renders into. Pure layout: it has no
 * opinion on what it contains (default slot only).
 */
@customElement('dp-page')
export class DpPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .inner {
      margin: 0 auto;
      padding: var(--dc-space-6, 24px);
      box-sizing: border-box;
    }
  `

  @property({ attribute: 'max-width', reflect: true })
  maxWidth: PageMaxWidth = 'md'

  render() {
    return html`
      <div class="inner" style="max-width: ${MAX_WIDTH_PX[this.maxWidth]}">
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dp-page': DpPage
  }
}
