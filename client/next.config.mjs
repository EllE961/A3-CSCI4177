/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove typed routes experiment that's causing TypeScript issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Allow build to continue with prerender errors for dashboard pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  // Security headers
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Build CSP header
    const cspDirectives = [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "manifest-src 'self'",
      "worker-src 'self'",
    ];
    
    if (isDev) {
      cspDirectives.push(
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' http://localhost:* ws://localhost:*"
      );
    } else {
      cspDirectives.push(
        "script-src 'self'",
        "style-src 'self'",
        "connect-src 'self'"
      );
    }
    
    const cspHeader = cspDirectives.join('; ');
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
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
    ]
  },
  // API Proxy to handle CORS
  async rewrites() {
    return [
      {
        source: '/api/product/:path*',
        destination: 'http://localhost:4300/api/product/:path*',
      },
      {
        source: '/api/cart/:path*',
        destination: 'http://localhost:4100/api/cart/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'http://localhost:4200/api/order/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://localhost:4400/api/payment/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:4000/api/auth/:path*',
      },
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:4500/api/user/:path*',
      },
      {
        source: '/api/consumer/:path*',
        destination: 'http://localhost:4500/api/consumer/:path*',
      },
      {
        source: '/api/vendor/:path*',
        destination: 'http://localhost:4500/api/vendor/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:4600/api/analytics/:path*',
      },
    ]
  },
}

export default nextConfig
