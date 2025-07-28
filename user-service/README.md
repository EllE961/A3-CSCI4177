# 👤 **user‑service API**

Central service for **consumer** and **vendor** profile management in **ShopSphere**.  
All authentication & JWT validation is delegated to `auth-service`; this service enforces **role‑based authorization** on every request.

**Base path:** `/api/user`

---

## 0. Service Health

### **GET `/user/health`**

Check if the user‑service is running.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **500** – server error |

**Success Response 200**
```json
{
  "service": "user",
  "status": "up",
  "uptime_seconds": "123.45",
  "checked_at": "2025-07-23T12:34:56.789Z",
  "message": "User service is running smoothly."
}
```

---

## 1. Consumer Profile

### 1.1 **POST`/consumer/profile`**

Create the authenticated consumer’s complete profile.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** – token missing / invalid |

**Headers**
```
Authorization: Bearer <JWT>
```
**Request Body**
```json
{
  "fullName": "Consumer Al Consumers",
  "email": "conusmer@domian.com",
  "phoneNumber": "+19021234567"
}
```

**Success Response 200**
```json
{
  "message": "Consumer profile created successfully.",
  "profile": {
      "consumerId": "user_consumer",
      "fullName": "Consumer Al Consumers",
      "email": "conusmer@domian.com",
      "phoneNumber": "+19021234567",
      "createdAt": "2025-07-23T16:35:26.184Z"
  }
}
```

**Error Example**
```json
{ "error": "Authentication required." }
```

---

### 1.2 **GET `/consumer/profile`**

Return the authenticated consumer’s complete profile.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** – token missing / invalid |

**Headers**
```
Authorization: Bearer <JWT>
```

**Success Response 200**
```json
{
  "displayProfile": {
      "consumerId": "user_consumer",
      "fullName": "Consumer Al Consumers",
      "email": "conusmer@domian.com",
      "phoneNumber": "+19021234567",
      "createdAt": "2025-07-23T16:35:26.184Z"
  }
}
```

**Error Example**
```json
{ "error": "Authentication required." }
```

---

### 1.3 **PUT `/consumer/profile`**

Update personal fields (name, phone, email, etc.).

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – invalid data<br>**404 Not Found** – consumer not found |

**Headers**
```
Authorization: Bearer <JWT>
```


**Request Body**
```json
{
  "fullName": "Consumer Al Consumers",
  "email": "conusmer@domian.com",
  "phoneNumber": "+19040234567"
}
```

**Success Response 200**
```json
{
  "message": "Consumer profile updated successfully",
  "profile": {
      "consumerId": "user_consumer",
      "fullName": "Consumer Al Consumers",
      "email": "conusmer@domian.com",
      "phoneNumber": "+19040234567",
      "createdAt": "2025-07-23T16:35:26.184Z"
  }
}
```

**Error Example**
```json
{ "error": "Invalid email format." }
```

---

## 2. Consumer Settings

### 2.1 **GET `/consumer/settings`**

Fetch user preference flags (currency, theme, notifications, etc.).

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** |

**Headers**
```
Authorization: Bearer <JWT>
```

**Success Response 200**
```json
{
  "settings": {
      "currency": "CAD",
      "theme": "light"
  }
}
```

---

### 2.2 **PUT `/consumer/settings`**

Update preference flags.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – invalid keys<br>**401 Unauthorized** |

**Headers**
```
Authorization: Bearer <JWT>
```

**Request Body**
```json
{
    "currency": "USD",
    "theme": "dark"
}
```

**Success Response 200**
```json
{
  "message": "Settings updated.",
  "settings": {
      "currency": "USD",
      "theme": "dark"
  }
}
```

---

## 3. Consumer Addresses

| Method & Path | Purpose |
|---------------|---------|
| **POST `/consumer/addresses`** | Add a new address |
| **GET `/consumer/addresses`** | List all addresses |
| **PUT `/consumer/addresses/:id`** | Update an address |
| **DELETE `/consumer/addresses/:id`** | Remove an address |

---

### 3.1 **POST `/consumer/addresses`**

| Success | Error(s) |
|---------|----------|
| **201 Created** | **400 Bad Request** |

**Request Body**
```json
{
  "label": "Home",
  "line1": "1234 South Street Apt 2",
  "city": "Halifax",
  "postalCode": "B3H1T2",
  "country": "Canada"
}
```

**Success Response 201**
```json
{
  "message": "New address created successfully",
  "address": {
      "label": "Home",
      "line1": "1234 South Street Apt 2",
      "city": "Halifax",
      "postalCode": "B3H1T2",
      "country": "Canada"
  }
}
```

---

### 3.2 **GET `/consumer/addresses`**

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** |

**Success Response 200**
```json
{
  "addresses": [
      {
          "label": "Home",
          "line1": "1234 South Street Apt 2",
          "city": "Halifax",
          "postalCode": "B3H1T2",
          "country": "Canada",
          "_id": "6881109d532e8c504e261584"
      }
  ]
}
```

---

### 3.3 **PUT `/consumer/addresses/:id`**

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request**<br>**404 Not Found** – address missing |

**Request Body**
```json
{
  "label": "Home",
  "line1": "4321 South Street Apt 2",
  "city": "Halifax",
  "postalCode": "B3H1T2",
  "country": "Canada"
}
```

**Success Response 200**
```json
{
  "message": "Address updated.",
  "address": {
      "label": "Home",
      "line1": "4321 South Street Apt 2",
      "city": "Halifax",
      "postalCode": "B3H1T2",
      "country": "Canada",
      "_id": "6881109d532e8c504e261584"
  }
}
```

---

### 3.4 **DELETE `/consumer/addresses/:id`**

| Success | Error(s) |
|---------|----------|
| **204 No Content** | **404 Not Found** |

**Success Response 200**
```json
{
  "message": "Address deleted successfully."
}
```

---

## 4. Vendor Profile

### 4.1 **POST `/vendor/profile`**

Create the authenticated vendor’s profile.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** |

**Request Body**
```json
{
  "storeName": "Threadle Tailors",
  "location": "Halifax, NS",
  "logoUrl": "https://cdn.example.com/logos/threadle.png",
  "storeBannerUrl": "https://cdn.example.com/banners/threadle-banner.jpg",
  "phoneNumber": "+19025551234",
  "socialLinks": [
    "https://instagram.com/threadle_tailors",
    "https://facebook.com/threadle"
  ]
}

```

**Success Response 200**
```json
{
    "message": "Vendor profile created successfully.",
    "profile": {
        "vendorId": "68827dcf6153af08170c23a7",
        "storeName": "Threadle Tailors",
        "location": "Halifax, NS",
        "phoneNumber": "+19025551234",
        "logoUrl": "https://cdn.example.com/logos/threadle.png",
        "storeBannerUrl": "https://cdn.example.com/banners/threadle-banner.jpg",
        "socialLinks": [
            "https://instagram.com/threadle_tailors",
            "https://facebook.com/threadle"
        ],
        "createdAt": "2025-07-25T02:40:10.364Z"
    }
}
```

---

### 4.2 **GET `/vendor/profile`**

Return the authenticated vendor’s profile.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** |

**Success Response 200**
```json
{
    "displayProfile": {
        "vendorId": "68827dcf6153af08170c23a7",
        "storeName": "Threadle Tailors",
        "location": "Halifax, NS",
        "phoneNumber": "+19025551234",
        "logoUrl": "https://cdn.example.com/logos/threadle.png",
        "storeBannerUrl": "https://cdn.example.com/banners/threadle-banner.jpg",
        "rating": "0",
        "socialLinks": [
            "https://instagram.com/threadle_tailors",
            "https://facebook.com/threadle"
        ]
    }
}
```

---

### 4.3 **PUT `/vendor/profile`**

Update vendor public details.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request**<br>**401 Unauthorized** |

**Request Body**
```json
{
    "storeName": "Threadle",
    "location": "Halifax, NS",
    "logoUrl": "https://cdn.example.com/logos/threadle.png",
    "storeBannerUrl": "https://cdn.example.com/banners/threadle-banner.jpg",
    "phoneNumber": "+19025551234",
    "socialLinks": [
        "https://instagram.com/threadle_tailors"
    ]
}
```

**Success Response 200**
```json
{
    "message": "Vendor profile updated successfully",
    "profile": {
        "vendorId": "68827dcf6153af08170c23a7",
        "storeName": "Threadle",
        "location": "Halifax, NS",
        "phoneNumber": "+19025551234",
        "logoUrl": "https://cdn.example.com/logos/threadle.png",
        "storeBannerUrl": "https://cdn.example.com/banners/threadle-banner.jpg",
        "rating": "0",
        "socialLinks": [
            "https://instagram.com/threadle_tailors"
        ]
    }
}
```

---
### 4.4 **GET `/vendor/settings`**

GET vendor preference flags.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – invalid keys<br>**401 Unauthorized** |


**Success Response 200**
```json
{
    "settings": {
        "theme": "light"
    }
}
```

### 4.5 **PUT `/vendor/settings`**

Update vendor preference flags.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – invalid keys<br>**401 Unauthorized** |

**Request Body**
```json
{
    "theme": "dark"
}
```

**Success Response 200**
```json
{
    "message": "Settings updated.",
    "settings": {
        "theme": "dark"
    }
}
```

---

### 4.6 **GET `/vendor/:id/approve`** 

Check vendor approval

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – invalid body<br>**401 Unauthorized** |



**Success Response 200**
```json
{
    "vendorId": "68827dcf6153af08170c23a7",
    "isApproved": false
}
```

---

### 4.7 **PUT `/vendor/:id/approve`** *(Admin only)*

Approve or revoke vendor visibility & store management.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – invalid body<br>**401 Unauthorized** |

**Request Body**
```json
{
    "isApproved": true
}
```

**Success Response 200**
```json
{
    "message": "Vendor approval status updated.",
    "vendorId": "68827dcf6153af08170c23a7",
    "isApproved": true
}
```

---

## 5. Error Handling

All endpoints return errors in the unified format below:

```json
{ "error": "Human‑readable message here." }
```
- **400**: Invalid request data or parameters  
- **401**: Authentication required / invalid token  
- **404**: Resource not found  
- **500**: Internal server error  

---

## 6. Endpoint Summary

| Endpoint | Method | Who Can Use | Auth? | Purpose |
|----------|--------|-------------|-------|---------|
| `/user/health` | GET | All | No | Service health check |
| `/consumer/profile` | GET | Consumer | Yes | Retrieve own profile |
| `/consumer/profile` | PUT | Consumer | Yes | Update own profile |
| `/consumer/settings` | GET | Consumer | Yes | Fetch preference flags |
| `/consumer/settings` | PUT | Consumer | Yes | Update preference flags |
| `/consumer/addresses` | POST | Consumer | Yes | Add address |
| `/consumer/addresses` | GET | Consumer | Yes | List addresses |
| `/consumer/addresses/:id` | PUT | Consumer | Yes | Update address |
| `/consumer/addresses/:id` | DELETE | Consumer | Yes | Delete address |
| `/vendor/profile` | GET | Vendor | Yes | Retrieve vendor profile |
| `/vendor/profile` | PUT | Vendor | Yes | Update vendor profile |
| `/vendor/settings` | GET | Vendor | Yes | Get vendor settings |
| `/vendor/settings` | PUT | Vendor | Yes | Update vendor settings |
| `/vendor/:id/approve` | PUT | Admin | Yes | Approve/revoke vendor |

---

## ✅ Scope Coverage Summary

* **Consumer**: profile, settings, addresses CRUD  
* **Vendor**: profile, settings, admin approval workflow  
* **Role enforcement** via JWT in headers  
* **Consistent error handling** across routes  

