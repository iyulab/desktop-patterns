import { fixture, html, expect, oneEvent } from '@open-wc/testing'
import './dp-toolbar.js'
import type { DpToolbar } from './dp-toolbar.js'

describe('dp-toolbar', () => {
  it('renders the title when no subtitle is given', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App"></dp-toolbar>`)
    expect(el.shadowRoot!.querySelector('.title')!.textContent).to.equal('My App')
  })

  it('prefers subtitle over title when both are given', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App" subtitle="Settings"></dp-toolbar>`)
    expect(el.shadowRoot!.querySelector('.title')!.textContent).to.equal('Settings')
  })

  it('omits the toggle button by default', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App"></dp-toolbar>`)
    expect(el.shadowRoot!.querySelector('.toggle')).to.be.null
  })

  it('renders and wires the toggle button when show-toggle is set', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App" show-toggle></dp-toolbar>`)
    const button = el.shadowRoot!.querySelector('.toggle') as HTMLButtonElement
    expect(button).to.exist
    setTimeout(() => button.click())
    const event = await oneEvent(el, 'dp-toolbar-toggle')
    expect(event.type).to.equal('dp-toolbar-toggle')
  })

  it('does not reflect drag-region unless set', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App"></dp-toolbar>`)
    expect(el.hasAttribute('drag-region')).to.be.false
  })

  it('reflects drag-region as an attribute distinct from the native draggable property', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App" drag-region></dp-toolbar>`)
    expect(el.hasAttribute('drag-region')).to.be.true
    // the native HTML5 drag-and-drop attribute must be untouched by this component
    expect(el.getAttribute('draggable')).to.be.null
  })

  it('is accessible', async () => {
    const el = await fixture<DpToolbar>(html`<dp-toolbar heading="My App" show-toggle></dp-toolbar>`)
    await expect(el).to.be.accessible()
  })
})
