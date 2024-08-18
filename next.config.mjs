/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, // Replace '*' with specific origins as needed
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: "1mb",
      },
      responseLimit: false,
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

if (process.env.VERCEL) {
  nextConfig.experimental.serverActions.timeout = 300; // 5 minutes in seconds
}

export default nextConfig;
