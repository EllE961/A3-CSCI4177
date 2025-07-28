import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { AuthProvider } from "@/components/auth-provider"
import { CartProvider } from "@/components/cart-provider"
import { SettingsProvider } from "@/components/settings-provider"
import { Toaster } from "@/components/ui/sonner"
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShopSphere - Multi-Vendor E-commerce Platform",
  description: "Discover amazing products from verified sellers worldwide",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <AuthProvider>
                <CartProvider>
                  <SettingsProvider>
                    <QueryProvider>
                      <ConditionalLayout>
                        {children}
                      </ConditionalLayout>
                      <Toaster />
                    </QueryProvider>
                  </SettingsProvider>
                </CartProvider>
              </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}
