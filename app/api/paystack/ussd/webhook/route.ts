import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import crypto from "crypto";

// Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Secret key from Paystack Dashboard
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_HASH_HEADER = "x-paystack-signature";

// Define payment status type
type PaymentStatus = "pending" | "succeeded" | "failed";

export async function POST(req: Request) {
  try {
    // Get the raw request body as a string
    const rawBody = await req.text();
    
    // Get the signature from the header
    const signature = req.headers.get(PAYSTACK_HASH_HEADER);

    console.log('Webhook received:', {
      hasSignature: signature ? true : false,
      bodyLength: rawBody.length,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Verify the signature
    if (!signature) {
      console.error('Missing webhook signature');
      return new NextResponse("Missing signature", { status: 401 });
    }

    // Compute the hash using the raw request body
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    // Compare the computed hash with the signature from Paystack
    if (hash !== signature) {
      console.error('Invalid webhook signature:', {
        received: signature,
        calculated: hash,
        bodyLength: rawBody.length
      });
      return new NextResponse("Invalid signature", { status: 401 });
    }

    // Parse the event data
    const event = JSON.parse(rawBody);
    console.log('Webhook event:', event);

    if (event.event === "charge.success") {
      const { reference, metadata, customer } = event.data;
      console.log('Processing successful charge:', { reference, metadata, customer });

      const sessionId = metadata?.sessionId;
      const nomineeCode = metadata?.nomineeCode;
      const voteCount = metadata?.voteCount;
      const phoneNumber = customer?.phone || metadata?.phoneNumber;

      if (!sessionId || !nomineeCode || !voteCount) {
        console.error('Missing required metadata:', { sessionId, nomineeCode, voteCount });
        return new NextResponse("Missing required metadata", { status: 400 });
      }

      // Check if payment is already processed
      const existingPayment = await convex.query(api.payments.getPaymentByTransaction, { 
        transactionId: reference 
      });

      // If payment is already succeeded, just return success
      if (existingPayment?.status === "succeeded" as PaymentStatus) {
        console.log('Payment already processed:', reference);
        return new NextResponse("Payment already processed", { status: 200 });
      }

      try {
        // Get the session to verify it exists
        const session = await convex.query(api.session.getVoteSession, { sessionId });
        
        // Get nominee details
        const nominee = await convex.query(api.nominees.getNomineeByCode, { code: nomineeCode });
        if (!nominee) {
          console.error('Nominee not found:', nomineeCode);
          return new NextResponse("Nominee not found", { status: 404 });
        }

        // Update payment status to succeeded first
        try {
          await convex.mutation(api.payments.updatePaymentDetails, {
            transactionId: reference,
            phoneNumber: phoneNumber || "",
            nomineeId: nominee._id,
            status: "succeeded",
            source: "ussd",
          });
        } catch (error) {
          console.error("Failed to update payment details:", error);
          throw error;
        }

        // If session exists, update it
        if (session) {
          await convex.mutation(api.session.updateVoteSession, {
            sessionId,
            paymentReference: reference,
            paymentStatus: "paid",
          });
        }

        // Verify and record votes
        try {
          const result = await convex.mutation(api.voting.verifyPaymentByCode, {
            transactionId: reference,
            paymentReference: reference,
            nomineeCode,
            voteCount: parseInt(voteCount),
          });
          console.log("Vote verification result:", result);
          return new NextResponse("OK", { status: 200 });
        } catch (error) {
          // If we get a "Payment already processed" error, that's fine
          if (error instanceof Error && error.message.includes("Payment already processed")) {
            console.log('Payment already verified:', reference);
            return new NextResponse("Payment already verified", { status: 200 });
          }
          console.error('Error during vote verification:', error);
          throw error; // Re-throw if it's a different error
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        // Only update payment status to failed if it's not already succeeded
        if (existingPayment?.status !== "succeeded" as PaymentStatus) {
          try {
            await convex.mutation(api.payments.updatePaymentDetails, {
              transactionId: reference,
              phoneNumber: phoneNumber || "",
              status: "failed",
              source: "ussd",
            });
          } catch (error) {
            console.error("Failed to update payment status:", error);
            throw error;
          }
        }
        return new NextResponse("Error processing payment", { status: 500 });
      }
    } else if (event.event === "charge.failed") {
      const { reference, metadata, customer } = event.data;
      console.log('Processing failed charge:', { reference, metadata, customer });

      try {
        // Check if payment is already succeeded before marking as failed
        const existingPayment = await convex.query(api.payments.getPaymentByTransaction, { 
          transactionId: reference 
        });

        // Only update to failed if not already succeeded
        if (existingPayment?.status !== "succeeded" as PaymentStatus) {
          await convex.mutation(api.payments.updatePaymentDetails, {
            transactionId: reference,
            phoneNumber: customer?.phone || metadata?.phoneNumber || "",
            status: "failed",
            source: "ussd",
          });

          // If session exists, update its status to pending (since it failed)
          const sessionId = metadata?.sessionId;
          if (sessionId) {
            try {
              await convex.mutation(api.session.updateVoteSession, {
                sessionId,
                paymentStatus: "pending",
              });
            } catch (error) {
              console.error('Failed to update session status:', error);
            }
          }
        }

        console.log('Marked payment as failed:', { reference });
        return new NextResponse("OK", { status: 200 });
      } catch (error) {
        console.error('Error updating failed payment:', error);
        return new NextResponse("Error updating payment status", { status: 500 });
      }
    }

    console.log('Unhandled webhook event:', event.event);
    return new NextResponse("Unhandled event", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
