import type { Metadata } from 'next'
import '@/styles/globals.css'
import { CartProvider } from '@/lib/cart-context'
import NavbarWrapper from '@/components/layout/NavbarWrapper'
import MainContent from '@/components/layout/MainContent'
import CartDrawer from '@/components/layout/CartDrawer'
import Toast from '@/components/ui/Toast'
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
          <NavbarWrapper />
          <MainContent>
            {children}
          </MainContent>
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  )
}
