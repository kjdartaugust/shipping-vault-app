/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
    serverActions: {
      // Vault file uploads pass through a server action for encryption.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
