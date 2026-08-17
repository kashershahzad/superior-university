const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * RNFB v26 package.json "exports" Metro ko nativeModule.android.js skip
 * kara ke web fallback pe bhej deta hai. Platform files force-resolve karo.
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName.endsWith(
          '@react-native-firebase/app/dist/module/internal/nativeModule',
        ) &&
        (platform === 'android' || platform === 'ios')
      ) {
        return context.resolveRequest(
          context,
          `${moduleName}.${platform}`,
          platform,
        );
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
