# 🛍 **product‑service API**

Central service for **all product operations** in **ShopSphere**.  
Authentication is handled by `auth-service`; vendor/admin authorization is enforced by middleware in this service.  
Reviews & ratings require the user to be authenticated as a **consumer**.

**Base path:** `/api/product`

---

## 0. Service Health

### **GET `/product/health`**

Check if the product service is running.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **500** – server error |

**Headers:** None required

**Success Response 200**
```json
{
  "service": "product",
  "status": "up",
  "uptime_seconds": "123.45",
  "checked_at": "2024-05-01T12:34:56.789Z",
  "message": "Product service is running smoothly."
}
```

---

## 1. Vendor / Admin Operations

### 1.1 **POST `/product`**

Create a new product.

| Success | Error(s) |
|---------|----------|
| **201 Created** | **400 Bad Request** – invalid fields<br>**401 Unauthorized** – not logged in<br>**403 Forbidden** – not vendor/admin |

**Headers:**
- `Authorization: Bearer <JWT>`
  
#### Request Body
```json
{
    "vendorId": "68827dcf6153af08170c23a7",
    "name": "Wireless Bluetooth Headphones 3",
    "description": "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    "price": 300.99,
    "quantityInStock": 50,
    "images": [
        "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQTP3?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=MVJhVmI0YmhYQVJ5Y0VDdzF1YWp3MmorYzFkTG5HaE9wejd5WUxYZjRMOHoveDdpQVpwS0ltY2w2UW05aU90TzVtaW9peGdOaitwV1Nxb1VublZoTVE"
    ],
    "tags": [
        "electronics",
        "audio",
        "wireless",
        "bluetooth"
    ],
    "isPublished": true
}
```

#### Success Response 201
```json
{
    "message": "Product created successfully.",
    "productId": "6882cc083b79b350694e5d33"
}
```

---

### 1.2 **PUT `/product/:id`**

Update **any** product field.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – malformed body<br>**401** – unauthenticated<br>**403** – not owner / not admin<br>**404** – product not found |

**Headers:**
- `Authorization: Bearer <JWT>`
  
#### Example Request Body (all fields except images)
```json
{
  "name": "Premium Cotton Shirt",
  "description": "Softer, thicker 100 % cotton shirt in all sizes",
  "price": 44.99,
  "quantityInStock": 80,
  "tags": ["shirt", "cotton", "premium"],
  "isPublished": true
}
```
- **addImages:** To add new images, include an `addImages` field as a JSON array of image URLs (these will be uploaded to Cloudinary and appended to the product).
- **deleteImages:** To delete images, include a `deleteImages` field as a JSON array of Cloudinary image URLs to remove from the product and Cloudinary.
- All other fields are sent as usual.

#### Example (Add and Delete Images)
```json
{
  "addImages": [
    "https://m.media-amazon.com/images/I/41JACWT-wWL._AC_SL1200_.jpg"
  ],
  "deleteImages": [
    "https://res.cloudinary.com/<cloud_name>/image/upload/products/abc123.jpg"
  ]
}
```

#### Success Response 200
```json
{
    "message": "Product updated successfully."
}
```

---

### 1.3 **DELETE `/product/:id`**

Remove a product.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401** – unauthenticated<br>**403** – not owner / not admin<br>**404** – product not found |

**Headers:**
- `Authorization: Bearer <JWT>`

#### Success Response 200
```json
{
    "message": "Product deleted successfully."
}
```

---

### 1.4 **PATCH `/product/:id/decrement-stock`**

Decrement product stock (e.g., after a purchase). Vendor/Admin only.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – invalid data/insufficient stock<br>**401** – unauthenticated<br>**403** – not owner / not admin<br>**404** – product not found |

**Headers:**
- `Authorization: Bearer <JWT>`

**Request Body**
```json
{
  "quantity": 2
}
```

**Success Response 200**
```json
{
    "message": "Stock decremented",
    "productId": "6882cc083b79b350694e5d33",
    "newQuantity": 76
}
```

---

## 2. Consumer‑Facing Catalogue

### 2.1 **GET `/product`**

Paginated catalogue with optional filters.

#### Query Parameters
```
?page=1&limit=20&minPrice=10&maxPrice=50&tags=shirt,cotton&sort=price:asc
```

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – bad query value |

#### Success Response 200
```json
{
    "page": 1,
    "limit": 20,
    "total": 1,
    "products": [
        {
            "productId": "6882cc083b79b350694e5d33",
            "name": "Premium Cotton Shirt",
            "price": 44.99,
            "thumbnail": "https://res.cloudinary.com/dnmljbyos/image/upload/products/c63ee52b-60c0-4d5f-81bf-c2450df630fb",
            "averageRating": 0,
            "reviewCount": 0,
            "images": [
                "https://res.cloudinary.com/dnmljbyos/image/upload/products/c63ee52b-60c0-4d5f-81bf-c2450df630fb"
            ],
            "_links": {
                "self": "api/product/6882cc083b79b350694e5d33",
                "reviews": "api/product/6882cc083b79b350694e5d33/reviews",
                "vendor": "api/product/vendor/68827dcf6153af08170c23a7"
            }
        }
    ]
}
```

---

### 2.2 **GET `/product/:id`**

Full product details (includes aggregated rating & review count).

| Success | Error(s) |
|---------|----------|
| **200 OK** | **404** – product not found |

#### Success Response 200
```json
{
    "productId": "6882cc083b79b350694e5d33",
    "vendorId": "68827dcf6153af08170c23a7",
    "name": "Premium Cotton Shirt",
    "description": "Softer, thicker 100 % cotton shirt in all sizes",
    "price": 44.99,
    "quantityInStock": 76,
    "images": [
        "https://res.cloudinary.com/dnmljbyos/image/upload/products/c63ee52b-60c0-4d5f-81bf-c2450df630fb"
    ],
    "tags": [
        "shirt",
        "cotton",
        "premium"
    ],
    "averageRating": 0,
    "reviewCount": 0,
    "isPublished": true,
    "createdAt": "2025-07-25T00:12:56.173Z",
    "_links": {
        "self": "api/product/6882cc083b79b350694e5d33",
        "reviews": "api/product/6882cc083b79b350694e5d33/reviews",
        "vendor": "api/product/vendor/68827dcf6153af08170c23a7"
    }
}
```

**_links** fields are included:
```json
{
  "_links": {
    "self": "/product/p001",
    "reviews": "/product/p001/reviews",
    "vendor": "/vendors/v123"
  }
}
```

---

### 2.3 **GET `/product/vendor/:vendorId`**

Retrieve **all products for a specific vendor**.  
Supports the same pagination & filter query params as the general catalogue endpoint.

#### Example
```
/product/vendor/v123?page=1&limit=30&sort=createdAt:desc
```

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – bad query<br>**404** – vendor not found (if no products associated) |

#### Success Response 200
```json
{
    "vendorId": "68827dcf6153af08170c23a7",
    "page": 1,
    "limit": 30,
    "total": 1,
    "products": [
        {
            "productId": "6882cc083b79b350694e5d33",
            "name": "Premium Cotton Shirt",
            "price": 44.99,
            "thumbnail": "https://res.cloudinary.com/dnmljbyos/image/upload/products/c63ee52b-60c0-4d5f-81bf-c2450df630fb",
            "averageRating": 0,
            "reviewCount": 0,
            "images": [
                "https://res.cloudinary.com/dnmljbyos/image/upload/products/c63ee52b-60c0-4d5f-81bf-c2450df630fb"
            ],
            "_links": {
                "self": "api/product/6882cc083b79b350694e5d33",
                "reviews": "api/product/6882cc083b79b350694e5d33/reviews",
                "vendor": "api/product/vendor/68827dcf6153af08170c23a7"
            }
        }
    ]
}
```

---

## 3. Reviews & Ratings

Each review contains a **rating (1‑5)** and an optional **text comment**.  
Users may create **one review per product** but can update or delete their own review.  
Admins may update/delete any review.

### 3.1 **POST `/product/:id/reviews`**

Create a review.

| Success | Error(s) |
|---------|----------|
| **201 Created** | **400** – rating outside 1‑5<br>**401** – unauthenticated<br>**409** – review already exists |

**Headers:**
- `Authorization: Bearer <JWT>`

#### Request Body
```json
{
  "rating": 5,
  "comment": "Loved the fabric quality!"
}
```

#### Success Response 201
```json
{
  "message": "Review submitted.",
  "review": {
    "reviewId": "r789",
    "userId": "u123",
    "rating": 5,
    "comment": "Loved the fabric quality!",
    "createdAt": "2025-06-11T18:30:00Z"
  },
  "newAverageRating": 4.4,
  "newReviewCount": 13
}
```

---

### 3.2 **GET `/product/:id/reviews`**

List reviews (paginated).

#### Query Parameters
```
?page=1&limit=10&sort=createdAt:desc
```

| Success | Error(s) |
|---------|----------|
| **200 OK** | **404** – product not found |

#### Success Response 200
```json
{
  "page": 1,
  "limit": 10,
  "total": 13,
  "reviews": [
    {
      "reviewId": "r789",
      "userId": "u123",
      "username": "abdullah123",
      "rating": 5,
      "comment": "Loved the fabric quality!",
      "createdAt": "2025-06-11T18:30:00Z"
    }
  ]
}
```
*Note: Review responses do **not** include a `_links` field.*

---

### 3.3 **PUT `/product/:id/reviews/:reviewId`**

Update own review.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – invalid rating<br>**401** – unauthenticated<br>**403** – not review owner / not admin<br>**404** – review not found |

**Headers:**
- `Authorization: Bearer <JWT>`

#### Request Body
```json
{
  "rating": 4,
  "comment": "After washing, still great quality."
}
```

#### Success Response 200
```json
{
  "message": "Review updated.",
  "review": {
    "reviewId": "r789",
    "rating": 4,
    "comment": "After washing, still great quality.",
    "updatedAt": "2025-06-12T10:05:00Z"
  },
  "newAverageRating": 4.2
}
```
*Note: Review responses do **not** include a `_links` field.*

---

### 3.4 **DELETE `/product/:id/reviews/:reviewId`**

Delete own review.

| Success | Error(s) |
|---------|----------|
| **204 No Content** | **401** – unauthenticated<br>**403** – not owner / not admin<br>**404** – review not found |

**Headers:**
- `Authorization: Bearer <JWT>`

_No body on success._
*Note: Review responses do **not** include a `_links` field.*

---

## 4. Permissions & Roles

- **Vendor**: Can create, update, delete, and decrement stock for their own products.
- **Admin**: Can manage all products.
- **Consumer/Guest**: Can browse, search, and view product details and reviews.
- **Authorization**: All protected endpoints require `Authorization: Bearer <JWT>` header.

---

## 5. Error Handling

All endpoints return errors in the following format:
```json
{
  "error": "Error message here."
}
```
- 400: Invalid request data or parameters
- 401: Authentication required or invalid token
- 403: Insufficient permissions
- 404: Resource not found
- 409: Conflict (e.g., duplicate review)
- 500: Internal server error

---

## 6. Endpoint Summary Table

| Endpoint | Method | Who Can Use | Auth? | Main Use Case |
|----------|--------|-------------|-------|---------------|
| `/product/health` | GET | All | No | Service health check |
| `/product` | POST | Vendor/Admin | Yes | Create product |
| `/product/:id` | PUT | Vendor/Admin | Yes | Update product |
| `/product/:id` | DELETE | Vendor/Admin | Yes | Delete product |
| `/product/:id/decrement-stock` | PATCH | Vendor/Admin | Yes | Decrement stock |
| `/product` | GET | All | No | Browse/search products |
| `/product/vendor/:vendorId` | GET | All | No | View vendor’s products |
| `/product/:id` | GET | All | No | View product details |

---

## 7. Usage Notes for Frontend Developers

- Always include the `Authorization: Bearer <JWT>` header for protected endpoints.
- Use the `_links` fields in responses to easily navigate to related resources (product details, reviews, vendor info).
- Handle error responses as described above for robust UX.
- Use query parameters for filtering, sorting, and pagination in catalogue endpoints.
- Vendors should ensure they only manage their own products (enforced by backend).
- Admins have full access to all product management endpoints.
- Guests/consumers can browse and view products and reviews, but cannot manage products.

---

## ✅ Scope Coverage Summary

* **Vendor / admin CRUD** with full‑field updates  
* **Public browsing**: catalogue, free‑text search, trending, featured, related, **vendor listings**  
* **Consumer review & rating** workflow with aggregation  
* **Role enforcement**:  
  * **Vendor / Admin** for product CRUD  
  * **Consumer** for review CRUD  
* **Consistent error handling** across all routes  
* **Schema fields**: productId, vendorId, name, description, price, quantityInStock, images, tags, averageRating, reviewCount, rating (per review), isPublished, createdAt
