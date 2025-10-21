// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable Fast Refresh during E2E tests to prevent session restoration issues
// Fast Refresh causes excessive app reloads (21+ during tests) which triggers
// checkSession() and restores Supabase sessions from expo-secure-store
if (process.env.E2E_TEST === 'true') {
  console.log('🧪 [Metro] E2E_TEST mode: Disabling Fast Refresh');
  config.server = config.server || {};
  config.server.hot = false;
}

module.exports = config;

