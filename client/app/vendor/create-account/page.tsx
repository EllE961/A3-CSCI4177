"use client"

import { useState, useRef } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

const profileSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  location: z.string().min(2, "Location is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  logoUrl: z.string().optional().refine((val) => {
    if (!val || val === '') return true
    // Accept URLs or data URLs
    return val.startsWith('http') || val.startsWith('https') || val.startsWith('data:image/')
  }, "Invalid image URL or format"),
  storeBannerUrl: z.string().optional().refine((val) => {
    if (!val || val === '') return true
    // Accept URLs or data URLs
    return val.startsWith('http') || val.startsWith('https') || val.startsWith('data:image/')
  }, "Invalid image URL or format"),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function CreateVendorAccountPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [bannerPreview, setBannerPreview] = useState<string>("")
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const logoUrl = watch("logoUrl")
  const bannerUrl = watch("storeBannerUrl")

  const compressImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to data URL with more compression
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
          resolve(dataUrl)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
    // Check file size (1MB limit for better base64 handling)
    const maxSize = 1 * 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 1MB')
      return
    }

    try {
      // Compress image more aggressively to reduce size
      const maxDimension = type === 'logo' ? 200 : 600
      const compressedDataUrl = await compressImage(file, maxDimension)
      
      if (type === 'logo') {
        setLogoPreview(compressedDataUrl)
        setValue('logoUrl', compressedDataUrl)
        toast.success('Logo uploaded successfully')
      } else {
        setBannerPreview(compressedDataUrl)
        setValue('storeBannerUrl', compressedDataUrl)
        toast.success('Banner uploaded successfully')
      }
    } catch (error) {
      toast.error('Failed to process image')
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    setSubmitting(true)
    try {
      // Ensure we have valid URLs or base64 data
      const profileData = {
        storeName: data.storeName,
        location: data.location,
        phoneNumber: data.phoneNumber,
        logoUrl: data.logoUrl || logoPreview || undefined,
        storeBannerUrl: data.storeBannerUrl || bannerPreview || undefined,
        socialLinks: [],
      }
      
      console.log('Submitting vendor profile:', {
        ...profileData,
        logoUrl: profileData.logoUrl ? profileData.logoUrl.substring(0, 50) + '...' : 'none',
        storeBannerUrl: profileData.storeBannerUrl ? profileData.storeBannerUrl.substring(0, 50) + '...' : 'none',
      })
      
      await userService.createVendorProfile(profileData)
      toast.success("Profile created")
      router.push("/vendor")
    } catch (error: any) {
      console.error('Profile creation error:', error)
      if (error.message?.includes('413') || error.message?.includes('too large')) {
        toast.error('Images are too large. Please use smaller images or compress them further.')
      } else {
        toast.error(error.message || "Failed to create profile")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-center">Set up your store</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store name</Label>
                <Input id="storeName" {...register("storeName")} disabled={submitting} />
                {errors.storeName && <p className="text-sm text-destructive">{errors.storeName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} disabled={submitting} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input id="phoneNumber" {...register("phoneNumber")} disabled={submitting} />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <Link2 className="mr-2 h-4 w-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="mt-4">
                    <Input 
                      id="logoUrl" 
                      placeholder="https://example.com/logo.png"
                      {...register("logoUrl")} 
                      disabled={submitting} 
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                    <div className="space-y-4">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'logo')
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={submitting}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Choose Logo Image
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Max size: 1MB. Images will be compressed.
                      </p>
                      {logoPreview && (
                        <div className="relative w-32 h-32 mx-auto">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Store Banner</Label>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <Link2 className="mr-2 h-4 w-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="mt-4">
                    <Input 
                      id="storeBannerUrl" 
                      placeholder="https://example.com/banner.png"
                      {...register("storeBannerUrl")} 
                      disabled={submitting} 
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                    <div className="space-y-4">
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, 'banner')
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={submitting}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Choose Banner Image
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Max size: 1MB. Images will be compressed.
                      </p>
                      {bannerPreview && (
                        <div className="relative w-full h-32">
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                {errors.storeBannerUrl && <p className="text-sm text-destructive">{errors.storeBannerUrl.message}</p>}
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