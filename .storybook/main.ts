import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    // Prefer TypeScript stories to avoid loading duplicate .js/.ts pairs
    "../src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: "@storybook/vue3-vite",
};
export default config;
