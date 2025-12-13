# Canteen Owner Analytics API

## Overview
Analytics endpoints for canteen owners to track sales, earnings, and performance metrics.

---

## 📊 Endpoints

### 1. Get Canteen Analytics Summary
**GET** `/api/v1/analytics/canteen/:canteenId?period=day|week|month`

Get comprehensive analytics including total sales, earnings, order breakdown, and top-selling items.

#### Query Parameters
- `period` (optional): `day`, `week`, or `month` (default: `day`)
  - `day`: Today (from midnight)
  - `week`: Last 7 days
  - `month`: Last 30 days

#### Example Request
```bash
curl -X GET "http://localhost:5001/api/v1/analytics/canteen/693b010b3ab6f068202b736b?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "period": "week",
    "startDate": "2025-12-06T00:00:00.000Z",
    "endDate": "2025-12-13T01:25:00.000Z",
    "summary": {
      "totalOrders": 45,
      "totalEarnings": 3450,
      "averageOrderValue": 76.67
    },
    "ordersByStatus": {
      "paid": 5,
      "preparing": 8,
      "ready": 12,
      "completed": 18,
      "cancelled": 2
    },
    "topSellingItems": [
      {
        "name": "Samosa",
        "quantity": 120,
        "revenue": 3600
      },
      {
        "name": "Tea",
        "quantity": 85,
        "revenue": 1275
      },
      {
        "name": "Vada Pav",
        "quantity": 60,
        "revenue": 1800
      }
    ],
    "canteen": {
      "id": "693b010b3ab6f068202b736b",
      "name": "Main Canteen",
      "place": "Building A, Floor 1"
    }
  }
}
```

---

### 2. Get Earnings Breakdown by Date
**GET** `/api/v1/analytics/canteen/:canteenId/earnings?period=week|month`

Get daily earnings breakdown for charting and detailed analysis.

#### Query Parameters
- `period` (optional): `week` or `month` (default: `week`)

#### Example Request
```bash
curl -X GET "http://localhost:5001/api/v1/analytics/canteen/693b010b3ab6f068202b736b/earnings?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "period": "week",
    "breakdown": [
      {
        "date": "2025-12-06",
        "earnings": 450,
        "orders": 6
      },
      {
        "date": "2025-12-07",
        "earnings": 520,
        "orders": 7
      },
      {
        "date": "2025-12-08",
        "earnings": 380,
        "orders": 5
      },
      {
        "date": "2025-12-09",
        "earnings": 610,
        "orders": 8
      },
      {
        "date": "2025-12-10",
        "earnings": 490,
        "orders": 6
      },
      {
        "date": "2025-12-11",
        "earnings": 550,
        "orders": 7
      },
      {
        "date": "2025-12-12",
        "earnings": 450,
        "orders": 6
      }
    ],
    "total": {
      "earnings": 3450,
      "orders": 45
    }
  }
}
```

---

## 📱 Frontend Display Examples

### Dashboard Summary Card
```
┌─────────────────────────────────────┐
│  📊 This Week's Performance         │
├─────────────────────────────────────┤
│  Total Sales: ₹3,450                │
│  Total Orders: 45                   │
│  Avg Order: ₹76.67                  │
├─────────────────────────────────────┤
│  Order Status:                      │
│  ✅ Completed: 18                   │
│  🟣 Ready: 12                       │
│  🔵 Preparing: 8                    │
│  🟢 Paid: 5                         │
│  ❌ Cancelled: 2                    │
└─────────────────────────────────────┘
```

### Top Selling Items
```
┌─────────────────────────────────────┐
│  🏆 Top Selling Items               │
├─────────────────────────────────────┤
│  1. Samosa                          │
│     120 sold • ₹3,600               │
├─────────────────────────────────────┤
│  2. Tea                             │
│     85 sold • ₹1,275                │
├─────────────────────────────────────┤
│  3. Vada Pav                        │
│     60 sold • ₹1,800                │
└─────────────────────────────────────┘
```

### Earnings Chart (Line/Bar Graph)
Use the `breakdown` array to create a chart showing daily earnings trend.

---

## 🎨 React/React Native Example

```jsx
import { useState, useEffect } from 'react';

const AnalyticsDashboard = ({ canteenId, token }) => {
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    fetchBreakdown();
  }, [period]);

  const fetchAnalytics = async () => {
    const response = await fetch(
      `http://localhost:5001/api/v1/analytics/canteen/${canteenId}?period=${period}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    setAnalytics(data.data);
  };

  const fetchBreakdown = async () => {
    const response = await fetch(
      `http://localhost:5001/api/v1/analytics/canteen/${canteenId}/earnings?period=${period}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    setBreakdown(data.data);
  };

  return (
    <View>
      {/* Period Selector */}
      <SegmentedControl
        values={['Day', 'Week', 'Month']}
        selectedIndex={period === 'day' ? 0 : period === 'week' ? 1 : 2}
        onChange={(e) => {
          const periods = ['day', 'week', 'month'];
          setPeriod(periods[e.nativeEvent.selectedSegmentIndex]);
        }}
      />

      {/* Summary Cards */}
      <Card>
        <Text style={styles.amount}>₹{analytics?.summary.totalEarnings}</Text>
        <Text>Total Earnings</Text>
      </Card>

      <Card>
        <Text style={styles.amount}>{analytics?.summary.totalOrders}</Text>
        <Text>Total Orders</Text>
      </Card>

      <Card>
        <Text style={styles.amount}>₹{analytics?.summary.averageOrderValue}</Text>
        <Text>Average Order</Text>
      </Card>

      {/* Top Items */}
      <Text style={styles.heading}>Top Selling Items</Text>
      {analytics?.topSellingItems.map((item, index) => (
        <View key={index}>
          <Text>{item.name}</Text>
          <Text>{item.quantity} sold • ₹{item.revenue}</Text>
        </View>
      ))}

      {/* Earnings Chart */}
      <LineChart
        data={{
          labels: breakdown?.breakdown.map(d => d.date.slice(5)) || [],
          datasets: [{
            data: breakdown?.breakdown.map(d => d.earnings) || []
          }]
        }}
      />
    </View>
  );
};
```

---

## 🔒 Authorization
- Only the **canteen owner** or **admin** can access analytics
- Returns `403 Forbidden` if unauthorized

## 📝 Notes
- Only counts **paid orders** (`paymentStatus: 'success'`)
- All amounts are in the smallest currency unit (paise for INR, divide by 100 for display)
- Dates are in ISO 8601 format
- Top selling items limited to top 10
