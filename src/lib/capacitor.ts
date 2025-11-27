import { Capacitor } from '@capacitor/core';

/**
 * Get the current platform (ios, android, or web)
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Check if the app is running on a native platform (iOS or Android)
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Check if the app is running on web
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * Check if a specific plugin is available
 */
export const isPluginAvailable = (pluginName: string): boolean => {
  return Capacitor.isPluginAvailable(pluginName);
};

/**
 * Get safe area insets for notched devices
 * Returns CSS env() values for safe area handling
 */
export const getSafeAreaInsets = () => {
  return {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
  };
};

/**
 * Trigger haptic feedback on native platforms
 * Falls back silently on web
 */
export const vibrate = (duration: number = 50): void => {
  if (isNativePlatform() && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};
