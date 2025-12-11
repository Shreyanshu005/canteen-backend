# Backend API Implementation & Response Examples

This document contains the Curl commands and corresponding JSON responses for the implemented backend endpoints. Requires a running backend server on port 5001 (default).

## Authentication

### 1. Send OTP
**Endpoint:** `POST /api/v1/auth/email/send-otp`

```bash
curl -X POST http://localhost:5001/api/v1/auth/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "frontend_dev@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "data": "OTP sent to email"
}
```

> **Note:** Check server logs for the OTP (e.g., `OTP for frontend_dev@example.com: 694303`).

### 2. Verify OTP (Login)
**Endpoint:** `POST /api/v1/auth/email/verify-otp`

```bash
curl -X POST http://localhost:5001/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "frontend_dev@example.com", "otp": "694303"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Important:** Save the `token` from the response. It is required for all matching requests as `Authorization: Bearer <TOKEN>`.

---

## Canteens

### 3. Create Canteen
**Endpoint:** `POST /api/v1/canteens`

```bash
curl -X POST http://localhost:5001/api/v1/canteens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Tech Cafe",
    "place": "Building 5",
    "ownerId": "693aefbe22027c879c968d3c"
  }'
```
*Note: `ownerId` can be the user's ID obtained from decoding the JWT or from previous context.*

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Tech Cafe",
    "place": "Building 5",
    "ownerId": "693aefbe22027c879c968d3c",
    "_id": "693af14522027c879c968d42",
    "createdAt": "2025-12-11T16:28:53.988Z",
    "__v": 0
  }
}
```

### 4. Get All Canteens
**Endpoint:** `GET /api/v1/canteens`

```bash
curl -X GET http://localhost:5001/api/v1/canteens \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "693af14522027c879c968d42",
      "name": "Tech Cafe",
      "place": "Building 5",
      "ownerId": {
        "_id": "693aefbe22027c879c968d3c",
        "email": "frontend_dev@example.com",
        "role": "user"
      },
      "createdAt": "2025-12-11T16:28:53.988Z",
      "__v": 0
    }
  ]
}
```

### 5. Get My Canteens
**Endpoint:** `GET /api/v1/canteens/my-canteens`

```bash
curl -X GET http://localhost:5001/api/v1/canteens/my-canteens \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "693af14522027c879c968d42",
      "name": "Tech Cafe",
      "place": "Building 5",
      "ownerId": "693aefbe22027c879c968d3c",
      "createdAt": "2025-12-11T16:28:53.988Z",
      "__v": 0
    }
  ]
}
```

### 6. Delete Canteen
**Endpoint:** `DELETE /api/v1/canteens/:id`

```bash
curl -X DELETE http://localhost:5001/api/v1/canteens/693af14522027c879c968d42 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

---

## Menu Management

### 7. Add Menu Item
**Endpoint:** `POST /api/v1/menu/canteen/:canteenId`

```bash
curl -X POST http://localhost:5001/api/v1/menu/canteen/693af14522027c879c968d42 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Veg Sandwich",
    "price": 40,
    "availableQuantity": 100
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Veg Sandwich",
    "price": 40,
    "availableQuantity": 100,
    "canteenId": "693af14522027c879c968d42",
    "_id": "693af15c22027c879c968d46",
    "createdAt": "2025-12-11T16:29:16.392Z",
    "__v": 0
  }
}
```

### 8. Get Canteen Menu
**Endpoint:** `GET /api/v1/menu/canteen/:canteenId`

```bash
curl -X GET http://localhost:5001/api/v1/menu/canteen/693af14522027c879c968d42 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "693af15c22027c879c968d46",
      "name": "Veg Sandwich",
      "price": 40,
      "availableQuantity": 100,
      "canteenId": "693af14522027c879c968d42",
      "createdAt": "2025-12-11T16:29:16.392Z",
      "__v": 0
    }
  ]
}
```

### 9. Update Menu Item Details
**Endpoint:** `PUT /api/v1/menu/canteen/:canteenId/item/:itemId`

```bash
curl -X PUT http://localhost:5001/api/v1/menu/canteen/693af14522027c879c968d42/item/693af15c22027c879c968d46 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"price": 45}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "693af15c22027c879c968d46",
    "name": "Veg Sandwich",
    "price": 45,
    "availableQuantity": 95,
    "canteenId": "693af14522027c879c968d42",
    "createdAt": "2025-12-11T16:29:16.392Z",
    "__v": 0
  }
}
```

### 10. Update Menu Item Quantity
**Endpoint:** `PATCH /api/v1/menu/canteen/:canteenId/item/:itemId/quantity`

```bash
curl -X PATCH http://localhost:5001/api/v1/menu/canteen/693af14522027c879c968d42/item/693af15c22027c879c968d46/quantity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"quantity": 95}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "693af15c22027c879c968d46",
    "name": "Veg Sandwich",
    "price": 45,
    "availableQuantity": 95,
    "canteenId": "693af14522027c879c968d42",
    "createdAt": "2025-12-11T16:29:16.392Z",
    "__v": 0
  }
}
```

### 11. Delete Menu Item
**Endpoint:** `DELETE /api/v1/menu/canteen/:canteenId/item/:itemId`

```bash
curl -X DELETE http://localhost:5001/api/v1/menu/canteen/693af14522027c879c968d42/item/693af15c22027c879c968d46 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```
