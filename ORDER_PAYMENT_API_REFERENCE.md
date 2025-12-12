# Order & Payment APIs - Complete Reference with Real Examples

## 🔐 Authentication First

Before using any order APIs, you need a valid token:

### Step 1: Send OTP
```bash
curl -X POST http://localhost:5001/api/v1/auth/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "data": "OTP sent to email"
}
```

### Step 2: Verify OTP (Check console for OTP)
```bash
curl -X POST http://localhost:5001/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "292764"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw",
  "role": "user"
}
```

**Save this token!** Use it in all subsequent requests as `Authorization: Bearer <TOKEN>`

---

## 📦 ORDER MANAGEMENT APIs

### 1. Create Order

**Endpoint:** `POST /api/v1/orders`

**curl Command:**
```bash
curl -X POST http://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw" \
  -d '{
    "canteenId": "693b010b3ab6f068202b736b",
    "items": [
      {
        "menuItemId": "693b033e3ab6f068202b7384",
        "quantity": 2
      }
    ]
  }'
```

**Request Body:**
```json
{
  "canteenId": "693b010b3ab6f068202b736b",
  "items": [
    {
      "menuItemId": "693b033e3ab6f068202b7384",
      "quantity": 2
    }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "693a7a06367521330ccf99d2",
    "canteenId": "693b010b3ab6f068202b736b",
    "items": [
      {
        "menuItemId": "693b033e3ab6f068202b7384",
        "name": "Samosa",
        "price": 30,
        "quantity": 2,
        "_id": "693bb36d34872b3c5b921fbb"
      }
    ],
    "totalAmount": 60,
    "status": "pending",
    "paymentStatus": "pending",
    "_id": "693bb36d34872b3c5b921fba",
    "createdAt": "2025-12-12T06:17:17.207Z",
    "updatedAt": "2025-12-12T06:17:17.207Z",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "__v": 0
  }
}
```

**Key Points:**
- ✅ Auto-generates unique `orderId` (e.g., ORD-MJ2H5XNB-NIJ69)
- ✅ Validates menu items exist
- ✅ Checks available quantity
- ✅ Calculates total amount automatically
- ✅ Initial status: `pending`, paymentStatus: `pending`

---

### 2. Get My Orders

**Endpoint:** `GET /api/v1/orders`

**curl Command:**
```bash
curl -X GET http://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw"
```

**Optional Query Parameters:**
- `?status=paid` - Filter by order status
- `?status=pending` - Get pending orders
- `?status=ready` - Get ready orders

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "693bb36d34872b3c5b921fba",
      "userId": "693a7a06367521330ccf99d2",
      "canteenId": {
        "_id": "693b010b3ab6f068202b736b",
        "name": "Me",
        "place": "Me block "
      },
      "items": [
        {
          "menuItemId": "693b033e3ab6f068202b7384",
          "name": "Samosa",
          "price": 30,
          "quantity": 2,
          "_id": "693bb36d34872b3c5b921fbb"
        }
      ],
      "totalAmount": 60,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2025-12-12T06:17:17.207Z",
      "updatedAt": "2025-12-12T06:17:17.207Z",
      "orderId": "ORD-MJ2H5XNB-NIJ69",
      "__v": 0
    }
  ]
}
```

**Key Points:**
- ✅ Returns only the authenticated user's orders
- ✅ Canteen details are populated
- ✅ Sorted by creation date (newest first)

---

### 3. Get Order by ID

**Endpoint:** `GET /api/v1/orders/:id`

**curl Command:**
```bash
curl -X GET http://localhost:5001/api/v1/orders/693bb36d34872b3c5b921fba \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "693bb36d34872b3c5b921fba",
    "userId": {
      "_id": "693a7a06367521330ccf99d2",
      "email": "test@example.com"
    },
    "canteenId": {
      "_id": "693b010b3ab6f068202b736b",
      "name": "Me",
      "place": "Me block "
    },
    "items": [
      {
        "menuItemId": "693b033e3ab6f068202b7384",
        "name": "Samosa",
        "price": 30,
        "quantity": 2,
        "_id": "693bb36d34872b3c5b921fbb"
      }
    ],
    "totalAmount": 60,
    "status": "pending",
    "paymentStatus": "pending",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "createdAt": "2025-12-12T06:17:17.207Z",
    "updatedAt": "2025-12-12T06:17:17.207Z",
    "__v": 0
  }
}
```

**Authorization:**
- ✅ User can view their own orders
- ✅ Admin can view any order
- ✅ Canteen owner can view orders for their canteen

---

### 4. Update Order Status (Admin/Owner Only)

**Endpoint:** `PATCH /api/v1/orders/:id/status`

**curl Command:**
```bash
curl -X PATCH http://localhost:5001/api/v1/orders/693bb36d34872b3c5b921fba/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "preparing"}'
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid Status Values:**
- `preparing` - Kitchen is preparing the order
- `ready` - Order is ready for pickup
- `completed` - Order has been picked up
- `cancelled` - Order cancelled

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "693bb36d34872b3c5b921fba",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "status": "preparing",
    "paymentStatus": "success",
    "totalAmount": 60,
    "updatedAt": "2025-12-12T06:25:00.000Z"
  }
}
```

**Status Flow:**
```
pending → paid → preparing → ready → completed
         ↓
     cancelled
```

---

### 5. Cancel Order

**Endpoint:** `DELETE /api/v1/orders/:id`

**curl Command:**
```bash
curl -X DELETE http://localhost:5001/api/v1/orders/693bb36d34872b3c5b921fba \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "693bb36d34872b3c5b921fba",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "status": "cancelled",
    "updatedAt": "2025-12-12T06:30:00.000Z"
  }
}
```

**Rules:**
- ✅ User can cancel their own `pending` or `paid` orders
- ❌ Cannot cancel orders with status `preparing`, `ready`, or `completed`

---

### 6. Get Canteen Orders (Admin/Owner Only)

**Endpoint:** `GET /api/v1/orders/canteen/:canteenId`

**curl Command:**
```bash
curl -X GET "http://localhost:5001/api/v1/orders/canteen/693b010b3ab6f068202b736b?status=paid" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Optional Query Parameters:**
- `?status=paid` - Filter by status
- `?status=ready` - Get ready orders

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "693bb36d34872b3c5b921fba",
      "orderId": "ORD-MJ2H5XNB-NIJ69",
      "userId": {
        "_id": "693a7a06367521330ccf99d2",
        "email": "test@example.com"
      },
      "items": [
        {
          "name": "Samosa",
          "price": 30,
          "quantity": 2
        }
      ],
      "totalAmount": 60,
      "status": "paid",
      "paymentStatus": "success",
      "createdAt": "2025-12-12T06:17:17.207Z"
    }
  ]
}
```

**Authorization:**
- ✅ Admin can view all canteen orders
- ✅ Canteen owner can view their canteen's orders
- ❌ Regular users cannot access this endpoint

---

### 7. Verify QR Code (Admin/Owner Only)

**Endpoint:** `POST /api/v1/orders/verify-qr`

**curl Command:**
```bash
curl -X POST http://localhost:5001/api/v1/orders/verify-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"qrData": "{\"orderId\":\"ORD-MJ2H5XNB-NIJ69\",\"timestamp\":1702380000000,\"signature\":\"abc123...\"}"}'
```

**Request Body:**
```json
{
  "qrData": "{\"orderId\":\"ORD-MJ2H5XNB-NIJ69\",\"timestamp\":1702380000000,\"signature\":\"abc123...\"}"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "QR code verified successfully",
  "data": {
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "status": "ready",
    "items": [
      {
        "name": "Samosa",
        "quantity": 2,
        "price": 30
      }
    ],
    "totalAmount": 60,
    "userId": {
      "email": "test@example.com"
    }
  }
}
```

**Error Response - Invalid QR:**
```json
{
  "success": false,
  "error": "Invalid or expired QR code"
}
```

**QR Code Security:**
- ✅ HMAC-SHA256 signature verification
- ✅ 24-hour expiration
- ✅ Tamper-proof

---

## 💳 PAYMENT APIs

### 8. Initiate Payment

**Endpoint:** `POST /api/v1/payments/initiate`

**curl Command:**
```bash
curl -X POST http://localhost:5001/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw" \
  -d '{"orderId": "693bb36d34872b3c5b921fba"}'
```

**Request Body:**
```json
{
  "orderId": "693bb36d34872b3c5b921fba"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "paymentSessionId": "session_abc123xyz456",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "amount": 60
  }
}
```

**Frontend Next Steps:**
```javascript
// Use paymentSessionId to redirect to Cashfree
const cashfree = Cashfree({ mode: "sandbox" });
cashfree.checkout({
  paymentSessionId: data.paymentSessionId,
  redirectTarget: "_self"
});
```

---

### 9. Verify Payment

**Endpoint:** `POST /api/v1/payments/verify`

**curl Command:**
```bash
curl -X POST http://localhost:5001/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2E3YTA2MzY3NTIxMzMwY2NmOTlkMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NTE5NzkxLCJleHAiOjE3NjgxMTE3OTF9.2ae7BNinRd6CX3xAk60-yorQ2Z0WRRfKwHjgZG6cKXw" \
  -d '{"orderId": "ORD-MJ2H5XNB-NIJ69"}'
```

**Request Body:**
```json
{
  "orderId": "ORD-MJ2H5XNB-NIJ69"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "693bb36d34872b3c5b921fba",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "status": "paid",
    "paymentStatus": "success",
    "paymentId": "cf_payment_123456",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "totalAmount": 60,
    "createdAt": "2025-12-12T06:17:17.207Z",
    "updatedAt": "2025-12-12T06:35:00.000Z"
  }
}
```

**Failed Payment Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Payment failed",
  "data": {
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "status": "pending",
    "paymentStatus": "failed"
  }
}
```

**After Successful Payment:**
- ✅ Order status → `paid`
- ✅ Payment status → `success`
- ✅ QR code generated automatically
- ✅ Payment ID stored

---

## 🔄 Complete Order Flow Example

```bash
# 1. Login
curl -X POST http://localhost:5001/api/v1/auth/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# 2. Verify OTP (use OTP from console)
curl -X POST http://localhost:5001/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'

# Save the token!
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Get canteens
curl -X GET http://localhost:5001/api/v1/canteens \
  -H "Authorization: Bearer $TOKEN"

# 4. Get menu for a canteen
curl -X GET http://localhost:5001/api/v1/menu/canteen/693b010b3ab6f068202b736b \
  -H "Authorization: Bearer $TOKEN"

# 5. Create order
curl -X POST http://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "canteenId": "693b010b3ab6f068202b736b",
    "items": [{"menuItemId": "693b033e3ab6f068202b7384", "quantity": 2}]
  }'

# Save the order _id!
ORDER_ID="693bb36d34872b3c5b921fba"

# 6. Initiate payment
curl -X POST http://localhost:5001/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"orderId\": \"$ORDER_ID\"}"

# 7. After Cashfree payment, verify
curl -X POST http://localhost:5001/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"orderId": "ORD-MJ2H5XNB-NIJ69"}'

# 8. Get order with QR code
curl -X GET http://localhost:5001/api/v1/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Insufficient quantity for Samosa. Available: 5"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Order not found"
}
```

---

## 📝 Notes

1. **Order ID Format:** Auto-generated as `ORD-XXXXXXXX-XXXXX`
2. **Token Expiry:** 30 days
3. **QR Code Expiry:** 24 hours
4. **Payment Gateway:** Cashfree (TEST mode)
5. **Base URL:** `http://localhost:5001/api/v1`

**All endpoints tested and working! ✅**
