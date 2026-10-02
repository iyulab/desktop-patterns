import { fixture, html, expect } from '@open-wc/testing'
import { emulateMedia } from '@web/test-runner-commands'
import './dp-shell.js'
import type { DpShell } from './dp-shell.js'

describe('dp-shell', () => {
  it('renders slotted content in main', async () => {
    const el = await fixture<DpShell>(html`<dp-shell><p>content</p></dp-shell>`)
    const main = el.shadowRoot!.querySelector('main')!
    const slot = main.querySelector('slot')!
    expect(slot.assignedElements().length).to.equal(1)
  })

  it('hides the sidebar region by default (sidebar-open false, narrow viewport)', async () => {
    const el = await fixture<DpShell>(html`<dp-shell></dp-shell>`)
    expect(el.hasAttribute('sidebar-open')).to.be.false
  })

  it('does not render a backdrop when sidebar-open is false', async () => {
    const el = await fixture<DpShell>(html`<dp-shell></dp-shell>`)
    expect(el.shadowRoot!.querySelector('.backdrop')).to.be.null
  })

  it('renders a backdrop when sidebar-open is true', async () => {
    const el = await fixture<DpShell>(html`<dp-shell sidebar-open></dp-shell>`)
    expect(el.shadowRoot!.querySelector('.backdrop')).to.exist
  })

  it('dispatches dp-shell-sidebar-close when the backdrop is clicked', async () => {
    const el = await fixture<DpShell>(html`<dp-shell sidebar-open></dp-shell>`)
    let fired = false
    el.addEventListener('dp-shell-sidebar-close', () => (fired = true))
    ;(el.shadowRoot!.querySelector('.backdrop') as HTMLElement).click()
    expect(fired).to.be.true
  })

  it('dispatches dp-shell-sidebar-close on Escape while the drawer is open', async () => {
    const el = await fixture<DpShell>(html`<dp-shell sidebar-open></dp-shell>`)
    let fired = 0
    el.addEventListener('dp-shell-sidebar-close', () => fired++)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(fired).to.equal(1)
  })

  it('leaves Escape alone while the drawer is closed, or when something else took it', async () => {
    const el = await fixture<DpShell>(html`<dp-shell></dp-shell>`)
    let fired = 0
    el.addEventListener('dp-shell-sidebar-close', () => fired++)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    el.sidebarOpen = true
    await el.updateComplete
    const taken = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    taken.preventDefault()
    document.dispatchEvent(taken)
    expect(fired).to.equal(0)
  })

  it('does not mark the toolbar row as a drag region itself — whatever renders into the toolbar slot owns dragging, e.g. dp-toolbar\'s own part="drag-handle"', async () => {
    const el = await fixture<DpShell>(html`<dp-shell></dp-shell>`)
    const toolbarRow = el.shadowRoot!.querySelector('.toolbar-row')!
    expect(toolbarRow.hasAttribute('data-drag-region')).to.be.false
    expect('toolbarDragRegion' in el).to.be.false
  })

  it('does not hardcode any banner content — only the slot exists', async () => {
    const el = await fixture<DpShell>(html`<dp-shell></dp-shell>`)
    const bannerSlot = el.shadowRoot!.querySelector('slot[name="banner"]') as HTMLSlotElement | null
    expect(bannerSlot).to.exist
    expect(bannerSlot!.assignedElements().length).to.equal(0)
  })

  it('is accessible', async () => {
    const el = await fixture<DpShell>(html`<dp-shell><p>content</p></dp-shell>`)
    await expect(el).to.be.accessible()
  })

  describe('on paper', () => {
    afterEach(() => emulateMedia({ media: 'screen' }))

    it('prints what is in main at its full length, without the sidebar or the toolbar', async () => {
      await emulateMedia({ media: 'print' })
      const el = await fixture<DpShell>(html`<dp-shell sidebar-open>
        <nav slot="sidebar">menu</nav>
        <div slot="toolbar">tools</div>
        <p style="height: 3000px">content</p>
      </dp-shell>`)
      const part = (selector: string) => getComputedStyle(el.shadowRoot!.querySelector(selector)!)
      expect(part('.sidebar-region').display).to.equal('none')
      expect(part('.toolbar-row').display).to.equal('none')
      expect(part('.backdrop').display).to.equal('none')
      expect(part('main').overflow).to.equal('visible')
      expect(getComputedStyle(el).overflow).to.equal('visible')
      expect(el.getBoundingClientRect().height).to.be.at.least(3000)
    })
  })
})
