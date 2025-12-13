# Canteen Management: Open/Close & Operating Hours

## Overview
New features allow canteen owners to manually open/close their canteen or set automatic operating hours. This prevents users from placing orders when the canteen is unavailable.

---

## 🎮 Manual Open/Close

### Toggle Status Endpoint
**PATCH** `/api/v1/canteens/:id/status`

Manually flips the `isOpen` status.

#### Headers
- `Authorization`: Bearer `<your_token>`

#### Example Response (200 OK)
```json
{
    "success": true,
    "data": {
        "_id": "675af...",
        "name": "Main Canteen",
        "isOpen": false,  // Updated status
        ...
    },
    "message": "Canteen is now CLOSED"
}
```

---

## ⏰ Automatic Operating Hours

You can set `openingTime` and `closingTime` when creating or updating a canteen.

### Update Canteen Endpoint
**POST** `/api/v1/canteens?id=<canteen_id>`

#### Request Body
```json
{
    "name": "Main Canteen",
    "place": "Building A",
    "isOpen": true,       // Master switch (must be true for auto-hours to work)
    "openingTime": "09:00", // 24-hour format
    "closingTime": "18:00"  // 24-hour format
}
```

---

## 🚫 Order Blocking Logic

When a user tries to place an order (`POST /api/v1/orders`), the system checks:

1.  **Manual Check**: Is `isOpen` set to `false`?
    *   If **Yes**: Returns `400 Bad Request` - "Canteen is currently closed (Manually Closed)"

2.  **Time Check**: Are `openingTime` and `closingTime` set?
    *   If **Yes**: Checks if current server time is within range.
    *   If **Outside Range**: Returns `400 Bad Request` - "Canteen is closed. Operating hours: 09:00 - 18:00"

---
## 🧪 Testing
1.  **Manual Toggle**: Use the PATCH endpoint to close the canteen, then try to order.
2.  **Auto Hours**: Set `closingTime` to a past time (e.g., "05:00" if it's currently 10:00), then try to order.
