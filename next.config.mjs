/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "bsmcqplghysxwniajxbp.supabase.co",
      "kxkryylxfkkjgbgtxfog.supabase.co",
      "tedin-easy.vercel.app",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "tedin-easy.vercel.app",
        pathname: "/properties/**",
      },
    ],
    unoptimized: false,
    loader: "default",
  },
};

export default nextConfig;
