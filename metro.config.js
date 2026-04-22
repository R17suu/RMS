const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  // Workaround for Expo SDK 55 dev-only keep-awake activation race on Android.
  'expo-keep-awake': path.resolve(__dirname, 'stubs/expo-keep-awake.js'),
};

module.exports = config;
