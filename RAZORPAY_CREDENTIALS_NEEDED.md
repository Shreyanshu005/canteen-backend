# ⚠️ Razorpay Credentials Required

## Current Issue

Payment link creation is failing because Razorpay credentials in `.env` are placeholders:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id_here  ❌
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here  ❌
```

## 🔧 Quick Fix - Get Real Credentials

### Option 1: Use Test Credentials (Recommended for Development)

1. **Sign up at Razorpay:**
   - Go to https://razorpay.com/
   - Click "Sign Up" (free account)
   - Complete registration

2. **Get Test API Keys:**
   - Login to https://dashboard.razorpay.com/
   - Go to **Settings** → **API Keys**
   - Click **"Generate Test Key"**
   - You'll see:
     ```
     Key ID: rzp_test_xxxxxxxxxxxxx
     Key Secret: xxxxxxxxxxxxx (click "Show" to reveal)
     ```

3. **Update `.env`:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

4. **Restart server** (it will auto-restart with nodemon)

### Option 2: Skip Payment for Now (Testing Only)

If you want to test other features without Razorpay:

1. Comment out payment link creation temporarily
2. Return a mock payment link for testing
3. Test order creation and other features

---

## 🧪 After Adding Credentials

Test with these test cards:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`

**Failure:**
- Card: `4000 0000 0000 0002`

---

## 📝 What Happens Next

Once you add real Razorpay credentials:

1. ✅ Payment link creation will work
2. ✅ Frontend will get valid payment URL
3. ✅ User can complete payment on Razorpay
4. ✅ Order status updates automatically
5. ✅ QR code generated after payment

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Sign up at razorpay.com
# 2. Get test API keys from dashboard
# 3. Update .env with real keys
# 4. Server auto-restarts
# 5. Test payment flow!
```

---

**Current Error:** `Failed to create payment link`  
**Reason:** Invalid/placeholder Razorpay credentials  
**Solution:** Add real test credentials from Razorpay dashboard  

**Get credentials here:** https://dashboard.razorpay.com/app/keys
