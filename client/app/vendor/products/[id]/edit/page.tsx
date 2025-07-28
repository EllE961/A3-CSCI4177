"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { productService } from "@/lib/api/product-service"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Upload, X, Loader2, Save } from "lucide-react"
import type { Product } from "@/lib/api/product-service"

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Stock must be a non-negative number",
  }),
  category: z.string().min(1, "Please select a category"),
})

type ProductForm = z.infer<typeof productSchema>

const categories = [
  "electronics",
  "fashion",
  "home",
  "books",
  "sports",
  "accessories",
  "gaming",
  "art",
  "other"
]

export default function EditProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const selectedCategory = watch("category")

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const productData = await productService.getProduct(productId)
      setProduct(productData)
      setExistingImages(productData.images || [])
      
      // Set form values
      reset({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        stock: productData.quantityInStock.toString(),
        category: productData.category || "",
      })
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('Failed to load product')
      router.push('/vendor/products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalImages = existingImages.length - imagesToDelete.length + selectedImages.length + newFiles.length

    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    
    setSelectedImages([...selectedImages, ...validFiles])
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const toggleDeleteExistingImage = (imageUrl: string) => {
    if (imagesToDelete.includes(imageUrl)) {
      setImagesToDelete(imagesToDelete.filter(url => url !== imageUrl))
    } else {
      setImagesToDelete([...imagesToDelete, imageUrl])
    }
  }

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          
          const maxSize = 800
          let width = img.width
          let height = img.height
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
          
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          resolve(compressedBase64)
        }
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const onSubmit = async (data: ProductForm) => {
    if (!user || !product) return

    const remainingImages = existingImages.filter(img => !imagesToDelete.includes(img))
    if (remainingImages.length + selectedImages.length === 0) {
      toast.error("At least one image is required")
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare update data
      const updateData: any = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        quantityInStock: parseInt(data.stock),
        category: data.category,
      }

      // Add new images if any
      if (selectedImages.length > 0) {
        toast.info("Compressing images...")
        const compressedImages = await Promise.all(
          selectedImages.map(file => compressImage(file))
        )
        updateData.addImages = compressedImages
      }

      // Add images to delete if any
      if (imagesToDelete.length > 0) {
        updateData.deleteImages = imagesToDelete
      }

      await productService.updateProduct(productId, updateData)
      toast.success("Product updated successfully!")
      router.push("/vendor/products")
    } catch (error: any) {
      console.error('Failed to update product:', error)
      toast.error(error.message || "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/vendor/products">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Enter product name"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Describe your product..."
                        rows={5}
                        disabled={isSubmitting}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => setValue("category", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              <span className="capitalize">{category}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Inventory */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Inventory</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register("price")}
                          placeholder="0.00"
                          disabled={isSubmitting}
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          {...register("stock")}
                          placeholder="0"
                          disabled={isSubmitting}
                        />
                        {errors.stock && (
                          <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Product Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Existing Images */}
                      {existingImages.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Current Images</p>
                          <div className="grid grid-cols-2 gap-2">
                            {existingImages.map((image, index) => (
                              <div 
                                key={image} 
                                className={`relative group ${imagesToDelete.includes(image) ? 'opacity-50' : ''}`}
                              >
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={image}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleDeleteExistingImage(image)}
                                  className={`absolute top-1 right-1 p-1 rounded-full transition-opacity ${
                                    imagesToDelete.includes(image) 
                                      ? 'bg-green-500 opacity-100' 
                                      : 'bg-red-500 opacity-0 group-hover:opacity-100'
                                  }`}
                                  disabled={isSubmitting}
                                >
                                  {imagesToDelete.includes(image) ? (
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                  ) : (
                                    <X className="h-4 w-4 text-white" />
                                  )}
                                </button>
                                {index === 0 && !imagesToDelete.includes(image) && (
                                  <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-2 py-1 rounded">
                                    Main
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          {imagesToDelete.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {imagesToDelete.length} image(s) will be deleted
                            </p>
                          )}
                        </div>
                      )}

                      {/* New Image Upload */}
                      <div>
                        <p className="text-sm font-medium mb-2">Add New Images</p>
                        <div className="relative">
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            disabled={isSubmitting || (existingImages.length - imagesToDelete.length + selectedImages.length >= 5)}
                            className="hidden"
                          />
                          <label
                            htmlFor="image-upload"
                            className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                              isSubmitting || (existingImages.length - imagesToDelete.length + selectedImages.length >= 5)
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                            }`}
                          >
                            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                            <p className="text-xs font-medium">
                              {existingImages.length - imagesToDelete.length + selectedImages.length >= 5
                                ? 'Maximum 5 images'
                                : 'Click to upload'}
                            </p>
                          </label>
                        </div>

                        {/* New Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={preview}
                                    alt={`New image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Product
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/vendor/products")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}