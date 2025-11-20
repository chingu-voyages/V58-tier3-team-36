/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.chingu.io',
        port: '',
        pathname: '/logo-with-text-192.png', 
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
