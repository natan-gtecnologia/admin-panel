/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  images: {
    domains: [
      "localhost",
      "images.Liveforce.dev.sejanalu.com.br",
      "via.placeholder.com",
      'images.growforce.dev.sejanalu.com.br',
    ],
  },
};

module.exports = nextConfig;
