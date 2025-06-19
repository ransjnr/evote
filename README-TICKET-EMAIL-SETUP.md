# Ticket Email Confirmation Setup Guide

This guide covers setting up email confirmations with QR codes for the eVote ticket system.

## Features

✅ **16-digit unique ticket codes** - Generated automatically for each ticket
✅ **QR code generation** - Each ticket gets a unique QR code for verification  
✅ **Email confirmation** - Beautiful HTML emails sent after payment
✅ **Ticket sharing** - Users can download, share, and copy ticket codes
✅ **Mobile-responsive** - QR codes work perfectly on mobile devices

## Quick Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Paystack (existing)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

### 2. Gmail App Password Setup

For Gmail (recommended):

1. **Enable 2-Factor Authentication** on your Google account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security** → **2-Step Verification**
4. Scroll down to **App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Enter "eVote Tickets" as the name
7. Copy the generated 16-character password
8. Use this password as `EMAIL_PASS` in your `.env.local`

### 3. Alternative Email Providers

#### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Custom SMTP
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

Then update the transporter in `app/api/tickets/send-confirmation/route.ts`:

```javascript
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## How It Works

### 1. Payment Flow
```
User purchases tickets → Payment processed → Email triggered → User receives confirmation
```

### 2. Ticket Code Generation
- **Format**: 16 consecutive digits (e.g., `1234567890123456`)
- **Uniqueness**: Each code is cryptographically random
- **Validation**: Frontend validates 16-digit format

### 3. QR Code Data Structure
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

### 4. Email Features
- **Responsive HTML design**
- **Embedded QR codes** (base64 images)
- **Event details** and ticket information
- **Professional branding** with eVote styling
- **Call-to-action** buttons and instructions

## Testing

### 1. Local Development
```bash
# Start the development server
npm run dev

# Test with these steps:
1. Create an event with ticketing enabled
2. Purchase tickets using test Paystack credentials
3. Check your email for confirmation
4. Verify QR codes are properly generated
```

### 2. Test Email Template
You can test the email template independently:

```bash
# Send a test email
curl -X POST http://localhost:3000/api/tickets/send-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "tickets": [{
      "_id": "test123",
      "ticketCode": "1234567890123456",
      "purchaserName": "Test User",
      "purchaserEmail": "test@example.com",
      "purchaserPhone": "+1234567890",
      "status": "confirmed"
    }],
    "event": {
      "_id": "event123",
      "name": "Test Event",
      "description": "A test event",
      "startDate": 1703123456789,
      "endDate": 1703209856789,
      "venue": "Test Venue"
    },
    "purchaserEmail": "test@example.com",
    "transactionId": "TXN-123456789"
  }'
```

## Customization

### 1. Email Template
Edit `app/api/tickets/send-confirmation/route.ts` to customize:
- **Colors** and branding
- **Email subject** line
- **Footer** information
- **Support** contact details

### 2. QR Code Styling
Modify QR code appearance:
```javascript
const qrCodeDataURL = await QRCode.toDataURL(qrData, {
  width: 300,        // Size
  margin: 4,         // Border
  color: {
    dark: '#667eea',   // QR code color
    light: '#FFFFFF'   // Background color
  },
  errorCorrectionLevel: 'M' // Error correction
});
```

### 3. Ticket Code Format
To change from 16 digits to another format, update:
- `convex/tickets.ts` - `generateTicketCode()` function
- `lib/utils/ticket-utils.ts` - `isValidTicketCode()` function

## Security Considerations

### 1. Email Security
- ✅ Use app passwords, never regular passwords
- ✅ Enable 2FA on email accounts
- ✅ Rotate email passwords regularly
- ✅ Monitor email sending quotas

### 2. QR Code Security
- ✅ Include timestamp for temporal validation
- ✅ Use JSON structure for extensibility
- ✅ Validate QR data on scan
- ✅ Prevent replay attacks with one-time use

### 3. Rate Limiting
Consider implementing rate limiting for email sending:

```javascript
// Add to your API route
const rateLimit = new Map();

export async function POST(request) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 5;

  if (rateLimit.has(ip)) {
    const { count, resetTime } = rateLimit.get(ip);
    if (now < resetTime) {
      if (count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' }, 
          { status: 429 }
        );
      }
      rateLimit.set(ip, { count: count + 1, resetTime });
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    }
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  }

  // Continue with email sending...
}
```

## Production Setup

### 1. Email Service Recommendations

**For Low Volume (< 100 emails/day)**
- Gmail with App Password ✅
- Outlook/Hotmail

**For Medium Volume (< 10,000 emails/day)**
- [SendGrid](https://sendgrid.com/) - Free tier: 100 emails/day
- [Mailgun](https://www.mailgun.com/) - Free tier: 5,000 emails/month
- [Amazon SES](https://aws.amazon.com/ses/) - Pay per use

**For High Volume (> 10,000 emails/day)**
- Dedicated SMTP provider
- Multiple email services for redundancy

### 2. Environment Variables (Production)
```env
# Production email settings
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-secure-app-password
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional: Custom SMTP for production
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### 3. DNS Configuration
If using custom domain:
```
# Add these DNS records
MX    10 mx1.yourdomain.com
TXT   "v=spf1 include:_spf.google.com ~all"
TXT   "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

## Troubleshooting

### Common Issues

#### ❌ "Invalid login" error
- Check email/password combination
- Ensure 2FA is enabled and app password is used
- Verify email service configuration

#### ❌ QR codes not generating
- Check if `qrcode` package is installed: `npm list qrcode`
- Verify browser compatibility for Canvas API
- Check console for JavaScript errors

#### ❌ Emails not sending
- Check network connectivity
- Verify email service quotas/limits
- Check spam folders
- Review server logs for detailed errors

#### ❌ Confirmation page not loading
- Verify transaction ID format
- Check Convex database queries
- Ensure payment status is correctly updated

### Debug Mode
Enable detailed logging:

```javascript
// Add to your API route
console.log('Email request:', {
  to: purchaserEmail,
  ticketCount: tickets.length,
  eventName: event.name
});

// Add error details
catch (error) {
  console.error('Detailed email error:', {
    message: error.message,
    code: error.code,
    response: error.response
  });
}
```

## Monitoring

### 1. Email Delivery
Track email success rates:
- Monitor bounce rates
- Check spam complaints
- Review delivery confirmations

### 2. QR Code Usage
Log QR code scans:
- Scan locations and times
- Success/failure rates
- Popular scanning apps

### 3. Performance Metrics
- Email sending speed
- QR generation time
- User engagement rates

## Support

For issues:
1. Check this documentation first
2. Review console logs and network requests  
3. Test with different email providers
4. Verify environment variable configuration
5. Contact support with specific error messages

## Updates

This system is designed to be extensible. Future enhancements may include:
- PDF ticket generation
- Multi-language email templates
- Advanced QR code validation
- Email analytics dashboard
- Webhook integrations 