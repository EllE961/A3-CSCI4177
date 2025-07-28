export interface Address {
  id: string
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: "consumer" | "seller" | "admin"
  image?: string
  createdAt: string
  updatedAt: string
}
