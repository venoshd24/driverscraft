// src/app/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { CartProvider } from '@/lib/cart-context'
import Navbar from '@/components/layout/Navbar'
import CartDrawer from '@/components/layout/CartDrawer'
import Toast from '@/components/ui/Toast'
import PageTransition from '@/components/ui/PageTransition'
import RouteProgressBar from '@/components/ui/RouteProgressBar'

export const metadata: Metadata = {
  title: 'driversCraft — Gear. Stories. Community.',
  description: 'Premium motorsport lifestyle brand. Merch, race analysis, and a community that lives to drive.',
  openGraph: {
    title: 'driversCraft',
    description: 'Premium motorsport lifestyle brand.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <RouteProgressBar />
          <Navbar />
          <main style={{ paddingTop: 'var(--nav-height)' }}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  )
}
