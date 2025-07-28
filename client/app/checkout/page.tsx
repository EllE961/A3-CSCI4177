"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { cartService } from "@/lib/api/cart-service"
import { paymentService } from "@/lib/api/payment-service"
import { orderService } from "@/lib/api/order-service"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { CreditCard, Loader2, CheckCircle } from "lucide-react"
import type { CartTotals } from "@/lib/api/cart-service"
import type { PaymentMethod } from "@/lib/api/payment-service"

const checkoutSchema = z.object({
  // Shipping Address
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  
  // Payment
  paymentMethodId: z.string().min(1, "Please select a payment method"),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [totals, setTotals] = useState<CartTotals | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "USA",
    }
  })

  const selectedPaymentMethod = watch("paymentMethodId")

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (user.role !== 'consumer') {
      router.push('/')
      toast.error('Only consumers can checkout')
      return
    }

    fetchCheckoutData()
  }, [user, router])

  const fetchCheckoutData = async () => {
    try {
      const [cartTotals, methods] = await Promise.all([
        cartService.getCartTotals(),
        paymentService.getPaymentMethods()
      ])

      if (cartTotals.totalItems === 0) {
        router.push('/cart')
        toast.error('Your cart is empty')
        return
      }

      setTotals(cartTotals)
      setPaymentMethods(methods)
      
      // Select first payment method by default
      if (methods.length > 0) {
        setValue("paymentMethodId", methods[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch checkout data:', error)
      toast.error('Failed to load checkout information')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CheckoutForm) => {
    setProcessing(true)

    try {
      // 1. Create payment
      const payment = await paymentService.createPayment({
        amount: totals!.total,
        paymentMethodId: data.paymentMethodId,
        currency: 'usd'
      })

      // 2. Create order with payment's parentOrderId
      const orders = await orderService.createOrder({
        parentOrderId: payment.parentOrderId,
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        paymentMethod: data.paymentMethodId,
      })

      // 3. Clear cart after successful order
      await cartService.clearCart()

      setOrderComplete(true)
      toast.success('Order placed successfully!')

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        router.push('/orders')
      }, 2000)

    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error('Failed to complete checkout. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">Order Placed!</h1>
          <p className="text-muted-foreground">Thank you for your purchase.</p>
          <p className="text-sm text-muted-foreground">Redirecting to your orders...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Left Column - Shipping & Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          {...register("street")}
                          placeholder="123 Main St"
                          disabled={processing}
                        />
                        {errors.street && (
                          <p className="text-sm text-destructive mt-1">{errors.street.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          placeholder="New York"
                          disabled={processing}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          {...register("state")}
                          placeholder="NY"
                          disabled={processing}
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode")}
                          placeholder="10001"
                          disabled={processing}
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-destructive mt-1">{errors.zipCode.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          {...register("country")}
                          placeholder="USA"
                          disabled={processing}
                        />
                        {errors.country && (
                          <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethods.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No payment methods saved</p>
                        <Button variant="outline" disabled>
                          Add Payment Method
                        </Button>
                        <p className="text-sm text-muted-foreground mt-4">
                          For testing, we'll use a mock payment method
                        </p>
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedPaymentMethod}
                        onValueChange={(value) => setValue("paymentMethodId", value)}
                        disabled={processing}
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="capitalize">{method.card.brand}</span>
                                  <span>•••• {method.card.last4}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {method.card.expMonth}/{method.card.expYear}
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {errors.paymentMethodId && (
                      <p className="text-sm text-destructive mt-2">{errors.paymentMethodId.message}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="mt-6 lg:mt-0">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({totals?.totalItems || 0} items)</span>
                        <span>${totals?.subtotal.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>${totals?.estimatedTax.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${totals?.total.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={processing || paymentMethods.length === 0}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Place Order - $${totals?.total.toFixed(2) || '0.00'}`
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      By placing this order, you agree to our terms and conditions
                    </p>
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