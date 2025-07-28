"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Gift, Zap, Shield } from "lucide-react"
import { toast } from "sonner"

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type NewsletterForm = z.infer<typeof newsletterSchema>

const benefits = [
  {
    icon: <Gift className="h-5 w-5" />,
    title: "Exclusive Deals",
    description: "Get access to subscriber-only discounts and offers"
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Early Access",
    description: "Be the first to know about new products and sales"
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "No Spam",
    description: "We respect your inbox - quality content only"
  }
]

export function Newsletter() {
  const [isLoading, setIsLoading] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
  })

  const onSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock subscription success
      toast.success("Thank you for subscribing! Check your email for confirmation.")
      reset()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background gradient layer */}
      <div className="absolute inset-0 animated-gradient-background" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="relative overflow-hidden bg-white/95 dark:bg-background/95 backdrop-blur-sm border-gray-200/60 dark:border-white/20 shadow-xl">
            
            <CardContent className="relative p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-8 w-8 text-primary" />
                      <h3 className="text-2xl md:text-3xl font-bold">
                        Stay in the Loop
                      </h3>
                    </div>
                    
                    <p className="text-lg text-muted-foreground">
                      Subscribe to our newsletter and never miss out on the latest deals, 
                      new arrivals, and exclusive offers from your favorite vendors.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="text-primary mt-0.5">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{benefit.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {benefit.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...register("email")}
                        disabled={isLoading}
                        className="h-12 text-base"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 text-base"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    By subscribing, you agree to our{" "}
                    <a href="/privacy" className="underline hover:text-primary">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="/terms" className="underline hover:text-primary">
                      Terms of Service
                    </a>
                    . You can unsubscribe at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
} 