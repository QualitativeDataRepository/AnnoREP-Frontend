module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../**/*.stories.@(tsx|mdx)",
  ],
  addons: ["@storybook/addon-essentials", "storybook-css-modules-preset"],
}
