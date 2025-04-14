# Paystack Integration Setup Guide

This document provides instructions on how to set up Paystack for processing payments in the eVote application.

## Overview

eVote uses Paystack to process payments for votes. The integration is implemented in the `app/events/[eventId]/page.tsx` file, where the `PaystackCheckout` component handles the payment flow.

## Setup Instructions

### 1. Create a Paystack Account

1. Go to [Paystack](https://paystack.com/) and sign up for an account
2. Complete the verification process to activate your account

### 2. Get Your API Keys

1. Log in to your Paystack Dashboard
2. Navigate to Settings > API Keys & Webhooks
3. You'll see both test and live keys. For development, use the test keys

### 3. Configure Your Environment

1. Create or edit the `.env.local` file in your project root
2. Add your Paystack public key:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```
3. Replace `pk_test_your_key_here` with your actual Paystack test public key

### 4. Testing the Integration

1. Run your application
2. Go to an active event page
3. Select a nominee and click "Vote"
4. Enter the vote quantity and click "Pay with Paystack"
5. For test payments, you can use the following test card:
   - Card Number: `4084 0840 8408 4081`
   - Expiry Date: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)
   - PIN: Any 4 digits (e.g., `1234`)
   - OTP: Any 6 digits (e.g., `123456`)

### 5. Going Live

When you're ready to accept real payments:

1. Complete the Paystack compliance requirements
2. Get your live API keys from the Paystack Dashboard
3. Update your `.env.local` file with your live public key:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
   ```
4. Make sure your payment callback URLs are correctly configured in the Paystack Dashboard

## Customization

### Payment Amount

The payment amount is calculated based on the event's vote price and the quantity of votes:

```javascript
const totalPrice = event.votePrice * voteCount;
```

### Payment Metadata

The following metadata is sent with each payment:

- Event Name
- Nominee Name
- Vote Count

This information is used for tracking and verification purposes.

## Webhook Integration (Advanced)

For additional security and reliability, consider implementing Paystack webhooks:

1. Set up a webhook URL in your application (e.g., `/api/paystack/webhook`)
2. Register this URL in the Paystack Dashboard under Settings > API Keys & Webhooks
3. Implement webhook handling to process events such as `charge.success`

## Support

If you encounter any issues with the Paystack integration, please:

1. Check the [Paystack Documentation](https://paystack.com/docs/api/)
2. Verify your API keys are correctly configured
3. Ensure your account is properly verified with Paystack 