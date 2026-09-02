import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-toolbar.js'

const meta: Meta = {
  title: 'Patterns/Toolbar',
  component: 'dp-toolbar',
  args: {
    heading: 'My App',
    subtitle: '',
    showToggle: true,
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => html`
    <dp-toolbar heading=${args.heading} subtitle=${args.subtitle} ?show-toggle=${args.showToggle}>
      <button slot="actions">Action</button>
    </dp-toolbar>
  `,
}

export const WithSubtitle: Story = {
  args: { subtitle: 'Settings' },
  render: (args) => html`
    <dp-toolbar heading=${args.heading} subtitle=${args.subtitle} ?show-toggle=${args.showToggle}></dp-toolbar>
  `,
}
