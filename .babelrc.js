module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: '3',
        targets: {
          browsers: 'last 1 Chrome version',
        },
      },
    ],
  ],
}
