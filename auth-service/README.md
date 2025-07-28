# 🔐 **auth‑service API**

Centralized authentication & authorization microservice for **ShopSphere**

**Base path:** 
```
/api/auth
```
---

## 0. Health Check

### GET `/health`
Returns the health status of the payments service.

---

## 1. POST `/register`

Registers a new account and immediately returns the freshly created profile.

| Success | Error(s) |
|---------|----------|
| **201 Created** | **400 Bad Request** – missing / malformed fields<br>**409 Conflict** – email or username already exists |

### Request Body
```json
{
  "username": "user_vendor",
  "email": "vendor@example.com",
  "password": "StrongPassword!123",
  "role": "vendor"           // "consumer" | "vendor" | "admin"
}
```

### Success Response
```json
{
  "message": "User registered successfully.",
  "user": {
    "userId": "u123",
    "username": "abdullah123",
    "email": "abdullah@example.com",
    "role": "consumer"
  }
}
```

### Error Examples
```json
// 400 – missing password field
{ "error": "Password is required." }

// 409 – email taken
{ "error": "Email already exists." }
```

---

## 2. POST `/login`

Authenticates credentials and returns a signed JWT plus essential profile data.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400 Bad Request** – malformed body<br>**401 Unauthorized** – bad email/password |

### Request Body
```json
{
  "email": "vendor@example.com",
  "password": "StrongPassword!123"
}
```

### Success Response
```json
{
  "token": "jwt.token.here",
  "user": {
          "userId": "68827dcf6153af08170c23a7",
          "username": "user_vendor",
          "email": "vendor@example.com",
          "role": "vendor"
      }
}
```

### Error Examples
```json
// 400 – bad JSON
{ "error": "Invalid request payload." }

// 401 – wrong credentials
{ "error": "Email or password is incorrect." }
```

---

## 3. POST `/logout`

Invalidates the supplied JWT (token blacklist / refresh‑token revocation).

| Success | Error(s) |
|---------|----------|
| **204 No Content** | **401 Unauthorized** – token missing / expired |

### Headers
```
Authorization: Bearer <token>
```

### Error Example
```json
{ "error": "Token expired or invalid." }
```

---

## 4. GET `/me`

Returns the **full** authenticated profile.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** – token missing / invalid |

### Headers
```
Authorization: Bearer <token>
```

### Success Response
```json
{
    "userId": "68827dcf6153af08170c23a7",
    "username": "user_vendor",
    "email": "vendor@example.com",
    "role": "vendor",
    "createdAt": "2025-07-24T18:39:11.296Z",
    "updatedAt": "2025-07-24T18:39:11.296Z"
}
```

### Error Example
```json
{ "error": "Authentication required." }
```

---

## 5. GET `/validate`

Light‑weight endpoint to **verify** a JWT and fetch minimal identity.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **401 Unauthorized** – token missing / invalid |

### Headers
```
Authorization: Bearer <token>
```

### Success Response
```json
{
    "valid": true,
    "userId": "68827dcf6153af08170c23a7",
    "role": "vendor",
    "exp": 1753496306
}
```

### Error Example
```json
{ "error": "Token expired." }
```

---

## 🛡️ Unified Error Contract
All error payloads follow:

```json
{
  "error": "Human‑readable message."
}
```

---
