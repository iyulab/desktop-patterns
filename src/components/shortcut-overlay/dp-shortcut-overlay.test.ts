import { fixture, html, expect } from '@open-wc/testing'
import './dp-shortcut-overlay.js'
import type { DpShortcutOverlay } from './dp-shortcut-overlay.js'

const SHORTCUTS = [
  { combo: 'Ctrl+K', description: 'Open command palette' },
  { combo: 'Ctrl+S', description: 'Save' },
]

describe('dp-shortcut-overlay', () => {
  it('renders nothing when closed', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS}></dp-shortcut-overlay>`)
    expect(el.shadowRoot!.querySelector('.backdrop')).to.be.null
  })

  it('renders the panel with a dialog role when open', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    const panel = el.shadowRoot!.querySelector('.panel')
    expect(panel).to.exist
    expect(panel!.getAttribute('role')).to.equal('dialog')
    expect(panel!.getAttribute('aria-modal')).to.equal('true')
  })

  it('lists every shortcut with its combo and description', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    const items = el.shadowRoot!.querySelectorAll('li')
    expect(items.length).to.equal(2)
    expect(items[0].textContent).to.contain('Open command palette')
    expect(items[0].textContent).to.contain('Ctrl+K')
  })

  it('shows the empty message when no shortcuts are given', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay open></dp-shortcut-overlay>`)
    expect(el.shadowRoot!.querySelector('.empty')!.textContent).to.equal('No shortcuts registered.')
    expect(el.shadowRoot!.querySelector('ul')).to.be.null
  })

  it('dispatches dismiss when the close button is clicked', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    let fired = false
    el.addEventListener('dp-shortcut-overlay-dismiss', () => (fired = true))
    ;(el.shadowRoot!.querySelector('.close') as HTMLButtonElement).click()
    expect(fired).to.be.true
  })

  it('dispatches dismiss when the backdrop (outside the panel) is clicked', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    let fired = false
    el.addEventListener('dp-shortcut-overlay-dismiss', () => (fired = true))
    ;(el.shadowRoot!.querySelector('.backdrop') as HTMLElement).click()
    expect(fired).to.be.true
  })

  it('does NOT dispatch dismiss when clicking inside the panel', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    let fired = false
    el.addEventListener('dp-shortcut-overlay-dismiss', () => (fired = true))
    ;(el.shadowRoot!.querySelector('.panel') as HTMLElement).click()
    expect(fired).to.be.false
  })

  it('dispatches dismiss on Escape while open', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    let fired = false
    el.addEventListener('dp-shortcut-overlay-dismiss', () => (fired = true))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(fired).to.be.true
  })

  it('removes its window keydown listener once closed', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    el.open = false
    await el.updateComplete
    let fired = false
    el.addEventListener('dp-shortcut-overlay-dismiss', () => (fired = true))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(fired).to.be.false
  })

  it('is accessible when open', async () => {
    const el = await fixture<DpShortcutOverlay>(html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`)
    await expect(el).to.be.accessible()
  })
})
