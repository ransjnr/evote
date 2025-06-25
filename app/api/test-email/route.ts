import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    // Import the email service with correct path
    const emailService = require("../../mailer");

    let result;

    switch (type) {
      case "vote": {
        result = await emailService.sendVoteConfirmation(email, {
          nominee: { name: "Test Nominee" },
          event: { name: "Test Event" },
          voteCount: 1,
          amount: 5,
          transactionId: "TEST_" + Date.now(),
        });
        break;
      }

      case "ticket": {
        // Test ticket confirmation email
        const testTicketData = {
          tickets: [
            {
              ticketCode: "TKT-" + Date.now(),
              purchaserName: "Test User",
              purchaserEmail: email,
              ticketType: "General Admission",
              qrCodeDataURL:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            },
          ],
          event: {
            name: "Test Event",
            description: "This is a test event for email verification",
            startDate: Date.now() + 86400000, // Tomorrow
            venue: "Test Venue, Test City",
          },
          purchaserEmail: email,
          transactionId: "TEST_TKT_" + Date.now(),
          confirmationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/tickets/confirmation/TEST_TKT_${Date.now()}`,
        };

        result = await emailService.sendTicketConfirmation(
          email,
          testTicketData
        );
        break;
      }

      case "password-reset": {
        result = await emailService.sendPasswordReset(email, {
          user: { name: "Test User", email },
          resetToken: "test_token_" + Date.now(),
          resetUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=test_token_${Date.now()}`,
        });
        break;
      }

      case "event-results": {
        result = await emailService.sendEventResults(email, {
          event: { name: "Test Event" },
          results: [
            {
              categoryName: "Best Performer",
              winner: { name: "John Doe" },
              voteCount: 150,
              percentage: 65.5,
            },
          ],
          totalVotes: 229,
        });
        break;
      }

      default: {
        result = await emailService.sendTestEmail(email);
        break;
      }
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test ${type || "vote"} email sent successfully`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
