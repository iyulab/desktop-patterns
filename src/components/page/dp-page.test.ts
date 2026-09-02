import { fixture, html, expect } from '@open-wc/testing'
import './dp-page.js'
import type { DpPage } from './dp-page.js'

describe('dp-page', () => {
  it('renders slotted content', async () => {
    const el = await fixture<DpPage>(html`<dp-page><p>hello</p></dp-page>`)
    const slot = el.shadowRoot!.querySelector('slot')!
    const assigned = slot.assignedElements()
    expect(assigned.length).to.equal(1)
    expect(assigned[0].textContent).to.equal('hello')
  })

  it('defaults to md max-width', async () => {
    const el = await fixture<DpPage>(html`<dp-page></dp-page>`)
    expect(el.maxWidth).to.equal('md')
  })

  it('reflects max-width to an attribute', async () => {
    const el = await fixture<DpPage>(html`<dp-page max-width="full"></dp-page>`)
    expect(el.getAttribute('max-width')).to.equal('full')
  })

  it('applies the full max-width as "none"', async () => {
    const el = await fixture<DpPage>(html`<dp-page max-width="full"></dp-page>`)
    const inner = el.shadowRoot!.querySelector('.inner') as HTMLElement
    expect(inner.style.maxWidth).to.equal('none')
  })

  it('is accessible', async () => {
    const el = await fixture<DpPage>(html`<dp-page><p>hello</p></dp-page>`)
    await expect(el).to.be.accessible()
  })
})
