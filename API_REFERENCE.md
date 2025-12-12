# Canteen Backend API - Complete Reference

This document contains all API endpoints with curl examples and responses.

## Base URL
```
http://localhost:5001/api/v1
```

---

## Authentication

### 1. Send OTP
**Endpoint:** `POST /api/v1/auth/email/send-otp`

```bash
curl -X POST http://localhost:5001/api/v1/auth/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**
```json
{
  "success": true,
  "data": "OTP sent to email"
}
```

### 2. Verify OTP (Login)
**Endpoint:** `POST /api/v1/auth/email/verify-otp`

```bash
curl -X POST http://localhost:5001/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

> **Note:** Save the token for authenticated requests: `Authorization: Bearer <TOKEN>`

---

## Canteens

### 3. Create Canteen
```bash
curl -X POST http://localhost:5001/api/v1/canteens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Tech Cafe", "place": "Building 5", "ownerId": "<USER_ID>"}'
```

### 4. Get All Canteens
```bash
curl -X GET http://localhost:5001/api/v1/canteens \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. Get My Canteens
```bash
curl -X GET http://localhost:5001/api/v1/canteens/my-canteens \
  -H "Authorization: Bearer <TOKEN>"
```

### 6. Get Canteen by ID
```bash
curl -X GET http://localhost:5001/api/v1/canteens/<CANTEEN_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 7. Delete Canteen
```bash
curl -X DELETE http://localhost:5001/api/v1/canteens/<CANTEEN_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Menu Management

### 8. Add Menu Item
```bash
curl -X POST http://localhost:5001/api/v1/menu/canteen/<CANTEEN_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Veg Sandwich", "price": 40, "availableQuantity": 100}'
```

### 9. Get Canteen Menu
```bash
curl -X GET http://localhost:5001/api/v1/menu/canteen/<CANTEEN_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 10. Update Menu Item
```bash
curl -X PUT http://localhost:5001/api/v1/menu/canteen/<CANTEEN_ID>/item/<ITEM_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"price": 45}'
```

### 11. Update Item Quantity
```bash
curl -X PATCH http://localhost:5001/api/v1/menu/canteen/<CANTEEN_ID>/item/<ITEM_ID>/quantity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"quantity": 95}'
```

### 12. Delete Menu Item
```bash
curl -X DELETE http://localhost:5001/api/v1/menu/canteen/<CANTEEN_ID>/item/<ITEM_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Orders (NEW)

### 13. Create Order
**Endpoint:** `POST /api/v1/orders`

```bash
curl -X POST http://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "canteenId": "<CANTEEN_ID>",
    "items": [
      {"menuItemId": "<ITEM_ID>", "quantity": 2},
      {"menuItemId": "<ITEM_ID_2>", "quantity": 1}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-ABC123-XYZ",
    "userId": "...",
    "canteenId": "...",
    "items": [...],
    "totalAmount": 120,
    "status": "pending",
    "paymentStatus": "pending",
    "_id": "...",
    "createdAt": "2025-12-11T..."
  }
}
```

### 14. Get My Orders
**Endpoint:** `GET /api/v1/orders`

```bash
curl -X GET http://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer <TOKEN>"
```

**Optional query params:** `?status=paid` (filter by status)

### 15. Get Order by ID
**Endpoint:** `GET /api/v1/orders/:id`

```bash
curl -X GET http://localhost:5001/api/v1/orders/<ORDER_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 16. Update Order Status (Admin/Owner)
**Endpoint:** `PATCH /api/v1/orders/:id/status`

```bash
curl -X PATCH http://localhost:5001/api/v1/orders/<ORDER_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status": "preparing"}'
```

**Valid statuses:** `preparing`, `ready`, `completed`, `cancelled`

### 17. Cancel Order
**Endpoint:** `DELETE /api/v1/orders/:id`

```bash
curl -X DELETE http://localhost:5001/api/v1/orders/<ORDER_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 18. Get Canteen Orders (Admin/Owner)
**Endpoint:** `GET /api/v1/orders/canteen/:canteenId`

```bash
curl -X GET http://localhost:5001/api/v1/orders/canteen/<CANTEEN_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

**Optional query params:** `?status=paid`

### 19. Verify QR Code (Admin/Owner)
**Endpoint:** `POST /api/v1/orders/verify-qr`

```bash
curl -X POST http://localhost:5001/api/v1/orders/verify-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"qrData": "<SCANNED_QR_DATA>"}'
```

**Response:**
```json
{
  "success": true,
  "message": "QR code verified successfully",
  "data": {
    "orderId": "ORD-ABC123-XYZ",
    "status": "ready",
    ...
  }
}
```

---

## Payments (NEW)

### 20. Initiate Payment
**Endpoint:** `POST /api/v1/payments/initiate`

```bash
curl -X POST http://localhost:5001/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"orderId": "<ORDER_MONGODB_ID>"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentSessionId": "session_xxx",
    "orderId": "ORD-ABC123-XYZ",
    "amount": 120
  }
}
```

> **Frontend:** Use `paymentSessionId` to redirect to Cashfree hosted checkout

### 21. Verify Payment
**Endpoint:** `POST /api/v1/payments/verify`

```bash
curl -X POST http://localhost:5001/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"orderId": "ORD-ABC123-XYZ"}'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "ORD-ABC123-XYZ",
    "status": "paid",
    "paymentStatus": "success",
    "qrCode": "data:image/png;base64,...",
    ...
  }
}
```

### 22. Webhook (Cashfree)
**Endpoint:** `POST /api/v1/payments/webhook`

> **Note:** This endpoint is called automatically by Cashfree. No manual testing needed.

---

## Order Flow Summary

1. **User creates order** → Status: `pending`
2. **User initiates payment** → Get `paymentSessionId`
3. **Frontend redirects to Cashfree** → User completes payment
4. **Cashfree webhook updates order** → Status: `paid`, QR code generated
5. **User verifies payment** → Gets order with QR code
6. **Admin updates status** → `preparing` → `ready`
7. **User shows QR at counter** → Admin scans
8. **Admin verifies QR** → Marks order as `completed`

---

## Environment Variables Required

Add to `.env`:
```env
# Cashfree Payment Gateway
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=TEST
CASHFREE_WEBHOOK_SECRET=your_webhook_secret

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

---

## Security Features

✅ **JWT Authentication** - All endpoints protected except auth and webhook  
✅ **HMAC QR Signatures** - QR codes signed with JWT secret  
✅ **Role-based Access** - Admin/owner checks for sensitive operations  
✅ **Payment Verification** - Cashfree signature validation  
✅ **Order Ownership** - Users can only access their own orders  
✅ **Quantity Validation** - Stock checks before order creation  

---

## Testing Checklist

- [ ] Create order with valid items
- [ ] Initiate payment and get session ID
- [ ] Complete payment on Cashfree (TEST mode)
- [ ] Verify payment and receive QR code
- [ ] Admin updates order status
- [ ] Scan QR code to verify order
- [ ] Test error cases (insufficient quantity, invalid items, etc.)
