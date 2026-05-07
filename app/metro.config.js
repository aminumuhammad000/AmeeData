const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Add asset extensions
  config.resolver.assetExts.push('ttf');
  
  return config;
})();
