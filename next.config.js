const withPWA = require("next-pwa");

module.exports = withPWA({
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
  },
  reactStrictMode: false,
  images: {
    domains: ["img.discogs.com", "i.discogs.com"],
  },
});
