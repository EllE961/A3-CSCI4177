# 🛒 **cart‑service API**

Manages the **shopping cart** for consumers prior to checkout.  
Authentication is handled by `auth-service`; all endpoints require a **consumer** bearer token unless otherwise noted.

**Base path:** `/api/cart`

---

# 0. Service Health

## 0.1 **GET `/cart/health`**

Check if the cart service is running.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **500** – server error |

**Headers:** None required

**Success Response 200**
```json
{
  "service": "cart",
  "status": "up",
  "uptime_seconds": "123.45",
  "checked_at": "2024-05-01T12:34:56.789Z",
  "message": "Cart service is operational."
}
```

---

# 1. Cart Retrieval

## 1.1 **GET `/cart`**

Return the authenticated consumer’s cart items (paginated optional).

### Query Params
```
?page=1&limit=50
```

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** – missing / expired token |

**Headers:**
- `Authorization: Bearer <JWT>`

### Success Response 200
```json
{
  "page": 1,
  "limit": 50,
  "totalItems": 3,
  "items": [
    {
      "itemId": "ci001",
      "productId": "p001",
      "productName": "Custom Cotton Shirt",
      "price": 39.99,
      "quantity": 2,
      "addedAt": "2025-06-11T18:40:00Z",
      "_links": {
        "product": "/products/p001",
        "update": "/cart/items/ci001",
        "remove": "/cart/items/ci001"
      }
    }
  ]
}
```

---

## 1.2 **GET `/cart/totals`**

Return subtotal, estimated tax, and total for current cart.

> **Tax is calculated using the `TAX_RATE` environment variable (default 0.15 = 15%).**

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** |

**Headers:**
- `Authorization: Bearer <JWT>`

### Success Response 200
```json
{
  "totalItems": 3,
  "subtotal": 139.97,
  "estimatedTax": 20.99,
  "total": 160.96,
  "currency": "CAD"
}
```

---

# 2. Manage Cart Items

## 2.1 **POST `/cart/items`**

Add a product (or increase quantity if already present).

| Success | Error(s) |
|---------|----------|
| **201 Created** | **400** – invalid body<br>**401** – unauthenticated |

**Headers:**
- `Authorization: Bearer <JWT>`

### Request Body
```json
{
  "productId": "p001",
  "quantity": 2
}
```

### Success Response 201
```json
{
  "message": "Product added to cart.",
  "item": {
    "itemId": "ci003",
    "productId": "p001",
    "productName": "Custom Cotton Shirt",
    "quantity": 2
  }
}
```

### Error Example
```json
{ "error": "Quantity must be at least 1." }
```

---

## 2.2 **PUT `/cart/items/:itemId`**

Update the quantity of an existing cart item.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – invalid quantity<br>**401** – unauthenticated<br>**404** – item not found |

**Headers:**
- `Authorization: Bearer <JWT>`

### Request Body
```json
{
  "quantity": 3
}
```

### Success Response 200
```json
{
  "message": "Cart item updated.",
  "item": {
    "itemId": "ci003",
    "quantity": 3
  }
}
```

---

## 2.3 **DELETE `/cart/items/:itemId`**

Remove an item from the cart.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401** – unauthenticated<br>**404** – item not found |

**Headers:**
- `Authorization: Bearer <JWT>`

### Success Response 200
```json
{ "message": "Product removed from cart." }
```

---

# 3. Clear Cart

## 3.1 **DELETE `/cart/clear`**

Delete **all** items from the consumer’s cart (used after successful checkout).

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401** – unauthenticated |

**Headers:**
- `Authorization: Bearer <JWT>`

### Success Response 200
```json
{ "message": "Cart cleared successfully." }
```

---

# 4. Admin Operations

## 4.1 **DELETE `/cart/admin/clear-expired`**

Clear expired carts (not updated in X days). **Admin only.**

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401** – unauthenticated<br>**403** – not admin |

**Headers:**
- `Authorization: Bearer <JWT>` (admin only)

**Query Params:**
- `days` (optional, default 7)

**Success Response 200**
```json
{
  "message": "Expired carts cleared",
  "deletedCount": 5
}
```

---

# 5. Endpoint Summary Table

| Endpoint                        | Method | Who Can Use      | Auth? | Main Use Case                |
|----------------------------------|--------|------------------|-------|------------------------------|
| `/cart/health`                  | GET    | All              | No    | Service health check         |
| `/cart/`                        | GET    | Consumer/Admin   | Yes   | Get current cart             |
| `/cart/items`                   | POST   | Consumer/Admin   | Yes   | Add product to cart          |
| `/cart/items/:itemId`           | PUT    | Consumer/Admin   | Yes   | Update cart item quantity    |
| `/cart/items/:itemId`           | DELETE | Consumer/Admin   | Yes   | Remove item from cart        |
| `/cart/clear`                   | DELETE | Consumer/Admin   | Yes   | Clear all items from cart    |
| `/cart/totals`                  | GET    | Consumer/Admin   | Yes   | Get cart totals              |
| `/cart/admin/clear-expired`     | DELETE | Admin            | Yes   | Clear expired carts          |

---

# 6. Usage Notes for Frontend Developers

- Always include the `Authorization: Bearer <JWT>` header for all endpoints except `/cart/health`.
- Use the `_links` fields in cart item responses to easily navigate to related resources (product details, update, remove).
- Handle error responses as described below for robust UX.
- Use query parameters for filtering, sorting, and pagination in cart retrieval endpoints.
- Only admins can use the `/cart/admin/clear-expired` endpoint.
- Consumers can add, update, remove, and clear their own cart items.

---

# 7. Unified Error Format

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

# ⚙️ Config

- `TAX_RATE`: Tax rate used for all calculations (default: 0.15 for 15%).

---

# ✅ Scope Coverage Summary

* **Full item CRUD**: add, update, delete, clear  
* **Cart retrieval** with pagination  
* **Totals endpoint** for checkout preview (subtotal, tax, total)  
* **Role enforcement**: consumer token required  
* **Consistent error handling** across all routes  
* **Schema fields**: itemId, productId, productName, price, quantity, addedAt, subtotal, totalItems, _links
