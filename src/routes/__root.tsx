import { ClerkProvider } from '@clerk/tanstack-react-start';
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import appCss from '../styles.css?url'
import React, { useState } from 'react'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'RakshaTrack — SGT University Transport Safety System',
      },
      {
        name: 'description',
        content:
          'Software-only RFID university transport attendance, telemetry tracking, and GPS proximity safety platform.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/font.css" />
      </head>
      <body>
        <ClerkProvider>
          <QueryClientProvider client={queryClient}>
          <AppLayout>
          <Outlet />
          </AppLayout>
          </QueryClientProvider>
          <Scripts />
        </ClerkProvider>
      </body>
    </html>
  )
}