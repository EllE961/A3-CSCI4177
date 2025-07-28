"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { userService } from "@/lib/api/user-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"

// Canadian phone number validation
const canadianPhoneRegex = /^(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phoneNumber: z.string()
    .min(10, "Phone number is required")
    .regex(canadianPhoneRegex, "Please enter a valid Canadian phone number"),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function CreateConsumerAccountPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const checkProfile = async () => {
      if (!user || user.role !== 'consumer') {
        router.push('/')
        return
      }

      try {
        // Try to get existing profile
        await userService.getConsumerProfile()
        // If successful, redirect to profile page
        router.push('/consumer/profile')
      } catch (error) {
        // Profile doesn't exist, stay on this page
        setChecking(false)
      }
    }

    checkProfile()
  }, [user, router])

  const onSubmit = async (data: ProfileForm) => {
    setSubmitting(true)
    try {
      await userService.createConsumerProfile(data)
      toast.success("Profile created")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile")
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-center">Complete your profile</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...register("fullName")} disabled={submitting} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input 
                  id="phoneNumber" 
                  type="tel"
                  placeholder="(416) 555-0123"
                  {...register("phoneNumber")} 
                  disabled={submitting} 
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                <p className="text-xs text-muted-foreground">Canadian phone number format</p>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}