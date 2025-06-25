import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🏆 Event results email API called");

  try {
    const requestBody = await request.json();
    console.log("📥 Request body received:", JSON.stringify(requestBody, null, 2));

    const { emails, event, categories, winners, totalVotes } = requestBody;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "Email list is required" },
        { status: 400 }
      );
    }

    if (!event || !categories || !winners) {
      return NextResponse.json(
        { success: false, error: "Event data is required" },
        { status: 400 }
      );
    }

    // Import the email service
    const emailService = require("../../../mailer");

    const resultsData = {
      event,
      categories,
      winners,
      totalVotes: totalVotes || 0,
    };

    const results = [];

    // Send emails to all recipients
    for (const email of emails) {
      console.log(`📧 Sending event results to: ${email}`);
      try {
        const result = await emailService.sendEventResults(email, resultsData);
        results.push({
          email,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });
        console.log(`✅ Email sent to ${email}:`, result);
      } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
        results.push({
          email,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Event results sent: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: emails.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error("Error in event results email API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send event results emails",
      },
      { status: 500 }
    );
  }
} 