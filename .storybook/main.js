module.exports = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../**/*.@(mdx|stories.@(tsx))"
  ],

  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],

  framework: {
    name: "@storybook/nextjs",
    options: {}
  },

  staticDirs: ["../public"]
}
