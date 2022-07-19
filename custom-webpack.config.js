module.exports = {
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream'),
      },
    },
    entry: { 
      'content-script': { import: 'src/content-script.ts', runtime: false } ,
      background: { import: 'src/background.ts', runtime: false } 
    },
  };