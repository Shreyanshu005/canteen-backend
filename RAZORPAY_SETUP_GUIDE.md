# Razorpay Payment Links - Complete Setup Guide

## 🎯 What Are Payment Links?

Payment Links are Razorpay's hosted payment pages. You create a link with order details, redirect the user to it, they pay, and Razorpay redirects them back to your app with payment details.

**No SDK needed on frontend!** Just redirect to a URL.

---

## 📋 Step-by-Step Setup

### Step 1: Create Razorpay Account

1. Go to https://razorpay.com/
2. Click "Sign Up" (top right)
3. Fill in business details
4. Verify email and phone
5. Complete KYC (for live mode, skip for testing)

---

### Step 2: Get API Credentials

1. **Login to Dashboard:** https://dashboard.razorpay.com/
2. **Go to Settings** (left sidebar) → **API Keys**
3. **Generate Test Keys:**
   - Click "Generate Test Key"
   - You'll see:
     - `Key ID`: `rzp_test_xxxxxxxxxxxxx`
     - `Key Secret`: `xxxxxxxxxxxxx` (click "Show" to reveal)
4. **Copy both** and add to your `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

---

### Step 3: Configure Webhook (Optional but Recommended)

1. **Go to Settings → Webhooks**
2. **Click "Add New Webhook"**
3. **Enter Details:**
   - **Webhook URL:** `https://your-backend.com/api/v1/payments/webhook`
     - For local testing: Use ngrok or similar
     - Example: `https://abc123.ngrok.io/api/v1/payments/webhook`
   - **Alert Email:** Your email
   - **Active Events:** Select:
     - ✅ `payment.captured`
     - ✅ `payment.failed`
4. **Click "Create Webhook"**
5. **Copy Secret:** You'll see a webhook secret
6. **Add to `.env`:**

```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🔄 Complete Payment Flow

### Backend Flow

```javascript
// 1. User creates order
POST /api/v1/orders
→ Order created with status: "pending"

// 2. User initiates payment
POST /api/v1/payments/initiate
{
  "orderId": "675a1234567890abcdef1234"
}

// Backend creates Razorpay Payment Link
const paymentLink = await razorpay.paymentLink.create({
  amount: 10000,  // ₹100 in paise (₹1 = 100 paise)
  currency: "INR",
  description: "Payment for Order ORD-XXX",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    contact: "9999999999"
  },
  callback_url: "http://localhost:3000/payment/callback",
  callback_method: "get"
});

// Returns
{
  "paymentLink": "https://rzp.io/i/abc123",
  "paymentLinkId": "plink_xxxxx",
  "orderId": "ORD-XXX",
  "amount": 100
}
```

### Frontend Flow

```javascript
// 3. Frontend receives payment link
const response = await initiatePayment(orderId);
const { paymentLink, paymentLinkId } = response.data;

// 4. Save payment link ID for later verification
localStorage.setItem('paymentLinkId', paymentLinkId);

// 5. Redirect user to Razorpay payment page
window.location.href = paymentLink;
// User is now on Razorpay's hosted page
```

### User Pays on Razorpay

```
User sees:
- Order details
- Amount to pay
- Payment options (Card, UPI, Netbanking, Wallet)
- Razorpay's secure payment form

User completes payment
```

### Razorpay Redirects Back

```javascript
// 6. After payment, Razorpay redirects to callback_url with params
// URL: http://localhost:3000/payment/callback?razorpay_payment_id=pay_xxxxx&razorpay_payment_link_id=plink_xxxxx&razorpay_payment_link_reference_id=ORD-XXX&razorpay_payment_link_status=paid&razorpay_signature=xxxxx

// 7. Frontend extracts payment details from URL
const urlParams = new URLSearchParams(window.location.search);
const razorpayPaymentId = urlParams.get('razorpay_payment_id');
const razorpayPaymentLinkId = urlParams.get('razorpay_payment_link_id');
const status = urlParams.get('razorpay_payment_link_status');

// 8. Verify payment with backend
if (status === 'paid' && razorpayPaymentId) {
  const verifyResponse = await fetch('/api/v1/payments/verify', {
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
  
  const result = await verifyResponse.json();
  // result.data contains order with QR code
}
```

---

## 💻 Complete Code Examples

### Backend: Create Payment Link

```typescript
// src/utils/razorpay.ts
export const createPaymentLink = async (
  orderId: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string
) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const paymentLinkData = {
    amount: amount * 100, // Convert ₹ to paise
    currency: 'INR',
    description: `Payment for Order ${orderId}`,
    customer: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
    callback_method: 'get',
    reference_id: orderId,
  };

  const paymentLink = await razorpay.paymentLink.create(paymentLinkData);
  return paymentLink;
};
```

### Frontend: Complete Integration

```javascript
// Step 1: Create order and initiate payment
async function handleCheckout(canteenId, items) {
  try {
    const token = localStorage.getItem('token');
    
    // Create order
    const orderRes = await fetch('http://localhost:5001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ canteenId, items })
    });
    
    const orderData = await orderRes.json();
    const orderId = orderData.data._id;
    
    // Initiate payment
    const paymentRes = await fetch('http://localhost:5001/api/v1/payments/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });
    
    const paymentData = await paymentRes.json();
    
    // Save for callback
    localStorage.setItem('paymentLinkId', paymentData.data.paymentLinkId);
    localStorage.setItem('pendingOrderId', orderData.data.orderId);
    
    // Redirect to Razorpay
    window.location.href = paymentData.data.paymentLink;
    
  } catch (error) {
    console.error('Checkout failed:', error);
    alert('Failed to initiate payment');
  }
}

// Step 2: Handle callback (on /payment/callback page)
async function handlePaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const razorpayPaymentId = urlParams.get('razorpay_payment_id');
  const razorpayPaymentLinkId = urlParams.get('razorpay_payment_link_id');
  const status = urlParams.get('razorpay_payment_link_status');
  
  // Check if payment was successful
  if (status !== 'paid' || !razorpayPaymentId) {
    alert('Payment was not completed');
    window.location.href = '/orders';
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    // Verify payment with backend
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
      // Payment successful!
      console.log('Order:', result.data);
      
      // Show success message
      alert('Payment successful! Order ID: ' + result.data.orderId);
      
      // Display QR code
      const qrImage = document.getElementById('qr-code');
      qrImage.src = result.data.qrCode;
      
      // Clean up
      localStorage.removeItem('paymentLinkId');
      localStorage.removeItem('pendingOrderId');
      
      // Redirect to order details
      window.location.href = `/orders/${result.data._id}`;
    } else {
      alert('Payment verification failed');
    }
  } catch (error) {
    console.error('Verification failed:', error);
    alert('Failed to verify payment');
  }
}

// Call this on page load of callback page
if (window.location.pathname === '/payment/callback') {
  handlePaymentCallback();
}
```

---

## 🔍 URL Parameters After Payment

When Razorpay redirects back, the URL will look like:

```
http://localhost:3000/payment/callback?
  razorpay_payment_id=pay_xxxxxxxxxxxxx&
  razorpay_payment_link_id=plink_xxxxxxxxxxxxx&
  razorpay_payment_link_reference_id=ORD-MJ2H5XNB-NIJ69&
  razorpay_payment_link_status=paid&
  razorpay_signature=xxxxxxxxxxxxx
```

**Parameters:**
- `razorpay_payment_id` - Unique payment ID (use this to verify)
- `razorpay_payment_link_id` - The payment link ID
- `razorpay_payment_link_reference_id` - Your order ID
- `razorpay_payment_link_status` - `paid` or `failed`
- `razorpay_signature` - Signature for verification (optional)

---

## 🧪 Testing

### Test Cards (Test Mode Only)

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`

**UPI:**
- UPI ID: `success@razorpay`

### Test Flow

1. **Start server:** `npm run dev`
2. **Create order** via API
3. **Initiate payment** - Get payment link
4. **Open link** in browser
5. **Enter test card** details
6. **Complete payment**
7. **Check redirect** - Should go to callback URL
8. **Verify payment** - Backend confirms and generates QR

---

## 📱 Mobile App Integration

For React Native or mobile apps:

```javascript
import { Linking } from 'react-native';

// Open payment link
async function openPaymentLink(paymentLink) {
  const supported = await Linking.canOpenURL(paymentLink);
  
  if (supported) {
    await Linking.openURL(paymentLink);
  } else {
    alert('Cannot open payment link');
  }
}

// Handle deep link callback
Linking.addEventListener('url', handleDeepLink);

function handleDeepLink(event) {
  const url = event.url;
  // Parse URL and verify payment
}
```

---

## ⚙️ Razorpay Dashboard Settings

### Enable Payment Methods

1. Go to **Settings → Configuration**
2. **Payment Methods:**
   - ✅ Cards (Visa, Mastercard, Rupay)
   - ✅ UPI
   - ✅ Netbanking
   - ✅ Wallets (Paytm, PhonePe, etc.)
3. **Save Changes**

### Customize Payment Page

1. Go to **Settings → Branding**
2. Upload your logo
3. Set brand color
4. Add business name

---

## 🔒 Security Best Practices

1. **Never expose Key Secret** on frontend
2. **Always verify payments** on backend
3. **Use HTTPS** in production
4. **Validate webhook signatures**
5. **Check payment amount** matches order amount
6. **Log all transactions**

---

## 🚀 Going Live

1. **Complete KYC** in Razorpay dashboard
2. **Get Live API Keys** (Settings → API Keys → Generate Live Key)
3. **Update `.env`:**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
4. **Update webhook URL** to production URL
5. **Test with real payment** (small amount)
6. **Monitor transactions** in dashboard

---

## 🎯 Summary

**What You Need:**
1. Razorpay account
2. API credentials in `.env`
3. Callback URL configured

**Flow:**
1. Backend creates payment link with order amount
2. Frontend redirects user to payment link
3. User pays on Razorpay page
4. Razorpay redirects back with payment details
5. Frontend verifies with backend
6. Backend confirms and generates QR code

**That's it!** No complex SDK integration needed. 🎉
