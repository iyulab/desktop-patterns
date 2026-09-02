import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'
import './dp-shortcut-overlay.js'

const SHORTCUTS = [
  { combo: 'Ctrl+K', description: 'Open command palette' },
  { combo: 'Ctrl+S', description: 'Save' },
  { combo: 'Ctrl+Z', description: 'Undo' },
  { combo: 'Shift+/', description: 'Show this overlay' },
]

const meta: Meta = {
  title: 'Patterns/ShortcutOverlay',
  component: 'dp-shortcut-overlay',
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS} open></dp-shortcut-overlay>`,
}

export const Empty: Story = {
  render: () => html`<dp-shortcut-overlay open></dp-shortcut-overlay>`,
}

export const Closed: Story = {
  render: () => html`<dp-shortcut-overlay .shortcuts=${SHORTCUTS}></dp-shortcut-overlay>`,
}
