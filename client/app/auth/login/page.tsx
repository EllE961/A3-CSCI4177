"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)

    try {
        const user = await signIn(data.email, data.password)
        toast.success("Welcome back!")
        
        // Redirect based on user role
        if (user.role === 'admin') {
          router.push("/admin")
        } else if (user.role === 'vendor') {
          router.push("/vendor")
        } else {
          router.push("/")
        }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    // For now, show a message that OAuth is not implemented
    // You can implement OAuth later if needed
    toast.info(`${provider} sign-in will be available soon`)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 py-16 relative">
      <Link href="/" className="absolute top-4 left-4">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg">
            <span className="text-primary-foreground font-bold text-xl">SS</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your ShopSphere account</p>
        </div>

        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleOAuthSignIn("google")} 
                disabled={isLoading}
                className="h-11 border-border/50 hover:border-primary/50 transition-all duration-200"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleOAuthSignIn("github")} 
                disabled={isLoading}
                className="h-11 border-border/50 hover:border-primary/50 transition-all duration-200"
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  disabled={isLoading}
                  className="h-11 border-border/50 focus:border-primary/50 transition-all duration-200"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <span className="text-sm text-muted-foreground">
                    Forgot password? Contact support
                  </span>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  {...register("password")} 
                  disabled={isLoading}
                  className="h-11 border-border/50 focus:border-primary/50 transition-all duration-200"
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={isLoading}
              >
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Create account
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Want to sell on ShopSphere?{" "}
            <Link href="/auth/register?role=vendor" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Become a seller
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
