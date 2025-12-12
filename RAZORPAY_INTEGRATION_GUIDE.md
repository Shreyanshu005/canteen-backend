# Razorpay Payment Integration - Complete Guide

## 🎯 Overview

The backend now uses **Razorpay Payment Links** for payment processing. Users are redirected to a Razorpay-hosted payment page, complete payment, and are redirected back to your app.

---

## 🔑 Setup

### 1. Get Razorpay Credentials

1. Sign up at https://razorpay.com/
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live API Keys
4. Copy `Key ID` and `Key Secret`

### 2. Update Environment Variables

Add to `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

---

## 📦 Payment Flow

```
1. User creates order → Status: pending
2. User clicks "Pay Now"
3. Frontend calls POST /api/v1/payments/initiate
4. Backend creates Razorpay Payment Link
5. Backend returns payment link URL
6. Frontend redirects user to payment link
7. User completes payment on Razorpay page
8. Razorpay redirects back to your app with payment details
9. Frontend calls POST /api/v1/payments/verify
10. Backend verifies payment and updates order
11. Order status → paid, QR code generated
```

---

## 🔌 API Endpoints

### 1. Initiate Payment

**Endpoint:** `POST /api/v1/payments/initiate`

**Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentLink": "https://rzp.io/i/abc123",
    "paymentLinkId": "plink_xxxxx",
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "amount": 100
  }
}
```

---

### 2. Verify Payment

**Endpoint:** `POST /api/v1/payments/verify`

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "razorpayPaymentId": "pay_xxxxx",
    "razorpayPaymentLinkId": "plink_xxxxx"
  }'
```

**Request Body:**
```json
{
  "razorpayPaymentId": "pay_xxxxx",
  "razorpayPaymentLinkId": "plink_xxxxx"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "ORD-MJ2H5XNB-NIJ69",
    "status": "paid",
    "paymentStatus": "success",
    "paymentId": "pay_xxxxx",
    "qrCode": "data:image/png;base64,...",
    "totalAmount": 100
  }
}
```

---

### 3. Webhook (Razorpay → Backend)

**Endpoint:** `POST /api/v1/payments/webhook`

**Purpose:** Razorpay sends payment status updates

**Configuration:**
1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://your-backend.com/api/v1/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret to `.env`

---

## 💻 Frontend Integration

### Step 1: Initiate Payment

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
  
  const data = await response.json();
  return data.data; // { paymentLink, paymentLinkId, orderId, amount }
}
```

### Step 2: Redirect to Payment Link

```javascript
async function handlePayment(orderId) {
  try {
    const paymentData = await initiatePayment(orderId);
    
    // Save payment link ID for verification
    localStorage.setItem('paymentLinkId', paymentData.paymentLinkId);
    localStorage.setItem('pendingOrderId', paymentData.orderId);
    
    // Redirect to Razorpay payment page
    window.location.href = paymentData.paymentLink;
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
}
```

### Step 3: Handle Callback

```javascript
// On your callback page (e.g., /payment/callback)
async function handlePaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Razorpay adds these params to callback URL
  const razorpayPaymentId = urlParams.get('razorpay_payment_id');
  const razorpayPaymentLinkId = localStorage.getItem('paymentLinkId');
  
  if (!razorpayPaymentId) {
    // Payment cancelled or failed
    alert('Payment was not completed');
    return;
  }
  
  // Verify payment
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5001/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      razorpayPaymentId,
      razorpayPaymentLinkId
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Payment successful - show QR code
    console.log('Order:', result.data);
    displayQRCode(result.data.qrCode);
    
    // Clean up
    localStorage.removeItem('paymentLinkId');
    localStorage.removeItem('pendingOrderId');
  } else {
    alert('Payment verification failed');
  }
}
```

### Complete Example

```javascript
// Create order and initiate payment
async function createOrderAndPay(canteenId, items) {
  try {
    // 1. Create order
    const orderResponse = await fetch('http://localhost:5001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ canteenId, items })
    });
    
    const orderData = await orderResponse.json();
    const orderId = orderData.data._id;
    
    // 2. Initiate payment
    const paymentResponse = await fetch('http://localhost:5001/api/v1/payments/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ orderId })
    });
    
    const paymentData = await paymentResponse.json();
    
    // 3. Save for callback
    localStorage.setItem('paymentLinkId', paymentData.data.paymentLinkId);
    
    // 4. Redirect to payment
    window.location.href = paymentData.data.paymentLink;
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🔒 Security Features

✅ **Payment Link Security** - Each link is unique and tied to one order  
✅ **Webhook Verification** - HMAC signature validation  
✅ **Payment Verification** - Backend verifies payment status with Razorpay  
✅ **Order Ownership** - Users can only pay for their own orders  
✅ **QR Code Generation** - Only after successful payment  

---

## 🧪 Testing

### Test Mode

1. Use test credentials: `rzp_test_xxxxx`
2. Test card numbers:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
3. Any CVV and future expiry date

### Test Flow

```bash
# 1. Create order
ORDER_ID="..."

# 2. Initiate payment
curl -X POST http://localhost:5001/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d "{\"orderId\": \"$ORDER_ID\"}"

# 3. Open payment link in browser
# Complete payment with test card

# 4. After redirect, verify payment
curl -X POST http://localhost:5001/api/v1/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "razorpayPaymentId": "pay_xxxxx",
    "razorpayPaymentLinkId": "plink_xxxxx"
  }'
```

---

## ⚠️ Common Issues

### Issue 1: Payment link not opening
**Solution:** Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set correctly

### Issue 2: Webhook not working
**Solution:** 
1. Ensure webhook URL is publicly accessible
2. Verify `RAZORPAY_WEBHOOK_SECRET` matches dashboard
3. Check webhook logs in Razorpay dashboard

### Issue 3: Payment verification fails
**Solution:** Ensure you're passing the correct `razorpayPaymentId` from callback URL

---

## 📊 Payment Link vs Checkout

**Why Payment Links?**
- ✅ No frontend SDK needed
- ✅ Simpler integration
- ✅ Razorpay handles UI/UX
- ✅ Mobile-friendly
- ✅ Automatic retry on failure
- ✅ SMS/Email notifications

**vs Standard Checkout:**
- ❌ Requires Razorpay.js SDK
- ❌ More frontend code
- ❌ Need to handle UI states

---

## 🚀 Going Live

1. Get live API keys from Razorpay
2. Update `.env` with live credentials
3. Configure webhook with production URL
4. Test with real payment (small amount)
5. Enable required payment methods in dashboard

---

## 📝 Environment Variables

```env
# Required
RAZORPAY_KEY_ID=rzp_test_xxxxx          # or rzp_live_xxxxx for production
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# URLs
FRONTEND_URL=http://localhost:3000       # Your frontend URL
BACKEND_URL=http://localhost:5001        # Your backend URL
```

---

**All endpoints tested and working! ✅**
