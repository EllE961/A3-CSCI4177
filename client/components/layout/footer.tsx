"use client"

import * as React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  ArrowUp,
  Send,
} from "lucide-react"
import { useAuthSession } from "@/components/auth-provider"

/* ---------- link sets ---------- */
const quickLinks = [
  { name: "Sign In", href: "/auth/login" },
  { name: "Sign Up", href: "/auth/register" },
]

const shopLinks = [
  { name: "Home", href: "/" },
  { name: "Get Started", href: "/auth/register" },
]

/* replacement columns for signed‑in users */
const accountLinksAuth = [
  { name: "Profile", href: "/consumer/profile" },
  { name: "Orders", href: "/orders" },
]

const exploreLinks = [
  { name: "Shops", href: "/shop" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
]

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: <Facebook className="h-5 w-5" />,
    color: "hover:text-blue-600 dark:hover:text-blue-400",
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: <Twitter className="h-5 w-5" />,
    color: "hover:text-sky-500 dark:hover:text-sky-400",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: <Instagram className="h-5 w-5" />,
    color: "hover:text-pink-600 dark:hover:text-pink-400",
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: <Youtube className="h-5 w-5" />,
    color: "hover:text-red-600 dark:hover:text-red-400",
  },
]

export function Footer() {
  const [email, setEmail] = React.useState("")
  const [isSubscribed, setIsSubscribed] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)
  const { data: session } = useAuthSession()

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setTimeout(() => {
      setIsSubscribed(false)
      setEmail("")
    }, 2000)
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <footer className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-background dark:to-muted/20 border-t border-gray-300 dark:border-border/50 w-full overflow-hidden">
      {/* subtle pattern */}
      <div className="absolute inset-0 bg-grid-gray-200/30 dark:bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      {/* main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* company info */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-primary-foreground font-bold text-lg">
                  SS
                </span>
              </motion.div>
              <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                ShopSphere
              </span>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your trusted marketplace connecting millions of shoppers with
              amazing products from verified sellers worldwide.
            </p>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>hello@shopsphere.com</span>
            </div>
          </motion.div>

          {/* columns 2 & 3 */}
          {session ? (
            <>
              {/* My Account */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  My&nbsp;Account
                </h4>
                <ul className="space-y-3">
                  {accountLinksAuth.map((link) => (
                    <motion.li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Explore */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Explore
                </h4>
                <ul className="space-y-3">
                  {exploreLinks.map((link) => (
                    <motion.li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </>
          ) : (
            <>
              {/* Account (guest) */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Account
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <motion.li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Navigation (guest) */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Navigation
                </h4>
                <ul className="space-y-3">
                  {shopLinks.map((link) => (
                    <motion.li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </>
          )}

          {/* Newsletter column (always shown) */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Stay in the loop
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Get the latest deals and updates delivered to your inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pr-12 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                />
                <motion.button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    {isSubscribed ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center"
                      >
                        ✓
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Send className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              <AnimatePresence>
                {isSubscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-green-600 dark:text-green-400"
                  >
                    Thanks for subscribing! 🎉
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>

        {/* bottom strip */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-200 dark:border-border/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span>© 2024 ShopSphere.</span>
            </div>

            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-500 dark:text-gray-400 ${social.color} transition-all duration-200`}
                    aria-label={social.name}
                  >
                    <motion.div whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }}>
                      {social.icon}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* scroll‑to‑top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 z-50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
