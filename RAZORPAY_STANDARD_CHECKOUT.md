# Razorpay Standard Checkout - Complete Integration Guide

## 🎯 What Changed

**Before:** Payment Links (hosted payment page URL)  
**Now:** Standard Checkout (Razorpay Orders API)

**Benefits:**
- ✅ Better mobile app integration
- ✅ More control over UI/UX
- ✅ Embedded checkout on your page
- ✅ Custom redirect handling
- ✅ Standard Razorpay flow

---

## 🔄 Complete Payment Flow

```
1. User creates order → Backend creates internal order
2. User initiates payment → Backend creates Razorpay Order
3. Backend returns razorpayOrderId + razorpayKeyId
4. Frontend initializes Razorpay Checkout with order_id
5. User completes payment on Razorpay modal/page
6. Razorpay calls handler with payment details
7. Frontend sends payment details to backend for verification
8. Backend verifies signature and updates order
9. QR code generated and returned
```

---

## 📡 Backend APIs

### 1. Initiate Payment

**Endpoint:** `POST /api/v1/payments/initiate`

**Request:**
```json
{
  "orderId": "ORD-MJ2O8L23-7OGQS"  // or MongoDB _id
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_MNop1234567890",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 3000,  // in paise
    "currency": "INR",
    "orderId": "ORD-MJ2O8L23-7OGQS"
  }
}
```

---

### 2. Verify Payment

**Endpoint:** `POST /api/v1/payments/verify`

**Request:**
```json
{
  "razorpayOrderId": "order_MNop1234567890",
  "razorpayPaymentId": "pay_MNop1234567890",
  "razorpaySignature": "abc123def456..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "ORD-MJ2O8L23-7OGQS",
    "status": "paid",
    "paymentStatus": "success",
    "paymentId": "pay_MNop1234567890",
    "qrCode": "data:image/png;base64,...",
    "totalAmount": 30
  }
}
```

---

## 💻 Frontend Integration

### Web Application (React/JavaScript)

```javascript
// Step 1: Initiate Payment
async function initiatePayment(orderId) {
  const response = await fetch('http://13.126.198.86:5001/api/v1/payments/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId })
  });
  
  const data = await response.json();
  return data.data;
}

// Step 2: Open Razorpay Checkout
async function openRazorpayCheckout(orderId) {
  const paymentData = await initiatePayment(orderId);
  
  const options = {
    key: paymentData.razorpayKeyId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    order_id: paymentData.razorpayOrderId,
    name: "Canteen App",
    description: `Payment for ${paymentData.orderId}`,
    handler: async function (response) {
      // Payment successful - verify on backend
      await verifyPayment(response);
    },
    prefill: {
      name: "Customer Name",
      email: "customer@example.com",
      contact: "9999999999"
    },
    theme: {
      color: "#3399cc"
    }
  };
  
  const rzp = new Razorpay(options);
  rzp.open();
}

// Step 3: Verify Payment
async function verifyPayment(response) {
  const verifyResponse = await fetch('http://13.126.198.86:5001/api/v1/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    })
  });
  
  const result = await verifyResponse.json();
  
  if (result.success) {
    // Show QR code
    displayQRCode(result.data.qrCode);
  }
}
```

---

### Mobile App (React Native / Swift)

#### React Native

```javascript
import RazorpayCheckout from 'react-native-razorpay';

async function openRazorpayCheckout(orderId) {
  // Get payment data from backend
  const paymentData = await initiatePayment(orderId);
  
  const options = {
    key: paymentData.razorpayKeyId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    order_id: paymentData.razorpayOrderId,
    name: 'Canteen App',
    description: `Payment for ${paymentData.orderId}`,
    prefill: {
      email: 'customer@example.com',
      contact: '9999999999',
      name: 'Customer Name'
    },
    theme: { color: '#3399cc' }
  };
  
  RazorpayCheckout.open(options)
    .then((data) => {
      // Payment successful
      verifyPayment({
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature
      });
    })
    .catch((error) => {
      // Payment failed
      console.error(error);
    });
}
```

#### Swift (iOS)

```swift
import Razorpay

func openRazorpayCheckout(orderId: String) {
    // Get payment data from backend
    initiatePayment(orderId: orderId) { paymentData in
        let options: [String: Any] = [
            "key": paymentData.razorpayKeyId,
            "amount": paymentData.amount,
            "currency": paymentData.currency,
            "order_id": paymentData.razorpayOrderId,
            "name": "Canteen App",
            "description": "Payment for \(paymentData.orderId)",
            "prefill": [
                "email": "customer@example.com",
                "contact": "9999999999",
                "name": "Customer Name"
            ],
            "theme": [
                "color": "#3399cc"
            ]
        ]
        
        let razorpay = Razorpay.initWithKey(paymentData.razorpayKeyId, andDelegate: self)
        razorpay.open(options)
    }
}

// Razorpay Delegate Methods
extension YourViewController: RazorpayPaymentCompletionProtocol {
    func onPaymentSuccess(_ payment_id: String, andData response: [AnyHashable: Any]) {
        // Payment successful - verify on backend
        verifyPayment(
            orderId: response["razorpay_order_id"] as! String,
            paymentId: payment_id,
            signature: response["razorpay_signature"] as! String
        )
    }
    
    func onPaymentError(_ code: Int32, description str: String, andData response: [AnyHashable: Any]?) {
        // Payment failed
        print("Payment failed: \(str)")
    }
}
```

---

## 🔒 Security - Signature Verification

The backend automatically verifies the payment signature using HMAC SHA256:

```typescript
// Backend verification (automatic)
const signatureData = `${razorpayOrderId}|${razorpayPaymentId}`;
const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(signatureData)
    .digest('hex');

if (razorpaySignature === expectedSignature) {
    // Payment is authentic ✅
}
```

**Never verify signatures on frontend!** Always verify on backend.

---

## 🧪 Testing

### Test Cards

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`

**Failure:**
- Card: `4000 0000 0000 0002`

### Test Flow

1. Create order
2. Initiate payment → Get `razorpayOrderId`
3. Open Razorpay Checkout with test card
4. Complete payment
5. Verify signature on backend
6. Get QR code

---

## 📊 API Response Comparison

### Initiate Payment

**Before (Payment Links):**
```json
{
  "paymentLink": "https://rzp.io/i/abc123",
  "paymentLinkId": "plink_xxxxx"
}
```

**Now (Standard Checkout):**
```json
{
  "razorpayOrderId": "order_xxxxx",
  "razorpayKeyId": "rzp_test_xxxxx",
  "amount": 3000,
  "currency": "INR"
}
```

### Verify Payment

**Before:**
```json
{
  "razorpayPaymentId": "pay_xxxxx",
  "razorpayPaymentLinkId": "plink_xxxxx"
}
```

**Now:**
```json
{
  "razorpayOrderId": "order_xxxxx",
  "razorpayPaymentId": "pay_xxxxx",
  "razorpaySignature": "abc123..."
}
```

---

## 🎨 Customization Options

```javascript
const options = {
  key: razorpayKeyId,
  amount: amount,
  currency: 'INR',
  order_id: razorpayOrderId,
  
  // Branding
  name: 'Your Company Name',
  description: 'Purchase Description',
  image: 'https://your-logo-url.com/logo.png',
  
  // Customer Details
  prefill: {
    name: 'Customer Name',
    email: 'customer@example.com',
    contact: '9999999999'
  },
  
  // Theme
  theme: {
    color: '#F37254'
  },
  
  // Modal Options
  modal: {
    ondismiss: function() {
      console.log('Checkout form closed');
    }
  }
};
```

---

## ⚠️ Important Notes

1. **Amount is in paise:** ₹1 = 100 paise
2. **Signature verification is mandatory** - Always verify on backend
3. **Order ID is unique** - Each payment needs a new Razorpay order
4. **Test mode:** Use `rzp_test_` keys for testing
5. **Live mode:** Use `rzp_live_` keys for production

---

## 🚀 Production Checklist

- [ ] Replace test keys with live keys
- [ ] Test with real payment (small amount)
- [ ] Configure webhook for production
- [ ] Enable required payment methods in dashboard
- [ ] Add company logo and branding
- [ ] Test on all platforms (web, iOS, Android)
- [ ] Verify signature verification is working
- [ ] Test failure scenarios

---

**All APIs updated and ready to use!** ✅
