import { fixture, html, expect, oneEvent } from '@open-wc/testing'
import './dp-sidebar.js'
import type { DpSidebar, DpSidebarSelectEvent } from './dp-sidebar.js'

const ITEMS = [
  { id: 'overview', icon: '■', label: 'Overview' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

describe('dp-sidebar', () => {
  it('renders a nav button per item', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    const buttons = el.shadowRoot!.querySelectorAll('nav button')
    expect(buttons.length).to.equal(2)
  })

  it('marks the active item with aria-current="page"', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="settings"></dp-sidebar>`)
    const buttons = [...el.shadowRoot!.querySelectorAll('nav button')]
    expect(buttons[0].hasAttribute('aria-current')).to.be.false
    expect(buttons[1].getAttribute('aria-current')).to.equal('page')
  })

  it('dispatches dp-sidebar-select with the clicked item id', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    const buttons = el.shadowRoot!.querySelectorAll('nav button')
    setTimeout(() => (buttons[1] as HTMLButtonElement).click())
    const event = (await oneEvent(el, 'dp-sidebar-select')) as DpSidebarSelectEvent
    expect(event.itemId).to.equal('settings')
  })

  it('does not dispatch when clicking the already-active item', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    const buttons = el.shadowRoot!.querySelectorAll('nav button')
    let fired = false
    el.addEventListener('dp-sidebar-select', () => (fired = true))
    ;(buttons[0] as HTMLButtonElement).click()
    await el.updateComplete
    expect(fired).to.be.false
  })

  it('renders bottom-pinned items in a separate group', async () => {
    const el = await fixture<DpSidebar>(
      html`<dp-sidebar .items=${ITEMS} .bottomItems=${[{ id: 'help', icon: '?', label: 'Help' }]} active-id="overview"></dp-sidebar>`
    )
    expect(el.shadowRoot!.querySelector('.bottom-group')).to.exist
    expect(el.shadowRoot!.querySelectorAll('.bottom-group button').length).to.equal(1)
  })

  it('omits the bottom group entirely when no bottomItems given', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    expect(el.shadowRoot!.querySelector('.bottom-group')).to.be.null
  })

  it('hides text labels and shows title tooltips when collapsed', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview" collapsed></dp-sidebar>`)
    const button = el.shadowRoot!.querySelector('nav button')!
    expect(button.querySelector('span:not(.icon)')).to.be.null
    expect(button.getAttribute('title')).to.equal('Overview')
  })

  it('exposes a navigation landmark via the inner <nav> element (not a redundant host role)', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    expect(el.shadowRoot!.querySelector('nav')).to.exist
    expect(el.hasAttribute('role')).to.be.false
  })

  it('is accessible (expanded)', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview" header="App"></dp-sidebar>`)
    await expect(el).to.be.accessible()
  })

  it('is accessible (collapsed)', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview" collapsed></dp-sidebar>`)
    await expect(el).to.be.accessible()
  })
})
