import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-page.js'

const meta: Meta = {
  title: 'Patterns/Page',
  component: 'dp-page',
  argTypes: {
    maxWidth: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
  },
  args: {
    maxWidth: 'md',
  },
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px; border: 1px dashed var(--dc-color-border, #e2e2e4);">
      <dp-page max-width=${args.maxWidth}>
        <h2>Page title</h2>
        <p>Body content centered in a max-width column.</p>
      </dp-page>
    </div>
  `,
}
