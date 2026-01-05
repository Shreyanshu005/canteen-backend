import cron from 'node-cron';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import redis from '../config/redis';

/**
 * Logic to cleanup pending orders older than 5 minutes
 */
export const cleanupPendingOrders = async () => {
    try {
        console.log('🧹 Running (PENDING) order cleanup job...');

        // Calculate timestamp for 5 minutes ago
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Find all PENDING orders created more than 5 minutes ago
        const expiredOrders = await Order.find({
            status: 'pending',
            createdAt: { $lt: fiveMinutesAgo }
        });

        if (expiredOrders.length === 0) {
            return;
        }

        console.log(`⚠️  Found ${expiredOrders.length} potential expired orders. Processing...`);

        // Collect unique canteen IDs for cache invalidation
        const affectedCanteens = new Set<string>();

        for (const order of expiredOrders) {
            try {
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
