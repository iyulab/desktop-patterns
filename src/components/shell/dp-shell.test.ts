import { fixture, html, expect } from '@open-wc/testing'
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

  it('does not mark the toolbar row as a drag region itself (HD-17③: ownership moved to whatever renders into the toolbar slot, e.g. dp-toolbar\'s own part="drag-handle")', async () => {
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
})
