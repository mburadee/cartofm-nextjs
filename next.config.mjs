import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' } // station favicons come from arbitrary broadcaster domains
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Suppress verbose build logging to stay under Vercel's 4MB log limit
  logging: {
    level: 'error'
  },
  productionBrowserSourceMaps: false,
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5
  }
};

export default withNextIntl(nextConfig);
