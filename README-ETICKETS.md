# E-Ticketing System Integration Guide

This document provides a comprehensive guide on the e-ticketing system integrated into the eVote application.

## Overview

The e-ticketing system allows event organizers to sell tickets for their events and track payments. Users can purchase tickets using Paystack payment integration, and admins can monitor all ticket sales and payments through the admin dashboard.

## Features

### For Users
- Browse events with ticketing enabled
- View different ticket types with pricing and benefits
- Purchase tickets with secure Paystack payment processing
- Receive confirmation emails with ticket details and QR codes
- View ticket confirmation page with all purchase details

### For Admins
- Create and manage ticket types for events
- Set pricing, quantity, and sale periods for tickets
- View comprehensive payment analytics (both votes and tickets)
- Track ticket sales in real-time
- Monitor payment statuses and transaction details
- Validate tickets using QR codes

## Setup Instructions

### 1. Environment Configuration

Add your Paystack configuration to your `.env.local` file:

```env
# Paystack Configuration (Test Mode)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_test_key_here

# For production, use your live key:
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_live_key_here
```

### 2. Get Paystack API Keys

1. Sign up for a Paystack account at [https://paystack.com](https://paystack.com)
2. Complete account verification
3. Navigate to Settings > API Keys & Webhooks
4. Copy your public key (use test key for development)

### 3. Event Configuration

When creating events, you can now choose from three event types:

1. **Voting Only** - Traditional voting events without ticketing
2. **Ticketing Only** - Events focused on ticket sales without voting
3. **Voting and Ticketing** - Combined events with both voting and ticketing features

For ticketing-enabled events, you must provide:
- Event venue
- Maximum attendees
- (Vote price is only required for voting-enabled events)

## How It Works

### Ticket Purchase Flow

1. **Event Discovery**: Users browse events and navigate to ticket purchase page
2. **Ticket Selection**: Users select ticket type and quantity
3. **Form Completion**: Users fill in personal details
4. **Payment Processing**: 
   - System creates pending ticket records
   - User is redirected to Paystack for payment
   - Payment is processed securely
5. **Confirmation**: 
   - Payment success triggers ticket confirmation
   - User receives confirmation page with ticket details
   - Email confirmation is sent (future enhancement)

### Admin Payment Tracking

Admins can view comprehensive payment analytics including:

- **Total Revenue**: Combined revenue from votes and tickets
- **Vote Revenue**: Earnings from voting payments
- **Ticket Revenue**: Earnings from ticket sales
- **Transaction Status**: Pending, successful, and failed payments
- **Payment Details**: Transaction IDs, amounts, event details
- **Filtering Options**: By status, event, payment type, and date range

## Database Schema

### Events Table
New fields added for ticketing:
- `eventType`: "voting_only" | "ticketing_only" | "voting_and_ticketing"
- `venue`: Optional venue for ticketing events
- `maxAttendees`: Optional capacity limit for ticketing events

### Ticket Types Table
- `name`: Ticket type name (e.g., "VIP", "Regular")
- `description`: Optional description
- `eventId`: Reference to event
- `price`: Ticket price
- `quantity`: Total available tickets
- `remaining`: Remaining tickets for sale
- `benefits`: Array of benefits/inclusions
- `saleStartDate`: Optional sale start date
- `saleEndDate`: Optional sale end date

### Tickets Table
- `ticketTypeId`: Reference to ticket type
- `eventId`: Reference to event
- `purchaserName`: Buyer's name
- `purchaserEmail`: Buyer's email
- `purchaserPhone`: Buyer's phone
- `transactionId`: Unique transaction identifier
- `amount`: Ticket price
- `status`: "pending" | "confirmed" | "cancelled" | "used"
- `ticketCode`: Unique ticket code for validation
- `createdAt`: Purchase timestamp
- `usedAt`: Optional usage timestamp
- `additionalDetails`: Optional buyer details (age, gender, requirements)

### Payments Table
Enhanced with ticketing support:
- `paymentType`: "vote" | "ticket"
- `ticketTypeId`: Optional reference to ticket type
- Additional fields for tracking different payment types

## API Endpoints

### Ticket Management
- `createTicketType`: Create new ticket type for an event
- `updateTicketType`: Update existing ticket type
- `deleteTicketType`: Delete ticket type (if no tickets sold)
- `getTicketTypes`: Get all ticket types for an event

### Ticket Purchasing
- `purchaseTickets`: Create pending ticket purchase
- `confirmTicketPayment`: Confirm payment and activate tickets
- `getTicketsByTransaction`: Get tickets for a transaction
- `validateTicket`: Mark ticket as used

### Payment Tracking
- `getPaymentsByDepartment`: Get all payments for a department
- `getTicketPayments`: Get all ticket payments
- `getEventPaymentStats`: Get payment statistics for an event
- `updatePaymentStatus`: Update payment status

## Testing

### Test Payment Details

For testing payments, use these Paystack test card details:

- **Card Number**: 4084 0840 8408 4081
- **Expiry Date**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **PIN**: Any 4 digits (e.g., 1234)
- **OTP**: Any 6 digits (e.g., 123456)

### Test Workflow

1. Create an event with ticket types
2. Navigate to the event ticket purchase page
3. Select ticket type and fill in details
4. Use test payment details to complete purchase
5. Verify ticket confirmation page shows correct details
6. Check admin dashboard for payment tracking

## Future Enhancements

### Planned Features
- Email confirmation with QR codes
- Ticket PDF generation
- Bulk ticket purchase discounts
- Refund management
- Advanced ticket validation
- Mobile app integration
- Analytics dashboard improvements

### Webhook Integration

For production environments, consider implementing Paystack webhooks for additional security:

```javascript
// Example webhook endpoint
app.post('/api/paystack/webhook', (req, res) => {
  // Verify webhook signature
  // Update payment status
  // Send confirmation emails
});
```

## Troubleshooting

### Common Issues

1. **Paystack Key Issues**
   - Ensure you're using the correct public key for your environment
   - Test keys start with `pk_test_`, live keys start with `pk_live_`

2. **Payment Not Confirming**
   - Check Convex logs for errors
   - Verify transaction ID matches between frontend and backend
   - Ensure payment status is being updated correctly

3. **Ticket Availability Issues**
   - Check ticket quantity and remaining count
   - Verify sale date restrictions
   - Ensure event type supports ticketing

### Debug Mode

Enable debug mode by adding to your environment:

```env
NODE_ENV=development
```

This will show additional logging information for troubleshooting.

## Support

For issues related to:
- **Paystack Integration**: Check [Paystack Documentation](https://paystack.com/docs)
- **Convex Backend**: Check [Convex Documentation](https://docs.convex.dev)
- **Application Issues**: Check the console logs and error messages

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **Payment Verification**: Always verify payments on the server side
3. **Data Validation**: Validate all user inputs before processing
4. **Transaction Security**: Use unique transaction IDs and verify amounts
5. **Ticket Security**: Generate unique, hard-to-guess ticket codes

## License

This e-ticketing integration is part of the eVote application and follows the same licensing terms. 