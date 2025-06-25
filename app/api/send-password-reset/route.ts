import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🔐 Password reset email API called");

  try {
    const requestBody = await request.json();
    console.log("📥 Request body received:", JSON.stringify(requestBody, null, 2));

    const { email, user, resetToken, resetUrl } = requestBody;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!resetUrl) {
      return NextResponse.json(
        { success: false, error: "Reset URL is required" },
        { status: 400 }
      );
    }

    // Import the email service
    const emailService = require("../../../mailer");

    const resetData = {
      user: user || { email },
      resetToken,
      resetUrl,
    };

    // Send password reset email
    console.log("📧 Calling emailService.sendPasswordReset with:", { email, resetData });
    const result = await emailService.sendPasswordReset(email, resetData);
    console.log("📧 Email service result:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Password reset email sent successfully",
        messageId: result.messageId,
        recipient: result.recipient,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in password reset email API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send password reset email",
      },
      { status: 500 }
    );
  }
} 