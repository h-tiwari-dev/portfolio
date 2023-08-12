/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async redirects() {
    return ([
      {
        source: '/',
        destination: '/home',
        permanent: true,
        basePath: false,
      },
    ]);
  }
}

module.exports = nextConfig
