# App Store Submission Guide: Test Credentials

## Overview
Apple requires a functional "Demo Account" to review apps that have a login wall. Since your app uses Email/OTP, we have implemented a **Fixed OTP** mechanism specifically for the demo account.

## 🔑 Test Credentials (For Apple Review)

Please provide these exact credentials in the **App Review Information** section of App Store Connect:

- **Username / Email**: `demo@canteen.com`
- **Password / OTP**: `123456`
- **Notes**: 
  > "Please use the provided email. The system is configured to accept the fixed OTP '123456' for this specific test account, bypassing the need for email access."

## ⚙️ How it Works
1. When the reviewer enters `demo@canteen.com`, the backend detects this specific email.
2. Instead of sending a real email, it internally sets the OTP to `123456`.
3. The reviewer simply enters `123456` to log in successfully.

## 💳 Payment Testing (Razorpay)
Apple Reviewers **cannot** make real payments. 

**Ensure you are using Razorpay Test Mode Keys** in your backend environment variables during the review period:
- `RAZORPAY_KEY_ID`: Must be a `rzp_test_...` key.
- `RAZORPAY_KEY_SECRET`: Must be the corresponding test secret.

**Instructions for Reviewer:**
> "The payment gateway is in Test Mode. You can use the standard Razorpay test card details to verify the order flow."
>
> **Card Number**: `4111 1111 1111 1111`
> **Expiry**: Any future date
> **CVV**: Any 3 digits
> **OTP (Bank)**: `123456`

## 🧪 Verification
You can verify this yourself before submitting:
1. Open your app.
2. Enter email: `demo@canteen.com`.
3. Click "Send OTP".
4. Enter `123456`.
5. Login should succeed!
