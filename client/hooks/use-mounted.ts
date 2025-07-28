"use client"

import { useState, useEffect } from "react"

/**
 * A hook to check if the component has mounted.
 * Useful for preventing hydration errors with client-side only logic.
 * @returns {boolean} - True if the component has mounted, false otherwise.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
