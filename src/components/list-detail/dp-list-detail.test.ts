import { fixture, html, expect } from '@open-wc/testing'
import { emulateMedia, setViewport } from '@web/test-runner-commands'
import './dp-list-detail.js'
import type { DpListDetail } from './dp-list-detail.js'

const view = () => html`<div style="height: 200px; display: flex">
  <dp-list-detail>
    <ul slot="list"><li style="height: 600px">a</li></ul>
    <article><p style="height: 600px">the item</p></article>
  </dp-list-detail>
</div>`

const pane = (el: DpListDetail, name: 'list' | 'detail') => el.shadowRoot!.querySelector(`.${name}`) as HTMLElement

describe('dp-list-detail', () => {
  afterEach(() => setViewport({ width: 800, height: 600 }))

  it('puts the list slot in one pane and what was picked in the other', async () => {
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    const list = pane(el, 'list').querySelector('slot') as HTMLSlotElement
    const detail = pane(el, 'detail').querySelector('slot') as HTMLSlotElement
    expect(list.assignedElements()[0].tagName).to.equal('UL')
    expect(detail.assignedElements()[0].tagName).to.equal('ARTICLE')
  })

  it('at desktop width shows both, the list as wide as the sidebar, and each pane scrolls on its own', async () => {
    await setViewport({ width: 1280, height: 800 })
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    const list = pane(el, 'list')
    const detail = pane(el, 'detail')
    expect(list.getBoundingClientRect().width).to.equal(220)
    expect(detail.getBoundingClientRect().width).to.be.greaterThan(220)
    expect(getComputedStyle(list).overflowY).to.equal('auto')
    expect(list.scrollHeight).to.be.greaterThan(list.clientHeight)
    expect(detail.scrollHeight).to.be.greaterThan(detail.clientHeight)
  })

  it('takes the list width from its token, which defaults to the sidebar width', async () => {
    await setViewport({ width: 1280, height: 800 })
    const host = await fixture(html`<div style="height: 200px; display: flex; --dp-sidebar-width: 240px">
      <dp-list-detail><ul slot="list"></ul></dp-list-detail>
    </div>`)
    const el = host.querySelector('dp-list-detail')!
    expect(pane(el, 'list').getBoundingClientRect().width).to.equal(240)
    el.style.setProperty('--dp-list-detail-list-width', '300px')
    expect(pane(el, 'list').getBoundingClientRect().width).to.equal(300)
  })

  it('below desktop width shows one pane: the list, or the item while detail-open is set', async () => {
    await setViewport({ width: 800, height: 600 })
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    expect(getComputedStyle(pane(el, 'list')).display).to.equal('block')
    expect(getComputedStyle(pane(el, 'detail')).display).to.equal('none')
    el.detailOpen = true
    await el.updateComplete
    expect(el.hasAttribute('detail-open')).to.be.true
    expect(getComputedStyle(pane(el, 'list')).display).to.equal('none')
    expect(getComputedStyle(pane(el, 'detail')).display).to.equal('block')
  })

  it('at desktop width ignores detail-open: both panes stay', async () => {
    await setViewport({ width: 1280, height: 800 })
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    el.detailOpen = true
    await el.updateComplete
    expect(getComputedStyle(pane(el, 'list')).display).to.equal('block')
    expect(getComputedStyle(pane(el, 'detail')).display).to.equal('block')
  })

  it('at desktop width folds the list away while list-collapsed is set, the item taking the whole width', async () => {
    await setViewport({ width: 1280, height: 800 })
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    const whole = el.getBoundingClientRect().width
    el.listCollapsed = true
    await el.updateComplete
    expect(el.hasAttribute('list-collapsed')).to.be.true
    expect(getComputedStyle(pane(el, 'list')).display).to.equal('none')
    expect(pane(el, 'detail').getBoundingClientRect().width).to.equal(whole)
    el.listCollapsed = false
    await el.updateComplete
    expect(getComputedStyle(pane(el, 'list')).display).to.equal('block')
  })

  it('below desktop width leaves the panes to detail-open whether or not the list is collapsed', async () => {
    await setViewport({ width: 800, height: 600 })
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    el.listCollapsed = true
    await el.updateComplete
    expect(getComputedStyle(pane(el, 'list')).display).to.equal('block')
    el.detailOpen = true
    await el.updateComplete
    expect(getComputedStyle(pane(el, 'detail')).display).to.equal('block')
  })

  it('is accessible', async () => {
    const el = (await fixture(view())).querySelector('dp-list-detail')!
    await expect(el).to.be.accessible()
  })

  it('on paper prints only the item picked, at its full length, at any width', async () => {
    await emulateMedia({ media: 'print' })
    try {
      for (const width of [600, 1280]) {
        await setViewport({ width, height: 800 })
        const el = (await fixture(view())).querySelector('dp-list-detail')!
        el.detailOpen = true
        await el.updateComplete
        expect(getComputedStyle(pane(el, 'list')).display).to.equal('none')
        expect(getComputedStyle(pane(el, 'detail')).overflow).to.equal('visible')
        expect(pane(el, 'detail').getBoundingClientRect().height).to.be.at.least(600)
      }
    } finally {
      await emulateMedia({ media: 'screen' })
    }
  })
})
