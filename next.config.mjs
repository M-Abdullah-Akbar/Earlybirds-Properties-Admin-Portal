/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;

