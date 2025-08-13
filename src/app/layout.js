export const metadata = {
  title: 'Shrine Inventory System - RFID Tracking',
  description: 'Sistema de inventario elegante basado en Material Design con seguimiento RFID en tiempo real',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shrine RFID',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#E91E63',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#E91E63" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shrine RFID" />
        <meta name="application-name" content="Shrine RFID" />
        <meta name="msapplication-TileColor" content="#E91E63" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png" />
        
        <script dangerouslySetInnerHTML={{
          __html: `
            // Polyfills para Safari iOS
            if (typeof window !== 'undefined') {
              // Polyfill básico para Array.find
              if (!Array.prototype.find) {
                Array.prototype.find = function(predicate) {
                  for (var i = 0; i < this.length; i++) {
                    if (predicate(this[i], i, this)) {
                      return this[i];
                    }
                  }
                  return undefined;
                };
              }
              
              // Service Worker registration con manejo de errores
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
