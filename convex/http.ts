import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";

const http = httpRouter();

// Ticket verification endpoint - Access a QR code data URL
http.route({
  path: "/verify-ticket/:reservationId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const reservationId = url.pathname.split("/").pop();

    if (!reservationId) {
      return new Response("Reservation ID is required", { status: 400 });
    }

    try {
      // Parse the reservation ID
      const reservationIdObj = await ctx.runQuery(
        internal.ticketReservations.parseReservationId,
        {
          reservationId: reservationId,
        }
      );

      // Get the QR code
      const qrCode = await ctx.runQuery(internal.qrcode.getTicketQRCode, {
        reservationId: reservationIdObj,
      });

      if (!qrCode) {
        return new Response("QR code not found", { status: 404 });
      }

      // Generate a data URL for the QR code
      const dataURL = await ctx.runAction(
        internal.qrcode.generateQRCodeDataURL,
        {
          data: qrCode.qrCodeData,
        }
      );

      return new Response(dataURL, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      console.error("Error retrieving QR code:", error);
      return new Response("Error retrieving QR code", { status: 500 });
    }
  }),
});

// Verify a ticket by scanning its QR code
http.route({
  path: "/scan-ticket",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { qrData, eventId, adminId } = body;

    if (!qrData || !eventId || !adminId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      // Parse the QR data
      const parsedData = JSON.parse(qrData);

      // Call the check-in function
      const result = await ctx.runMutation(
        internal.ticketReservations.checkInTicket,
        {
          ticketCode: parsedData.reservationId,
          eventId: eventId,
          adminId: adminId,
        }
      );

      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error scanning ticket:", error);
      return new Response(JSON.stringify({ error: "Error scanning ticket" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
