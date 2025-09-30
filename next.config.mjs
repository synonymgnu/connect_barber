/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Desativa a otimização
    domains: ["utfs.io"], // libera o domínio
  },
}

export default nextConfig
