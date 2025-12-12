# Frontend Integration Guide - Canteen Backend API

## 🎯 Quick Start

**Base URL:** `http://localhost:5001/api/v1`  
**Authentication:** JWT Bearer Token (get from login)

---

## 📋 Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Canteen Management](#canteen-management)
3. [Menu Management](#menu-management)
4. [Order Management](#order-management)
5. [Payment Integration](#payment-integration)
6. [Complete User Flow](#complete-user-flow)

---

## 🔐 Authentication Flow

### 1. Send OTP
**Endpoint:** `POST /api/v1/auth/email/send-otp`

```bash
curl -X POST http://localhost:5001/api/v1/auth/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": "OTP sent to email"
}
```

**Frontend Implementation:**
```javascript
async function sendOTP(email) {
  const response = await fetch('http://localhost:5001/api/v1/auth/email/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await response.json();
}
```

---

### 2. Verify OTP (Login)
**Endpoint:** `POST /api/v1/auth/email/verify-otp`

```bash
curl -X POST http://localhost:5001/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5M2FlZmJlMjIwMjdjODc5Yzk2OGQzYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY1NDcwMzY3LCJleHAiOjE3NjgwNjIzNjd9.kBNjeXCRHscUqroHuI2CBg8dxLxP1_OPEWxsEPI4jGw",
  "role": "user"
}
```

**Frontend Implementation:**
```javascript
async function verifyOTP(email, otp) {
  const response = await fetch('http://localhost:5001/api/v1/auth/email/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await response.json();
  
  // Store token and role
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  
  return data;
}
```

---

## 🏪 Canteen Management

### 3. Get All Canteens
**Endpoint:** `GET /api/v1/canteens`

```bash
curl -X GET http://localhost:5001/api/v1/canteens \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "693af14522027c879c968d42",
      "name": "Tech Cafe",
      "place": "Building 5",
      "ownerId": {
        "_id": "693aefbe22027c879c968d3c",
        "email": "owner@example.com",
        "role": "user"
      },
      "createdAt": "2025-12-11T16:28:53.988Z",
      "__v": 0
    },
    {
      "_id": "693af14522027c879c968d43",
      "name": "Main Canteen",
      "place": "Ground Floor",
      "ownerId": {
        "_id": "693aefbe22027c879c968d3d",
        "email": "admin@example.com",
        "role": "admin"
      },
      "createdAt": "2025-12-11T17:30:00.000Z",
      "__v": 0
    }
  ]
}
```

**Frontend Implementation:**
```javascript
async function getAllCanteens() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/v1/canteens', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

---

### 4. Get Canteen by ID
**Endpoint:** `GET /api/v1/canteens/:id`

```bash
curl -X GET http://localhost:5001/api/v1/canteens/693af14522027c879c968d42 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "693af14522027c879c968d42",
    "name": "Tech Cafe",
    "place": "Building 5",
    "ownerId": {
      "_id": "693aefbe22027c879c968d3c",
      "email": "owner@example.com",
      "role": "user"
    },
    "createdAt": "2025-12-11T16:28:53.988Z",
    "__v": 0
  }
}
```

---

## 🍔 Menu Management

### 5. Get Canteen Menu
**Endpoint:** `GET /api/v1/menu/canteen/:canteenId`

```bash
curl -X GET http://localhost:5001/api/v1/menu/canteen/693af14522027c879c968d42 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "693af15c22027c879c968d46",
      "name": "Veg Sandwich",
      "price": 40,
      "availableQuantity": 100,
      "canteenId": "693af14522027c879c968d42",
      "createdAt": "2025-12-11T16:29:16.392Z",
      "__v": 0
    },
    {
      "_id": "693af15c22027c879c968d47",
      "name": "Coffee",
      "price": 20,
      "availableQuantity": 50,
      "canteenId": "693af14522027c879c968d42",
      "createdAt": "2025-12-11T16:30:00.000Z",
      "__v": 0
    },
    {
      "_id": "693af15c22027c879c968d48",
      "name": "Samosa",
      "price": 15,
      "availableQuantity": 75,
      "canteenId": "693af14522027c879c968d42",
      "createdAt": "2025-12-11T16:31:00.000Z",
      "__v": 0
    }
  ]
}
```

**Frontend Implementation:**
```javascript
async function getCanteenMenu(canteenId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5001/api/v1/menu/canteen/${canteenId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

---

## 📦 Order Management

### 6. Create Order
**Endpoint:** `POST /api/v1/orders`

```bash
curl -X POST http://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "canteenId": "693af14522027c879c968d42",
    "items": [
      {"menuItemId": "693af15c22027c879c968d46", "quantity": 2},
      {"menuItemId": "693af15c22027c879c968d47", "quantity": 1}
    ]
  }'
```

**Request Body:**
```json
{
  "canteenId": "693af14522027c879c968d42",
  "items": [
    {
      "menuItemId": "693af15c22027c879c968d46",
      "quantity": 2
    },
    {
      "menuItemId": "693af15c22027c879c968d47",
      "quantity": 1
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-L9X2K3M-4N5P6",
    "userId": "693aefbe22027c879c968d3c",
    "canteenId": "693af14522027c879c968d42",
    "items": [
      {
        "menuItemId": "693af15c22027c879c968d46",
        "name": "Veg Sandwich",
        "price": 40,
        "quantity": 2
      },
      {
        "menuItemId": "693af15c22027c879c968d47",
        "name": "Coffee",
        "price": 20,
        "quantity": 1
      }
    ],
    "totalAmount": 100,
    "status": "pending",
    "paymentStatus": "pending",
    "_id": "675a1234567890abcdef1234",
    "createdAt": "2025-12-12T10:00:00.000Z",
    "updatedAt": "2025-12-12T10:00:00.000Z",
    "__v": 0
  }
}
```

**Frontend Implementation:**
```javascript
async function createOrder(canteenId, items) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ canteenId, items })
  });
  return await response.json();
}

// Example usage:
const order = await createOrder('693af14522027c879c968d42', [
  { menuItemId: '693af15c22027c879c968d46', quantity: 2 },
  { menuItemId: '693af15c22027c879c968d47', quantity: 1 }
]);
```

---

### 7. Get My Orders
**Endpoint:** `GET /api/v1/orders`

```bash
curl -X GET http://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer <TOKEN>"
```

**Optional Query Params:** `?status=paid` (filter by status)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "675a1234567890abcdef1234",
      "orderId": "ORD-L9X2K3M-4N5P6",
      "userId": "693aefbe22027c879c968d3c",
      "canteenId": {
        "_id": "693af14522027c879c968d42",
        "name": "Tech Cafe",
        "place": "Building 5"
      },
      "items": [
        {
          "menuItemId": "693af15c22027c879c968d46",
          "name": "Veg Sandwich",
          "price": 40,
          "quantity": 2
        }
      ],
      "totalAmount": 100,
      "status": "paid",
      "paymentStatus": "success",
      "paymentId": "cf_payment_123456",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "createdAt": "2025-12-12T10:00:00.000Z",
      "updatedAt": "2025-12-12T10:05:00.000Z",
      "__v": 0
    }
  ]
}
```

**Frontend Implementation:**
```javascript
async function getMyOrders(status = null) {
  const token = localStorage.getItem('token');
  const url = status 
    ? `http://localhost:5001/api/v1/orders?status=${status}`
    : 'http://localhost:5001/api/v1/orders';
    
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

---

### 8. Get Order by ID
**Endpoint:** `GET /api/v1/orders/:id`

```bash
curl -X GET http://localhost:5001/api/v1/orders/675a1234567890abcdef1234 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "675a1234567890abcdef1234",
    "orderId": "ORD-L9X2K3M-4N5P6",
    "userId": {
      "_id": "693aefbe22027c879c968d3c",
      "email": "user@example.com"
    },
    "canteenId": {
      "_id": "693af14522027c879c968d42",
      "name": "Tech Cafe",
      "place": "Building 5"
    },
    "items": [...],
    "totalAmount": 100,
    "status": "ready",
    "paymentStatus": "success",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "createdAt": "2025-12-12T10:00:00.000Z",
    "updatedAt": "2025-12-12T10:15:00.000Z"
  }
}
```

---

## 💳 Payment Integration

### 9. Initiate Payment
**Endpoint:** `POST /api/v1/payments/initiate`

```bash
curl -X POST http://localhost:5001/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"orderId": "675a1234567890abcdef1234"}'
```

**Request Body:**
```json
{
  "orderId": "675a1234567890abcdef1234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "paymentSessionId": "session_abc123xyz456",
    "orderId": "ORD-L9X2K3M-4N5P6",
    "amount": 100
  }
}
```

**Frontend Implementation:**
```javascript
async function initiatePayment(orderId) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/v1/payments/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId })
  });
  return await response.json();
}

// Redirect to Cashfree
async function redirectToCashfree(orderId) {
  const { data } = await initiatePayment(orderId);
  
  // Load Cashfree SDK
  const cashfree = Cashfree({
    mode: "sandbox" // or "production"
  });
  
  // Redirect to checkout
  cashfree.checkout({
    paymentSessionId: data.paymentSessionId,
    redirectTarget: "_self"
  });
}
```

---

### 10. Verify Payment
**Endpoint:** `POST /api/v1/payments/verify`

```bash
curl -X POST http://localhost:5001/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"orderId": "ORD-L9X2K3M-4N5P6"}'
```

**Request Body:**
```json
{
  "orderId": "ORD-L9X2K3M-4N5P6"
}
```

**Response (200 OK - Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "675a1234567890abcdef1234",
    "orderId": "ORD-L9X2K3M-4N5P6",
    "status": "paid",
    "paymentStatus": "success",
    "paymentId": "cf_payment_123456",
    "qrCode": "data:image/png;base64,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sBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AViNcAKxGuABYjXABsBrhAmA1wgXAaoQLgNUIFwCrES4AVvt/AQDwMCcRYYLmAAAAAElFTkSuQmCC",
    "totalAmount": 100,
    "createdAt": "2025-12-12T10:00:00.000Z",
    "updatedAt": "2025-12-12T10:05:00.000Z"
  }
}
```

**Response (400 Bad Request - Failed):**
```json
{
  "success": false,
  "error": "Payment failed",
  "data": {
    "orderId": "ORD-L9X2K3M-4N5P6",
    "status": "pending",
    "paymentStatus": "failed"
  }
}
```

**Frontend Implementation:**
```javascript
async function verifyPayment(orderId) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId })
  });
  return await response.json();
}

// Call after Cashfree redirect
async function handlePaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  
  const result = await verifyPayment(orderId);
  
  if (result.success) {
    // Show QR code
    displayQRCode(result.data.qrCode);
  } else {
    // Show error
    alert('Payment failed');
  }
}
```

---

## 🔄 Complete User Flow

### Step-by-Step Implementation

```javascript
// 1. Login
const loginResult = await sendOTP('user@example.com');
const authResult = await verifyOTP('user@example.com', '123456');
// Store token

// 2. Browse Canteens
const canteens = await getAllCanteens();

// 3. View Menu
const menu = await getCanteenMenu(canteens.data[0]._id);

// 4. Create Order
const orderItems = [
  { menuItemId: menu.data[0]._id, quantity: 2 },
  { menuItemId: menu.data[1]._id, quantity: 1 }
];
const order = await createOrder(canteens.data[0]._id, orderItems);

// 5. Initiate Payment
const payment = await initiatePayment(order.data._id);

// 6. Redirect to Cashfree
const cashfree = Cashfree({ mode: "sandbox" });
cashfree.checkout({
  paymentSessionId: payment.data.paymentSessionId,
  redirectTarget: "_self"
});

// 7. After redirect back, verify payment
const verified = await verifyPayment(order.data.orderId);

// 8. Display QR Code
if (verified.success) {
  document.getElementById('qr-code').src = verified.data.qrCode;
}

// 9. Check order status
const myOrders = await getMyOrders('paid');
```

---

## 🔑 Admin/Owner Endpoints

### Update Order Status
**Endpoint:** `PATCH /api/v1/orders/:id/status`

```bash
curl -X PATCH http://localhost:5001/api/v1/orders/675a1234567890abcdef1234/status \
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

**Valid Statuses:** `preparing`, `ready`, `completed`, `cancelled`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "675a1234567890abcdef1234",
    "orderId": "ORD-L9X2K3M-4N5P6",
    "status": "preparing",
    ...
  }
}
```

---

### Get Canteen Orders (Admin Panel)
**Endpoint:** `GET /api/v1/orders/canteen/:canteenId`

```bash
curl -X GET "http://localhost:5001/api/v1/orders/canteen/693af14522027c879c968d42?status=paid" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "675a1234567890abcdef1234",
      "orderId": "ORD-L9X2K3M-4N5P6",
      "userId": {
        "_id": "693aefbe22027c879c968d3c",
        "email": "user@example.com"
      },
      "items": [...],
      "totalAmount": 100,
      "status": "paid",
      "createdAt": "2025-12-12T10:00:00.000Z"
    }
  ]
}
```

---

### Verify QR Code (Scanner)
**Endpoint:** `POST /api/v1/orders/verify-qr`

```bash
curl -X POST http://localhost:5001/api/v1/orders/verify-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"qrData": "{\"orderId\":\"ORD-L9X2K3M-4N5P6\",\"timestamp\":1702380000000,\"signature\":\"abc123...\"}"}'
```

**Request Body:**
```json
{
  "qrData": "{\"orderId\":\"ORD-L9X2K3M-4N5P6\",\"timestamp\":1702380000000,\"signature\":\"abc123...\"}"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "QR code verified successfully",
  "data": {
    "orderId": "ORD-L9X2K3M-4N5P6",
    "status": "ready",
    "items": [...],
    "totalAmount": 100
  }
}
```

**Frontend Implementation (QR Scanner):**
```javascript
import QrScanner from 'qr-scanner'; // or similar library

async function scanQRCode() {
  const video = document.getElementById('qr-video');
  const qrScanner = new QrScanner(
    video,
    async (result) => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/orders/verify-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrData: result.data })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Order ${data.data.orderId} verified!`);
        // Mark as completed
        await updateOrderStatus(data.data._id, 'completed');
      }
    }
  );
  
  qrScanner.start();
}
```

---

## 🛡️ Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Not authorized, no token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Not authorized to access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Order not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Insufficient quantity for Veg Sandwich. Available: 5"
}
```

**Frontend Error Handling:**
```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Show user-friendly error
    alert(error.message);
    throw error;
  }
}
```

---

## 📱 Cashfree Integration (Frontend)

### 1. Install Cashfree SDK

```html
<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
```

### 2. Initialize and Redirect

```javascript
async function processPayment(orderId) {
  // Step 1: Initiate payment
  const { data } = await initiatePayment(orderId);
  
  // Step 2: Initialize Cashfree
  const cashfree = Cashfree({
    mode: "sandbox" // Use "production" for live
  });
  
  // Step 3: Redirect to checkout
  const checkoutOptions = {
    paymentSessionId: data.paymentSessionId,
    redirectTarget: "_self" // or "_modal" for popup
  };
  
  cashfree.checkout(checkoutOptions);
}
```

### 3. Handle Callback

```javascript
// On your callback page (e.g., /payment/callback)
window.addEventListener('load', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  
  if (orderId) {
    const result = await verifyPayment(orderId);
    
    if (result.success) {
      // Payment successful
      window.location.href = `/order/${result.data._id}`;
    } else {
      // Payment failed
      window.location.href = `/payment-failed?orderId=${orderId}`;
    }
  }
});
```

---

## 🎨 UI Components Examples

### Order Card Component
```javascript
function OrderCard({ order }) {
  return (
    <div className="order-card">
      <h3>Order #{order.orderId}</h3>
      <p>Status: {order.status}</p>
      <p>Total: ₹{order.totalAmount}</p>
      
      {order.qrCode && (
        <img src={order.qrCode} alt="Order QR Code" />
      )}
      
      <div className="items">
        {order.items.map(item => (
          <div key={item.menuItemId}>
            {item.name} x {item.quantity} = ₹{item.price * item.quantity}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Payment Button Component
```javascript
function PaymentButton({ orderId }) {
  const handlePayment = async () => {
    try {
      const { data } = await initiatePayment(orderId);
      
      const cashfree = Cashfree({ mode: "sandbox" });
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self"
      });
    } catch (error) {
      alert('Payment initiation failed');
    }
  };
  
  return (
    <button onClick={handlePayment}>
      Pay ₹{order.totalAmount}
    </button>
  );
}
```

---

## 📊 Status Flow

```
Order Status Flow:
pending → paid → preparing → ready → completed

Payment Status:
pending → success/failed
```

**Status Meanings:**
- `pending`: Order created, awaiting payment
- `paid`: Payment successful, awaiting preparation
- `preparing`: Kitchen is preparing the order
- `ready`: Order ready for pickup
- `completed`: Order picked up (after QR scan)
- `cancelled`: Order cancelled

---

## ✅ Testing Checklist

- [ ] User can login with OTP
- [ ] User can view all canteens
- [ ] User can view menu items
- [ ] User can create order
- [ ] Order validates item availability
- [ ] Payment initiation returns session ID
- [ ] Cashfree redirect works
- [ ] Payment verification updates order
- [ ] QR code is generated after payment
- [ ] QR code is displayed correctly
- [ ] Admin can view canteen orders
- [ ] Admin can update order status
- [ ] Admin can scan and verify QR code
- [ ] Error messages are user-friendly

---

## 🔧 Environment Setup

**Backend `.env` (already configured):**
```env
PORT=5001
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=TEST
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5001/api/v1
REACT_APP_CASHFREE_MODE=sandbox
```

---

## 📞 Support

For any issues or questions:
1. Check error responses for details
2. Verify token is being sent correctly
3. Ensure Cashfree credentials are valid
4. Check order status before operations

**Common Issues:**
- **401 Error**: Token expired or invalid
- **403 Error**: Insufficient permissions
- **400 Error**: Validation failed (check request body)
- **Payment Failed**: Check Cashfree dashboard for details
