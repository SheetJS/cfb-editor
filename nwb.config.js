module.exports = {
  type: 'react-app',
  webpack: {
    extra: {
      module: {
        rules: [
//          {test: /\.html$/, loader: 'html-loader'},
          {test: /\.md$/, use: 'raw-loader'}
        ]
      }
    }
  }
};
