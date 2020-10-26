const presets = [
  [
    '@babel/env',
    {
      targets: {
        firefox: '57',
        chrome: '60',
      },
      useBuiltIns: 'entry',
      corejs: 2,
    },
  ],
  '@babel/react',
];

const plugins = [];

module.exports = { presets, plugins };
