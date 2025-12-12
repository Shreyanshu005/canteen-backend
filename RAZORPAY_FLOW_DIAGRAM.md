# Razorpay Payment Flow - Visual Guide

## 🔄 Complete Flow Diagram

```
┌─────────────┐
│   USER      │
│  (Mobile/   │
│   Web App)  │
└──────┬──────┘
       │
       │ 1. Create Order
       ▼
┌─────────────────────────────────────────┐
│  POST /api/v1/orders                    │
│  { canteenId, items }                   │
└──────┬──────────────────────────────────┘
       │
       │ Order Created
       │ { _id, orderId: "ORD-XXX", status: "pending" }
       │
       │ 2. Initiate Payment
       ▼
┌─────────────────────────────────────────┐
│  POST /api/v1/payments/initiate         │
│  { orderId: "675a..." }                 │
└──────┬──────────────────────────────────┘
       │
       │ Backend creates Payment Link
       ▼
┌─────────────────────────────────────────┐
│  Razorpay.paymentLink.create({          │
│    amount: 10000,  // ₹100 in paise     │
│    callback_url: "app.com/callback"     │
│  })                                     │
└──────┬──────────────────────────────────┘
       │
       │ Returns Payment Link
       │ { paymentLink: "https://rzp.io/i/abc123" }
       │
       │ 3. Redirect to Payment Link
       ▼
┌─────────────────────────────────────────┐
│  window.location.href = paymentLink     │
└──────┬──────────────────────────────────┘
       │
       │ User is now on Razorpay's page
       ▼
┌─────────────────────────────────────────┐
│         RAZORPAY HOSTED PAGE            │
│  ┌───────────────────────────────────┐  │
│  │  Order: ORD-XXX                   │  │
│  │  Amount: ₹100                     │  │
│  │                                   │  │
│  │  [Card] [UPI] [Netbanking]       │  │
│  │                                   │  │
│  │  Card Number: ____-____-____-____ │  │
│  │  CVV: ___  Expiry: __/__          │  │
│  │                                   │  │
│  │  [Pay ₹100] ←─ User clicks        │  │
│  └───────────────────────────────────┘  │
└──────┬──────────────────────────────────┘
       │
       │ 4. Payment Processed
       │
       │ 5. Razorpay Redirects Back
       ▼
┌─────────────────────────────────────────┐
│  app.com/payment/callback?              │
│    razorpay_payment_id=pay_xxx&         │
│    razorpay_payment_link_id=plink_xxx&  │
│    razorpay_payment_link_status=paid    │
└──────┬──────────────────────────────────┘
       │
       │ 6. Extract Payment Details
       │ const paymentId = params.get('razorpay_payment_id')
       │
       │ 7. Verify Payment
       ▼
┌─────────────────────────────────────────┐
│  POST /api/v1/payments/verify           │
│  {                                      │
│    razorpayPaymentId: "pay_xxx",        │
│    razorpayPaymentLinkId: "plink_xxx"   │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       │ Backend verifies with Razorpay
       ▼
┌─────────────────────────────────────────┐
│  Razorpay.payments.fetch(paymentId)     │
│  → { status: "captured", amount: 10000 }│
└──────┬──────────────────────────────────┘
       │
       │ 8. Update Order & Generate QR
       ▼
┌─────────────────────────────────────────┐
│  Order.status = "paid"                  │
│  Order.qrCode = generateQR(orderId)     │
└──────┬──────────────────────────────────┘
       │
       │ 9. Return Order with QR
       ▼
┌─────────────────────────────────────────┐
│  {                                      │
│    orderId: "ORD-XXX",                  │
│    status: "paid",                      │
│    qrCode: "data:image/png;base64,..."  │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       │ 10. Display QR Code
       ▼
┌─────────────────────────────────────────┐
│   USER SEES QR CODE                     │
│  ┌───────────────────────────────────┐  │
│  │  Payment Successful! ✓            │  │
│  │                                   │  │
│  │  Order: ORD-XXX                   │  │
│  │                                   │  │
│  │  ┌─────────────────┐              │  │
│  │  │  █▀▀▀▀▀█ ▄▀█ ▀  │              │  │
│  │  │  █ ███ █ ██▄▀▄  │  ← QR Code  │  │
│  │  │  █ ▀▀▀ █ █ ▀ █  │              │  │
│  │  │  ▀▀▀▀▀▀▀ ▀ ▀▄▀  │              │  │
│  │  └─────────────────┘              │  │
│  │                                   │  │
│  │  Show this at counter             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📱 URL Parameters Breakdown

### After Payment Success

```
http://localhost:3000/payment/callback
  ?razorpay_payment_id=pay_MNop1234567890
  &razorpay_payment_link_id=plink_MNop1234567890
  &razorpay_payment_link_reference_id=ORD-MJ2H5XNB-NIJ69
  &razorpay_payment_link_status=paid
  &razorpay_signature=abc123def456...
```

**What Each Parameter Means:**

| Parameter | Description | Use |
|-----------|-------------|-----|
| `razorpay_payment_id` | Unique payment ID | ✅ Send to backend for verification |
| `razorpay_payment_link_id` | Payment link ID | ✅ Send to backend for verification |
| `razorpay_payment_link_reference_id` | Your order ID | ℹ️ For display only |
| `razorpay_payment_link_status` | `paid` or `failed` | ✅ Check before verifying |
| `razorpay_signature` | Security signature | ℹ️ Optional (backend verifies) |

---

## 💰 Amount Conversion

**Important:** Razorpay uses **paise** (smallest currency unit)

```javascript
// ₹1 = 100 paise
// ₹100 = 10,000 paise

// In your code:
const orderAmount = 100; // ₹100
const amountInPaise = orderAmount * 100; // 10,000 paise

// Create payment link
const paymentLink = await razorpay.paymentLink.create({
  amount: amountInPaise, // 10000
  currency: 'INR'
});
```

---

## 🔍 Payment Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| `paid` | Payment successful | ✅ Verify and update order |
| `failed` | Payment failed | ❌ Show error, allow retry |
| `cancelled` | User cancelled | ℹ️ Return to cart |
| `expired` | Link expired | ⏰ Create new link |

---

## 🎨 Frontend Code - React Example

```jsx
// PaymentButton.jsx
import { useState } from 'react';

function PaymentButton({ orderId }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Initiate payment
      const response = await fetch('http://localhost:5001/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Save for callback
        localStorage.setItem('paymentLinkId', data.data.paymentLinkId);
        
        // Redirect to Razorpay
        window.location.href = data.data.paymentLink;
      } else {
        alert('Failed to initiate payment');
      }
    } catch (error) {
      console.error(error);
      alert('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="pay-button"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}

// PaymentCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const razorpayPaymentId = searchParams.get('razorpay_payment_id');
    const razorpayPaymentLinkId = searchParams.get('razorpay_payment_link_id');
    const paymentStatus = searchParams.get('razorpay_payment_link_status');

    if (paymentStatus !== 'paid' || !razorpayPaymentId) {
      setStatus('failed');
      return;
    }

    try {
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
        setStatus('success');
        // Redirect to order details after 2 seconds
        setTimeout(() => {
          navigate(`/orders/${result.data._id}`);
        }, 2000);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error(error);
      setStatus('failed');
    }
  };

  return (
    <div className="payment-callback">
      {status === 'verifying' && (
        <div>
          <h2>Verifying Payment...</h2>
          <p>Please wait</p>
        </div>
      )}
      
      {status === 'success' && (
        <div>
          <h2>✅ Payment Successful!</h2>
          <p>Redirecting to your order...</p>
        </div>
      )}
      
      {status === 'failed' && (
        <div>
          <h2>❌ Payment Failed</h2>
          <button onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Create order successfully
- [ ] Initiate payment → Get payment link
- [ ] Click payment link → Opens Razorpay page
- [ ] Enter test card: `4111 1111 1111 1111`
- [ ] Complete payment
- [ ] Redirected to callback URL
- [ ] Payment ID in URL parameters
- [ ] Verify payment → Order status updated
- [ ] QR code generated and displayed

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid API Key"
**Solution:** Check `RAZORPAY_KEY_ID` in `.env`

### Issue: Payment link doesn't open
**Solution:** Ensure `FRONTEND_URL` is correct in `.env`

### Issue: Callback not working
**Solution:** Check callback URL matches exactly

### Issue: Payment verified but order not updated
**Solution:** Check backend logs, ensure webhook is configured

---

## 📞 Support

- **Razorpay Docs:** https://razorpay.com/docs/payment-links/
- **Dashboard:** https://dashboard.razorpay.com/
- **Support:** support@razorpay.com

---

**You're all set!** 🎉
