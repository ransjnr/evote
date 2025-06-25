import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const { tickets, event, purchaserEmail, transactionId } =
      await request.json();

    if (!tickets || !event || !purchaserEmail || !transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required data for email confirmation",
        },
        { status: 400 }
      );
    }

    // Import the email service
    const emailService = require("../../../mailer");

    // Generate QR codes for each ticket
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket: any) => {
        const qrData = JSON.stringify({
          ticketCode: ticket.ticketCode,
          eventId: event._id,
          eventName: event.name,
          purchaserName: ticket.purchaserName,
          purchaserEmail: ticket.purchaserEmail,
          transactionId: transactionId,
          timestamp: Date.now(),
          version: "2.0",
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });

        return {
          ...ticket,
          qrCodeDataURL,
        };
      })
    );

    // Generate confirmation page URL
    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/tickets/confirmation/${transactionId}`;

    // Prepare email data
    const emailData = {
      tickets: ticketsWithQR,
      event: {
        ...event,
        startDate: event.startDate,
        endDate: event.endDate,
      },
      purchaserEmail,
      transactionId,
      confirmationUrl,
    };

    // Send email using our enhanced email service
    const result = await emailService.sendTicketConfirmation(
      purchaserEmail,
      emailData
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Ticket confirmation email sent successfully",
        messageId: result.messageId,
        confirmationUrl,
        emailSent: true,
      });
    } else {
      console.error("Email sending failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send confirmation email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send confirmation email",
      },
      { status: 500 }
    );
  }
}
