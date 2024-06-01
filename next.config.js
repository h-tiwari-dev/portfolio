/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",  // <=== enables static exports
    reactStrictMode: true,
    images: { unoptimized: true },
    async redirects() {
        return ([
            {
                source: '/',
                destination: '/home',
                permanent: true,
                basePath: true,
            },
        ]);
    }
}

module.exports = nextConfig
