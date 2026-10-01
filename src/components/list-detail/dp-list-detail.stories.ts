import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import { desktopMinWidth } from '../../breakpoints.js'
import './dp-list-detail.js'
import '../shell/dp-shell.js'
import '../sidebar/dp-sidebar.js'
import '../toolbar/dp-toolbar.js'
import '../page/dp-page.js'

const PEOPLE = Array.from({ length: 40 }, (_, i) => `Person ${i + 1}`)

const meta: Meta = {
  title: 'Patterns/List detail',
  component: 'dp-list-detail',
  args: { detailOpen: false },
}
export default meta

type Story = StoryObj

const list = html`<ul slot="list" aria-label="People" style="list-style: none; margin: 0; padding: 8px">
  ${PEOPLE.map((p, i) => html`<li style="padding: 6px 8px" aria-current=${i === 0 ? 'true' : 'false'}>${p}</li>`)}
</ul>`

const item = html`<article style="padding: 16px 24px">
  <h2>Person 1</h2>
  ${Array.from({ length: 30 }, (_, i) => html`<p>Entry ${i + 1}</p>`)}
</article>`

export const Default: Story = {
  render: (args) => html`
    <div style="height: 420px; display: flex; border: 1px solid var(--dc-color-border, #e2e2e4);">
      <dp-list-detail ?detail-open=${args.detailOpen}>${list} ${item}</dp-list-detail>
    </div>
  `,
}

/** Sidebar, list and item as 1:1:rest, the toolbar toggle folding the sidebar into its rail. */
export const InShell: Story = {
  render: () => {
    const wide = matchMedia(`(min-width: ${desktopMinWidth}px)`)
    const toggle = (e: Event) => {
      const shell = (e.currentTarget as HTMLElement).closest('dp-shell')!
      const nav = shell.querySelector('dp-sidebar')!
      if (wide.matches) nav.collapsed = !nav.collapsed
      else shell.sidebarOpen = !shell.sidebarOpen
    }
    return html`
      <div style="height: 500px; border: 1px solid var(--dc-color-border, #e2e2e4);">
        <dp-shell @dp-shell-sidebar-close=${(e: Event) => ((e.currentTarget as HTMLElement & { sidebarOpen: boolean }).sidebarOpen = false)}>
          <dp-sidebar
            slot="sidebar"
            header="My App"
            active-id="people"
            .items=${[
              { id: 'people', icon: '◉', label: 'People' },
              { id: 'settings', icon: '⚙', label: 'Settings' },
            ]}
          ></dp-sidebar>
          <dp-toolbar slot="toolbar" heading="People" show-toggle toggle-label="Toggle sidebar" @dp-toolbar-toggle=${toggle}></dp-toolbar>
          <dp-page fill max-width="full">
            <dp-list-detail>${list} ${item}</dp-list-detail>
          </dp-page>
        </dp-shell>
      </div>
    `
  },
}
