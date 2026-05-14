/** @type {import('next').NextConfig} */
const distDirByScript = {
  'dev:3000': '.next-3000',
  'build:3000': '.next-3000',
  'start:3000': '.next-3000'
}

const distDir = process.env.NEXT_DIST_DIR || distDirByScript[process.env.npm_lifecycle_event]

const nextConfig = {
  reactStrictMode: true,
  ...(distDir ? { distDir } : {})
}

export default nextConfig
