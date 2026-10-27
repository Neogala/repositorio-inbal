import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    // Un día: con la caché corta casi cada visita volvía a optimizar las imágenes
    // (~2 s cada una). Next no puede invalidarlas: si una obra se oculta o se restringe,
    // su página deja de mostrarla al momento, pero su enlace optimizado sigue hasta 24 h.
    minimumCacheTTL: 86400,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/img/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
