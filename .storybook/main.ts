import type { StorybookConfig } from '@storybook/web-components-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  // Controls, actions, docs and viewport are part of Storybook core since 9.0
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
}

export default config
