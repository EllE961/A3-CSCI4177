"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check } from "lucide-react"
import { useSettings } from "@/components/settings-provider"
import { motion } from "framer-motion"

const currencies = [
  { 
    code: "USD", 
    symbol: "$", 
    name: "US Dollar",
    flag: "🇺🇸",
    color: "from-blue-500 to-red-500"
  },
  { 
    code: "CAD", 
    symbol: "C$", 
    name: "Canadian Dollar",
    flag: "🇨🇦",
    color: "from-red-500 to-white"
  },
  { 
    code: "GBP", 
    symbol: "£", 
    name: "British Pound",
    flag: "🇬🇧",
    color: "from-blue-600 to-red-600"
  },
  { 
    code: "EUR", 
    symbol: "€", 
    name: "Euro",
    flag: "🇪🇺",
    color: "from-blue-600 to-yellow-500"
  },
] as const

export function CurrencySelector() {
  const { currency, setCurrency } = useSettings()
  const [isOpen, setIsOpen] = React.useState(false)

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-xl border border-border/50 hover:border-border bg-background/50 backdrop-blur-sm hover:bg-accent/80 transition-all duration-300 group shadow-sm hover:shadow-md overflow-hidden"
        >
          <motion.div
            key={currentCurrency.code}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1"
          >
            <span className="text-lg">{currentCurrency.flag}</span>
          </motion.div>
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${currentCurrency.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          />
          <span className="sr-only">Toggle currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl p-2"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          {currencies.map((curr, index) => {
            const isSelected = currency === curr.code
            
            return (
              <motion.div
                key={curr.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <DropdownMenuItem
                  onClick={() => {
                    setCurrency(curr.code)
                    setIsOpen(false)
                  }}
                  className={`
                    group relative cursor-pointer rounded-lg px-3 py-3 transition-all duration-200
                    hover:bg-accent/50 focus:bg-accent/50
                    ${isSelected ? 'bg-primary/10' : ''}
                  `}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      {/* Flag with subtle animation */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl flex-shrink-0"
                      >
                        {curr.flag}
                      </motion.div>
                      
                      {/* Currency info */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {curr.code}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className={`font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                            {curr.symbol}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {curr.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Check icon */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Selected background */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-primary/5 rounded-lg border border-primary/20"
                    />
                  )}
                  
                  {/* Hover gradient effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${curr.color} opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300`}
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