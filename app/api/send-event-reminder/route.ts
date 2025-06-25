import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, eventData } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    // Import the email service (server-side only)
    const emailService = require("@/mailer");

    // Default event data if not provided
    const defaultEventData = {
      event: {
        name: "Test Event 2024",
        description: "This is a test event for demonstration purposes.",
        startDate: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        endDate: Date.now() + 48 * 60 * 60 * 1000, // 48 hours from now
        venue: "Test Venue Hall",
      },
      userEmail: email,
      reminderType: "starts",
      ...eventData, // Override with provided data
    };

    // Send event reminder email
    const result = await emailService.sendEventReminder(
      email,
      defaultEventData
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Event reminder email sent successfully",
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
    console.error("Error in event reminder email API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send event reminder email",
      },
      { status: 500 }
    );
  }
}
