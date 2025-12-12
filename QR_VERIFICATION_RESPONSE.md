# QR Code Verification Response - Frontend Display Guide

## Endpoint
**POST** `/api/v1/orders/verify-qr`

## Request
```json
{
  "qrData": "{ ... scanned QR code data ... }"
}
```

## Response Structure

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "QR code verified successfully",
  "data": {
    "_id": "693c414cb5c7ab9ba33014b5",
    "orderId": "ORD-MJ32SDVY-M2EVL",
    "userId": {
      "_id": "693a7a06367521330ccf99d2",
      "email": "user@example.com"
    },
    "canteenId": {
      "_id": "693b010b3ab6f068202b736b",
      "name": "Main Canteen",
      "place": "Building A, Floor 1"
    },
    "items": [
      {
        "_id": "693c414cb5c7ab9ba33014b6",
        "menuItemId": "693b033e3ab6f068202b7384",
        "name": "Samosa",
        "price": 30,
        "quantity": 2
      },
      {
        "_id": "693c414cb5c7ab9ba33014b7",
        "menuItemId": "693b033e3ab6f068202b7385",
        "name": "Tea",
        "price": 15,
        "quantity": 1
      }
    ],
    "totalAmount": 75,
    "status": "paid",
    "paymentStatus": "success",
    "paymentId": "pay_RqlW3RY7m4dEFE",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "createdAt": "2025-12-12T16:22:36.622Z",
    "updatedAt": "2025-12-12T16:25:10.123Z"
  }
}
```

---

## What to Display on Frontend

### 📋 Order Summary Card
```
┌─────────────────────────────────────┐
│  Order #ORD-MJ32SDVY-M2EVL         │
│  ✅ PAID                            │
├─────────────────────────────────────┤
│  Customer: user@example.com         │
│  Canteen: Main Canteen              │
│  Location: Building A, Floor 1      │
├─────────────────────────────────────┤
│  Items:                             │
│  • Samosa x2 ............... ₹60    │
│  • Tea x1 .................. ₹15    │
├─────────────────────────────────────┤
│  Total: ₹75                         │
│  Status: PAID                       │
│  Payment ID: pay_RqlW3RY7m4dEFE    │
├─────────────────────────────────────┤
│  Ordered: Dec 12, 4:22 PM           │
│  Updated: Dec 12, 4:25 PM           │
└─────────────────────────────────────┘
```

### 🎨 UI Components to Show

#### 1. **Order Header**
- `orderId` - Display prominently at top
- `status` - Show as colored badge (paid = green, pending = yellow, etc.)

#### 2. **Customer Info**
- `userId.email` - Customer email

#### 3. **Canteen Info**
- `canteenId.name` - Canteen name
- `canteenId.place` - Location

#### 4. **Items List**
For each item in `items[]`:
- `name` - Item name
- `quantity` - How many
- `price` - Price per item
- Calculate: `price × quantity` for subtotal

#### 5. **Payment Info**
- `totalAmount` - Total price (₹)
- `paymentStatus` - success/pending/failed
- `paymentId` - Razorpay payment ID (for reference)

#### 6. **Timestamps**
- `createdAt` - When order was placed
- `updatedAt` - Last update time

---

## Status Values & Display

### Order Status (`status`)
- `pending` - 🟡 Pending Payment
- `paid` - 🟢 Paid
- `preparing` - 🔵 Preparing
- `ready` - 🟣 Ready for Pickup
- `completed` - ✅ Completed
- `cancelled` - ❌ Cancelled

### Payment Status (`paymentStatus`)
- `pending` - ⏳ Payment Pending
- `success` - ✅ Payment Successful
- `failed` - ❌ Payment Failed

---

## Frontend Code Example

### React/React Native
```jsx
const OrderDetails = ({ orderData }) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.orderId}>Order #{orderData.orderId}</Text>
      <Badge status={orderData.status} />
      
      {/* Customer */}
      <Text>Customer: {orderData.userId.email}</Text>
      
      {/* Canteen */}
      <Text>{orderData.canteenId.name}</Text>
      <Text>{orderData.canteenId.place}</Text>
      
      {/* Items */}
      {orderData.items.map(item => (
        <View key={item._id}>
          <Text>{item.name} x{item.quantity}</Text>
          <Text>₹{item.price * item.quantity}</Text>
        </View>
      ))}
      
      {/* Total */}
      <Text style={styles.total}>Total: ₹{orderData.totalAmount}</Text>
      
      {/* Timestamps */}
      <Text>Ordered: {new Date(orderData.createdAt).toLocaleString()}</Text>
    </View>
  );
};
```

---

## Error Responses

### 1. Invalid QR Code (400 Bad Request)
**Scenario**: QR code is malformed, has invalid signature, or is expired (>24 hours old)

```json
{
  "success": false,
  "error": "Invalid or expired QR code"
}
```

**Reasons for this error:**
- QR code signature doesn't match (tampered/fake QR)
- QR code is older than 24 hours
- QR code data is malformed/corrupted
- Missing required fields (orderId, timestamp, signature)

**Frontend Display:**
```
❌ Invalid QR Code
This QR code is invalid or has expired.
Please ask the customer for a new QR code.
```

---

### 2. Already Scanned/Completed (400 Bad Request)
**Scenario**: QR code has already been used for pickup

```json
{
  "success": false,
  "error": "Order already picked up/completed",
  "data": {
    "_id": "693c414cb5c7ab9ba33014b5",
    "orderId": "ORD-MJ32SDVY-M2EVL",
    "status": "completed",
    "paymentStatus": "success",
    "items": [...],
    "totalAmount": 75,
    "createdAt": "2025-12-12T16:22:36.622Z",
    "updatedAt": "2025-12-12T16:30:15.123Z"
  }
}
```

**Frontend Display:**
```
⚠️ Already Picked Up
This order has already been completed.

Order: ORD-MJ32SDVY-M2EVL
Completed: Dec 12, 4:30 PM
Total: ₹75

This QR code cannot be used again.
```

---

### 3. Order Cancelled (400 Bad Request)
**Scenario**: Order was cancelled before pickup

```json
{
  "success": false,
  "error": "Order is cancelled",
  "data": {
    "_id": "693c414cb5c7ab9ba33014b5",
    "orderId": "ORD-MJ32SDVY-M2EVL",
    "status": "cancelled",
    "paymentStatus": "failed",
    "items": [...],
    "totalAmount": 75
  }
}
```

**Frontend Display:**
```
❌ Order Cancelled
This order has been cancelled.

Order: ORD-MJ32SDVY-M2EVL
Status: Cancelled

Cannot complete pickup.
```

---

### 4. Payment Not Completed (400 Bad Request)
**Scenario**: User hasn't paid yet

```json
{
  "success": false,
  "error": "Payment not completed for this order",
  "data": {
    "_id": "693c414cb5c7ab9ba33014b5",
    "orderId": "ORD-MJ32SDVY-M2EVL",
    "status": "pending",
    "paymentStatus": "pending",
    "items": [...],
    "totalAmount": 75
  }
}
```

**Frontend Display:**
```
⏳ Payment Pending
This order hasn't been paid yet.

Order: ORD-MJ32SDVY-M2EVL
Amount: ₹75
Status: Payment Pending

Ask customer to complete payment first.
```

---

### 5. Order Not Found (404 Not Found)
**Scenario**: Order doesn't exist in database

```json
{
  "success": false,
  "error": "Order not found"
}
```

**Frontend Display:**
```
❌ Order Not Found
No order found with this QR code.
Please verify the QR code is correct.
```

---

### 6. Unauthorized (403 Forbidden)
**Scenario**: User is not the owner of this canteen

```json
{
  "success": false,
  "error": "Not authorized to verify orders for this canteen"
}
```

**Frontend Display:**
```
🚫 Unauthorized
You are not authorized to scan orders
for this canteen.
```

---

## Error Handling Flow Chart

```
Scan QR Code
    ↓
Is QR Valid? ──No──→ "Invalid or expired QR code"
    ↓ Yes
Order Exists? ──No──→ "Order not found"
    ↓ Yes
Authorized? ──No──→ "Not authorized"
    ↓ Yes
Payment Success? ──No──→ "Payment not completed"
    ↓ Yes
Status = Cancelled? ──Yes──→ "Order is cancelled"
    ↓ No
Status = Completed? ──Yes──→ "Already picked up/completed"
    ↓ No
✅ Mark as Completed
```

---

## Frontend Error Handling Example

```jsx
const handleQRScan = async (qrData) => {
  try {
    const response = await fetch('/api/v1/orders/pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ qrData })
    });

    const result = await response.json();

    if (result.success) {
      // ✅ Success
      showSuccessAlert('Order completed!', result.data);
    } else {
      // ❌ Handle specific errors
      switch (result.error) {
        case 'Invalid or expired QR code':
          showErrorAlert('Invalid QR', 'This QR code is invalid or expired.');
          break;
          
        case 'Order already picked up/completed':
          showWarningAlert('Already Used', 
            `This order was already completed at ${formatTime(result.data.updatedAt)}`);
          break;
          
        case 'Payment not completed for this order':
          showWarningAlert('Payment Pending', 
            'Customer needs to complete payment first.');
          break;
          
        case 'Order is cancelled':
          showErrorAlert('Cancelled', 'This order has been cancelled.');
          break;
          
        default:
          showErrorAlert('Error', result.error);
      }
    }
  } catch (error) {
    showErrorAlert('Network Error', 'Failed to verify QR code.');
  }
};
```

---

## Key Fields Summary

| Field | Type | Description | Display |
|-------|------|-------------|---------|
| `orderId` | String | Unique order ID | Header |
| `userId.email` | String | Customer email | Customer info |
| `canteenId.name` | String | Canteen name | Location |
| `canteenId.place` | String | Canteen location | Location |
| `items[]` | Array | Order items | Items list |
| `items[].name` | String | Item name | Item row |
| `items[].quantity` | Number | Quantity | Item row |
| `items[].price` | Number | Price per item | Item row |
| `totalAmount` | Number | Total price | Total section |
| `status` | String | Order status | Badge |
| `paymentStatus` | String | Payment status | Badge |
| `paymentId` | String | Razorpay payment ID | Reference |
| `createdAt` | Date | Order creation time | Timestamp |
| `updatedAt` | Date | Last update time | Timestamp |
