import cron from 'node-cron';
import Order from '../models/Order';
import Payment from '../models/Payment';
import MenuItem from '../models/MenuItem';
import redis from '../config/redis';
import { fulfillOrder } from './orderFulfillment.service';

// Timeout for pending orders (5 minutes)
const PENDING_ORDER_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Logic to cleanup pending orders older than a certain threshold
 */
export const cleanupPendingOrders = async () => {
    try {
        console.log(`🧹 Running (PENDING) order cleanup job (Threshold: 5 minutes)...`);

        // Calculate timestamp for the timeout
        const expiryTime = new Date(Date.now() - PENDING_ORDER_TIMEOUT_MS);

        // Find all PENDING orders created more than 5 minutes ago
        const expiredOrders = await Order.find({
            status: 'pending',
            createdAt: { $lt: expiryTime }
        });

        if (expiredOrders.length === 0) {
            return;
        }

        console.log(`⚠️  Found ${expiredOrders.length} potential expired orders. Processing...`);

        // Collect unique canteen IDs for cache invalidation
        const affectedCanteens = new Set<string>();

        for (const order of expiredOrders) {
            try {
                // IMPORTANT: Check if there's a successful payment record for this order
                // before canceling it. This handles cases where fulfillment might have failed
                // or is still processing.
                const payment = await Payment.findOne({ orderId: order._id, status: 'success' });
                if (payment) {
                    console.log(`ℹ️  Skipping cleanup for order ${order.orderId} - Found successful payment record. Will attempt re-fulfillment.`);

                    // Only attempt fulfillment if order is still in pending status
                    // If it's in any other status, it means it's already been processed or there's an issue
                    const currentOrder = await Order.findById(order._id);
                    if (currentOrder && currentOrder.status === 'pending' && currentOrder.paymentStatus === 'pending') {
                        try {
                            await fulfillOrder(payment.razorpayOrderId, payment.razorpayPaymentId || 'N/A', payment.paymentMethod || 'unknown');
                            console.log(`✅ Successfully re-fulfilled order ${order.orderId}`);
                        } catch (fulfillErr) {
                            console.error(`Failed to auto-fulfill order ${order.orderId} during cleanup:`, fulfillErr);
                            // Don't retry - let it be handled manually or by next cleanup cycle
                        }
                    } else {
                        console.log(`ℹ️  Order ${order.orderId} already processed or in non-pending state. Skipping re-fulfillment.`);
                    }
                    continue;
                }

                // ATOMIC CHECK: Try to mark as 'cancelled' immediately to claim it.
                // This prevents double-processing if the cron job overlaps or runs twice.
                const lockedOrder = await Order.findOneAndUpdate(
                    { _id: order._id, status: 'pending' },
                    {
                        status: 'cancelled',
                        paymentStatus: 'failed'
                    },
                    { new: true }
                );

                // If lockedOrder is null, it means the order is no longer pending
                // (maybe user paid just now, or another job handled it)
                if (!lockedOrder) {
                    continue;
                }

                affectedCanteens.add(lockedOrder.canteenId.toString());

                // Now safe to restore inventory
                console.log(`Restoring inventory for expired order: ${lockedOrder.orderId}`);
                for (const item of lockedOrder.items) {
                    await MenuItem.findByIdAndUpdate(item.menuItemId, {
                        $inc: { availableQuantity: item.quantity }
                    });
                }

                console.log(`❌ Cancelled and restored inventory for: ${lockedOrder.orderId}`);
            } catch (err) {
                console.error(`Failed to process expired order ${order.orderId}:`, err);
            }
        }

        // Invalidate cache for all affected canteens
        for (const canteenId of affectedCanteens) {
            try {
                await redis.del(`menu:${canteenId}`);
                console.log(`♻️  Invalidated menu cache for canteen: ${canteenId}`);
            } catch (e) {
                console.error(`Failed to invalidate cache for canteen ${canteenId}:`, e);
            }
        }
    } catch (error) {
        console.error('Error in order cleanup job:', error);
    }
};

/**
 * Initialize background job to cleanup pending orders
 * Runs every minute to check for orders older than 5 minutes
 */
export const initOrderCleanupJob = () => {
    console.log('⏰ Initializing Order Cleanup Job...');

    // Run every minute: '*/1 * * * *'
    cron.schedule('*/1 * * * *', async () => {
        await cleanupPendingOrders();
    });

    console.log('✅ Order Cleanup Job Scheduled (Runs every minute)');
};
