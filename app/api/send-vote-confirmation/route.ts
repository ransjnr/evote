import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🎯 Vote confirmation API called");

  try {
    const requestBody = await request.json();
    console.log(
      "📥 Request body received:",
      JSON.stringify(requestBody, null, 2)
    );

    const {
      email,
      nominee,
      event,
      voteCount,
      amount,
      transactionId,
      adminEmail,
    } = requestBody;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!nominee || !event || !transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required vote data" },
        { status: 400 }
      );
    }

    // Import the email service
    const emailService = require("../../../mailer");

    const voteData = {
      nominee,
      event,
      voteCount: voteCount || 1,
      amount: amount || 0,
      transactionId,
    };

    // Send confirmation email to voter
    console.log("📧 Calling emailService.sendVoteConfirmation with:", {
      email,
      voteData,
    });
    const voterResult = await emailService.sendVoteConfirmation(
      email,
      voteData
    );
    console.log("📧 Email service result:", voterResult);

    let adminResult = null;
    // Optionally send notification to admin
    if (adminEmail) {
      adminResult = await emailService.sendAdminVoteNotification(
        adminEmail,
        voteData
      );
    }

    if (voterResult.success) {
      return NextResponse.json({
        success: true,
        message: "Vote confirmation email sent successfully",
        voterEmail: {
          messageId: voterResult.messageId,
          recipient: voterResult.recipient,
        },
        adminEmail: adminResult
          ? {
              success: adminResult.success,
              messageId: adminResult.messageId,
              recipient: adminResult.recipient,
            }
          : null,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: voterResult.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in vote confirmation email API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send vote confirmation email",
      },
      { status: 500 }
    );
  }
}
