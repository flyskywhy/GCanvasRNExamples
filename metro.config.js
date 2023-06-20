/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const defaultAssetExts = require('metro-config/src/defaults/defaults')
  .assetExts;
const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: [...defaultAssetExts, 'dds', 'txt'],
    blockList: exclusionList([
      // to avoid node_watcher error below when `npm run web-clean` besides `npm run rn` on Windows
      //events.js:174
      //       throw er; // Unhandled 'error' event
      //       ^
      // Error: EPERM: operation not permitted, lstat 'D:\proj\GCanvasRNExamples\node_modules\.cache\default-development'
      // Emitted 'error' event at:
      //     at NodeWatcher.<anonymous> (D:\proj\GCanvasRNExamples\node_modules\sane\src\node_watcher.js:291:16)
      //     at FSReqWrap.oncomplete (fs.js:153:21)
      /node_modules\/\.cache/,

      // to avoid node_watcher error when `npm run android` besides `npm run rn` on Windows
      /node_modules\/.*\/android\/build/,
      /node_modules\/.*\/build\/intermediates/,
      /node_modules\/.*\/build\/generated/,
      /android\/app\/build/,
      /\.cxx/,
      /\.transforms/,
    ]),
  },
};
