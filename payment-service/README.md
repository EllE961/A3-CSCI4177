
# 💳 **payment‑service API**

Handles payment transactions and saved payment methods via **Stripe** for **ShopSphere**.

**Base path:** `/api/payments`

> **Internal Stripe Customer Mapping**  
> Each authenticated consumer is mapped to a Stripe **Customer** behind the scenes.  
> The `stripeCustomerId` never leaves the payment‑service; you just use your JWT.

---

## 0. Health Check

### GET `/health`
Returns the health status of the payments service.

---

## 1. SetupIntent helper

### POST `/setup-intent`
Returns a Stripe **SetupIntent** `client_secret` so the front‑end can securely collect card details.

**Headers**
```
Authorization: Bearer <token>
```

**Success 201**
```json
{
  "setupIntentId": "seti_1OC...",
  "clientSecret": "seti_1OC..._secret_xyz"
}
```

---

## 2. Payment Methods

| Method | Path | Purpose |
|--------|------|---------|
| **POST**   | `/consumer/payment-methods`         | Save a Stripe `pm_…` to the consumer |
| **GET**    | `/payment-methods`                 | List saved cards |
| **PUT**    | `/consumer/payment-methods/:id/default` | Make a saved card default |
| **DELETE** | `/payment-methods/:paymentMethodId` | Remove a saved card |

### 2.1 POST `/consumer/payment-methods`
```json
{
  "paymentMethodToken": "pm_123456789",
  "billingDetails": { "name": "Abdullah Al Salmi", "email": "abdullah@example.com" }
}
```
**Success 201**
```json
{
  "message": "Payment method saved successfully.",
  "paymentMethod": {
    "paymentMethodId": "pm_123456789",
    "brand": "Visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2028,
    "default": false
  }
}
```

### 2.2 GET `/payment-methods`
```json
{
  "paymentMethods": [
    {
      "paymentMethodId": "pm_123456789",
      "brand": "Visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2028,
      "isDefault": true
    }
  ]
}
```

### 2.3 PUT `/consumer/payment-methods/:id/default`
```json
{ "message": "Default payment method updated." }
```

### 2.4 DELETE `/payment-methods/:paymentMethodId`
`204 No Content`

---

## 3. Payments (Checkout)

| Method | Path | Purpose |
|--------|------|---------|
| **POST** | `/` | Charge the consumer for an order (Stripe PaymentIntent) |
| **GET**  | `/` | List consumer’s payments (supports pagination) |
| **GET**  | `/:paymentId` | Fetch one payment record by ID |
| **POST** | `/:paymentId/refund` | Refund a payment |

### 3.1 POST `/`
Charge the consumer for all items in their cart. The payment service will:
- Validate the cart, check product prices and stock, and decrement stock for each item.
- Generate a unique `orderId` (parent order id) for this checkout.
- Process the payment via Stripe.
- Return the payment record, including the generated `orderId`.

**Request:**
```json
{
  "amount": 259900,
  "currency": "CAD",
  "paymentMethodId": "pm_123456789"
}
```
**Success 201**
```json
{
  "payment": {
    "id": "PAYMENT_ID",
    "orderId": "PARENT_ORDER_ID",
    "paymentIntentId": "pi_...",
    "paymentMethodId": "pm_...",
    "amount": 259900,
    "currency": "CAD",
    "status": "succeeded",
    "createdAt": "2025-06-11T18:30:00Z"
  }
}
```

**Integration with Order Service:**
- After payment succeeds, use the returned `orderId` and `payment.id` to create the order(s) in the order service:
```json
{
  "paymentId": "PAYMENT_ID",
  "orderId": "PARENT_ORDER_ID",
  "consumerId": "USER_ID",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Halifax",
    "postalCode": "B3H 1Y4",
    "country": "CA"
  }
}
```
The order service will split the order by vendor and create a child order for each vendor, all referencing the same parent `orderId`.

### 3.2 GET `/`
Query params: `?page=1&limit=10`
```json
{
  "payments": [
    {
      "paymentId": "pi_ABC123456789",
      "amount": 259900,
      "currency": "cad",
      "status": "succeeded",
      "createdAt": "2025-06-11T18:30:00Z",
      "paymentMethod": { "brand": "Visa", "last4": "4242" },
      "orderId": "o987"
    }
  ]
}
```

### 3.3 GET `/:paymentId`
Fetch a specific payment by its ID.

### 3.4 POST `/:paymentId/refund`
Refund a payment by its ID.

---

## 4. Stripe Webhooks

### POST `/api/payments/webhook`
Processes Stripe events such as `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_method.attached`, etc.

- Expects the raw request body for signature verification (do not use JSON body parser for this route).
- Returns `200 OK` on success, `400 Bad Request` if the signature or payload is invalid.

**Headers**
```
Stripe-Signature: <signature from Stripe>
Content-Type: application/json
```

**Request:** Raw Stripe event payload (sent by Stripe).

**Responses:**
- `200 OK` — Event received and processed (or logged)
- `400 Bad Request` — Signature verification failed or invalid payload

---

## 7. Unified Error Format

All endpoints return errors in the following format:
```json
{ "error": "Human‑readable message here" }
```
- 400: Invalid request data or parameters
- 401: Authentication required or invalid token
- 403: Insufficient permissions
- 404: Resource not found
- 500: Internal server error

---

## ⚙️ Config

- `TAX_RATE`: Tax rate used for all calculations (default: 0.15 for 15%).

---

## ✅ Scope Coverage
* SetupIntent helper for card saving  
* Multi‑card support  
* PaymentIntent checkout flow  
* Consistent error handling
