import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { sessionId, nomineeCode, voteCount, amount, phoneNumber } = await req.json();

    if (!sessionId || !nomineeCode || !voteCount || !amount || !phoneNumber) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 }
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
        channels: ["mobile_money"],
        mobile_money: {
          phone: phoneNumber,
          provider: "mtn" // Default to MTN as it's most common in Ghana
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/ussd/callback`,
        metadata: {
          sessionId,
          nomineeCode,
          voteCount,
          paymentType: "mobile_money",
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("Paystack initialization error:", data);
      return new NextResponse(
        JSON.stringify({ error: "Failed to initialize payment" }),
        { status: 400 }
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