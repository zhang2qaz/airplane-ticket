import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Prisma 7 + better-sqlite3 是带 native binding 的服务端依赖，
  // 让 Next.js 跳过打包，直接从 node_modules 运行时加载
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
