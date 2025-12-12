# Payment Initiation - Fixed ✅

## Issue
Frontend was sending `orderId` (e.g., "ORD-MJ2NTWTP-SNBRR") instead of MongoDB `_id`, causing:
```
Cast to ObjectId failed for value "ORD-MJ2NTWTP-SNBRR"
```

## Solution
Updated `initiatePayment` controller to accept **both formats**:
- MongoDB `_id`: `675a1234567890abcdef1234`
- Custom `orderId`: `ORD-MJ2NTWTP-SNBRR`

## Frontend Can Now Use Either

**Option 1: Use MongoDB _id (recommended)**
```javascript
const { data } = await createOrder(...);
await initiatePayment(data._id); // MongoDB ID
```

**Option 2: Use custom orderId**
```javascript
const { data } = await createOrder(...);
await initiatePayment(data.orderId); // ORD-XXX format
```

Both will work! ✅
