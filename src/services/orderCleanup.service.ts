import cron from 'node-cron';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import { refundPayment } from '../utils/razorpay';

/**
 * Initialize background job to cleanup pending orders
 * Runs every minute to check for orders older than 5 minutes
 */
export const initOrderCleanupJob = () => {
    console.log('⏰ Initializing Order Cleanup Job...');

    // Run every minute: '*/1 * * * *'
    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log('🧹 Running order cleanup job...');

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
        } catch (error) {
            console.error('Error in order cleanup job:', error);
        }
    });

    // Run every hour: '0 * * * *' to check for expired PAID orders (24 hours)
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🧹 Running 24h refund cleanup job...');

            // 24 hours ago
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Find valid PAID orders created > 24h ago
            const expiredPaidOrders = await Order.find({
                status: 'paid',
                paymentStatus: 'success',
                createdAt: { $lt: twentyFourHoursAgo }
            });

            if (expiredPaidOrders.length === 0) {
                return;
            }

            console.log(`⚠️  Found ${expiredPaidOrders.length} expired paid orders to refund...`);

            for (const order of expiredPaidOrders) {
                try {
                    // ATOMIC CHECK: Lock the order
                    const lockedOrder = await Order.findOneAndUpdate(
                        {
                            _id: order._id,
                            status: 'paid',
                            paymentStatus: 'success'
                        },
                        {
                            status: 'cancelled',
                            paymentStatus: 'refunded'
                        },
                        { new: true }
                    );

                    if (!lockedOrder) continue;

                    // Initiate Refund
                    if (lockedOrder.paymentId) {
                        console.log(`💸 Initiating refund for order: ${lockedOrder.orderId}`);
                        await refundPayment(lockedOrder.paymentId, lockedOrder.totalAmount);
                    }

                    // Restore Inventory
                    console.log(`Restoring inventory for refunded order: ${lockedOrder.orderId}`);
                    for (const item of lockedOrder.items) {
                        await MenuItem.findByIdAndUpdate(item.menuItemId, {
                            $inc: { availableQuantity: item.quantity }
                        });
                    }

                    console.log(`✅ Refunded and cancelled order: ${lockedOrder.orderId}`);

                } catch (err) {
                    console.error(`Failed to refund order ${order.orderId}:`, err);
                }
            }

        } catch (error) {
            console.error('Error in refund cleanup job:', error);
        }
    });

    console.log('✅ Order Cleanup Job Scheduled (Runs every minute)');
    console.log('✅ Refund Cleanup Job Scheduled (Runs every hour)');
};
