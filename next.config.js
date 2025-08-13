/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Configuración para compatibilidad con Safari iOS
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración de Babel para Safari iOS
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Headers de seguridad para iOS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
