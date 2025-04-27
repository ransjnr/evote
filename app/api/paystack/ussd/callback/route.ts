import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, phone, amount, provider } = body;

  try {
    const response = await axios.post("https://api.paystack.co/charge", {
      email,
      amount: parseInt(amount) * 100,
      currency: "GHS",
      mobile_money: { phone, provider },
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(response.data.data);
  } catch (error: any) {
    return NextResponse.json({ error: "Charge failed", details: error.message }, { status: 500 });
  }
}
