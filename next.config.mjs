/** @type {import('next').NextConfig} */
const nextConfig = {
  // Help prevent hydration mismatches
  experimental: {
    optimizePackageImports: ["bootstrap"],
  },
  // Suppress hydration warnings for browser extensions
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  redirects: () => {
    return [
      {
        source: "/dashboard",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/admin/login",
        permanent: true,
      },
      {
        source: "/user-management",
        destination: "/admin/user-management",
        permanent: true,
      },
      {
        source: "/property-management",
        destination: "/admin/property-management",
        permanent: true,
      },
      {
        source: "/add-user",
        destination: "/admin/add-user",
        permanent: true,
      },
      {
        source: "/add-property",
        destination: "/admin/add-property",
        permanent: true,
      },
      {
        source: "/my-profile",
        destination: "/admin/my-profile",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spn.nexteksol.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
