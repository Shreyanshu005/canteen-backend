# Canteen Owner Integration: Scan & Pickup

## 📲 Overview
The logic for "Scan -> Verify -> Expire" is implemented using two endpoints:
1. **Verify (Scan):** Checks details but doesn't change status.
2. **Pickup (Redeem):** Checks details AND marks as completed (expiring it).

---

## 🚀 Scan-to-Pickup Flow

### Scenario A: Check Details Only (Scan)
Use this if the owner just wants to see what's in the order before handing it over.

**Endpoint:** `POST /api/v1/orders/verify-qr`
- **Input:** `{ "qrData": "..." }`
- **Output:** Order details
- **Effect:** None (Order remains readable)

### Scenario B: Handover & Complete (Scan & Expire)
Use this when handing over the food. **This fulfills your requirement: "qr will be expired then"**.

**Endpoint:** `POST /api/v1/orders/pickup`
- **Input:** `{ "qrData": "..." }`
- **Output:** Success message + Order Details
- **Effect:** Order status becomes `completed`.
- **Validation:** 
  - If status is already `completed`, returns error: `Order already picked up/completed`.
  - Payment must be `success`.

---

## 💻 Frontend Implementation (Owner App)

```javascript
import { Camera } from 'react-native-vision-camera'; // or similar lib

// 1. Scan QR Code
const onCodeScanned = async (code) => {
  const qrData = code.data;
  
  // 2. Call Complete Pickup API
  const response = await fetch('http://.../api/v1/orders/pickup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ qrData })
  });

  const result = await response.json();

  if (result.success) {
    alert("✅ Order Completed! Hand over food.");
  } else {
    // 3. Handle Expiration / Errors
    if (result.error.includes("already picked up")) {
      alert("❌ This QR code has already been used!");
    } else {
      alert(`Error: ${result.error}`);
    }
  }
}
```

---

## 🔒 Security Features
- **Expiration:** Once status is `completed`, the `pickup` API returns an error for the same QR code.
- **24h Expiry:** QR codes are invalid 24 hours after generation.
- **Authorization:** Only Admin or the specific Canteen Owner can scan.
- **Payment Check:** Ensures order is paid before completion.
