import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-page-header.js'

const meta: Meta = {
  title: 'Patterns/PageHeader',
  component: 'dp-page-header',
  args: {
    eyebrow: 'Clients',
    heading: 'Ada Lovelace',
    description: '9 sessions since March',
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => html`
    <dp-page-header eyebrow=${args.eyebrow} heading=${args.heading} description=${args.description}>
      <span slot="heading-extra" style="font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--dc-color-surface-subtle, #eee);">Active</span>
      <button slot="actions">Edit</button>
      <button slot="actions">Export</button>
    </dp-page-header>
  `,
}

export const HeadingOnly: Story = {
  render: () => html`<dp-page-header heading="Settings"></dp-page-header>`,
}

export const Narrow: Story = {
  render: (args) => html`
    <div style="width: 320px;">
      <dp-page-header eyebrow=${args.eyebrow} heading=${args.heading} description=${args.description}>
        <button slot="actions">Edit</button>
        <button slot="actions">Export</button>
      </dp-page-header>
    </div>
  `,
}
