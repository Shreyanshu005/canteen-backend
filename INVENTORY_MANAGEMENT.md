# Automatic Inventory Management

## Overview
The system now automatically deducts menu item quantities when orders are successfully paid.

## Implementation

### When Quantity Decreases
- **Trigger**: Payment verification succeeds (`POST /api/v1/payments/verify`)
- **Timing**: After Razorpay confirms payment is "captured"
- **Logic**: 
  ```typescript
  for (const item of order.items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (menuItem) {
          menuItem.availableQuantity -= item.quantity;
          await menuItem.save();
      }
  }
  ```

### Why After Payment (Not After Order Creation)?
- **Prevents Stock Loss**: If a user creates an order but never pays, inventory isn't locked
- **Handles Failures**: Failed/cancelled payments don't affect inventory
- **Accurate Tracking**: Only confirmed purchases reduce stock

## Example Flow

1. **Menu Item**: Samosa (Available: 50)
2. **User Creates Order**: 5 Samosas → Inventory still 50
3. **User Pays**: Payment verified → Inventory becomes 45
4. **Payment Fails**: No deduction, inventory remains 50

## Owner Management

Owners can still manually update quantities via:
- **PATCH** `/api/v1/menu/canteen/:canteenId/item/:itemId/quantity`

This is useful for:
- Restocking items
- Adjusting for spoilage
- Manual corrections
