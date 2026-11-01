import { fixture, html, expect, oneEvent } from '@open-wc/testing'
import './dp-tab-strip.js'
import type { DpTabCloseEvent, DpTabItem, DpTabPinEvent, DpTabSelectEvent, DpTabStrip } from './dp-tab-strip.js'

const ITEMS: DpTabItem[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta', dirty: true },
  { id: 'c', label: 'Gamma', pinned: true },
  { id: 'd', label: 'Delta', closable: false },
]

const make = (activeId = 'b') =>
  fixture<DpTabStrip>(html`<dp-tab-strip label="Documents" close-label="Close" active-id=${activeId} .items=${ITEMS}></dp-tab-strip>`)

const tabs = (el: DpTabStrip) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('[role="tab"]')]

describe('dp-tab-strip', () => {
  it('names the tab list and marks only the active tab as selected', async () => {
    const el = await make('b')
    expect(el.shadowRoot!.querySelector('[role="tablist"]')!.getAttribute('aria-label')).to.equal('Documents')
    expect(tabs(el).map(t => t.getAttribute('aria-selected'))).to.deep.equal(['false', 'true', 'false', 'false'])
  })

  it('keeps a single tab stop on the selected tab (roving tabindex)', async () => {
    const el = await make('b')
    expect(tabs(el).map(t => t.getAttribute('tabindex'))).to.deep.equal(['-1', '0', '-1', '-1'])
  })

  it('keeps the first tab reachable when nothing is selected', async () => {
    const el = await make('')
    expect(tabs(el).map(t => t.getAttribute('tabindex'))).to.deep.equal(['0', '-1', '-1', '-1'])
  })

  it('shows a dirty dot only on dirty tabs', async () => {
    const el = await make()
    expect(tabs(el).map(t => !!t.querySelector('.dirty'))).to.deep.equal([false, true, false, false])
  })

  it('gives close buttons only to closable, unpinned tabs and names them from close-label', async () => {
    const el = await make()
    expect(tabs(el).map(t => t.querySelector('.close')?.getAttribute('aria-label') ?? null)).to.deep.equal(['Close Alpha', 'Close Beta', null, null])
  })

  it('reports a click as dp-tab-select without changing active-id itself', async () => {
    const el = await make('b')
    setTimeout(() => tabs(el)[0].click())
    const event = (await oneEvent(el, 'dp-tab-select')) as DpTabSelectEvent
    expect(event.tabId).to.equal('a')
    expect(el.activeId).to.equal('b') // the host decides
  })

  it('reports the close button as dp-tab-close and does not also select the tab', async () => {
    const el = await make('b')
    let selected = false
    el.addEventListener('dp-tab-select', () => (selected = true))
    setTimeout(() => (tabs(el)[0].querySelector('.close') as HTMLButtonElement).click())
    const event = (await oneEvent(el, 'dp-tab-close')) as DpTabCloseEvent
    expect(event.tabId).to.equal('a')
    expect(selected).to.be.false
  })

  it('closes on middle-click only when closable', async () => {
    const el = await make()
    const closed: string[] = []
    el.addEventListener('dp-tab-close', e => closed.push((e as DpTabCloseEvent).tabId))
    for (const index of [0, 2, 3]) tabs(el)[index].dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }))
    expect(closed).to.deep.equal(['a']) // pinned and non-closable tabs ignore it
  })

  it('toggles pin on double-click', async () => {
    const el = await make()
    const seen: Array<[string, boolean]> = []
    el.addEventListener('dp-tab-pin', e => seen.push([(e as DpTabPinEvent).tabId, (e as DpTabPinEvent).pinned]))
    tabs(el)[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    tabs(el)[2].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
    expect(seen).to.deep.equal([['a', true], ['c', false]])
  })

  it('moves selection with the arrow keys, wrapping at both ends', async () => {
    const el = await make('a')
    const picked: string[] = []
    el.addEventListener('dp-tab-select', e => picked.push((e as DpTabSelectEvent).tabId))
    const key = (index: number, k: string) => tabs(el)[index].dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))
    key(0, 'ArrowLeft') // wraps to the last
    key(0, 'ArrowRight')
    key(1, 'Home')
    key(1, 'End')
    expect(picked).to.deep.equal(['d', 'b', 'a', 'd'])
  })

  it('closes the focused tab on Delete, unless it is pinned or not closable', async () => {
    const el = await make()
    const closed: string[] = []
    el.addEventListener('dp-tab-close', e => closed.push((e as DpTabCloseEvent).tabId))
    for (const index of [1, 2, 3]) tabs(el)[index].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    expect(closed).to.deep.equal(['b'])
  })

  it('has no built-in strings: with no label the list has no accessible name of its own', async () => {
    const el = await fixture<DpTabStrip>(html`<dp-tab-strip .items=${ITEMS}></dp-tab-strip>`)
    expect(el.shadowRoot!.querySelector('[role="tablist"]')!.hasAttribute('aria-label')).to.be.false
    expect(tabs(el)[0].querySelector('.close')!.getAttribute('aria-label')).to.equal('Alpha') // no prefix invented
  })
})
