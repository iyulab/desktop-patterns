import { fixture, html, expect, oneEvent } from '@open-wc/testing'
import './dp-sidebar.js'
import type { DpSidebar, DpSidebarActionEvent, DpSidebarActivateEvent, DpSidebarSelectEvent } from './dp-sidebar.js'

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

  it('dispatches dp-sidebar-activate on every pick, the active item included, after any dp-sidebar-select', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    const buttons = el.shadowRoot!.querySelectorAll('nav button')
    const seen: string[] = []
    el.addEventListener('dp-sidebar-select', (e) => seen.push(`select ${(e as DpSidebarSelectEvent).itemId}`))
    el.addEventListener('dp-sidebar-activate', (e) => seen.push(`activate ${(e as DpSidebarActivateEvent).itemId}`))
    ;(buttons[0] as HTMLButtonElement).click()
    ;(buttons[1] as HTMLButtonElement).click()
    expect(seen).to.deep.equal(['activate overview', 'select settings', 'activate settings'])
  })

  it('does not dispatch dp-sidebar-activate when dp-sidebar-select was cancelled: nothing was picked', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    let activated = false
    el.addEventListener('dp-sidebar-select', (e) => e.preventDefault())
    el.addEventListener('dp-sidebar-activate', () => (activated = true))
    ;(el.shadowRoot!.querySelectorAll('nav button')[1] as HTMLButtonElement).click()
    expect(activated).to.be.false
    expect(el.activeId).to.equal('overview')
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

describe('dp-sidebar — links', () => {
  const LINKS = [
    { id: 'overview', icon: '■', label: 'Overview', href: '/overview' },
    { id: 'settings', icon: '⚙', label: 'Settings', href: '/settings' },
  ]

  it('renders an <a href> for an item with href, and marks the active one with aria-current="page"', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${LINKS} active-id="settings"></dp-sidebar>`)
    const links = [...el.shadowRoot!.querySelectorAll('nav a')]
    expect(links.map((a) => a.getAttribute('href'))).to.deep.equal(['/overview', '/settings'])
    expect(el.shadowRoot!.querySelectorAll('nav button').length).to.equal(0)
    expect(links[1].getAttribute('aria-current')).to.equal('page')
    expect(links[0].hasAttribute('aria-current')).to.be.false
  })

  it('still dispatches dp-sidebar-select for a link — navigation itself is left to the consumer (a router, or the browser)', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${LINKS} active-id="overview"></dp-sidebar>`)
    const link = el.shadowRoot!.querySelectorAll('nav a')[1] as HTMLAnchorElement
    el.addEventListener('dp-sidebar-select', (e) => e.preventDefault(), { once: true }) // keep the test page where it is
    setTimeout(() => link.click())
    const event = (await oneEvent(el, 'dp-sidebar-select')) as DpSidebarSelectEvent
    expect(event.itemId).to.equal('settings')
  })

  it('cancelling dp-sidebar-select cancels the link navigation and keeps the active item', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${LINKS} active-id="overview"></dp-sidebar>`)
    el.addEventListener('dp-sidebar-select', (e) => e.preventDefault())
    const link = el.shadowRoot!.querySelectorAll('nav a')[1] as HTMLAnchorElement
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, button: 0 })
    link.dispatchEvent(click)
    await el.updateComplete
    expect(click.defaultPrevented).to.be.true
    expect(el.activeId).to.equal('overview')
  })

  it('does not treat a modified click (new tab / window) as selecting the item', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${LINKS} active-id="overview"></dp-sidebar>`)
    let fired = false
    el.addEventListener('dp-sidebar-select', () => (fired = true))
    const link = el.shadowRoot!.querySelectorAll('nav a')[1] as HTMLAnchorElement
    link.addEventListener('click', (e) => e.preventDefault(), { once: true }) // the test page must not open a tab
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, button: 0, ctrlKey: true }))
    await el.updateComplete
    expect(fired).to.be.false
    expect(el.activeId).to.equal('overview')
  })
})

describe('dp-sidebar — groups', () => {
  const GROUPED = [
    { id: 'home', icon: '■', label: 'Home', href: '/' },
    {
      id: 'work',
      icon: '▤',
      label: 'Work',
      items: [
        { id: 'requests', icon: '·', label: 'Requests', href: '/requests' },
        { id: 'orders', icon: '·', label: 'Orders', href: '/orders' },
      ],
    },
    { id: 'admin', icon: '⚙', label: 'Admin', collapsed: true, items: [{ id: 'roles', icon: '·', label: 'Roles', href: '/roles' }] },
  ]

  it('renders a group as a named group of its items', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${GROUPED} active-id="home"></dp-sidebar>`)
    const group = el.shadowRoot!.querySelector('[role="group"][aria-label="Work"]')!
    expect(group).to.exist
    expect([...group.querySelectorAll('a .label')].map((l) => l.textContent!.trim())).to.deep.equal(['Requests', 'Orders'])
  })

  it('discloses a group with a toggle that reports aria-expanded, starting from the collapsed flag of the group', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${GROUPED} active-id="home"></dp-sidebar>`)
    const toggles = [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>('button.group-toggle')]
    expect(toggles.map((t) => t.getAttribute('aria-expanded'))).to.deep.equal(['true', 'false'])
    const admin = el.shadowRoot!.querySelector<HTMLElement>('[role="group"][aria-label="Admin"]')!
    expect(admin.hidden).to.be.true
    toggles[1].click()
    await el.updateComplete
    expect(toggles[1].getAttribute('aria-expanded')).to.equal('true')
    expect(admin.hidden).to.be.false
  })

  it('keeps a collapsed group open while it holds the current page — the active item is never hidden', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${GROUPED} active-id="roles"></dp-sidebar>`)
    const admin = el.shadowRoot!.querySelector<HTMLElement>('[role="group"][aria-label="Admin"]')!
    expect(admin.hidden).to.be.false
    expect(admin.querySelector('a')!.getAttribute('aria-current')).to.equal('page')
  })

  it('in the collapsed rail, shows the items of every group (no disclosure to operate) and keeps each group named', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${GROUPED} active-id="home" collapsed></dp-sidebar>`)
    expect(el.shadowRoot!.querySelectorAll('button.group-toggle').length).to.equal(0)
    const admin = el.shadowRoot!.querySelector<HTMLElement>('[role="group"][aria-label="Admin"]')!
    expect(admin.hidden).to.be.false
    expect(el.shadowRoot!.querySelectorAll('nav a').length).to.equal(4)
  })

  it('is accessible with groups and links (expanded and collapsed)', async () => {
    const expanded = await fixture<DpSidebar>(html`<dp-sidebar .items=${GROUPED} active-id="orders" nav-label="Main"></dp-sidebar>`)
    await expect(expanded).to.be.accessible()
    const rail = await fixture<DpSidebar>(html`<dp-sidebar .items=${GROUPED} active-id="orders" nav-label="Main" collapsed></dp-sidebar>`)
    await expect(rail).to.be.accessible()
  })
})

describe('dp-sidebar — icons, landmark name, bottom actions', () => {
  it('renders the text icon as the fallback of a per-item icon slot, so a consumer can slot any icon element', async () => {
    const el = await fixture<DpSidebar>(html`
      <dp-sidebar .items=${ITEMS} active-id="overview"><svg slot="icon-settings" data-test="gear"></svg></dp-sidebar>
    `)
    const slots = [...el.shadowRoot!.querySelectorAll<HTMLSlotElement>('slot[name^="icon-"]')]
    expect(slots.map((s) => s.name)).to.deep.equal(['icon-overview', 'icon-settings'])
    expect(slots[0].assignedElements().length).to.equal(0)
    expect(slots[0].textContent!.trim()).to.equal('■')
    expect(slots[1].assignedElements()[0].getAttribute('data-test')).to.equal('gear')
  })

  it('names the navigation landmark from nav-label', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview" nav-label="Main menu"></dp-sidebar>`)
    expect(el.shadowRoot!.querySelector('nav')!.getAttribute('aria-label')).to.equal('Main menu')
  })

  it('leaves the landmark unnamed rather than inventing a name when nav-label is not given', async () => {
    const el = await fixture<DpSidebar>(html`<dp-sidebar .items=${ITEMS} active-id="overview"></dp-sidebar>`)
    expect(el.shadowRoot!.querySelector('nav')!.hasAttribute('aria-label')).to.be.false
  })

  it('treats bottom items as actions — every click fires dp-sidebar-action and the current page stays marked', async () => {
    const el = await fixture<DpSidebar>(
      html`<dp-sidebar .items=${ITEMS} .bottomItems=${[{ id: 'logout', icon: '⎋', label: 'Log out' }]} active-id="overview"></dp-sidebar>`
    )
    const action = el.shadowRoot!.querySelector<HTMLButtonElement>('.bottom-group button')!
    let actions = 0
    let selects = 0
    el.addEventListener('dp-sidebar-action', (e) => {
      if ((e as DpSidebarActionEvent).itemId === 'logout') actions++
    })
    el.addEventListener('dp-sidebar-select', () => selects++)
    action.click()
    action.click() // an action that failed must be retryable
    await el.updateComplete
    expect(actions).to.equal(2)
    expect(selects).to.equal(0)
    expect(el.activeId).to.equal('overview')
    expect(action.hasAttribute('aria-current')).to.be.false
  })
})
