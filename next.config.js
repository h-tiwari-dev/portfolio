/** @type {import('next').NextConfig} */
const nextConfig = {
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
