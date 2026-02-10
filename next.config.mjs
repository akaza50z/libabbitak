/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "dyj6gt4964deb.cloudfront.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
