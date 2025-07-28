"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User, 
  ChevronDown,
  Store,
  BarChart3,
  Home,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";

interface DashboardHeaderProps {
  type: "admin" | "vendor";
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
}

export function DashboardHeader({ 
  type, 
  title, 
  subtitle,
  userName = "User",
  userRole,
}: DashboardHeaderProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const roleConfig = {
    admin: {
      color: "bg-red-600",
      label: "Admin",
      avatar: "AD",
    },
    vendor: {
      color: "bg-blue-600", 
      label: "Vendor",
      avatar: "VN",
    }
  };

  const config = roleConfig[type];

  return (
    <motion.header 
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Brand and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ShopSphere
              </span>
            </div>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {type === "admin" ? (
                  <BarChart3 className="h-5 w-5 text-red-600" />
                ) : (
                  <Store className="h-5 w-5 text-blue-600" />
                )}
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-4">
            {/* Visit Marketplace button for vendors */}
            {type === "vendor" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-4 w-4 mr-2" />
                Visit Marketplace
              </Button>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Role Badge */}
            <Badge variant="secondary" className={`${config.color} text-white`}>
              {config.label}
            </Badge>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 pl-3 pr-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/${type}-avatar.jpg`} alt={userName} />
                    <AvatarFallback className={`${config.color} text-white`}>
                      {config.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {userName}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {userRole || config.label}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {type === "vendor" && (
                  <>
                    <DropdownMenuItem onClick={() => window.location.href = '/vendor/profile'}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Store Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 