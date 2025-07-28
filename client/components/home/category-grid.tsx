"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ShirtIcon, 
  Smartphone, 
  Home, 
  BookOpen, 
  Dumbbell, 
  ShoppingBag,
  Gamepad2,
  Palette,
  ArrowRight
} from "lucide-react"

const categories = [
  { 
    name: "Electronics", 
    icon: Smartphone, 
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-500/20",
    href: "/products?category=electronics",
    description: "Latest gadgets & tech"
  },
  { 
    name: "Fashion", 
    icon: ShirtIcon, 
    iconColor: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-500/10",
    hoverBg: "hover:bg-pink-100 dark:hover:bg-pink-500/20",
    href: "/products?category=fashion",
    description: "Trendy styles & outfits"
  },
  { 
    name: "Home & Garden", 
    icon: Home, 
    iconColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    hoverBg: "hover:bg-green-100 dark:hover:bg-green-500/20",
    href: "/products?category=home",
    description: "Everything for your space"
  },
  { 
    name: "Books", 
    icon: BookOpen, 
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-500/20",
    href: "/products?category=books",
    description: "Knowledge & stories"
  },
  { 
    name: "Sports", 
    icon: Dumbbell, 
    iconColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    hoverBg: "hover:bg-orange-100 dark:hover:bg-orange-500/20",
    href: "/products?category=sports",
    description: "Fitness & outdoor gear"
  },
  { 
    name: "Accessories", 
    icon: ShoppingBag, 
    iconColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-500/10",
    hoverBg: "hover:bg-yellow-100 dark:hover:bg-yellow-500/20",
    href: "/products?category=accessories",
    description: "Perfect additions"
  },
  { 
    name: "Gaming", 
    icon: Gamepad2, 
    iconColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    hoverBg: "hover:bg-red-100 dark:hover:bg-red-500/20",
    href: "/products?category=gaming",
    description: "Games & accessories"
  },
  { 
    name: "Art & Crafts", 
    icon: Palette, 
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    hoverBg: "hover:bg-indigo-100 dark:hover:bg-indigo-500/20",
    href: "/products?category=art",
    description: "Creative supplies"
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export function CategoryGrid() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <motion.div key={category.name} variants={itemVariants}>
            <Link
              href={category.href}
              className="group block h-full"
            >
              <div className={`
                relative overflow-hidden rounded-xl p-6 lg:p-8
                bg-white dark:bg-gray-900/50
                border border-gray-200 dark:border-gray-800
                shadow-sm hover:shadow-md dark:hover:shadow-xl
                transition-all duration-300
                hover:-translate-y-1
              `}>
                {/* Icon */}
                <div className={`
                  inline-flex p-3 rounded-lg mb-4
                  ${category.bgColor} ${category.hoverBg}
                  transition-all duration-300
                  group-hover:scale-110
                `}>
                  <Icon className={`h-6 w-6 ${category.iconColor}`} />
                </div>
                
                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
                
                {/* Arrow indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}