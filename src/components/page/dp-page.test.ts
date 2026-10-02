import { fixture, html, expect } from '@open-wc/testing'
import { emulateMedia } from '@web/test-runner-commands'
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

  it('scrolls itself by default', async () => {
    const el = await fixture<DpPage>(html`<dp-page style="height: 100px"><div style="height: 400px"></div></dp-page>`)
    expect(getComputedStyle(el).overflowY).to.equal('auto')
    expect(el.scrollHeight).to.be.greaterThan(el.clientHeight)
  })

  it('with fill, does not scroll: its column is as tall as the region, for a view that scrolls its own parts', async () => {
    const el = await fixture<DpPage>(html`<dp-page fill style="height: 100px"
      ><div style="flex: 1; min-height: 0; overflow: auto"><div style="height: 400px"></div></div
    ></dp-page>`)
    expect(getComputedStyle(el).overflowY).to.equal('hidden')
    const inner = el.shadowRoot!.querySelector('.inner') as HTMLElement
    expect(inner.getBoundingClientRect().height).to.equal(100)
    const view = el.querySelector('div') as HTMLElement
    expect(view.scrollHeight).to.be.greaterThan(view.clientHeight)
  })

  it('is accessible', async () => {
    const el = await fixture<DpPage>(html`<dp-page><p>hello</p></dp-page>`)
    await expect(el).to.be.accessible()
  })

  it('on paper runs on across pages, filled or not', async () => {
    await emulateMedia({ media: 'print' })
    try {
      const el = (await fixture(html`<div style="height: 100px"><dp-page fill><p style="height: 2000px">long</p></dp-page></div>`)).querySelector('dp-page')!
      expect(getComputedStyle(el).overflowY).to.equal('visible')
      expect(el.getBoundingClientRect().height).to.be.at.least(2000)
    } finally {
      await emulateMedia({ media: 'screen' })
    }
  })
})
