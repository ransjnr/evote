import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('USSD init payload:', payload);
    const { sessionId, nomineeCode, voteCount, amount, phoneNumber, provider } = payload;

    if (!sessionId || !nomineeCode || !voteCount || !amount || !phoneNumber || !provider) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 }
      );
    }

    // Get the session to get the event ID
    const session = await convex.query(api.session.getVoteSession, { sessionId });
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Session not found" }),
        { status: 404 }
      );
    }

    // Initialize payment with Paystack
    const response = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to pesewas
        email: "ussd@evote.com", // Use a default email for USSD transactions
        currency: "GHS",
        channels: ["ussd"],
        mobile_money: {
          phone: phoneNumber,
          provider: provider // Use selected network provider
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/ussd/webhook`,
        metadata: {
          sessionId,
          nomineeCode,
          voteCount,
          paymentType: "mobile_money",
        },
      }),
    });

    const data = await response.json();
    console.log('Paystack response:', data);
    console.log('Paystack response status:', data.status);
    console.log('Paystack data status:', data.data?.status);
    console.log('Paystack display text:', data.data?.display_text);

    // Check for HTTP-level errors
    if (!response.ok) {
      console.error("Paystack USSD init HTTP error:", response.status, data);
      console.error("Error details:", data.message, data.errors);
      return new NextResponse(
        JSON.stringify({ error: data.message || "Initialization failed", details: data }),
        { status: response.status }
      );
    }

    // Check Paystack API status
    if (!data.status) {
      console.error("Paystack initialization error:", data);
      console.error("Error details:", data.message, data.errors);
      return new NextResponse(
        JSON.stringify({ error: data.message || "Failed to initialize payment", details: data }),
        { status: 400 }
      );
    }

    // Create initial payment record
    try {
      await convex.mutation(api.payments.createPayment, {
        transactionId: data.data.reference,
        amount: amount,
        voteCount: voteCount,
        status: "pending",
        eventId: session.eventId,
        paymentReference: data.data.reference,
        phoneNumber: phoneNumber,
        source: "ussd",
      });

      // Update session with payment reference and status
      await convex.mutation(api.session.updateVoteSession, {
        sessionId,
        paymentReference: data.data.reference,
        paymentStatus: "pending",
      });
    } catch (error) {
      console.error("Failed to create payment record:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to create payment record" }),
        { status: 500 }
      );
    }

    // Handle different response statuses
    if (data.data.status === "pay_offline") {
      // For MTN, AirtelTigo, etc.
      return new NextResponse(
        JSON.stringify({
          success: true,
          reference: data.data.reference,
          status: "pay_offline",
          displayText: data.data.display_text,
        }),
        { status: 200 }
      );
    } else if (data.data.status === "send_otp") {
      // For Vodafone
      return new NextResponse(
        JSON.stringify({
          success: true,
          reference: data.data.reference,
          status: "send_otp",
          displayText: data.data.display_text,
        }),
        { status: 200 }
      );
    } else if (data.data.status === "success") {
      // Payment was successful immediately
      return new NextResponse(
        JSON.stringify({
          success: true,
          reference: data.data.reference,
          status: "success",
        }),
        { status: 200 }
      );
    } else {
      // Handle other statuses
      return new NextResponse(
        JSON.stringify({
          success: true,
          reference: data.data.reference,
          status: data.data.status,
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Paystack Mobile Money Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 