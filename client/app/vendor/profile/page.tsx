"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { userService, type VendorProfile } from "@/lib/api/user-service"
import { authService } from "@/lib/api/auth-service"
import { motion } from "framer-motion"
import { 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Settings, 
  Edit,
  Save,
  X,
  Loader2,
  Shield,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
  DollarSign,
  Users,
  Eye,
  ArrowLeft,
  Upload,
  Github,
  Linkedin,
  Youtube,
  MessageCircle,
  Hash,
  Video,
  Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Canadian phone number validation
const isValidCanadianPhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
  return phoneRegex.test(phoneNumber)
}

// Format phone number to standard format
const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[^\d]/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phoneNumber
}

// Compress image to reduce file size
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

        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataUrl)
      }
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Get social media icon
const getSocialIcon = (url: string) => {
  const lowerUrl = url.toLowerCase()
  
  // Major social media with specific icons
  if (lowerUrl.includes('facebook.com')) return <Facebook className="h-4 w-4" />
  if (lowerUrl.includes('instagram.com')) return <Instagram className="h-4 w-4" />
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <Twitter className="h-4 w-4" />
  if (lowerUrl.includes('github.com')) return <Github className="h-4 w-4" />
  if (lowerUrl.includes('linkedin.com')) return <Linkedin className="h-4 w-4" />
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <Youtube className="h-4 w-4" />
  
  // Use alternative icons for platforms without specific icons
  if (lowerUrl.includes('threads.net')) return <Hash className="h-4 w-4" /> // Threads (using Hash as it's text-based)
  if (lowerUrl.includes('tiktok.com')) return <Video className="h-4 w-4" /> // TikTok (video platform)
  if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me')) return <MessageCircle className="h-4 w-4" /> // WhatsApp
  if (lowerUrl.includes('telegram.org') || lowerUrl.includes('t.me')) return <MessageCircle className="h-4 w-4" /> // Telegram
  if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) return <MessageCircle className="h-4 w-4" /> // Discord
  if (lowerUrl.includes('snapchat.com')) return <Camera className="h-4 w-4" /> // Snapchat
  if (lowerUrl.includes('twitch.tv')) return <Video className="h-4 w-4" /> // Twitch
  
  // Default
  return <Globe className="h-4 w-4" />
}

export default function VendorProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    storeName: "",
    location: "",
    phoneNumber: "",
    logoUrl: "",
    storeBannerUrl: "",
    socialLinks: [] as string[]
  })

  // Social link management
  const [newSocialLink, setNewSocialLink] = useState("")
  const [isAddingSocialLink, setIsAddingSocialLink] = useState(false)
  
  // Image upload refs and states
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordErrors, setPasswordErrors] = useState<{
    oldPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      router.push('/')
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const profileData = await userService.getVendorProfile()
      
      setProfile(profileData)
      setEditedProfile({
        storeName: profileData.storeName,
        location: profileData.location,
        phoneNumber: profileData.phoneNumber,
        logoUrl: profileData.logoUrl || "",
        storeBannerUrl: profileData.storeBannerUrl || "",
        socialLinks: profileData.socialLinks || []
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    // Validate phone number
    if (!isValidCanadianPhoneNumber(editedProfile.phoneNumber)) {
      toast.error('Please enter a valid Canadian phone number')
      return
    }

    try {
      setIsSaving(true)
      const formattedProfile = {
        storeName: editedProfile.storeName,
        location: editedProfile.location,
        phoneNumber: editedProfile.phoneNumber, // Send raw phone number, backend will clean it
        logoUrl: editedProfile.logoUrl,
        storeBannerUrl: editedProfile.storeBannerUrl,
        socialLinks: editedProfile.socialLinks
      }
      
      const response = await userService.updateVendorProfile(formattedProfile)
      
      // The response has profile data in response.profile
      const updatedProfile = response.profile
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        // Also update editedProfile to ensure it has the latest data
        setEditedProfile({
          storeName: updatedProfile.storeName,
          location: updatedProfile.location,
          phoneNumber: updatedProfile.phoneNumber,
          logoUrl: updatedProfile.logoUrl || "",
          storeBannerUrl: updatedProfile.storeBannerUrl || "",
          socialLinks: updatedProfile.socialLinks || []
        })
      }
      
      setIsEditing(false)
      toast.success('Profile updated successfully')
      
      // Refresh the profile to ensure we have the latest data
      setTimeout(() => {
        fetchProfile()
      }, 500)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSocialLink = async () => {
    if (!newSocialLink.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    try {
      new URL(newSocialLink)
      const updatedLinks = [...editedProfile.socialLinks, newSocialLink]
      
      // Update local state
      setEditedProfile({
        ...editedProfile,
        socialLinks: updatedLinks
      })
      
      // Save to backend
      setIsSaving(true)
      try {
        const response = await userService.updateVendorProfile({
          ...editedProfile,
          socialLinks: updatedLinks
        })
        
        if (response.profile) {
          setProfile(response.profile)
          // Update editedProfile with the response to ensure consistency
          setEditedProfile({
            ...editedProfile,
            socialLinks: response.profile.socialLinks || []
          })
          toast.success('Social media link added successfully')
        }
      } catch (error) {
        console.error('Failed to save social link:', error)
        toast.error('Failed to save social media link')
        // Revert the change on error
        setEditedProfile({
          ...editedProfile,
          socialLinks: editedProfile.socialLinks
        })
      } finally {
        setIsSaving(false)
      }
      
      setNewSocialLink("")
      setIsAddingSocialLink(false)
    } catch {
      toast.error('Please enter a valid URL')
    }
  }

  const handleRemoveSocialLink = async (index: number) => {
    const updatedLinks = editedProfile.socialLinks.filter((_, i) => i !== index)
    
    // Update local state
    setEditedProfile({
      ...editedProfile,
      socialLinks: updatedLinks
    })
    
    // Save to backend
    setIsSaving(true)
    try {
      const response = await userService.updateVendorProfile({
        ...editedProfile,
        socialLinks: updatedLinks
      })
      
      if (response.profile) {
        setProfile(response.profile)
        // Update editedProfile with the response to ensure consistency
        setEditedProfile({
          ...editedProfile,
          socialLinks: response.profile.socialLinks || []
        })
        toast.success('Social media link removed successfully')
      }
    } catch (error) {
      console.error('Failed to remove social link:', error)
      toast.error('Failed to remove social media link')
      // Revert the change on error
      setEditedProfile({
        ...editedProfile,
        socialLinks: editedProfile.socialLinks
      })
    } finally {
      setIsSaving(false)
    }
  }

  const validatePasswordForm = (): boolean => {
    const errors: typeof passwordErrors = {}
    
    if (!passwordForm.oldPassword) {
      errors.oldPassword = "Current password is required"
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required"
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters"
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password"
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return
    }

    try {
      setIsSaving(true)
      await authService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      })
      
      toast.success('Password changed successfully')
      setIsChangingPassword(false)
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setPasswordErrors({})
    } catch (error: any) {
      console.error('Failed to change password:', error)
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setPasswordErrors({ oldPassword: 'Current password is incorrect' })
      } else {
        toast.error('Failed to change password')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingLogo(true)
      const compressedImage = await compressImage(file, 400) // 400px max for logo
      setEditedProfile({ ...editedProfile, logoUrl: compressedImage })
      
      // Auto-save the logo
      const response = await userService.updateVendorProfile({
        ...editedProfile,
        logoUrl: compressedImage
      })
      
      if (response.profile) {
        setProfile(response.profile)
        toast.success('Logo updated successfully')
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingBanner(true)
      const compressedImage = await compressImage(file, 1200) // 1200px max for banner
      setEditedProfile({ ...editedProfile, storeBannerUrl: compressedImage })
      
      // Auto-save the banner
      const response = await userService.updateVendorProfile({
        ...editedProfile,
        storeBannerUrl: compressedImage
      })
      
      if (response.profile) {
        setProfile(response.profile)
        toast.success('Banner updated successfully')
      }
    } catch (error) {
      console.error('Failed to upload banner:', error)
      toast.error('Failed to upload banner')
    } finally {
      setIsUploadingBanner(false)
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Store Profile</h1>
              <p className="text-muted-foreground">Manage your store information and settings</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => window.open(`/shop/${profile.vendorId}`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Store
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile">Store Info</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Store Info Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-600/10 flex items-center justify-center">
                      <Store className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Business Information</CardTitle>
                      <CardDescription>Update your store details</CardDescription>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input
                          id="storeName"
                          value={editedProfile.storeName}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            storeName: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editedProfile.location}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            location: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={editedProfile.phoneNumber}
                          onChange={(e) => setEditedProfile({
                            ...editedProfile,
                            phoneNumber: e.target.value
                          })}
                          placeholder="(416) 555-0123"
                        />
                        <p className="text-xs text-muted-foreground">Canadian phone number format</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={isSaving}
                      >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedProfile({
                            storeName: profile.storeName,
                            location: profile.location,
                            phoneNumber: profile.phoneNumber,
                            logoUrl: profile.logoUrl || "",
                            storeBannerUrl: profile.storeBannerUrl || "",
                            socialLinks: profile.socialLinks || []
                          })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Store Name</p>
                      <p className="font-medium">{profile.storeName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{profile.location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{profile.phoneNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Store Rating</p>
                      <p className="font-medium">{profile.rating || "No ratings yet"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Approval Status</p>
                      <Badge variant={profile.isApproved ? "default" : "secondary"}>
                        {profile.isApproved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Vendor ID</p>
                      <p className="font-medium">{profile.vendorId}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/vendor/products')}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold">Products</p>
                      <p className="text-sm text-muted-foreground">Manage inventory</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/vendor/analytics')}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold">Analytics</p>
                      <p className="text-sm text-muted-foreground">View insights</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Branding</CardTitle>
                <CardDescription>Customize your store's visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Store Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {profile.logoUrl ? (
                        <img 
                          src={profile.logoUrl} 
                          alt="Store logo" 
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploadingLogo}
                      >
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Change Logo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Store Banner</Label>
                    <div className="mt-2 space-y-4">
                      {profile.storeBannerUrl ? (
                        <img 
                          src={profile.storeBannerUrl} 
                          alt="Store banner" 
                          className="w-full h-48 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploadingBanner}
                      >
                        {isUploadingBanner ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Change Banner
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Connect your social media accounts</CardDescription>
                  </div>
                  <Dialog open={isAddingSocialLink} onOpenChange={setIsAddingSocialLink}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Social Media Link</DialogTitle>
                        <DialogDescription>
                          Enter the URL of your social media profile
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="socialLink">URL</Label>
                          <Input
                            id="socialLink"
                            type="url"
                            value={newSocialLink}
                            onChange={(e) => setNewSocialLink(e.target.value)}
                            placeholder="https://facebook.com/yourstore"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingSocialLink(false)
                            setNewSocialLink("")
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddSocialLink}>
                          Add Link
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {editedProfile.socialLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No social media links added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editedProfile.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSocialIcon(link)}
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            {link}
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSocialLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Keep your account secure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword">Current Password</Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                            setPasswordErrors({ ...passwordErrors, oldPassword: undefined })
                          }}
                          placeholder="Enter current password"
                        />
                        {passwordErrors.oldPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.oldPassword}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                            setPasswordErrors({ ...passwordErrors, newPassword: undefined })
                          }}
                          placeholder="Enter new password"
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => {
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                            setPasswordErrors({ ...passwordErrors, confirmPassword: undefined })
                          }}
                          placeholder="Confirm new password"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordForm({
                            oldPassword: "",
                            newPassword: "",
                            confirmPassword: ""
                          })
                          setPasswordErrors({})
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleChangePassword} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Change Password
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Two-Factor Authentication
                  <Badge variant="outline" className="ml-auto">Coming Soon</Badge>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// Loading Skeleton
function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-[600px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-16 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}