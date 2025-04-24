import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
            const nominee = await convexClient.query(
              api.nominees.getNomineeByCode,
              {
                code: nomineeCode,
              }
            );
            const category = await convexClient.query(
              api.categories.getCategory,
              {
                categoryId: nominee.categoryId,
              }
            );
            const event = await convexClient.query(api.events.getEvent, {
              eventId: category.eventId,
            });

            // Store session data (sessionId is unique per request from telco)
            await convexClient.mutation(api.session.storeVoteSession, {
              sessionId,
              eventId: event._id,
              votePrice: event.votePrice,
              nomineeCode: nomineeCode,
            });

            response = `CON ${event.name}\nNominee: ${nominee.name}\nCode: ${nominee.code}\nCategory: ${category.name}\n1. Proceed\n0. Cancel`;
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
          if (isNaN(numVotes) || numVotes <= 0) {
            response = "END Invalid number of votes. Please try again.";
            break;
          }

          const session = await convexClient.query(api.session.getVoteSession, {
            sessionId,
          });

          if (!session) {
            response = "END Voting session expired. Please start again.";
            break;
          }

          const total = (numVotes * session.votePrice).toFixed(2);

          // Initialize Paystack USSD payment
          const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/ussd`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
              nomineeCode: session.nomineeCode,
              voteCount: numVotes,
              amount: parseFloat(total),
            }),
          });

          const paymentData = await paymentResponse.json();

          if (!paymentData.success) {
            console.error("Payment initialization failed:", paymentData);
            response = "END Payment initialization failed. Please try again.";
            break;
          }

          // Store the payment reference in the session
          await convexClient.mutation(api.session.updateVoteSession, {
            sessionId,
            paymentReference: paymentData.reference,
          });

          response = `CON Total cost is GHC ${total}\nPress 1 to confirm payment\n\nYou will receive a USSD prompt to complete your payment.`;
          break;
        }
        case 5:
          if (input[4] === "1") {
            const session = await convexClient.query(api.session.getVoteSession, {
              sessionId,
            });

            if (!session || !session.paymentReference) {
              response = "END Payment session expired. Please start again.";
              break;
            }

            response = "END Please follow the USSD prompt to complete your payment. You will receive a confirmation message once the payment is successful.";
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
// export async function GET() {
//   return new NextResponse("Method not allowed", { status: 405 });
// }
