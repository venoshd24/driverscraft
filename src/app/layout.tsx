import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { CartProvider } from '@/lib/cart-context'
import NavbarWrapper from '@/components/layout/NavbarWrapper'
import MainContent from '@/components/layout/MainContent'
import CartDrawer from '@/components/layout/CartDrawer'
import Toast from '@/components/ui/Toast'
import RouteProgressBar from '@/components/ui/RouteProgressBar'
import PageTransition from '@/components/ui/PageTransition'

export const viewport: Viewport = {
  themeColor: '#0d1f17',
}

export const metadata: Metadata = {
  title: 'driversCraft — Gear. Stories. Community.',
  description: 'Premium motorsport lifestyle brand. Merch, race analysis, and a community that lives to drive.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'driversCraft',
  },
  openGraph: {
    title: 'driversCraft',
    description: 'Premium motorsport lifestyle brand.',
    type: 'website',
    url: 'https://driverscraft.vercel.app',
    images: [{ url: '/hero-bg.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'driversCraft',
    description: 'Premium motorsport lifestyle brand.',
    images: ['/hero-bg.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <CartProvider>
          <RouteProgressBar />
          <NavbarWrapper />
          <MainContent>
            <PageTransition>
              {children}
            </PageTransition>
          </MainContent>
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  )
}

