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
  }
};

export default withNextIntl(nextConfig);
