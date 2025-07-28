"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { useSettings } from "@/components/settings-provider"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme } = useTheme()
  const { updateTheme } = useSettings()

  const themes = [
    { 
      value: "light", 
      label: "Light", 
      icon: Sun,
      gradient: "from-orange-300 to-yellow-300",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    { 
      value: "dark", 
      label: "Dark", 
      icon: Moon,
      gradient: "from-blue-600 to-purple-600",
      bgColor: "bg-gray-900/10 dark:bg-gray-900/50"
    },
    { 
      value: "system", 
      label: "System", 
      icon: Monitor,
      gradient: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-800/50"
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-xl border border-border/50 hover:border-border bg-background/50 backdrop-blur-sm hover:bg-accent/80 transition-all duration-300 group shadow-sm hover:shadow-md"
        >
          <div className="relative">
            <motion.div
              key="sun"
              initial={false}
              animate={{ 
                rotate: theme === "dark" ? -90 : 0, 
                scale: theme === "dark" ? 0 : 1,
                opacity: theme === "dark" ? 0 : 1 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.3 
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] text-orange-500 group-hover:text-orange-600 transition-colors duration-200" />
            </motion.div>
            
            <motion.div
              key="moon"
              initial={false}
              animate={{ 
                rotate: theme === "dark" ? 0 : 90, 
                scale: theme === "dark" ? 1 : 0,
                opacity: theme === "dark" ? 1 : 0 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.3 
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="h-[1.2rem] w-[1.2rem] text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
            </motion.div>
            
            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{
                background: theme === "dark" 
                  ? "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                  : "linear-gradient(45deg, rgba(251, 146, 60, 0.1), rgba(250, 204, 21, 0.1))"
              }}
            />
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl p-2"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          {themes.map((themeOption, index) => {
            const Icon = themeOption.icon
            const isSelected = theme === themeOption.value
            
            return (
              <motion.div
                key={themeOption.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <DropdownMenuItem 
                  onClick={() => updateTheme(themeOption.value)}
                  className={`
                    group relative cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200
                    hover:bg-accent/50 focus:bg-accent/50
                    ${isSelected ? 'bg-primary/10 text-primary' : 'text-foreground'}
                  `}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`
                      relative p-1.5 rounded-lg transition-all duration-200
                      ${isSelected ? themeOption.bgColor : 'bg-muted/50 group-hover:bg-muted'}
                    `}>
                      <Icon className={`
                        h-4 w-4 transition-all duration-200
                        ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
                      `} />
                      
                      {/* Icon glow effect for selected theme */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute inset-0 rounded-lg bg-gradient-to-r ${themeOption.gradient} opacity-20 blur-sm`}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <span className={`
                      font-medium transition-colors duration-200
                      ${isSelected ? 'text-primary' : ''}
                    `}>
                      {themeOption.label}
                    </span>
                  </div>
                  
                  {/* Background highlight for selected item */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-primary/5 rounded-lg border border-primary/20"
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-accent/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.1 }}
                  />
                </DropdownMenuItem>
              </motion.div>
            )
          })}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 