import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";

// Create a Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const reservationId = params.id;

  if (!reservationId) {
    return new NextResponse("Reservation ID is required", { status: 400 });
  }

  try {
    // Call the Convex HTTP endpoint to get the QR code
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CONVEX_URL}/verify-ticket/${reservationId}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error fetching QR code:", errorText);
      return new NextResponse("Failed to retrieve QR code from Convex", {
        status: response.status,
      });
    }

    // Return the QR code data URL
    const qrCodeData = await response.text();

    return new NextResponse(qrCodeData, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error in QR code proxy:", error);
    return new NextResponse("Error retrieving QR code", { status: 500 });
  }
}
