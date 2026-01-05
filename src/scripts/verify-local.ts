import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api/v1`;

const runVerification = async () => {
    console.log(`🔍 Starting Local Verification on ${BASE_URL}...\n`);

    try {
        // 1. Check Server & Security Headers
        console.log('1️⃣  Testing Security Headers...');
        const rootRes = await fetch(`${BASE_URL}/canteens`); // Public endpoint

        const securityHeader = rootRes.headers.get('x-dns-prefetch-control');
        const rateLimitLimit = rootRes.headers.get('x-ratelimit-limit');

        if (securityHeader) {
            console.log('   ✅ Helmet is active (X-DNS-Prefetch-Control found)');
        } else {
            console.log('   ❌ Helmet Config missing');
        }

        if (rateLimitLimit) {
            console.log(`   ✅ Rate Limiting is active (Limit: ${rateLimitLimit})`);
        } else {
            console.log('   ❌ Rate Limiting headers missing');
        }
        console.log('');

        // 2. Test Compression
        console.log('2️⃣  Testing Compression (Gzip)...');
        const compressionRes = await fetch(`${BASE_URL}/canteens`, {
            headers: { 'Accept-Encoding': 'gzip' }
        });
        const encoding = compressionRes.headers.get('content-encoding');
        if (encoding && encoding.includes('gzip')) {
            console.log('   ✅ Gzip Compression is WORKING');
        } else {
            console.log(`   ❌ Response not compressed (Encoding: ${encoding})`);
        }
        console.log('');

        // 3. Test Caching (Redis)
        console.log('3️⃣  Testing Redis Caching...');
        const canteensData = await rootRes.json();

        // @ts-ignore
        if (!canteensData.data || canteensData.data.length === 0) {
            console.log('   ⚠️  No canteens found, cannot test Menu caching.');
            return;
        }

        // @ts-ignore
        const canteenId = canteensData.data[0]._id;
        console.log(`   Target Canteen: ${canteenId}`);

        // First Request (Cache Miss)
        const start1 = performance.now();
        await fetch(`${BASE_URL}/menu/canteen/${canteenId}`);
        const end1 = performance.now();
        const duration1 = (end1 - start1).toFixed(2);
        console.log(`   🔹 Request 1 (DB Fetch): ${duration1}ms`);

        // Second Request (Cache Hit)
        const start2 = performance.now();
        await fetch(`${BASE_URL}/menu/canteen/${canteenId}`);
        const end2 = performance.now();
        const duration2 = (end2 - start2).toFixed(2);
        console.log(`   🔹 Request 2 (Redis Cache): ${duration2}ms`);

        if (Number(duration2) < Number(duration1)) {
            console.log('   ✅ Caching is WORKING (Request 2 was faster)');
        } else {
            console.log('   ⚠️  Caching might be inactive or network jitter occurred.');
        }
        console.log('');

        // 4. Test Order Expiry Logic
        console.log('4️⃣  Testing Expiry Logic...');

        // We need database access for this.
        // Importing here to avoid "Top-level await" issues if not in module
        const { default: connectDB } = await import('../config/db');
        const { default: Order } = await import('../models/Order');
        const { default: mongoose } = await import('mongoose');
        const { cleanupPendingOrders } = await import('../services/orderCleanup.service');

        await connectDB();

        // 4.1 TEST 5-Minute Expiry
        console.log('   🔹 Testing 5-minute Auto-Cancellation...');

        // Create a stale pending order (created 10 mins ago)
        const staleOrder = await Order.create({
            userId: new mongoose.Types.ObjectId(), // Fake ID
            canteenId: canteenId,
            items: [{ menuItemId: new mongoose.Types.ObjectId(), name: 'Test Item', price: 50, quantity: 1 }],
            totalAmount: 50,
            status: 'pending',
            createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 mins ago
        });

        await cleanupPendingOrders();

        const updatedOrder = await Order.findById(staleOrder._id);
        if (updatedOrder?.status === 'cancelled') {
            console.log('   ✅ 5-min Expiry Check PASSED (Order cancelled)');
        } else {
            console.log(`   ❌ 5-min Expiry Check FAILED (Status: ${updatedOrder?.status})`);
        }

        // Cleanup
        await Order.findByIdAndDelete(staleOrder._id);

        // Close DB
        await mongoose.connection.close();
        console.log('\n✅ Verification Complete.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed. Ensure server is running!', error);
        process.exit(1);
    }
};

runVerification();
