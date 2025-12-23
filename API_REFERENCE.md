# Canteen Backend API Reference

Base URL: `https://api.dranjali.tech/api/v1`

---

## 🔐 Authentication

### 1. Send OTP
**Endpoint:** `POST /auth/email/send-otp`
**Public**

```bash
curl -X POST https://api.dranjali.tech/api/v1/auth/email/send-otp \
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

### 2. Verify OTP
**Endpoint:** `POST /auth/email/verify-otp`
**Public**

```bash
curl -X POST https://api.dranjali.tech/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "role": "user"
}
```
*Use this token in the `Authorization` header for all protected routes: `Bearer <TOKEN>`*

faile

---

## 🏪 Canteen Management

### 3. Get All Canteens
**Endpoint:** `GET /canteens`
**Public**

```bash
curl -X GET https://api.dranjali.tech/api/v1/canteens
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "693b010b3ab6f068202b736b",
      "name": "Main Canteen",
      "place": "Block A",
      "isOpen": true,
      "openingTime": "09:00",
      "closingTime": "18:00"
    }
  ]
}
```

### 4. Create Canteen (Admin/Owner)
**Endpoint:** `POST /canteens`
**Private**

```bash
curl -X POST https://api.dranjali.tech/api/v1/canteens \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Cafe",
    "place": "IT Block",
    "ownerId": "USER_ID",
    "openingTime": "08:00",
    "closingTime": "20:00"
  }'
```

### 5. Get My Canteens (Owner)
**Endpoint:** `GET /canteens/my-canteens`
**Private**

```bash
curl -X GET https://api.dranjali.tech/api/v1/canteens/my-canteens \
  -H "Authorization: Bearer <TOKEN>"
```

### 6. Toggle Canteen Status
**Endpoint:** `PATCH /canteens/:id/status`
**Private**

```bash
curl -X PATCH https://api.dranjali.tech/api/v1/canteens/693b010b3ab6f068202b736b/status \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🍔 Menu Management

### 7. Get Canteen Menu
**Endpoint:** `GET /menu/canteen/:canteenId`
**Public**

```bash
curl -X GET https://api.dranjali.tech/api/v1/menu/canteen/693b010b3ab6f068202b736b
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "693b033e3ab6f068202b7384",
      "name": "Samosa",
      "price": 20,
      "availableQuantity": 50,
      "canteenId": "693b010b3ab6f068202b736b"
    }
  ]
}
```

### 8. Add Menu Item
**Endpoint:** `POST /menu/canteen/:canteenId`
**Private (Owner/Admin)**

```bash
curl -X POST https://api.dranjali.tech/api/v1/menu/canteen/693b010b3ab6f068202b736b \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Veg Burger",
    "price": 50,
    "availableQuantity": 100
  }'
```

### 9. Update Menu Item
**Endpoint:** `PUT /menu/canteen/:canteenId/item/:itemId`
**Private**

```bash
curl -X PUT https://api.dranjali.tech/api/v1/menu/canteen/CID/item/IID \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"price": 60}'
```

### 10. Update Item Quantity
**Endpoint:** `PATCH /menu/canteen/:canteenId/item/:itemId/quantity`
**Private**

```bash
curl -X PATCH https://api.dranjali.tech/api/v1/menu/canteen/CID/item/IID/quantity \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"quantity": 0}'
```

---

## 📦 Order Management

### 11. Create Order
**Endpoint:** `POST /orders`
**Private**

```bash
curl -X POST https://api.dranjali.tech/api/v1/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "canteenId": "693b010b3ab6f068202b736b",
    "items": [
      { "menuItemId": "693b033e3ab6f068202b7384", "quantity": 2 }
    ]
  }'
```

### 12. Get My Orders
**Endpoint:** `GET /orders`
**Private**

```bash
curl -X GET https://api.dranjali.tech/api/v1/orders \
  -H "Authorization: Bearer <TOKEN>"
```

### 13. Get Order by ID
**Endpoint:** `GET /orders/:id`
**Private**

```bash
curl -X GET https://api.dranjali.tech/api/v1/orders/ORD-MJ2H5XNB-NIJ69 \
  -H "Authorization: Bearer <TOKEN>"
```

### 14. Update Order Status (Admin/Owner)
**Endpoint:** `PATCH /orders/:id/status`
**Private**

```bash
curl -X PATCH https://api.dranjali.tech/api/v1/orders/OID/status \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status": "preparing"}'
```
*Statuses: preparing, ready, completed, cancelled*

### 15. Verify Order QR (Admin/Owner)
**Endpoint:** `POST /orders/verify-qr`
**Private**

```bash
curl -X POST https://api.dranjali.tech/api/v1/orders/verify-qr \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"qrData": "..."}'
```

### 16. Complete Pickup (Admin/Owner)
**Endpoint:** `POST /orders/pickup`
**Private**

```bash
curl -X POST https://api.dranjali.tech/api/v1/orders/pickup \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"qrData": "..."}'
```

---

## 💳 Payments

### 17. Initiate Payment
**Endpoint:** `POST /payments/initiate`
**Private**

```bash
curl -X POST https://api.dranjali.tech/api/v1/payments/initiate \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"orderId": "693bb36d34872b3c5b921fba"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_NeJ2H5XNBNIJ69",
    "amount": 6000,
    "currency": "INR"
  }
}
```

### 18. Verify Payment
**Endpoint:** `POST /payments/verify`
**Private**

```bash
curl -X POST https://api.dranjali.tech/api/v1/payments/verify \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "razorpayOrderId": "order_NeJ2H5XNBNIJ69",
    "razorpayPaymentId": "pay_NeJ3CkS8sJ7",
    "razorpaySignature": "e3b2c1..."
  }'
```

---

## 📊 Analytics

### 19. Get Canteen Analytics
**Endpoint:** `GET /analytics/canteen/:canteenId`
**Private (Admin/Owner)**

```bash
curl -X GET "https://api.dranjali.tech/api/v1/analytics/canteen/CID?period=day" \
  -H "Authorization: Bearer <TOKEN>"
```
*Periods: day, week, month*

### 20. Get Earnings Breakdown
**Endpoint:** `GET /analytics/canteen/:canteenId/earnings`
**Private (Admin/Owner)**

```bash
curl -X GET "https://api.dranjali.tech/api/v1/analytics/canteen/CID/earnings?period=week" \
  -H "Authorization: Bearer <TOKEN>"
```
