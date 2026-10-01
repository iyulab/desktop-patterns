import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import '@iyulab/desktop-compact/card'
import '@iyulab/desktop-compact/field'
import '@iyulab/desktop-compact/input'
import '@iyulab/desktop-compact/button'
import '@iyulab/desktop-compact/section-heading'
import '../components/shell/dp-shell.js'
import '../components/sidebar/dp-sidebar.js'
import '../components/toolbar/dp-toolbar.js'
import '../components/page/dp-page.js'
import '../components/page-header/dp-page-header.js'

const ITEMS = [
  { id: 'clients', icon: '■', label: 'Clients' },
  { id: 'sessions', icon: '▶', label: 'Sessions' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

const meta: Meta = {
  title: 'Patterns/Page anatomy',
}
export default meta

type Story = StoryObj

const anatomy = () => html`
  <dp-shell style="height: 560px;">
    <dp-sidebar slot="sidebar" .items=${ITEMS} active-id="clients" header="My App"></dp-sidebar>
    <dp-toolbar slot="toolbar" heading="My App" subtitle="Clients"></dp-toolbar>
    <dp-page>
      <dp-page-header eyebrow="Clients" heading="Ada Lovelace" description="9 sessions since March">
        <button slot="actions">Export</button>
      </dp-page-header>
      <dc-section-heading marker heading="Profile" description="Contact details"></dc-section-heading>
      <dc-card>
        <span slot="header">Contact</span>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <dc-field label="First name"><dc-input value="Ada"></dc-input></dc-field>
          <dc-field label="Last name"><dc-input value="Lovelace"></dc-input></dc-field>
          <dc-field label="Email" hint="Used for reminders"><dc-input value="ada@example.com"></dc-input></dc-field>
          <dc-field label="Phone"><dc-input value="555-0100"></dc-input></dc-field>
        </div>
        <dc-button slot="footer">Save</dc-button>
      </dc-card>
    </dp-page>
  </dp-shell>
`

export const Defaults: Story = { render: anatomy }

export const RoleTokenOverride: Story = {
  render: () => html`
    <div
      style="
        --dc-page-eyebrow-color: #b45309;
        --dc-page-title-size: 28px;
        --dc-page-rule: #b45309;
        --dc-section-marker-color: #b45309;
        --dc-card-radius: 12px;
        --dc-card-header-size: 15px;
        --dc-card-footer-bg: #fdf6ec;
        --dc-field-label-weight: 600;
      "
    >
      ${anatomy()}
    </div>
  `,
}
