import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Debatr",
  description: "AI-assisted structured debate platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Ambient decorative background lines */}
        <div className="page-ambient" aria-hidden="true">
          <div className="page-ambient-line" />
          <div className="page-ambient-line" />
          <div className="page-ambient-line" />
          <div className="page-ambient-line" />
          <div className="page-ambient-line" />
        </div>

        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
