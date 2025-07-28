# 📊 **analytics‑service API**

Aggregates and exposes analytics for vendors and admins, including revenue, order, and product sales trends.  
Authentication is handled via JWT; all endpoints require a **vendor** or **admin** bearer token unless otherwise noted.

**Base path:** `/api/analytics`

---

# 0. Service Health

## 0.1 **GET `/analytics/health`**

Check if the analytics service and its database are running.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **500** – DB connection failed |

**Headers:** None required

**Success Response 200**
```json
{
  "service": "analytics",
  "status": "up",
  "uptime_seconds": "123.45",
  "checked_at": "2025-07-21T12:34:56.789Z",
  "db_host": "mysql"
}
```

---

# 1. Analytics Endpoints

## 1.1 **GET `/analytics/summary`**

Returns summary stats for the authenticated vendor.

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – vendorId missing<br>**401** – unauthenticated<br>**403** – insufficient permissions |

**Headers:**
- `Authorization: Bearer <JWT>`

**Success Response 200**
```json
{
  "totalRevenue": "12345.67",
  "totalOrders": "42",
  "averageOrderValue": "293.94",
  "lastUpdated": "2025-07-21T03:55:08.127Z"
}
```

---

## 1.2 **GET `/analytics/top-products`**

Returns top-selling products for the vendor, sorted by revenue.

**Query Params:**
- `limit` (optional, default 5)
- `startDate` (optional, default 1970-01-01)
- `endDate` (optional, default today)

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – vendorId missing<br>**401** – unauthenticated<br>**403** – insufficient permissions |

**Headers:**
- `Authorization: Bearer <JWT>`

**Success Response 200**
```json
{
  "topProducts": [
    {
      "productId": "abc123",
      "revenue": "999.99",
      "unitsSold": "10"
    }
  ]
}
```

---

## 1.3 **GET `/analytics/sales-trend`**

Returns revenue trend for the vendor, grouped by day or month.

**Query Params:**
- `interval` (optional, `day` or `month`, default `day`)
- `months` (optional, default 6)

| Success | Error(s) |
|---------|----------|
| **200 OK** | **400** – vendorId missing<br>**401** – unauthenticated<br>**403** – insufficient permissions |

**Headers:**
- `Authorization: Bearer <JWT>`

**Success Response 200**
```json
{
  "trend": [
    { "period": "2025-07-01", "revenue": "123.45" },
    { "period": "2025-07-02", "revenue": "234.56" }
  ]
}
```

---

# 2. Endpoint Summary Table

| Endpoint                    | Method | Who Can Use      | Auth? | Main Use Case                |
|-----------------------------|--------|------------------|-------|------------------------------|
| `/analytics/health`         | GET    | All              | No    | Service health check         |
| `/analytics/summary`        | GET    | Vendor/Admin     | Yes   | Get revenue/order summary    |
| `/analytics/top-products`   | GET    | Vendor/Admin     | Yes   | Top-selling products         |
| `/analytics/sales-trend`    | GET    | Vendor/Admin     | Yes   | Revenue trend                |

---

# 3. Usage Notes

- Always include the `Authorization: Bearer <JWT>` header for all endpoints except `/analytics/health`.
- Only vendors and admins can access analytics endpoints.
- All errors are returned in the format:  
  ```json
  { "error": "Human-readable message here" }
  ```
- 401: Authentication required or invalid token  
- 403: Insufficient permissions  
- 400: Missing or invalid parameters  
- 500: Internal server/database error

---

# ⚙️ Config

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`: MySQL connection settings.
- `JWT_SECRET`, `JWT_ALGORITHM`: JWT authentication settings.

---

# ✅ Scope Coverage Summary

* **Vendor analytics**: revenue, order count, AOV, last updated  
* **Top products**: by revenue and units sold  
* **Sales trend**: by day or month  
* **Role enforcement**: vendor/admin token required  
* **Consistent error handling**  
* **Health check endpoint**
