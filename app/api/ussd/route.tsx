"use client";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convexClient";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const sessionId = params.get("sessionId") || "";
    const phoneNumber = params.get("phoneNumber") || "";
    const text = params.get("text") || "";

    let response = "";
    const input = text.split("*");

    if (text === "") {
      response = "CON Welcome to eVote\n1. Vote\n2. eTicket\n3. Help";
    } else if (input[0] === "1") {
      switch (input.length) {
        case 1:
          response = "CON Enter the unique code of your nominee:";
          break;
        case 2: {
          const nomineeCode = input[1];
          try {
            const nominee = await queryGeneric(
              api.nominees.getNomineeByCode,
              {
                code: nomineeCode,
              },
              convexClient
            );

            response = `CON Nominee: ${nominee.name}\nCode: ${nominee.code}\nPress 1 to proceed or 0 to cancel`;
          } catch (err) {
            console.error("Nominee fetch error:", err);
            response = "END Nominee not found. Please try again.";
          }
          break;
        }
        case 3:
          if (input[2] === "1") {
            response = "CON Enter number of votes:";
          } else {
            response = "END Voting cancelled.";
          }
          break;
        case 4: {
          const numVotes = parseInt(input[3]);
          const costPerVote = 5;
          const total = numVotes * costPerVote;
          response = `CON Total cost is KES ${total}\nPress 1 to confirm payment`;
          break;
        }
        case 5:
          if (input[4] === "1") {
            response =
              "END Thank you for voting! Your payment will be processed.";
          } else {
            response = "END Payment not confirmed.";
          }
          break;
        default:
          response = "END Invalid input.";
      }
    } else if (input[0] === "2") {
      response = "END eTicket coming soon!";
    } else if (input[0] === "3") {
      response = "END Contact support at help@example.com";
    } else {
      response = "END Invalid option selected.";
    }

    return new NextResponse(response, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("USSD Error:", error);
    return new NextResponse(
      "END Service unavailable. Please try again later.",
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }
}

// // Reject all other methods
// export async function GET() {
//   return new NextResponse("Method not allowed", { status: 405 });
// }
