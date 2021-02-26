const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig();
  const { assetExts } = defaultConfig.resolver;

  return {
    resolver: {
      // Add bin to assetExts
      assetExts: [...assetExts, 'bin'],
    }
  }
})();

// module.exports = {
//   transformer: {
//     assetPlugins: ['expo-asset/tools/hashAssetFiles'],
//   },
// };
