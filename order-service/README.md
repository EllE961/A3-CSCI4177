# 📦 order-service API

Responsible for **order lifecycle** in ShopSphere.

Orders are created **only after successful payment** (verified by `payment-service`).

**Role enforcement:**
- **Consumer** – view own orders, cancel pending orders
- **Vendor** – view orders to fulfill, update status
- **Admin** – full access to every order

**Base path:** `/api/orders`

---

# 0. Health Check

## **GET `/orders/health`**
Returns the health status of the order service.

**Roles:** Public

**Response 200:**
```json
{
  "service": "orders",
  "status": "up",
  "uptime_seconds": "123.45",
  "checked_at": "2025-07-17T20:55:40.500Z",
  "message": "Order service is operational."
}
```

---

# 1. Order Creation

## **POST `/orders`**
Creates **one child order per vendor** in the cart, all linked by a single parent order ID (from the payment service).

**Roles:** Consumer (authenticated)

**Request Body:**
```json
{
  "consumerId": "u123",
  "paymentId": "pi_abc123",
  "orderId": "parent_order_id_from_payment_service",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "Halifax",
    "postalCode": "B3H 1Y4",
    "country": "CA"
  }
}
```

**Response 201:**
```json
{
  "message": "Orders created",
  "parentOrderId": "parent_order_id_from_payment_service",
  "childOrderIds": ["child_order_id_1", "child_order_id_2"]
}
```

**Errors:**
- 400 – malformed payload, missing payment, cart empty, price/stock mismatch
- 401 – unauthenticated
- 403 – forbidden (wrong user)
- 502 – failed to contact payment/cart/product service

---

# 2. List Orders

## **GET `/orders`**
List all orders (paginated, filterable). **Vendor** sees their orders, **Admin** sees all.

**Roles:** Vendor, Admin (authenticated)

**Query Parameters:**
- `page` (int, optional, default: 1)
- `limit` (int, optional, default: 20, max: 100)
- `orderStatus` (string, optional)
- `dateFrom` (ISO8601, optional)
- `dateTo` (ISO8601, optional)

**Response 200:**
```json
{
  "page": 1,
  "limit": 20,
  "total": 2,
  "orders": [
    {
      "_id": "child_order_id_1",
      "consumerId": "u123",
      "vendorId": "v456",
      "orderItems": [
        {
          "productId": "p789",
          "quantity": 2,
          "price": 10.0,
          "_links": { "product": "api/product/p789" }
        }
      ],
      "orderStatus": "pending",
      "paymentId": "pi_abc123",
      "shippingAddress": { ... },
      "createdAt": "...",
      "updatedAt": "...",
      "_links": {
        "self": "api/order/child_order_id_1",
        "payment": "api/payment/pi_abc123",
        "tracking": "api/order/child_order_id_1/tracking"
      }
    }
  ]
}
```

**Errors:**
- 401 – unauthenticated
- 403 – forbidden (not vendor/admin)

---

## **GET `/orders/user/:userId`**
List all orders for a specific user (paginated).

**Roles:** Consumer (self), Admin

**Query Parameters:**
- `page` (int, optional, default: 1)
- `limit` (int, optional, default: 20, max: 100)

**Response 200:**
```json
{
  "page": 1,
  "limit": 20,
  "total": 2,
  "orders": [ ... ]
}
```

**Errors:**
- 401 – unauthenticated
- 403 – forbidden (not self/admin)

---

# 3. Retrieve Orders by Parent or ID

## **GET `/orders/parent/:parentOrderId`**
Returns all child orders created for a given parent order ID (from the payment service).

**Roles:** Authenticated (consumer, vendor, admin)

**Response 200:**
```json
{
  "parentOrderId": "parent_order_id_from_payment_service",
  "childOrders": [ { ... }, { ... } ]
}
```

**Errors:**
- 400 – invalid parentOrderId
- 404 – no child orders found

---

## **GET `/orders/:id`**
- If `id` is a child order ID, returns that order.
- If `id` is a parent order ID, returns all child orders for that parent.

**Roles:**
- Consumer: only own orders
- Vendor: only their orders
- Admin: all

**Response 200 (parent order ID):**
```json
{
  "parentOrderId": "parent_order_id_from_payment_service",
  "childOrders": [ { ... }, { ... } ]
}
```
**Response 200 (child order ID):**
```json
{
  "_id": "child_order_id_1",
  ...
}
```

**Errors:**
- 401 – unauthenticated
- 403 – forbidden
- 404 – not found

---

# 4. Order Lifecycle Actions

## **PUT `/orders/:id/status`**
Update order status (`processing`, `shipped`, `out_for_delivery`, `delivered`).

**Roles:** Vendor (for their orders), Admin

**Request Body:**
```json
{ "orderStatus": "shipped" }
```

**Response 200:**
```json
{ "message": "Status updated", "newStatus": "shipped" }
```

**Errors:**
- 400 – invalid status
- 401 – unauthenticated
- 403 – forbidden
- 404 – order not found

---

## **POST `/orders/:id/cancel`**
Cancel an order (only if not shipped/delivered).

**Roles:** Consumer (own order), Admin

**Request Body (optional):**
```json
{ "reason": "Ordered by mistake." }
```

**Response 200:**
```json
{ "message": "Order cancelled" }
```

**Errors:**
- 400 – cannot cancel at this stage
- 401 – unauthenticated
- 403 – forbidden
- 404 – order not found

---

## **GET `/orders/:id/tracking`**
Return chronological status updates for shipment tracking.

**Roles:** Consumer (own order), Vendor (their order), Admin

**Response 200:**
```json
{
  "orderId": "ord_001",
  "tracking": [
    { "status": "processing", "timestamp": "2025-06-11T19:00:00Z" },
    { "status": "shipped", "timestamp": "2025-06-12T08:00:00Z", "carrier": "Canada Post", "trackingNumber": "CP123456CA" },
    { "status": "out_for_delivery", "timestamp": "2025-06-13T07:30:00Z" }
  ]
}
```

**Errors:**
- 401 – unauthenticated
- 403 – forbidden
- 404 – order not found

---

# 5. Response Object Details

- All order and order item objects may include a `_links` field with URLs to related resources (self, payment, tracking, product).
- All error responses:
```json
{ "error": "Human-readable message here" }
```

---

# 6. Schema Fields

- `orderId`, `consumerId`, `vendorId`, `orderItems` (with `productId`, `quantity`, `price`), `subtotalAmount`, `paymentId`, `paymentStatus`, `orderStatus`, `shippingAddress`, `createdAt`, `updatedAt`, `tracking`

---

# 7. Role Matrix

| Endpoint                       | Consumer | Vendor | Admin |
|--------------------------------|:--------:|:------:|:-----:|
| GET /orders/health             |    ✔     |   ✔    |   ✔   |
| POST /orders                   |    ✔     |        |   ✔   |
| GET /orders                    |          |   ✔    |   ✔   |
| GET /orders/user/:userId       |    ✔*    |        |   ✔   |
| GET /orders/parent/:parentId   |    ✔     |   ✔    |   ✔   |
| GET /orders/:id                |    ✔*    |   ✔*   |   ✔   |
| PUT /orders/:id/status         |          |   ✔*   |   ✔   |
| POST /orders/:id/cancel        |    ✔*    |        |   ✔   |
| GET /orders/:id/tracking       |    ✔*    |   ✔*   |   ✔   |

*✔* = only for own orders (consumer) or their orders (vendor)

---

# 8. Error Handling

All errors are returned in the following format:
```json
{ "error": "Human-readable message here" }
```

---

# 9. Notes
- All endpoints require authentication except `/orders/health`.
- Pagination defaults: `page=1`, `limit=20`.
- All date/times are ISO8601.
- Status transitions: `processing` → `shipped` → `out_for_delivery` → `delivered`.
- Orders cannot be cancelled after shipping.
- All endpoints return only fields the user is authorized to see.
