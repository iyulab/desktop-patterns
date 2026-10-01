import { fixture, html, expect } from '@open-wc/testing'
import './dp-page-header.js'
import type { DpPageHeader } from './dp-page-header.js'

describe('dp-page-header', () => {
  it('renders the heading as an h2 with eyebrow and description', async () => {
    const el = await fixture<DpPageHeader>(html`<dp-page-header eyebrow="Clients" heading="Ada" description="9 sessions"></dp-page-header>`)
    const root = el.shadowRoot!
    expect(root.querySelector('h2')!.textContent!.trim()).to.equal('Ada')
    expect(root.querySelector('.eyebrow')!.textContent).to.equal('Clients')
    expect(root.querySelector('.description')!.textContent).to.equal('9 sessions')
  })

  it('leaves out an empty eyebrow and description', async () => {
    const el = await fixture<DpPageHeader>(html`<dp-page-header heading="Ada"></dp-page-header>`)
    expect(el.shadowRoot!.querySelector('.eyebrow')).to.equal(null)
    expect(el.shadowRoot!.querySelector('.description')).to.equal(null)
  })

  it('draws the page rule under itself and reads the page role tokens', async () => {
    const el = await fixture<DpPageHeader>(html`<dp-page-header heading="Ada" eyebrow="E" style="--dc-page-rule: rgb(1, 1, 1); --dc-page-title-size: 30px; --dc-page-eyebrow-color: rgb(2, 2, 2)"></dp-page-header>`)
    expect(getComputedStyle(el).borderBottomColor).to.equal('rgb(1, 1, 1)')
    expect(getComputedStyle(el.shadowRoot!.querySelector('h2')!).fontSize).to.equal('30px')
    expect(getComputedStyle(el.shadowRoot!.querySelector('.eyebrow')!).color).to.equal('rgb(2, 2, 2)')
  })

  it('puts the actions beside the heading when wide and under it when narrow', async () => {
    const wide = await fixture<DpPageHeader>(html`<dp-page-header style="width: 900px" heading="Ada" description="d"><button slot="actions">Edit</button></dp-page-header>`)
    const narrow = await fixture<DpPageHeader>(html`<dp-page-header style="width: 320px" heading="A long heading for a narrow window" description="d"><button slot="actions">Edit</button></dp-page-header>`)
    const top = (el: Element) => el.shadowRoot!.querySelector('.actions')!.getBoundingClientRect().top
    const headingBottom = (el: Element) => el.shadowRoot!.querySelector('h2')!.getBoundingClientRect().bottom
    expect(top(wide)).to.be.below(headingBottom(wide))
    expect(top(narrow)).to.be.at.least(headingBottom(narrow))
  })

  it('is accessible', async () => {
    const el = await fixture<DpPageHeader>(html`<dp-page-header eyebrow="Clients" heading="Ada" description="9 sessions"><button slot="actions">Edit</button></dp-page-header>`)
    await expect(el).to.be.accessible()
  })
})
