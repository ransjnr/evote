import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import crypto from "crypto";

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Secret key from Paystack Dashboard
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_HASH_HEADER = "x-paystack-signature";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get(PAYSTACK_HASH_HEADER);

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;

      const sessionId = metadata?.sessionId;

      if (!sessionId) {
        return new NextResponse("Missing session ID", { status: 400 });
      }

      // Update vote session with payment status
      await convex.mutation(api.session.updateVoteSession, {
        sessionId,
        paymentReference: reference,
        paymentStatus: "paid",
      });

      return new NextResponse("OK", { status: 200 });
    }

    return new NextResponse("Unhandled event", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
