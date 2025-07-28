"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { authService } from "@/lib/api/auth-service"
import { toast } from "sonner"
import { 
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Eye,
  Store,
  LayoutDashboard,
  Settings,
  LogOut,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const vendorNavItems = [
  {
    title: "Dashboard",
    href: "/vendor",
    icon: LayoutDashboard
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart
  },
  {
    title: "Analytics",
    href: "/vendor/analytics",
    icon: BarChart3
  },
  {
    title: "Profile",
    href: "/vendor/profile",
    icon: Settings
  }
]

interface VendorHeaderProps {
  vendorId?: string
}

export function VendorHeader({ vendorId }: VendorHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await authService.logout()
      signOut()
      router.push('/auth/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          <Link href="/vendor" className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            <span className="font-semibold">Vendor Portal</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {vendorNavItems.map((item) => {
              const href = item.href
              const isActive = pathname === item.href
              const Icon = item.icon

              if (false) {
                return (
                  <a
                    key={item.title}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </a>
                )
              }

              return (
                <Link
                  key={item.title}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Vendor Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'vendor@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/vendor/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}