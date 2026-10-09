import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { DemoModeBanner } from './DemoModeBanner'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* 1. Global Demo Mode Banner */}
      <DemoModeBanner />

      {/* 2. Main Flex Container */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-37px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Mobile Drawer Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 h-full">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[--color-surface-base]">
          <TopBar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[--color-surface-base]">
            <div className="max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
