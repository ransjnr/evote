import nodemailer from "nodemailer";

// Email configuration - using environment variables or fallback values
const EMAIL_USER = process.env.EMAIL_USER || "ransfordoppong375@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "rvqk dgxr alru akcs";
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";

// Email Templates
const emailTemplates = {
  // Voting confirmation email
  voteConfirmation: (data) => {
    const { nominee, event, voteCount, amount, transactionId } = data;

    return {
      subject: `🗳️ Vote Confirmed - ${nominee.name} for ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Vote Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🗳️ Vote Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your vote has been successfully recorded</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Vote Details</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="margin-bottom: 15px;">
                  <strong style="color: #10b981;">Nominee:</strong> ${nominee.name}<br>
                  ${nominee.code ? `<strong style="color: #6b7280;">Code:</strong> ${nominee.code}<br>` : ""}
                  <strong style="color: #6b7280;">Event:</strong> ${event.name}<br>
                  <strong style="color: #6b7280;">Votes Cast:</strong> ${voteCount}<br>
                  <strong style="color: #6b7280;">Amount Paid:</strong> GHS ${amount.toFixed(2)}
                </div>
              </div>
            </div>

            <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 10px 0; color: #15803d; display: flex; align-items: center; gap: 8px;">
                <span>✅</span> Thank You!
              </h3>
              <p style="margin: 0; color: #15803d;">
                Your vote contributes to a fair and transparent election process. 
                You can track results in real-time on our platform.
              </p>
            </div>

            <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 20px; text-align: center;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">Transaction Details</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Transaction ID: <strong>${transactionId}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
                Date: ${new Date().toLocaleDateString()}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #10b981;">support@pollix.com</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Admin notification for new votes
  adminVoteNotification: (data) => {
    const { nominee, event, voteCount, amount } = data;

    return {
      subject: `📊 New Vote Alert - ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Vote Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📊 New Vote Received</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Real-time voting update</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #3b82f6; margin: 0 0 15px 0;">Vote Details</h3>
              <p><strong>Nominee:</strong> ${nominee.name}</p>
              <p><strong>Event:</strong> ${event.name}</p>
              <p><strong>Votes:</strong> ${voteCount}</p>
              <p><strong>Amount:</strong> GHS ${amount.toFixed(2)}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Event reminder
  eventReminder: (data) => {
    const { event, userEmail, reminderType } = data;

    return {
      subject: `🔔 Reminder: ${event.name} ${reminderType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Event Reminder</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔔 Event Reminder</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${reminderType} soon!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #f59e0b; margin: 0 0 15px 0;">${event.name}</h3>
              ${event.description ? `<p style="color: #6b7280; margin-bottom: 15px;">${event.description}</p>` : ""}
              <p><strong>Start Date:</strong> ${new Date(event.startDate).toLocaleString()}</p>
              <p><strong>End Date:</strong> ${new Date(event.endDate).toLocaleString()}</p>
              ${event.venue ? `<p><strong>Venue:</strong> ${event.venue}</p>` : ""}
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Welcome email for new admins
  adminWelcome: (data) => {
    const { admin, department, tempPassword } = data;

    return {
      subject: `👋 Welcome to Pollix Admin Panel`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Pollix</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">👋 Welcome to Pollix!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your admin account is ready</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <h3 style="color: #8b5cf6; margin: 0 0 15px 0;">Account Details</h3>
              <p><strong>Name:</strong> ${admin.name}</p>
              <p><strong>Email:</strong> ${admin.email}</p>
              <p><strong>Department:</strong> ${department.name}</p>
              <p><strong>Role:</strong> ${admin.role === "super_admin" ? "Super Admin" : "Department Admin"}</p>
            </div>

            ${
              tempPassword
                ? `
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Temporary Login Credentials</h3>
              <p style="margin: 0; color: #92400e;">
                <strong>Password:</strong> ${tempPassword}<br>
                <em>Please change this password after your first login.</em>
              </p>
            </div>
            `
                : ""
            }

            <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af;">Next Steps</h3>
              <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
                <li>Log in to your admin dashboard</li>
                <li>Change your temporary password</li>
                <li>Explore the admin features</li>
                <li>Set up your first event</li>
              </ol>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Test email
  test: (data) => {
    const { testMessage } = data;

    return {
      subject: `🧪 Test Email from Pollix System`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🧪 Test Email</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Email system is working correctly!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #06b6d4; margin: 0 0 15px 0;">Test Message</h3>
              <p>${testMessage || "This is a test email to verify the email system is working correctly."}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> ✅ Email delivery successful</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Enhanced ticket confirmation email with QR codes
  ticketConfirmation: (data) => {
    const { tickets, event, purchaserEmail, transactionId, confirmationUrl } =
      data;

    const ticketRows = tickets
      .map(
        (ticket) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 15px; text-align: center; vertical-align: top;">
            <div style="margin-bottom: 10px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 12px; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 14px;">
                ${ticket.ticketCode}
              </div>
            </div>
            <div style="margin-bottom: 8px;">
              <strong style="color: #1f2937;">${ticket.purchaserName}</strong>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">
              ${ticket.purchaserEmail}
            </div>
            ${
              ticket.ticketType
                ? `
            <div style="background: #f3f4f6; padding: 6px 8px; border-radius: 4px; font-size: 12px; color: #4b5563;">
              ${ticket.ticketType}
            </div>
            `
                : ""
            }
          </td>
          <td style="padding: 15px; text-align: center; vertical-align: top;">
            <div style="margin-bottom: 8px;">
              <img src="${ticket.qrCodeDataURL}" alt="QR Code" style="width: 120px; height: 120px; border: 2px solid #e5e7eb; border-radius: 8px;" />
            </div>
            <div style="font-size: 11px; color: #6b7280; text-align: center;">
              Scan to verify
            </div>
          </td>
        </tr>
      `
      )
      .join("");

    return {
      subject: `🎫 Your tickets for ${event.name} - Confirmation #${transactionId.slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket Confirmation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; margin-bottom: 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎫 Tickets Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your tickets are ready to use</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Event Details -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 20px;">Event Details</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 18px;">${event.name}</h3>
                ${event.description ? `<p style="margin: 0 0 15px 0; color: #6b7280; line-height: 1.5;">${event.description}</p>` : ""}
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #667eea; font-size: 16px;">📅</span>
                    <span style="font-size: 14px; color: #374151;">${new Date(
                      event.startDate
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                  </div>
                  ${
                    event.venue
                      ? `
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #667eea; font-size: 16px;">📍</span>
                    <span style="font-size: 14px; color: #374151;">${event.venue}</span>
                  </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>

            <!-- Tickets Table -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 20px;">Your Tickets (${tickets.length})</h2>
              <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f9fafb;">
                      <th style="padding: 15px; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Ticket Details</th>
                      <th style="padding: 15px; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ticketRows}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Important Instructions -->
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; color: #1e40af; display: flex; align-items: center; gap: 8px; font-size: 16px;">
                <span style="font-size: 18px;">ℹ️</span> Important Instructions
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.6;">
                <li style="margin-bottom: 8px;"><strong>Save this email</strong> - Keep it easily accessible on your phone</li>
                <li style="margin-bottom: 8px;"><strong>Bring your QR code</strong> - Show it at the event entrance for quick check-in</li>
                <li style="margin-bottom: 8px;"><strong>Arrive early</strong> - Allow extra time for check-in process</li>
                <li style="margin-bottom: 8px;"><strong>Valid ID required</strong> - Bring photo identification matching the ticket name</li>
                <li><strong>No screenshots</strong> - Use the original QR code for best scanning results</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin-bottom: 30px;">
              ${
                confirmationUrl
                  ? `
              <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px 10px 0; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.4);">
                📱 View Online Tickets
              </a>
              `
                  : ""
              }
              <a href="mailto:support@pollix.com" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 0 10px 10px 0; border: 1px solid #d1d5db;">
                📧 Contact Support
              </a>
            </div>

            <!-- Transaction Details -->
            <div style="background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; padding: 20px; text-align: center; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Transaction Details</h3>
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Transaction ID: <strong style="color: #1f2937;">#${transactionId}</strong>
                  </p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Purchase Date: <strong style="color: #1f2937;">${new Date().toLocaleDateString()}</strong>
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #667eea; text-decoration: none;">support@pollix.com</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated email from Pollix. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Password reset email
  passwordReset: (data) => {
    const { user, resetToken, resetUrl } = data;

    return {
      subject: `🔐 Reset Your Pollix Password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We received a request to reset your password</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Hello ${user.name || user.email},</h2>
              <p style="color: #6b7280; line-height: 1.6;">
                Click the button below to reset your password. This link will expire in 1 hour for security reasons.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Security Notice</h3>
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #f59e0b;">support@pollix.com</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                This is an automated email from Pollix. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Event results announcement
  eventResults: (data) => {
    const { event, categories, winners, totalVotes } = data;

    const winnersList = categories
      .map((category) => {
        const categoryWinners = winners.filter(
          (w) => w.categoryId === category._id
        );
        return `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #667eea; margin-bottom: 15px; font-size: 18px;">${category.name}</h3>
          ${categoryWinners
            .map(
              (winner, index) => `
            <div style="background: ${index === 0 ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" : "white"}; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; color: ${index === 0 ? "white" : "#1f2937"}; font-size: 16px;">
                    ${index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📍"} ${winner.name}
                  </h4>
                  <p style="margin: 5px 0 0 0; color: ${index === 0 ? "rgba(255,255,255,0.8)" : "#6b7280"}; font-size: 14px;">
                    ${winner.description || ""}
                  </p>
                </div>
                <div style="text-align: right;">
                  <div style="color: ${index === 0 ? "white" : "#1f2937"}; font-weight: bold; font-size: 18px;">
                    ${winner.voteCount} votes
                  </div>
                  <div style="color: ${index === 0 ? "rgba(255,255,255,0.8)" : "#6b7280"}; font-size: 12px;">
                    ${((winner.voteCount / totalVotes) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      })
      .join("");

    return {
      subject: `🏆 ${event.name} - Official Results Announced!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Event Results</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🏆 Results Are In!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${event.name} Official Results</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px; text-align: center;">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Congratulations to all participants!</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">
                  ${totalVotes} Total Votes Cast
                </div>
                <div style="color: #6b7280; margin-top: 5px;">
                  Thank you to everyone who participated in this democratic process
                </div>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">🏆 Winners by Category</h2>
              ${winnersList}
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #667eea;">support@pollix.com</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                This is an automated email from Pollix. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Admin notification for new registrations
  adminNewRegistration: (data) => {
    const { newUser, department, registrationType } = data;

    return {
      subject: `👥 New ${registrationType} Registration - ${newUser.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Registration</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">👥 New Registration</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone just registered for Pollix</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #3b82f6; margin: 0 0 15px 0;">Registration Details</h3>
              <p><strong>Name:</strong> ${newUser.name}</p>
              <p><strong>Email:</strong> ${newUser.email}</p>
              <p><strong>Department:</strong> ${department?.name || "N/A"}</p>
              <p><strong>Registration Type:</strong> ${registrationType}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Pending Verification</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/superadmin/admin-verification" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review Registration
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Bulk campaign email
  campaignEmail: (data) => {
    const { campaign, recipient, unsubscribeUrl } = data;

    return {
      subject: campaign.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${campaign.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">${campaign.title}</h1>
            ${campaign.subtitle ? `<p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${campaign.subtitle}</p>` : ""}
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px;">
              <div style="color: #374151; line-height: 1.7;">
                ${campaign.content}
              </div>
            </div>

            ${
              campaign.callToAction
                ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${campaign.callToAction.url}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ${campaign.callToAction.text}
              </a>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                You're receiving this because you're subscribed to Pollix updates.
              </p>
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #10b981;">support@pollix.com</a>
              </p>
              ${
                unsubscribeUrl
                  ? `
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe from these emails</a>
              </p>
              `
                  : ""
              }
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Event invitation email
  eventInvitation: (data) => {
    const { event, recipient, invitedBy, rsvpUrl } = data;

    return {
      subject: `🎉 You're Invited: ${event.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Event Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Join us for an amazing event</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 15px;">${event.name}</h2>
              ${event.description ? `<p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">${event.description}</p>` : ""}
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="margin-bottom: 15px;">
                  <strong style="color: #ec4899;">📅 When:</strong> ${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}
                </div>
                ${
                  event.venue
                    ? `
                <div style="margin-bottom: 15px;">
                  <strong style="color: #ec4899;">📍 Where:</strong> ${event.venue}
                </div>
                `
                    : ""
                }
                <div>
                  <strong style="color: #ec4899;">👤 Invited by:</strong> ${invitedBy.name || invitedBy.email}
                </div>
              </div>
            </div>

            ${
              rsvpUrl
                ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${rsvpUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                RSVP Now
              </a>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #ec4899;">support@pollix.com</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                This is an automated email from Pollix. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Password reset email
  passwordReset: (data) => {
    const { user, resetToken, resetUrl } = data;

    return {
      subject: `🔐 Reset Your Pollix Password`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We received a request to reset your password</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Hello ${user.name || user.email},</h2>
              <p style="color: #6b7280; line-height: 1.6;">
                Click the button below to reset your password. This link will expire in 1 hour for security reasons.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Security Notice</h3>
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #f59e0b;">support@pollix.com</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                This is an automated email from Pollix. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Event results announcement
  eventResults: (data) => {
    const { event, categories, winners, totalVotes } = data;

    const winnersList = categories
      .map((category) => {
        const categoryWinners = winners.filter(
          (w) => w.categoryId === category._id
        );
        return `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #667eea; margin-bottom: 15px; font-size: 18px;">${category.name}</h3>
          ${categoryWinners
            .map(
              (winner, index) => `
            <div style="background: ${index === 0 ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" : "white"}; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; color: ${index === 0 ? "white" : "#1f2937"}; font-size: 16px;">
                    ${index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📍"} ${winner.name}
                  </h4>
                  <p style="margin: 5px 0 0 0; color: ${index === 0 ? "rgba(255,255,255,0.8)" : "#6b7280"}; font-size: 14px;">
                    ${winner.description || ""}
                  </p>
                </div>
                <div style="text-align: right;">
                  <div style="color: ${index === 0 ? "white" : "#1f2937"}; font-weight: bold; font-size: 18px;">
                    ${winner.voteCount} votes
                  </div>
                  <div style="color: ${index === 0 ? "rgba(255,255,255,0.8)" : "#6b7280"}; font-size: 12px;">
                    ${((winner.voteCount / totalVotes) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      })
      .join("");

    return {
      subject: `🏆 ${event.name} - Official Results Announced!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Event Results</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🏆 Results Are In!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${event.name} Official Results</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="margin-bottom: 30px; text-align: center;">
              <h2 style="color: #1f2937; margin-bottom: 15px;">Congratulations to all participants!</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">
                  ${totalVotes} Total Votes Cast
                </div>
                <div style="color: #6b7280; margin-top: 5px;">
                  Thank you to everyone who participated in this democratic process
                </div>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">🏆 Winners by Category</h2>
              ${winnersList}
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@pollix.com" style="color: #667eea;">support@pollix.com</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                This is an automated email from Pollix. Please do not reply directly to this message.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },

  // Admin notification for new registrations
  adminNewRegistration: (data) => {
    const { newUser, department, registrationType } = data;

    return {
      subject: `👥 New ${registrationType} Registration - ${newUser.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Registration</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">👥 New Registration</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone just registered for Pollix</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #3b82f6; margin: 0 0 15px 0;">Registration Details</h3>
              <p><strong>Name:</strong> ${newUser.name}</p>
              <p><strong>Email:</strong> ${newUser.email}</p>
              <p><strong>Department:</strong> ${department?.name || "N/A"}</p>
              <p><strong>Registration Type:</strong> ${registrationType}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Pending Verification</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/superadmin/admin-verification" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Review Registration
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  },
};

// Main email sending function
const sendEmail = async (to, templateName, templateData = {}) => {
  try {
    const transport = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Get the email template
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(templateData);

    const mailOptions = {
      from: `Pollix System <${EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transport.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      template: templateName,
      recipient: to,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
      template: templateName,
      recipient: to,
    };
  }
};

// Specific email functions for easy use
const emailService = {
  // Send voting confirmation
  sendVoteConfirmation: async (to, voteData) => {
    return await sendEmail(to, "voteConfirmation", voteData);
  },

  // Send admin notification
  sendAdminVoteNotification: async (adminEmail, voteData) => {
    return await sendEmail(adminEmail, "adminVoteNotification", voteData);
  },

  // Send event reminder
  sendEventReminder: async (to, eventData) => {
    return await sendEmail(to, "eventReminder", eventData);
  },

  // Send admin welcome email
  sendAdminWelcome: async (to, adminData) => {
    return await sendEmail(to, "adminWelcome", adminData);
  },

  // Send test email
  sendTestEmail: async (to, testData = {}) => {
    return await sendEmail(to, "voteConfirmation", {
      nominee: { name: "Test Nominee" },
      event: { name: "Test Event" },
      voteCount: 1,
      amount: 5,
      transactionId: "TEST_" + Date.now(),
      ...testData,
    });
  },

  // Send ticket confirmation
  sendTicketConfirmation: async (to, ticketData) => {
    return await sendEmail(to, "ticketConfirmation", ticketData);
  },

  // Send password reset email
  sendPasswordReset: async (to, resetData) => {
    return await sendEmail(to, "passwordReset", resetData);
  },

  // Send event results
  sendEventResults: async (to, resultsData) => {
    return await sendEmail(to, "eventResults", resultsData);
  },

  // Send admin new registration notification
  sendAdminNewRegistration: async (to, registrationData) => {
    return await sendEmail(to, "adminNewRegistration", registrationData);
  },

  // Send campaign email
  sendCampaignEmail: async (to, campaignData) => {
    return await sendEmail(to, "campaignEmail", campaignData);
  },

  // Send event invitation
  sendEventInvitation: async (to, invitationData) => {
    return await sendEmail(to, "eventInvitation", invitationData);
  },

  // Generic send function
  send: sendEmail,

  // List available templates
  getAvailableTemplates: () => {
    return Object.keys(emailTemplates);
  },
};

module.exports = emailService;
