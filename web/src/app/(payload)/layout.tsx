/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { Fraunces, Noto_Sans } from 'next/font/google'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz'], variable: '--font-fraunces' })
const notoSans = Noto_Sans({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-noto-sans' })

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
    htmlProps={{ className: `${fraunces.variable} ${notoSans.variable}` }}
  >
    {children}
  </RootLayout>
)

export default Layout
