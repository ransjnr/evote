import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

// Email configuration
const transporter = nodemailer.createTransporter({
  service: "gmail", // You can change this to your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { tickets, event, purchaserEmail, transactionId } =
      await request.json();

    // Generate QR codes for each ticket
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket: any) => {
        const qrData = JSON.stringify({
          ticketCode: ticket.ticketCode,
          eventId: event._id,
          eventName: event.name,
          purchaserName: ticket.purchaserName,
          timestamp: Date.now(),
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        return {
          ...ticket,
          qrCodeDataURL,
        };
      })
    );

    // Generate email HTML
    const emailHTML = generateEmailHTML(ticketsWithQR, event, transactionId);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: purchaserEmail,
      subject: `🎫 Your tickets for ${event.name} - Confirmation`,
      html: emailHTML,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent successfully",
    });
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

function generateEmailHTML(tickets: any[], event: any, transactionId: string) {
  const ticketRows = tickets
    .map(
      (ticket) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: center;">
        <div style="font-weight: bold; margin-bottom: 8px;">
          Ticket Code: ${ticket.ticketCode}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>${ticket.purchaserName}</strong>
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          ${ticket.purchaserEmail}
        </div>
      </td>
      <td style="padding: 12px; text-align: center;">
        <img src="${ticket.qrCodeDataURL}" alt="QR Code" style="width: 100px; height: 100px;" />
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          Scan to verify
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎫 Ticket Confirmation</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your tickets are ready!</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Event Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 20px;">${event.name}</h3>
            ${event.description ? `<p style="margin: 0 0 15px 0; color: #6b7280;">${event.description}</p>` : ""}
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
              <div style="display: flex; align-items: center; gap: 5px;">
                <span style="color: #667eea;">📅</span>
                <span>${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}</span>
              </div>
              ${
                event.venue
                  ? `
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="color: #667eea;">📍</span>
                  <span>${event.venue}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Your Tickets</h2>
          <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Ticket Details</th>
                  <th style="padding: 12px; text-align: center; font-weight: bold; color: #374151;">QR Code</th>
                </tr>
              </thead>
              <tbody>
                ${ticketRows}
              </tbody>
            </table>
          </div>
        </div>

        <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af; display: flex; align-items: center; gap: 8px;">
            <span>ℹ️</span> Important Information
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
            <li>Please save this email and keep your ticket codes safe</li>
            <li>Present your QR code at the event for quick check-in</li>
            <li>Each ticket code is unique and can only be used once</li>
            <li>Contact support if you have any issues</li>
          </ul>
        </div>

        <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 20px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Transaction Details</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Transaction ID: <strong>${transactionId}</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
            Purchase Date: ${new Date().toLocaleDateString()}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Need help? Contact us at <a href="mailto:support@evote.com" style="color: #667eea;">support@evote.com</a>
          </p>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
