import { paymentApi } from './api-client'

export interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault?: boolean
}

export interface Payment {
  _id: string
  paymentId: string
  parentOrderId: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded'
  paymentMethod: string
  stripePaymentIntentId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePaymentDto {
  amount: number
  currency?: string
  paymentMethodId: string
  savePaymentMethod?: boolean
}

export interface SetupIntentResponse {
  clientSecret: string
  setupIntentId: string
}

export interface RefundPaymentDto {
  amount?: number // Optional partial refund
  reason?: string
}

class PaymentService {
  async createSetupIntent(): Promise<SetupIntentResponse> {
    return paymentApi.post<SetupIntentResponse>('/setup-intent')
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return paymentApi.get<PaymentMethod[]>('/payment-methods')
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    return paymentApi.delete<{ message: string }>(`/payment-methods/${paymentMethodId}`)
  }

  async savePaymentMethod(paymentMethodId: string): Promise<{ message: string; paymentMethod: PaymentMethod }> {
    return paymentApi.post<{ message: string; paymentMethod: PaymentMethod }>('/consumer/payment-methods', {
      paymentMethodId
    })
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    return paymentApi.put<{ message: string }>(`/consumer/payment-methods/${paymentMethodId}/default`)
  }

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    return paymentApi.post<Payment>('/', data)
  }

  async getPayments(): Promise<Payment[]> {
    return paymentApi.get<Payment[]>('/')
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return paymentApi.get<Payment>(`/${paymentId}`)
  }

  async refundPayment(paymentId: string, data?: RefundPaymentDto): Promise<{ message: string; refund: any }> {
    return paymentApi.post<{ message: string; refund: any }>(`/${paymentId}/refund`, data || {})
  }
}

export const paymentService = new PaymentService()