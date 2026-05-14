import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'APT Scenario Platform MVP',
  description: 'Scenario JSON driven security education map'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
