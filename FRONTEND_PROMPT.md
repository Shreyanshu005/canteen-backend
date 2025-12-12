# Frontend Integration Prompt - Canteen App with Razorpay

## 🎯 Project Overview

Implement the frontend for a canteen food ordering application with Razorpay payment integration. The backend is complete and running.

---

## 📚 Complete Documentation Links

All documentation files are in the backend repository:

1. **RAZORPAY_SETUP_GUIDE.md** - Complete Razorpay setup and integration guide
2. **RAZORPAY_FLOW_DIAGRAM.md** - Visual flow diagrams and React examples
3. **RAZORPAY_INTEGRATION_GUIDE.md** - Technical API documentation
4. **ORDER_PAYMENT_API_REFERENCE.md** - All order and payment endpoints with curl examples
5. **FRONTEND_INTEGRATION_GUIDE.md** - Complete frontend integration examples
6. **DEBUGGING_ORDER_ERRORS.md** - Troubleshooting guide for common issues

---

## 🔗 Backend API Base URL

```
Production: http://13.126.198.86:5001/api/v1
Local: http://localhost:5001/api/v1
```

---

## 🚀 Quick Start Implementation

### 1. Authentication Flow

**Send OTP:**
```javascript
const response = await fetch('http://13.126.198.86:5001/api/v1/auth/email/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
```

**Verify OTP:**
```javascript
const response = await fetch('http://13.126.198.86:5001/api/v1/auth/email/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    otp: '123456' 
  })
});

const { token, role } = await response.json();
localStorage.setItem('token', token);
```

---

### 2. Browse Canteens & Menu

**Get All Canteens:**
```javascript
const response = await fetch('http://13.126.198.86:5001/api/v1/canteens', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
// data = array of canteens
```

**Get Menu for Canteen:**
```javascript
const response = await fetch(`http://13.126.198.86:5001/api/v1/menu/canteen/${canteenId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
// data = array of menu items
```

---

### 3. Create Order

```javascript
const response = await fetch('http://13.126.198.86:5001/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    canteenId: "693b010b3ab6f068202b736b",
    items: [
      {
        menuItemId: "693b033e3ab6f068202b7384",
        quantity: 2
      }
    ]
  })
});

const { data } = await response.json();
// data.orderId = "ORD-XXX"
// data._id = MongoDB ID (use this for payment)
```

---

### 4. Payment Integration (Razorpay)

#### Step 1: Initiate Payment

```javascript
// You can use either the MongoDB _id OR the custom orderId
// Both formats are supported!

const response = await fetch('http://13.126.198.86:5001/api/v1/payments/initiate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ 
    orderId: order._id  // MongoDB ID: "675a1234..."
    // OR
    // orderId: order.orderId  // Custom ID: "ORD-XXX"
  })
});

const { data } = await response.json();
// data.paymentLink = "https://rzp.io/i/abc123"
// data.paymentLinkId = "plink_xxxxx"
```

#### Step 2: Redirect to Payment

```javascript
// Save for callback
localStorage.setItem('paymentLinkId', data.paymentLinkId);
localStorage.setItem('pendingOrderId', data.orderId);

// Redirect user to Razorpay
window.location.href = data.paymentLink;
```

#### Step 3: Handle Payment Callback

Create a route `/payment/callback` in your app:

```javascript
// On /payment/callback page
const urlParams = new URLSearchParams(window.location.search);
const razorpayPaymentId = urlParams.get('razorpay_payment_id');
const razorpayPaymentLinkId = urlParams.get('razorpay_payment_link_id');
const status = urlParams.get('razorpay_payment_link_status');

if (status === 'paid' && razorpayPaymentId) {
  // Verify payment
  const response = await fetch('http://13.126.198.86:5001/api/v1/payments/verify', {
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
    // result.data.qrCode = QR code image (base64)
    // result.data.orderId = Order ID
    // Display QR code to user
  }
}
```

---

### 5. Display QR Code

```javascript
// After successful payment verification
const qrCodeImage = result.data.qrCode;

// In your JSX/HTML:
<img src={qrCodeImage} alt="Order QR Code" />
```

---

## 📱 Complete React Example

```jsx
import { useState } from 'react';

function CheckoutFlow() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (canteenId, items) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // 1. Create Order
      const orderRes = await fetch('http://13.126.198.86:5001/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ canteenId, items })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error);

      // 2. Initiate Payment
      const paymentRes = await fetch('http://13.126.198.86:5001/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: orderData.data._id })
      });

      const paymentData = await paymentRes.json();
      if (!paymentData.success) throw new Error(paymentData.error);

      // 3. Save and Redirect
      localStorage.setItem('paymentLinkId', paymentData.data.paymentLinkId);
      window.location.href = paymentData.data.paymentLink;

    } catch (error) {
      console.error('Checkout failed:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleCheckout(canteenId, items)} disabled={loading}>
      {loading ? 'Processing...' : 'Proceed to Payment'}
    </button>
  );
}

// Payment Callback Component
function PaymentCallback() {
  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const razorpayPaymentId = params.get('razorpay_payment_id');
      const razorpayPaymentLinkId = params.get('razorpay_payment_link_id');
      const status = params.get('razorpay_payment_link_status');

      if (status !== 'paid' || !razorpayPaymentId) {
        alert('Payment failed or cancelled');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://13.126.198.86:5001/api/v1/payments/verify', {
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
          // Show QR code
          setQrCode(result.data.qrCode);
          setOrderId(result.data.orderId);
        }
      } catch (error) {
        console.error('Verification failed:', error);
      }
    };

    verifyPayment();
  }, []);

  return (
    <div>
      {qrCode && (
        <div>
          <h2>Payment Successful! ✅</h2>
          <p>Order ID: {orderId}</p>
          <img src={qrCode} alt="QR Code" />
          <p>Show this QR code at the counter</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔑 Important Notes

### Authentication
- All endpoints (except auth) require `Authorization: Bearer <token>` header
- Token is returned after OTP verification
- Store token in localStorage

### Order Creation
- `canteenId` must be a valid MongoDB ObjectId
- `menuItemId` must be a valid MongoDB ObjectId
- `quantity` must be a **number**, not string

### Payment Flow
- Payment link is valid for 24 hours
- User completes payment on Razorpay's hosted page
- Razorpay redirects back with payment details in URL
- Always verify payment on backend before showing QR

### QR Code
- QR code is base64 encoded image
- Can be directly used in `<img src={qrCode} />`
- QR code is only generated after successful payment

---

## 🧪 Testing

### Test Credentials
- **Email:** Any valid email (OTP will be logged in backend console)
- **Test Card:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test Flow
1. Login with OTP
2. Browse canteens
3. Add items to cart
4. Create order
5. Initiate payment
6. Use test card on Razorpay
7. Complete payment
8. Verify and get QR code

---

## ⚠️ Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Token expired or missing. Login again.

### Issue: 500 Server Error on order creation
**Solution:** Check request format. Ensure `quantity` is number, not string.

### Issue: Payment link not opening
**Solution:** Check if payment initiation was successful.

### Issue: Callback not working
**Solution:** Ensure callback route is `/payment/callback` exactly.

---

## 📊 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/email/send-otp` | POST | Send OTP to email |
| `/auth/email/verify-otp` | POST | Verify OTP and get token |
| `/canteens` | GET | Get all canteens |
| `/menu/canteen/:id` | GET | Get menu for canteen |
| `/orders` | POST | Create new order |
| `/orders` | GET | Get user's orders |
| `/orders/:id` | GET | Get order details |
| `/payments/initiate` | POST | Create payment link |
| `/payments/verify` | POST | Verify payment |

---

## 📞 Support

- **Backend API:** http://13.126.198.86:5001
- **Documentation:** Check all .md files in backend repo
- **Razorpay Docs:** https://razorpay.com/docs/payment-links/

---

## ✅ Implementation Checklist

- [ ] Set up authentication (OTP login)
- [ ] Implement canteen listing
- [ ] Implement menu display
- [ ] Create cart functionality
- [ ] Implement order creation
- [ ] Add payment initiation
- [ ] Create payment callback page
- [ ] Implement payment verification
- [ ] Display QR code after payment
- [ ] Add order history page
- [ ] Test complete flow with test card

---

**All backend APIs are ready and tested!** Start with authentication, then move to order creation, and finally payment integration. Good luck! 🚀
