/** @type {import('next').NextConfig} */
module.exports = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.discogs.com",
      },
      {
        protocol: "https",
        hostname: "i.discogs.com",
      },
      {
        protocol: "http",
        hostname: "img.discogs.com",
      },
      {
        protocol: "http",
        hostname: "i.discogs.com",
      },
    ],
  },
};
