# E-Ticketing System Integration Guide

This document provides a comprehensive guide on the e-ticketing system integrated into the eVote application.

## 📱 E-Ticketing System

A comprehensive ticketing solution integrated with the eVote platform, allowing event organizers to sell tickets and manage attendees alongside voting functionality.

### ✨ Features

#### 🎫 Ticket Management
- **Multiple Ticket Types**: Create various ticket tiers (VIP, Regular, Early Bird, etc.)
- **Pricing Control**: Set individual prices for each ticket type
- **Inventory Management**: Smart availability tracking with automatic cleanup
- **Benefits System**: Highlight what each ticket includes
- **Sale Periods**: Optional start/end dates for ticket sales

#### 💳 Secure Payment Processing
- **Paystack Integration**: Reliable payment processing
- **16-Digit Ticket Codes**: Unique identification for each ticket
- **Email Confirmations**: Professional confirmation emails with QR codes
- **Payment Protection**: Tickets only confirmed after successful payment
- **Automatic Cleanup**: Expired pending payments cleaned automatically

#### 📧 Email System
- **Instant Confirmations**: Immediate email after successful payment
- **QR Code Generation**: Embedded QR codes for easy verification
- **Professional Templates**: Beautiful, responsive email design
- **Event Details**: Complete event information in emails

#### 🎯 Real-Time Availability
- **Live Updates**: Real-time ticket availability
- **Pending Protection**: Accounts for recent pending purchases
- **Overselling Prevention**: Smart inventory management
- **Race Condition Prevention**: Secure concurrent purchase handling

#### 📊 Admin Features
- **Sales Analytics**: Comprehensive ticket sales data
- **Revenue Tracking**: Separate tracking for votes vs tickets
- **Inventory Control**: Manage quantities and pricing
- **Manual Cleanup**: Admin tools for payment cleanup
- **Transaction History**: Complete payment audit trail

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+ and npm/yarn
- Convex account and project
- Paystack account
- Email service (Gmail or custom SMTP)

#### Installation
1. **Install Dependencies**
   ```bash
   npm install react-paystack qrcode nodemailer
   npm install --save-dev @types/qrcode @types/nodemailer
   ```

2. **Environment Variables**
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_SECRET_KEY=sk_test_...
   
   # Email configuration (see README-TICKET-EMAIL-SETUP.md)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Database Schema**
   The ticket system uses these Convex tables:
   - `ticketTypes`: Ticket type definitions
   - `tickets`: Individual purchased tickets
   - `payments`: Payment records (enhanced for tickets)

### 💡 How It Works

#### Payment Flow
```
1. User selects tickets → Creates pending tickets (no quantity reduction)
2. User pays via Paystack → Payment confirmed by webhook
3. System confirms payment → Reduces available quantity
4. Sends confirmation email → User receives QR codes
5. Cleanup expired pending → Maintains accurate availability
```

#### Inventory Management
- **Smart Availability**: Shows real tickets available minus recent pending
- **10-Minute Buffer**: Recent pending tickets (last 10 min) count as "reserved"
- **30-Minute Cleanup**: Expired pending payments auto-cleaned
- **Manual Cleanup**: Admin can trigger cleanup anytime

#### Email Workflow
1. **Purchase Initiation**: Tickets created in pending state
2. **Payment Success**: Triggers confirmation mutation
3. **Email Generation**: Creates QR codes and email content
4. **Email Delivery**: Sends via configured email service
5. **User Experience**: Download, share, and copy ticket codes

### 🎨 User Experience

#### Ticket Discovery
- **Beautiful Landing Page**: `/etickets` with event showcase
- **Advanced Filtering**: Search, status, and event type filters
- **Event Cards**: Modern design with status indicators
- **Direct Purchase**: One-click access to ticket buying

#### Purchase Experience
- **Two-Step Process**: Select tickets → Complete payment
- **Real-Time Validation**: Live availability checking
- **Multiple Quantities**: Buy multiple tickets at once
- **Guest Information**: Collect attendee details
- **Payment Security**: Secure Paystack integration

#### Confirmation & Management
- **Instant Confirmation**: Immediate confirmation page
- **QR Code Access**: Download and share QR codes
- **Ticket Codes**: 16-digit codes for manual entry
- **Email Backup**: Professional email confirmation

### 🔧 Admin Management

#### Event Setup
1. Create event with `ticketing_enabled` or `both` type
2. Set up ticket types with pricing and quantities
3. Configure sale periods (optional)
4. Monitor sales in real-time

#### Sales Monitoring
- **Dashboard Analytics**: Revenue, transaction counts
- **Payment Breakdown**: Separate vote vs ticket revenue
- **Real-Time Updates**: Live sales data
- **Export Capabilities**: Transaction history

#### Maintenance
- **Expired Cleanup**: Manual cleanup of expired payments
- **Inventory Adjustment**: Modify quantities as needed
- **Price Updates**: Change pricing before sales
- **Sale Period Control**: Manage when tickets are available

### 🛡️ Security Features

#### Payment Security
- **Transaction Validation**: Verify payments with Paystack
- **Duplicate Prevention**: Unique transaction IDs
- **Race Condition Handling**: Secure concurrent operations
- **Payment Webhooks**: Reliable payment confirmation

#### Ticket Security
- **Unique Codes**: 16-digit ticket identification
- **QR Code Verification**: Tamper-resistant QR codes
- **Status Tracking**: Complete ticket lifecycle
- **Audit Trail**: Full transaction history

#### Data Protection
- **Secure Storage**: Convex database encryption
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error management
- **Privacy Compliance**: Secure data handling

### 📊 Analytics & Reporting

#### Revenue Insights
- **Total Revenue**: Combined vote + ticket revenue
- **Revenue Breakdown**: Separate tracking by type
- **Transaction Metrics**: Success rates and patterns
- **Event Performance**: Per-event analytics

#### Inventory Analytics
- **Availability Tracking**: Real-time stock levels
- **Sales Velocity**: Ticket sales rate
- **Pending Analysis**: Payment completion rates
- **Cleanup Statistics**: Expired payment data

### 🔮 Advanced Features

#### Customization Options
- **Email Templates**: Customize confirmation emails
- **Ticket Benefits**: Highlight ticket perks
- **Pricing Strategies**: Flexible pricing models
- **Sale Periods**: Time-limited sales

#### Integration Capabilities
- **Webhook Support**: Payment status webhooks
- **API Access**: Convex API for custom integrations
- **Export Functions**: Data export capabilities
- **Third-Party Tools**: Integration with external services

### 📞 Support & Troubleshooting

#### Common Issues
- **Payment Failures**: Check Paystack configuration
- **Email Delivery**: Verify SMTP settings
- **Availability Issues**: Run cleanup for accurate counts
- **QR Code Problems**: Ensure proper image generation

#### Debugging Tools
- **Admin Cleanup**: Manual expired payment cleanup
- **Payment Logs**: Transaction history review
- **Email Testing**: Send test confirmations
- **Availability Check**: Real-time inventory verification

### 🎯 Best Practices

#### Event Planning
1. **Set Up Early**: Configure tickets before announcing
2. **Test Everything**: Test purchase flow completely
3. **Monitor Sales**: Check sales regularly
4. **Manage Inventory**: Adjust quantities as needed

#### Customer Experience
1. **Clear Information**: Provide detailed ticket descriptions
2. **Easy Purchase**: Streamline the buying process
3. **Quick Confirmation**: Ensure fast email delivery
4. **Support Access**: Provide help contact information

#### Technical Maintenance
1. **Regular Cleanup**: Run expired payment cleanup
2. **Monitor Logs**: Check for errors regularly
3. **Update Prices**: Adjust pricing as needed
4. **Backup Data**: Regular data backups

This e-ticketing system provides a complete solution for event ticket sales with the security, reliability, and user experience needed for professional events.

## Setup Instructions

### 1. Environment Configuration

Add your configuration to `.env.local`:

```env
# Paystack Configuration (Test Mode)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_test_key_here

# Email Configuration (NEW)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For production, use your live key:
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_live_key_here
```

### 2. Email Setup (Required for Confirmations)

**Quick Gmail Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password as `EMAIL_PASS` in your environment

**📋 Detailed Setup**: See [README-TICKET-EMAIL-SETUP.md](./README-TICKET-EMAIL-SETUP.md) for complete instructions including other email providers.

### 3. Install Dependencies

```bash
npm install qrcode @types/qrcode nodemailer @types/nodemailer
```

### 4. Get Paystack API Keys

1. Sign up for a Paystack account at [https://paystack.com](https://paystack.com)
2. Complete account verification
3. Navigate to Settings > API Keys & Webhooks
4. Copy your public key (use test key for development)

### 5. Event Configuration

When creating events, you can now choose from three event types:

1. **Voting Only** - Traditional voting events without ticketing
2. **Ticketing Only** - Events focused on ticket sales without voting
3. **Voting and Ticketing** - Combined events with both voting and ticketing features

## User Experience Flow

### 1. Ticket Purchase
```
Browse Events → Select Ticket Type → Enter Details → Pay with Paystack → Confirmation
```

### 2. After Payment
```
Payment Success → Email Sent → QR Codes Generated → Confirmation Page → Ready for Event
```

### 3. At Event
```
Show QR Code → Scan for Verification → Quick Check-in → Enjoy Event
```

## Database Schema Updates

### Tickets Table
```javascript
{
  _id: "ticket_id",
  ticketCode: "1234567890123456", // 16-digit numeric code
  ticketTypeId: "tickettype_id",
  eventId: "event_id",
  purchaserName: "John Doe",
  purchaserEmail: "john@example.com",
  purchaserPhone: "+1234567890",
  transactionId: "TXN-123456789",
  amount: 50.00,
  status: "confirmed", // pending, confirmed, used, cancelled
  createdAt: 1703123456789,
  additionalDetails: {
    age: 25,
    gender: "male",
    specialRequirements: "Wheelchair access"
  }
}
```

### QR Code Data Format
```json
{
  "ticketCode": "1234567890123456",
  "eventId": "k123456789",
  "eventName": "Concert Event",
  "purchaserName": "John Doe",
  "timestamp": 1703123456789,
  "version": "1.0"
}
```

## API Endpoints

### Email Confirmation
```
POST /api/tickets/send-confirmation
Content-Type: application/json

{
  "tickets": [ticket_objects],
  "event": event_object,
  "purchaserEmail": "user@example.com",
  "transactionId": "TXN-123456789"
}
```

### Existing Endpoints
- `GET /api/tickets/qrcode/[id]` - Generate QR code for ticket
- `POST /api/paystack/ussd/*` - USSD payment integration
- All existing Convex queries and mutations

## Testing

### 1. Test Email System
```bash
# Test with local development
npm run dev

# Purchase a ticket and check email
# Verify QR codes generate correctly
# Test sharing and download features
```

### 2. Paystack Test Cards
```
Test Card: 4084084084084081
CVV: Any 3 digits
Expiry: Any future date
PIN: 0000 or 1234
```

### 3. QR Code Testing
- Use any QR code scanner app
- Verify JSON data structure
- Test on different devices

## Advanced Features

### 1. Ticket Validation
```javascript
// Scan QR code to get data
const qrData = parseQRCodeData(scannedData);
if (qrData && isValidTicketCode(qrData.ticketCode)) {
  // Validate ticket in database
  // Mark as used
  // Allow entry
}
```

### 2. Bulk Operations
- Import ticket holders from CSV
- Bulk ticket generation
- Mass email campaigns
- Export attendee lists

### 3. Analytics
- Track email open rates
- Monitor QR code scan locations
- Analyze ticket sales patterns
- Revenue reporting

## Security Features

### 1. Ticket Security
- ✅ 16-digit unique codes prevent guessing
- ✅ QR codes include timestamps
- ✅ One-time use validation
- ✅ Encrypted ticket data

### 2. Email Security
- ✅ App passwords for email accounts
- ✅ Rate limiting on email sending
- ✅ Secure SMTP connections
- ✅ Anti-spam compliance

### 3. Payment Security
- ✅ Paystack PCI compliance
- ✅ Transaction verification
- ✅ Secure token handling
- ✅ Fraud detection

## Future Enhancements

### Planned Features
- **PDF ticket generation** with improved design
- **Bulk ticket purchase discounts**
- **Refund management system**
- **Advanced ticket validation dashboard**
- **Mobile app integration**
- **Multi-language email templates**
- **Webhook integrations for real-time updates**
- **Analytics dashboard improvements**

### Integration Possibilities
- **Check-in mobile app** for event staff
- **Print-at-home tickets** with PDF generation
- **Social media sharing** with custom graphics
- **Calendar integration** for event reminders
- **SMS notifications** for important updates

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check environment variables
   - Verify email credentials
   - Review email provider limits
   - Check spam folders

2. **QR Codes Not Generating**
   - Ensure `qrcode` package is installed
   - Check browser Canvas API support
   - Verify ticket data format

3. **Payment Not Confirming**
   - Verify Paystack webhook setup
   - Check transaction ID format
   - Review Convex logs

### Debug Mode

Enable detailed logging:
```javascript
// Add to environment
NODE_ENV=development
ENABLE_DEBUG_LOGS=true
```

### Support Resources
- **Email Setup**: [README-TICKET-EMAIL-SETUP.md](./README-TICKET-EMAIL-SETUP.md)
- **Paystack Documentation**: [https://paystack.com/docs](https://paystack.com/docs)
- **Convex Documentation**: [https://docs.convex.dev](https://docs.convex.dev)
- **QR Code Library**: [https://github.com/soldair/node-qrcode](https://github.com/soldair/node-qrcode)

## Performance Optimization

### 1. Email Sending
- Use background jobs for bulk emails
- Implement queue system for high volume
- Cache email templates
- Monitor delivery rates

### 2. QR Code Generation
- Generate QR codes asynchronously
- Cache generated codes
- Optimize image compression
- Use CDN for static assets

### 3. Database Queries
- Index ticket codes for fast lookup
- Optimize transaction queries
- Use pagination for large lists
- Cache frequent queries

## License

This e-ticketing system is part of the eVote application. Please refer to the main project license for usage terms.

---

**Need Help?** Check the [Email Setup Guide](./README-TICKET-EMAIL-SETUP.md) or contact support with specific error messages and logs. 