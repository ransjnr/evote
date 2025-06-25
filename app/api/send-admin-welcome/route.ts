import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, adminData } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    // Import the email service (server-side only)
    const emailService = require("@/mailer");

    // Default admin data if not provided
    const defaultAdminData = {
      admin: {
        name: "Test Admin",
        email: email,
        role: "department_admin",
      },
      department: {
        name: "Test Department",
      },
      tempPassword: "TempPass123!",
      ...adminData, // Override with provided data
    };

    // Send admin welcome email
    const result = await emailService.sendAdminWelcome(email, defaultAdminData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Admin welcome email sent successfully",
        messageId: result.messageId,
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
    console.error("Error in admin welcome email API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send admin welcome email",
      },
      { status: 500 }
    );
  }
}
