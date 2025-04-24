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

            // Store session data
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

          // Store vote count in session
          await convexClient.mutation(api.session.updateVoteSession, {
            sessionId,
            voteCount: numVotes,
          });

          response = `CON Total cost is GHC ${total}

Select your network:
1. MTN
2. Vodafone
3. AirtelTigo`;
          break;
        }
        case 5: {
          const networkChoice = input[4];
          let provider;

          switch (networkChoice) {
            case "1":
              provider = "mtn";
              break;
            case "2":
              provider = "vod";
              break;
            case "3":
              provider = "tgo";
              break;
            default:
              response = "END Invalid network selected. Please try again.";
              return;
          }

          const session = await convexClient.query(api.session.getVoteSession, {
            sessionId,
          });

          if (!session) {
            response = "END Session expired. Please start again.";
            break;
          }

          // Initialize Paystack payment
          const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/ussd`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
              nomineeCode: session.nomineeCode,
              voteCount: session.voteCount,
              amount: session.votePrice * session.voteCount,
              phoneNumber,
              provider,
            }),
          });

          const paymentData = await paymentResponse.json();

          if (!paymentData.success) {
            console.error("Payment initialization failed:", paymentData);
            response = "END Payment initialization failed. Please try again.";
            break;
          }

          // Store payment reference
          await convexClient.mutation(api.session.updateVoteSession, {
            sessionId,
            paymentReference: paymentData.reference,
          });

          response = "END Payment initiated. Please check your phone to approve the payment.";
          break;
        }
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
