import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-shell.js'
import '../sidebar/dp-sidebar.js'
import '../toolbar/dp-toolbar.js'
import '../page/dp-page.js'

const ITEMS = [
  { id: 'overview', icon: '■', label: 'Overview' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

const meta: Meta = {
  title: 'Patterns/Shell',
  component: 'dp-shell',
  args: {
    sidebarOpen: false,
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px; border: 1px solid var(--dc-color-border, #e2e2e4);">
      <dp-shell ?sidebar-open=${args.sidebarOpen}>
        <dp-sidebar slot="sidebar" .items=${ITEMS} active-id="overview" header="My App"></dp-sidebar>
        <dp-toolbar slot="toolbar" heading="My App" subtitle="Overview"></dp-toolbar>
        <dp-page>
          <h2>Overview</h2>
          <p>Main content area, composed from dp-sidebar + dp-toolbar + dp-page inside dp-shell.</p>
        </dp-page>
      </dp-shell>
    </div>
  `,
}

export const WithBanner: Story = {
  render: () => html`
    <div style="height: 500px; border: 1px solid var(--dc-color-border, #e2e2e4);">
      <dp-shell>
        <dp-sidebar slot="sidebar" .items=${ITEMS} active-id="overview"></dp-sidebar>
        <dp-toolbar slot="toolbar" heading="My App"></dp-toolbar>
        <div
          slot="banner"
          style="padding: 8px 16px; background: var(--dc-color-warning, #d97706); color: white; font-size: 12px;"
        >
          Example consumer-supplied banner (this repo has no built-in banner content).
        </div>
        <dp-page><p>Main content.</p></dp-page>
      </dp-shell>
    </div>
  `,
}
