import dotenv from 'dotenv';
dotenv.config();

const checkOrders = async () => {
    const { default: connectDB } = await import('../config/db');
    const { default: Order } = await import('../models/Order');
    const { default: mongoose } = await import('mongoose');

    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);

    console.log(`\n📦 Total Orders in DB: ${await Order.countDocuments()}`);
    console.log(`\n🔍 Last 10 Orders:`);

    orders.forEach(order => {
        console.log(`- ${order.orderId} | Status: ${order.status} | Payment: ${order.paymentStatus} | Created: ${order.createdAt}`);
    });

    await mongoose.connection.close();
    process.exit(0);
};

checkOrders();
