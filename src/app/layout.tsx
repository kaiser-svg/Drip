import type { Metadata, Viewport } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { HydrationProvider } from "@/contexts/HydrationContext";
import { NotificationProvider } from "@/components/NotificationBanner";
import { AlertProvider } from "@/components/AlertDialog";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

export const metadata: Metadata = {
  title: "Drip | Stay Hydrated",
  description: "Your personal hydration tracking companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Drip",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HydrationProvider>
            <AlertProvider>
              <NotificationProvider>
                <ErrorReporter />
                <Script
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
                  strategy="afterInteractive"
                  data-target-origin="*"
                  data-message-type="ROUTE_CHANGE"
                  data-include-search-params="true"
                  data-only-in-iframe="true"
                  data-debug="true"
                  data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
                />
                <Script
                  id="register-sw"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                      if ('serviceWorker' in navigator) {
                        window.addEventListener('load', function() {
                          navigator.serviceWorker.register('/sw.js').then(
                            function(registration) {
                              console.log('ServiceWorker registration successful');
                            },
                            function(err) {
                              console.log('ServiceWorker registration failed: ', err);
                            }
                          );
                        });
                      }
                    `,
                  }}
                />
                {children}
                <PWAInstallPrompt />
                <VisualEditsMessenger />
              </NotificationProvider>
            </AlertProvider>
          </HydrationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}