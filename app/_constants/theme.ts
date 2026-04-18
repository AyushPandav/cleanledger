// Re-export all constants from root level
export * from '../../constants/theme';

// Dummy default export to suppress expo-router route warning
// (underscore-prefixed files inside app/ are excluded from routing but still scanned)
const _theme = {};
export default _theme;
