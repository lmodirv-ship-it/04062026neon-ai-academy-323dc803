import type { CapacitorConfig } from "@capacitor/cli";

// HN-AI native wrapper configuration.
// Used when building the Android APK via Capacitor — see ANDROID_BUILD.md.
const config: CapacitorConfig = {
  appId: "com.hngroup.hnai",
  appName: "HN-AI",
  webDir: ".output/public",
  bundledWebRuntime: false,
  // For a TWA-style build pointing at the live PWA, uncomment and set server.url:
  // server: { url: "https://code-neon-ai.lovable.app", cleartext: false, androidScheme: "https" },
  android: {
    backgroundColor: "#0b0a1f",
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: "#0b0a1f",
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0b0a1f",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
