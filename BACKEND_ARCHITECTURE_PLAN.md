# Canteen Food Ordering App - Backend Architecture Plan

## Overview
This plan outlines the complete backend structure for a canteen food ordering system with payment integration (Cashfree), order management, and QR-based order verification.

## Proposed Backend Structure

### New Models

#### 1. Order Model (`src/models/Order.ts`)
```typescript
{
  orderId: string (unique),
  userId: ObjectId (ref: User),
  canteenId: ObjectId (ref: Canteen),
  items: [{
    menuItemId: ObjectId (ref: MenuItem),
    name: string,
    price: number,
    quantity: number
  }],
  totalAmount: number,
  status: enum ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'],
  paymentStatus: enum ['pending', 'success', 'failed'],
  paymentId: string (Cashfree payment ID),
  qrCode: string (base64 or URL),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Payment Model (`src/models/Payment.ts`)
```typescript
{
  orderId: ObjectId (ref: Order),
  cashfreeOrderId: string,
  paymentSessionId: string,
  amount: number,
  status: enum ['initiated', 'success', 'failed'],
  paymentMethod: string,
  transactionId: string,
  createdAt: Date,
  updatedAt: Date
}
```

### New Controllers

#### 1. Order Controller (`src/controllers/order.controller.ts`)
- `createOrder` - Create new order with items
- `getMyOrders` - Get user's order history
- `getOrderById` - Get specific order details
- `updateOrderStatus` - Update order status (admin/owner)
- `cancelOrder` - Cancel pending order
- `getCanteenOrders` - Get all orders for a canteen (admin/owner)
- `verifyOrderQR` - Verify order using QR code (admin panel)

#### 2. Payment Controller (`src/controllers/payment.controller.ts`)
- `initiatePayment` - Create Cashfree payment session
- `verifyPayment` - Verify payment callback from Cashfree
- `handleWebhook` - Handle Cashfree webhooks

### New Routes

#### Order Routes (`src/routes/order.routes.ts`)
```
POST   /api/v1/orders                    - Create order
GET    /api/v1/orders                    - Get my orders
GET    /api/v1/orders/:id                - Get order by ID
PATCH  /api/v1/orders/:id/status         - Update order status
DELETE /api/v1/orders/:id                - Cancel order
GET    /api/v1/orders/canteen/:canteenId - Get canteen orders
POST   /api/v1/orders/verify-qr          - Verify QR code
```

#### Payment Routes (`src/routes/payment.routes.ts`)
```
POST   /api/v1/payments/initiate         - Initiate payment
POST   /api/v1/payments/verify           - Verify payment
POST   /api/v1/payments/webhook          - Cashfree webhook
```

### New Utilities

#### 1. QR Code Generator (`src/utils/qrGenerator.ts`)
- Generate QR code for orders
- Encode order ID and verification token

#### 2. Cashfree Integration (`src/utils/cashfree.ts`)
- Initialize Cashfree SDK
- Create payment order
- Verify payment signature
- Handle payment callbacks

### Updated File Structure
```
src/
├── config/
│   ├── db.ts
│   └── cashfree.ts (NEW)
├── controllers/
│   ├── auth.controller.ts
│   ├── canteen.controller.ts
│   ├── menu.controller.ts
│   ├── order.controller.ts (NEW)
│   └── payment.controller.ts (NEW)
├── models/
│   ├── User.ts
│   ├── Canteen.ts
│   ├── MenuItem.ts
│   ├── Order.ts (NEW)
│   └── Payment.ts (NEW)
├── routes/
│   ├── auth.routes.ts
│   ├── canteen.routes.ts
│   ├── menu.routes.ts
│   ├── order.routes.ts (NEW)
│   └── payment.routes.ts (NEW)
├── utils/
│   ├── sendEmail.ts
│   ├── qrGenerator.ts (NEW)
│   └── cashfree.ts (NEW)
├── middleware/
│   └── auth.middleware.ts
├── scripts/
│   └── set-admin.ts
├── app.ts
└── server.ts
```

## Order Flow

### 1. **User Creates Order**
- User selects items from canteen menu
- Frontend sends order request with items and quantities
- Backend validates items and calculates total
- Order created with status 'pending'

### 2. **Payment Initiation**
- Backend creates Cashfree payment order
- Returns payment session ID to frontend
- Frontend redirects to Cashfree hosted checkout

### 3. **Payment Completion**
- Cashfree redirects back with payment status
- Backend verifies payment signature
- Updates order status to 'paid' and paymentStatus to 'success'
- Generates QR code with encrypted order ID

### 4. **Order Preparation**
- Admin/Owner views paid orders
- Updates status: 'paid' → 'preparing' → 'ready'

### 5. **Order Pickup**
- User shows QR code at counter
- Admin scans QR in admin panel
- Backend verifies QR and marks order as 'completed'

## Required NPM Packages
```json
{
  "cashfree-pg": "^2.0.0",
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

## Environment Variables (.env)
```
# Existing
MONGO_URI=...
JWT_SECRET=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USER=...
EMAIL_PASS=...
PORT=5001

# New - Cashfree
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=TEST # or PROD
CASHFREE_WEBHOOK_SECRET=your_webhook_secret

# Frontend URL for payment redirect
FRONTEND_URL=http://localhost:3000
```

## API Endpoints Summary

### Orders
1. **Create Order**: `POST /api/v1/orders`
   - Body: `{ canteenId, items: [{ menuItemId, quantity }] }`
   - Returns: Order object with orderId

2. **Get My Orders**: `GET /api/v1/orders`
   - Returns: Array of user's orders

3. **Get Order Details**: `GET /api/v1/orders/:id`
   - Returns: Full order details with QR code

4. **Update Order Status**: `PATCH /api/v1/orders/:id/status` (admin/owner)
   - Body: `{ status: 'preparing' | 'ready' | 'completed' }`

5. **Cancel Order**: `DELETE /api/v1/orders/:id`
   - Only allowed if status is 'pending' or 'paid'

6. **Get Canteen Orders**: `GET /api/v1/orders/canteen/:canteenId` (admin/owner)
   - Query params: `?status=paid` (optional filter)

7. **Verify QR**: `POST /api/v1/orders/verify-qr` (admin)
   - Body: `{ qrData: 'encrypted_order_id' }`
   - Returns: Order details if valid

### Payments
1. **Initiate Payment**: `POST /api/v1/payments/initiate`
   - Body: `{ orderId }`
   - Returns: `{ paymentSessionId, paymentUrl }`

2. **Verify Payment**: `POST /api/v1/payments/verify`
   - Body: `{ orderId, paymentId }`
   - Returns: Payment status and updated order

3. **Webhook Handler**: `POST /api/v1/payments/webhook`
   - Receives Cashfree payment notifications
   - Auto-updates order status

## Implementation Phases

### Phase 1: Order Management (Core)
- Create Order and Payment models
- Implement order controller (create, get, update, cancel)
- Set up order routes
- Test order creation and status updates

### Phase 2: Payment Integration
- Install Cashfree SDK
- Configure Cashfree settings
- Implement payment controller
- Set up payment routes and webhooks
- Test payment flow

### Phase 3: QR Code System
- Install QR code library
- Implement QR generation utility
- Add QR verification endpoint
- Test QR generation and scanning

### Phase 4: Testing & Documentation
- Test complete order flow
- Update API_REFERENCE.md with new endpoints
- Add error handling and validation
- Performance testing

## Next Steps

Ready to implement? I can:
1. **Start with Phase 1** (Order Management) - Get the core working first
2. **Implement everything at once** - All phases together
3. **Modify the plan** - If you want any changes

Let me know how you'd like to proceed!
