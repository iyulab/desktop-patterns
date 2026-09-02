import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-sidebar.js'

const ITEMS = [
  { id: 'overview', icon: '■', label: 'Overview' },
  { id: 'runs', icon: '▶', label: 'Runs' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
]

const meta: Meta = {
  title: 'Patterns/Sidebar',
  component: 'dp-sidebar',
  argTypes: {
    collapsed: { control: 'boolean' },
  },
  args: {
    header: 'My App',
    activeId: 'overview',
    collapsed: false,
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => html`
    <div style="height: 480px;">
      <dp-sidebar
        .items=${ITEMS}
        active-id=${args.activeId}
        header=${args.header}
        ?collapsed=${args.collapsed}
      >
        <span slot="footer" style="display:block; padding: 8px 12px; font-size: 11px; color: var(--dc-color-text-muted, #8a8a92);">v0.1.0</span>
      </dp-sidebar>
    </div>
  `,
}

export const WithBottomGroup: Story = {
  args: { collapsed: false },
  render: (args) => html`
    <div style="height: 480px;">
      <dp-sidebar
        .items=${ITEMS}
        .bottomItems=${[{ id: 'help', icon: '?', label: 'Help' }]}
        active-id=${args.activeId}
        header=${args.header}
        ?collapsed=${args.collapsed}
      ></dp-sidebar>
    </div>
  `,
}

export const Collapsed: Story = {
  args: { collapsed: true },
  render: (args) => html`
    <div style="height: 480px;">
      <dp-sidebar .items=${ITEMS} active-id=${args.activeId} ?collapsed=${args.collapsed}></dp-sidebar>
    </div>
  `,
}
