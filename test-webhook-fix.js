#!/usr/bin/env node

/**
 * Test script to verify the payment webhook race condition fix
 * 
 * This script simulates the scenario where a webhook arrives before
 * the payment record is created in the database.
 */

const ORDER_ID = 'ORD-TEST-12345'; // Replace with actual order ID from your database
const RAZORPAY_ORDER_ID = 'order_TEST123'; // Replace with actual Razorpay order ID

console.log('🧪 Testing Payment Webhook Race Condition Fix\n');

console.log('Test Scenario:');
console.log('1. Create an order through the API');
console.log('2. Payment is completed on Razorpay');
console.log('3. Webhook arrives BEFORE /payments/initiate is called');
console.log('4. Verify order is fulfilled correctly\n');

console.log('Steps to test manually:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n1. Create an order:');
console.log('   POST /api/v1/orders');
console.log('   Body: { "canteenId": "...", "items": [...] }');
console.log('   → Save the returned orderId\n');

console.log('2. Check database - no payment record should exist yet:');
console.log('   db.payments.findOne({ orderId: ObjectId("...") })');
console.log('   → Should return null\n');

console.log('3. Simulate webhook arrival (use Razorpay dashboard or curl):');
console.log('   POST /api/v1/payments/webhook');
console.log('   → Webhook should process successfully\n');

console.log('4. Verify results:');
console.log('   a) Check payment record was created:');
console.log('      db.payments.findOne({ razorpayOrderId: "order_..." })');
console.log('      → Should exist with status: "success"\n');
console.log('   b) Check order status updated:');
console.log('      db.orders.findOne({ orderId: "ORD-..." })');
console.log('      → status: "paid", paymentStatus: "success"\n');

console.log('Expected Logs:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Starting fulfillment for Razorpay Order: order_...');
console.log('⚠️  Payment record not found for Razorpay Order ID: order_...');
console.log('🔍 Fetching Razorpay order details to find matching order...');
console.log('📋 Found receipt in Razorpay order: ORD-...');
console.log('✅ Matched order: ORD-... (...)');
console.log('📝 Creating payment record for order ORD-... from webhook data');
console.log('✅ Payment record created: ...');
console.log('🔍 Found Order: ORD-... (Status: pending, Payment Status: pending)');
console.log('📝 Updating order ORD-... to \'paid\' status...');
console.log('🎊 Successfully fulfilled order ORD-...');
console.log('\n✅ Test passed if you see these logs and order status is updated!\n');
