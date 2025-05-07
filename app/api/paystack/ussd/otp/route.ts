import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { reference, otp } = await req.json();

    if (!reference || !otp) {
      return new NextResponse(
        JSON.stringify({ error: "Missing reference or OTP" }),
        { status: 400 }
      );
    }

    // Submit OTP to Paystack
    const response = await fetch("https://api.paystack.co/charge/submit_otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        otp,
        reference,
      }),
    });

    const data = await response.json();
    console.log('Paystack OTP response:', data);

    // Check for HTTP-level errors
    if (!response.ok) {
      console.error("Paystack OTP submission HTTP error:", response.status, data);
      return new NextResponse(
        JSON.stringify({ error: data.message || "OTP submission failed", details: data }),
        { status: response.status }
      );
    }

    // Check Paystack API status
    if (!data.status) {
      console.error("Paystack OTP submission error:", data);
      return new NextResponse(
        JSON.stringify({ error: data.message || "Failed to submit OTP", details: data }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        status: data.data.status,
        displayText: data.data.display_text,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Paystack OTP Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 