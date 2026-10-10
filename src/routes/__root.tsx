import { ClerkProvider } from '@clerk/tanstack-react-start';
import { HeadContent, Scripts, createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
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

  const matches = useRouterState({ select: (s) => s.matches })
  const match = matches[matches.length - 1]
  const routeId = match ? match.id : 'unknown'

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
            <AnimatePresence mode="wait">
              <motion.div
                key={routeId}
                initial={{ x: 24, opacity: 0, filter: 'blur(2px)' }}
                animate={{ 
                  x: 0, 
                  opacity: 1, 
                  filter: 'blur(0px)', 
                  transition: { duration: 0.22, ease: [0.165, 0.84, 0.44, 1] } 
                }}
                exit={{ 
                  opacity: 0, 
                  transition: { duration: 0.12, ease: 'linear' } 
                }}
                className="w-full h-full flex flex-col flex-1"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </AppLayout>
          </QueryClientProvider>
          <Scripts />
        </ClerkProvider>
      </body>
    </html>
  )
}