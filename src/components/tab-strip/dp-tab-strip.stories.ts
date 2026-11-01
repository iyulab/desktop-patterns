import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-tab-strip.js'

const meta: Meta = {
  title: 'Patterns/Tab strip',
  component: 'dp-tab-strip',
  args: { label: 'Documents', closeLabel: 'Close', activeId: 'b' },
}
export default meta

type Story = StoryObj

const items = [
  { id: 'a', label: 'Overview', pinned: true },
  { id: 'b', label: 'Orders', dirty: true },
  { id: 'c', label: 'Reports' },
  { id: 'd', label: 'A very long document name that gets truncated' },
]

// The strip never changes its own state — a host answers each event by updating `items` / `active-id`.
export const Default: Story = {
  render: args => html`
    <dp-tab-strip
      label=${args.label}
      close-label=${args.closeLabel}
      active-id=${args.activeId}
      .items=${items}
      @dp-tab-select=${(e: Event & { tabId: string }) => ((e.currentTarget as HTMLElement).setAttribute('active-id', e.tabId))}
    ></dp-tab-strip>
  `,
}
