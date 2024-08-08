/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "aware-dalmatian-938.convex.cloud",
            }
        ]
    }
};

export default nextConfig;
