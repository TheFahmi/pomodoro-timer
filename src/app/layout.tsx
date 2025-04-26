import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "./pwa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro Timer",
  description: "A flexible Pomodoro timer with task management and focus features.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pomodoro Timer",
  },
  applicationName: "Pomodoro Timer",
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Pomodoro Timer" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pomodoro Timer" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0F172A" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0F172A" />

        {/* PWA icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Fallback icons for browsers */}
        <link rel="icon" type="image/png" sizes="72x72" href="/icons/icon-72.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple specific icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144.png" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-square150x150logo" content="/icons/icon-152.png" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />

        {/* Manifest link is handled by metadata object now */}
        {/* <link rel="manifest" href="/manifest.json" /> */}

        {/* Add service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(err) {
                      console.log('Service Worker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />

        {/* Twitter Card data */}
        {/* <meta name="twitter:card" content="summary" /> */}
        {/* <meta name="twitter:url" content="https://yourdomain.com" /> */}
        {/* <meta name="twitter:title" content="Pomodoro Timer" /> */}
        {/* <meta name="twitter:description" content="A flexible Pomodoro timer with task management and focus features." /> */}
        {/* <meta name="twitter:image" content="https://yourdomain.com/icons/android-chrome-192x192.png" /> */}
        {/* <meta name="twitter:creator" content="@YourTwitterHandle" /> */}

        {/* Open Graph data */}
        {/* <meta property="og:type" content="website" /> */}
        {/* <meta property="og:title" content="Pomodoro Timer" /> */}
        {/* <meta property="og:description" content="A flexible Pomodoro timer with task management and focus features." /> */}
        {/* <meta property="og:site_name" content="Pomodoro Timer" /> */}
        {/* <meta property="og:url" content="https://yourdomain.com" /> */}
        {/* <meta property="og:image" content="https://yourdomain.com/icons/apple-touch-icon.png" /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          "--cursor-pointer": "pointer"
        } as React.CSSProperties}
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
