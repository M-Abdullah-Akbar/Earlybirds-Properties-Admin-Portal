/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: () => {
    return [
      {
        source: "/dashboard",
        destination: "/f8e7d6c5b4a398765432109876543210/dashboard",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/f8e7d6c5b4a398765432109876543210/login",
        permanent: true,
      },
      {
        source: "/user-management",
        destination: "/f8e7d6c5b4a398765432109876543210/user-management",
        permanent: true,
      },
      {
        source: "/property-management",
        destination: "/f8e7d6c5b4a398765432109876543210/property-management",
        permanent: true,
      },
      {
        source: "/add-user",
        destination: "/f8e7d6c5b4a398765432109876543210/add-user",
        permanent: true,
      },
      {
        source: "/add-property",
        destination: "/f8e7d6c5b4a398765432109876543210/add-property",
        permanent: true,
      },
      {
        source: "/my-profile",
        destination: "/f8e7d6c5b4a398765432109876543210/my-profile",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

