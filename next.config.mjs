/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // désactive StrictMode en dev

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'mg', 'en'],
    localeDetection: true,
  },
};

export default nextConfig;
