// Re-export all named components from root level
export * from '../../components/ui';

// Dummy default export required to suppress expo-router route warning
// (underscore-prefixed files are excluded from routing but still scanned)
export { Badge as default } from '../../components/ui';
