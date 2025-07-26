import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Body Composition Calculator',
  description: 'Calculate your body fat percentage, calorie and protein targets using the Katch-McArdle formula',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
} 