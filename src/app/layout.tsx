import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MoveTrack — Your Relocation Command Center',
  description: 'Plan, track, and conquer your move with MoveTrack.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  )
}
