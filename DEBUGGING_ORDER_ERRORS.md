# Debugging Order Creation 500 Error

## ✅ Backend Status: WORKING

I just tested order creation and it's working perfectly:

```bash
curl -X POST http://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "canteenId": "693b010b3ab6f068202b736b",
    "items": [{"menuItemId": "693b033e3ab6f068202b7384", "quantity": 2}]
  }'
```

**Result:** ✅ Success - Created order `ORD-MJ2HZLAH-9ALO6`

---

## 🔍 Common Issues & Solutions

### 1. Token Expiration ⏰

**Problem:** Token might be expired (tokens last 30 days)

**Solution:** Get a fresh token:
```javascript
// 1. Send OTP
const otpResponse = await fetch('http://localhost:5001/api/v1/auth/email/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com' })
});

// 2. Check console for OTP, then verify
const loginResponse = await fetch('http://localhost:5001/api/v1/auth/email/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com', otp: '123456' })
});

const { token } = await loginResponse.json();
localStorage.setItem('token', token); // Save new token
```

---

### 2. Request Format Issues 📝

**Problem:** Request body format might be incorrect

**Correct Format:**
```javascript
const orderData = {
  canteenId: "693b010b3ab6f068202b736b",  // Must be valid MongoDB ObjectId
  items: [
    {
      menuItemId: "693b033e3ab6f068202b7384",  // Must be valid MongoDB ObjectId
      quantity: 2  // Must be a number, not string
    }
  ]
};
```

**Common Mistakes:**
```javascript
// ❌ WRONG - quantity as string
{ menuItemId: "...", quantity: "2" }

// ❌ WRONG - missing items array
{ canteenId: "...", menuItemId: "...", quantity: 2 }

// ❌ WRONG - invalid ObjectId format
{ canteenId: "123", items: [...] }

// ✅ CORRECT
{ canteenId: "693b010b3ab6f068202b736b", items: [{ menuItemId: "...", quantity: 2 }] }
```

---

### 3. Headers Missing 🔑

**Problem:** Missing required headers

**Required Headers:**
```javascript
const headers = {
  'Content-Type': 'application/json',  // MUST include this
  'Authorization': `Bearer ${token}`   // MUST include Bearer prefix
};
```

**Common Mistakes:**
```javascript
// ❌ WRONG - Missing Content-Type
{ 'Authorization': `Bearer ${token}` }

// ❌ WRONG - Missing Bearer prefix
{ 'Authorization': token }

// ❌ WRONG - Token with extra quotes
{ 'Authorization': `Bearer "${token}"` }

// ✅ CORRECT
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

---

### 4. CORS Issues 🌐

**Problem:** CORS might be blocking the request

**Check:**
1. Is your frontend running on `http://localhost:3000`?
2. Check browser console for CORS errors

**Backend CORS is configured for all origins**, so this shouldn't be an issue.

---

## 🐛 Debugging Steps

### Step 1: Check Token Validity
```javascript
// Test if token is valid
const testResponse = await fetch('http://localhost:5001/api/v1/canteens', {
  headers: { 'Authorization': `Bearer ${token}` }
});

console.log('Token test:', await testResponse.json());
// If you get 401 error → Token expired, get new one
```

### Step 2: Verify Request Data
```javascript
// Log the exact data being sent
const orderData = {
  canteenId: canteenId,
  items: items
};

console.log('Sending order data:', JSON.stringify(orderData, null, 2));
console.log('Token:', token);

// Make sure:
// - canteenId is a string (MongoDB ObjectId)
// - items is an array
// - each item has menuItemId (string) and quantity (number)
```

### Step 3: Check Response Details
```javascript
try {
  const response = await fetch('http://localhost:5001/api/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(orderData)
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  
  const data = await response.json();
  console.log('Response data:', data);

  if (!response.ok) {
    console.error('Error details:', data);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Step 4: Test with Hardcoded Values
```javascript
// Use these exact values that work in backend
const testOrder = {
  canteenId: "693b010b3ab6f068202b736b",
  items: [{
    menuItemId: "693b033e3ab6f068202b7384",
    quantity: 2
  }]
};

// If this works, the issue is with your dynamic data
```

---

## 📋 Complete Working Example

```javascript
async function createOrder(canteenId, items) {
  try {
    // 1. Get token from storage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please login first.');
    }

    // 2. Validate data
    if (!canteenId || !items || items.length === 0) {
      throw new Error('Invalid order data');
    }

    // 3. Make request
    const response = await fetch('http://localhost:5001/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        canteenId: canteenId,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: Number(item.quantity) // Ensure it's a number
        }))
      })
    });

    // 4. Handle response
    const data = await response.json();

    if (!response.ok) {
      // Handle specific errors
      if (response.status === 401) {
        throw new Error('Token expired. Please login again.');
      }
      if (response.status === 400) {
        throw new Error(data.error || 'Invalid request');
      }
      if (response.status === 500) {
        console.error('Server error details:', data);
        throw new Error('Server error. Check console for details.');
      }
      throw new Error(data.error || 'Unknown error');
    }

    console.log('Order created successfully:', data.data);
    return data.data;

  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
}

// Usage
const order = await createOrder(
  '693b010b3ab6f068202b736b',
  [{ menuItemId: '693b033e3ab6f068202b7384', quantity: 2 }]
);
```

---

## 🔍 Check Server Logs

If the issue persists, check the backend console output. It will show the exact error:

```bash
# In the terminal running npm run dev, you'll see:
[2025-12-12T06:40:20.873Z] POST /api/v1/orders
# Any errors will be logged here
```

---

## ✅ Quick Checklist

Before creating an order, verify:

- [ ] Token is valid (not expired)
- [ ] `Content-Type: application/json` header is set
- [ ] `Authorization: Bearer <token>` header is set
- [ ] `canteenId` is a valid MongoDB ObjectId string
- [ ] `items` is an array with at least one item
- [ ] Each item has `menuItemId` (string) and `quantity` (number)
- [ ] Quantity is a number, not a string
- [ ] Menu items exist in the database
- [ ] Canteen exists in the database

---

## 🆘 Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Get a fresh token** - Login again
2. **Test with curl** - Use the exact curl command from ORDER_PAYMENT_API_REFERENCE.md
3. **Check network tab** - Look at the actual request being sent
4. **Share the error** - Copy the full error message and request details

**Backend is confirmed working!** The issue is likely in the frontend request format or token.
