import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Verify the payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${data.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verificationData = await response.json();

    if (!verificationData.status || verificationData.data.status !== "success") {
      return new NextResponse(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400 }
      );
    }

    const { sessionId, nomineeCode, voteCount } = verificationData.data.metadata;

    // Verify and record the payment
    const result = await convexClient.mutation(api.voting.verifyPaymentByCode, {
      transactionId: data.reference,
      paymentReference: data.reference,
      nomineeCode,
      voteCount: parseInt(voteCount),
    });

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to record payment" }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Payment processed successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Paystack USSD Callback Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 