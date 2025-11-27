import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drip.hydration',
  appName: 'Drip',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  ios: {
    scheme: 'Drip',
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#0ea5e9',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0ea5e9',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0ea5e9',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0ea5e9',
    },
  },
};

export default config;
