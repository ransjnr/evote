# Paystack Integration Setup Guide

This document provides instructions on how to set up Paystack for processing payments in the eVote application.

## Overview

eVote uses Paystack to process payments for both votes and tickets. The integration handles secure payment processing with proper transaction management and confirmation emails.

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root with the following test credentials:

```bash
# Paystack Configuration - Test Mode
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_72a6543e2d567054e14ebc32855cf3cb36df8d71
PAYSTACK_SECRET_KEY=sk_test_e4049c4c3de9ac662c03d9d7f983d82a51c0d76c

# Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email Configuration (for ticket confirmations)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**⚠️ Important**: These are test credentials - never use them in production!

### Important: Currency Configuration

To use GHS (Ghana Cedis) for payments:

1. **Paystack Account Setup**: Ensure your Paystack account is configured for Ghana and supports GHS currency
2. **Test Mode**: Test credentials automatically support GHS currency
3. **Live Mode**: Contact Paystack support if you encounter currency errors in live mode
4. **Business Verification**: Complete business verification with Paystack Ghana if required

If you see "Currency not supported by merchant" error:
- Verify your Paystack account country setting
- Contact Paystack support to enable GHS for your account
- Ensure you're using the correct API keys for your region

### 2. Test Card Details

For testing payments, use these test card details:

**Primary Test Card** (Always successful):
- **Card Number**: `4084 0840 8408 4081`
- **Expiry Date**: `12/25` (any future date)
- **CVV**: `123` (any 3 digits)
- **PIN**: `1234` (any 4 digits)
- **OTP**: `123456` (any 6 digits)

**Alternative Test Cards**:
- **Visa**: `4084 0840 8408 4081`
- **Mastercard**: `5060 6666 6666 6666 64`
- **Verve**: `5061 0201 1234 5678 09`

### 3. Testing the Payment Flow

#### A. Testing Vote Payments
1. Navigate to an active event page
2. Select a nominee and click "Vote"
3. Choose vote quantity and click "Pay with Paystack"
4. Use the test card details above
5. Verify vote count updates after successful payment

#### B. Testing Ticket Purchases
1. Go to `/etickets` or an event's ticket page
2. Select a ticket type and quantity
3. Fill in purchaser details
4. Click "Pay with Paystack"
5. Complete payment with test card
6. Check confirmation page and email delivery

### 4. Payment Flow Details

#### Vote Payment Process:
```
1. User selects nominee & vote count
2. Creates pending payment record
3. Redirects to Paystack payment
4. Payment success triggers vote recording
5. Vote count updates in real-time
```

#### Ticket Payment Process:
```
1. User selects tickets (creates pending tickets)
2. Ticket availability NOT reduced yet
3. Paystack payment initiated
4. Payment success confirms tickets
5. Ticket quantity reduced & email sent
6. Abandoned payments auto-cleanup after 30min
```

### 5. Webhook Configuration (Optional)

For production deployments, set up webhooks for additional security:

1. **Webhook URL**: `https://yourdomain.com/api/paystack/webhook`
2. **Events to Monitor**:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`

3. **Test Webhook URL**: Your current ngrok URL is configured as:
   ```
   https://72c6-2c0f-2a80-7a4-2010-cd8b-4f9c-2368-41d1.ngrok-free.app/api/ussd
   ```

### 6. Testing Scenarios

#### Successful Payment Test:
1. ✅ Use test card `4084 0840 8408 4081`
2. ✅ Complete all payment steps
3. ✅ Verify transaction appears in admin dashboard
4. ✅ Check email confirmation (for tickets)
5. ✅ Confirm inventory updates (for tickets)

#### Failed Payment Test:
1. ❌ Use invalid card number `4000 0000 0000 0002`
2. ❌ Verify payment fails gracefully
3. ❌ Check no inventory is reduced
4. ❌ Confirm no votes are recorded

#### Abandoned Payment Test:
1. 🕐 Start ticket purchase (creates pending)
2. 🕐 Close payment modal without paying
3. 🕐 Verify tickets remain available
4. 🕐 Wait 30 minutes for auto-cleanup
5. 🕐 Or trigger manual cleanup via admin panel

### 7. Admin Testing Tools

#### Manual Cleanup:
- Go to Admin → Events → [Event] → Tickets
- Click "Cleanup Expired" button
- Verify expired pending payments are removed

#### Payment Analytics:
- Check Admin → Payments dashboard
- Verify vote vs ticket revenue separation
- Review transaction history and success rates

### 8. Production Checklist

Before going live:

- [ ] Get live Paystack keys from dashboard
- [ ] Update environment variables with live keys
- [ ] Complete Paystack compliance requirements
- [ ] Set up production webhook URLs
- [ ] Test with small real payments
- [ ] Configure proper email service
- [ ] Set up backup and monitoring

## Troubleshooting

### Common Issues:

**"Currency not supported by merchant" Error**:
- Verify your Paystack account supports GHS currency
- Contact Paystack support to enable GHS for your account  
- Ensure you're using the correct regional API keys
- Check that business verification is complete
- Try logging into your Paystack dashboard to verify account status

**Payment Modal Doesn't Open**:
- Check public key configuration
- Verify environment variables loaded
- Check browser console for errors

**Payment Success But No Confirmation**:
- Check webhook configuration
- Verify server-side processing
- Review payment logs in admin dashboard

**Tickets Not Available After Failed Payment**:
- Run manual cleanup via admin panel
- Check for expired pending payments
- Verify real-time availability calculation

**Email Confirmations Not Sending**:
- Check email service configuration
- Verify SMTP settings in `.env.local`
- Test email service separately

### Support Resources:

- [Paystack Documentation](https://paystack.com/docs/api/)
- [Test Cards Reference](https://paystack.com/docs/payments/test-payments/)
- [Webhook Documentation](https://paystack.com/docs/payments/webhooks/)

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use test keys only** for development
3. **Validate all payments** server-side
4. **Implement proper error handling** for failed transactions
5. **Monitor transaction logs** regularly 