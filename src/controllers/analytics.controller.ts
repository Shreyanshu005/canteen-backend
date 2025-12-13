import type { Request, Response } from 'express';
import Order from '../models/Order';
import Canteen from '../models/Canteen';

// @desc    Get canteen analytics (sales, earnings, orders)
// @route   GET /api/v1/analytics/canteen/:canteenId?period=day|week|month
// @access  Private (Admin/Canteen Owner)
export const getCanteenAnalytics = async (req: Request, res: Response) => {
    try {
        const { canteenId } = req.params;
        const { period = 'day' } = req.query;

        // Verify canteen exists
        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        // Check authorization
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen.ownerId.toString() === req.user?._id.toString();

        if (!isAdmin && !isCanteenOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view analytics for this canteen',
            });
        }

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'day':
                // Today (from midnight)
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                // Last 7 days
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                // Last 30 days
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        // Fetch orders for the period
        const orders = await Order.find({
            canteenId,
            paymentStatus: 'success', // Only count paid orders
            createdAt: { $gte: startDate },
        });

        // Calculate analytics
        const totalOrders = orders.length;
        const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Count orders by status
        const ordersByStatus = {
            paid: orders.filter(o => o.status === 'paid').length,
            preparing: orders.filter(o => o.status === 'preparing').length,
            ready: orders.filter(o => o.status === 'ready').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        };

        // Top selling items
        const itemSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const key = item.menuItemId.toString();
                if (!itemSales[key]) {
                    itemSales[key] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0,
                    };
                }
                itemSales[key].quantity += item.quantity;
                itemSales[key].revenue += item.price * item.quantity;
            });
        });

        // Convert to array and sort by quantity
        const topItems = Object.values(itemSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10); // Top 10 items

        // Average order value
        const averageOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;

        // Response
        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate: now,
                summary: {
                    totalOrders,
                    totalEarnings,
                    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
                },
                ordersByStatus,
                topSellingItems: topItems,
                canteen: {
                    id: canteen._id,
                    name: canteen.name,
                    place: canteen.place,
                },
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get earnings breakdown by date
// @route   GET /api/v1/analytics/canteen/:canteenId/earnings?period=week|month
// @access  Private (Admin/Canteen Owner)
export const getEarningsBreakdown = async (req: Request, res: Response) => {
    try {
        const { canteenId } = req.params;
        const { period = 'week' } = req.query;

        // Verify canteen exists
        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ success: false, error: 'Canteen not found' });
        }

        // Check authorization
        const isAdmin = req.user?.role === 'admin';
        const isCanteenOwner = canteen.ownerId.toString() === req.user?._id.toString();

        if (!isAdmin && !isCanteenOwner) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view analytics for this canteen',
            });
        }

        // Calculate date range
        const now = new Date();
        const days = period === 'month' ? 30 : 7;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Fetch orders
        const orders = await Order.find({
            canteenId,
            paymentStatus: 'success',
            createdAt: { $gte: startDate },
        });

        // Group by date
        const earningsByDate: { [key: string]: { date: string; earnings: number; orders: number } } = {};

        orders.forEach(order => {
            const dateKey = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
            if (!earningsByDate[dateKey]) {
                earningsByDate[dateKey] = {
                    date: dateKey,
                    earnings: 0,
                    orders: 0,
                };
            }
            earningsByDate[dateKey].earnings += order.totalAmount;
            earningsByDate[dateKey].orders += 1;
        });

        // Convert to array and sort by date
        const breakdown = Object.values(earningsByDate).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        res.status(200).json({
            success: true,
            data: {
                period,
                breakdown,
                total: {
                    earnings: breakdown.reduce((sum, day) => sum + day.earnings, 0),
                    orders: breakdown.reduce((sum, day) => sum + day.orders, 0),
                },
            },
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
