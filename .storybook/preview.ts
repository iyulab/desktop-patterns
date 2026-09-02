import type { Preview } from '@storybook/web-components-vite'
import '@iyulab/desktop-compact/tokens.css'
import '../tokens.css'

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
  },
}

export default preview
