import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { FloatingSupportHub } from '@/components/support/floating-support-hub'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fzee Travels and Tours - Premium B2B Travel Portal',
  description: 'Connect travel agencies, manage group bookings, flights, and hotels effortlessly with Fzee Travels and Tours enterprise portal.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-['Plus_Jakarta_Sans',sans-serif]">
        {children}
        <FloatingSupportHub />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
