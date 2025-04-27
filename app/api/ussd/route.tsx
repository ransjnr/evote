import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import axios from "axios";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const sessionId = params.get("sessionId") || "";
    const phoneNumber = params.get("phoneNumber") || "";
    const text = params.get("text") || "";

    if (!sessionId || !phoneNumber) {
      return new NextResponse("END Missing session or phone number.", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

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
              { code: nomineeCode }
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

            await convexClient.mutation(api.session.storeVoteSession, {
              sessionId,
              eventId: event._id,
              nomineeCode: nominee.code,
              votePrice: event.votePrice,
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

          await convexClient.mutation(api.session.updateVoteSession, {
            sessionId,
            voteCount: numVotes,
          });

          const total = (numVotes * session.votePrice).toFixed(2);
          response = `CON Total cost is GHC ${total}\n1. Continue to payment\n0. Cancel`;
          break;
        }

        case 5:
          if (input[4] === "1") {
            response =
              "CON Select Network:\n1. MTN\n2. Airtel/Tigo\n3. Vodafone";
          } else {
            response = "END Payment not confirmed.";
          }
          break;

        case 6: {
          const providerMap: Record<string, string> = {
            "1": "mtn",
            "2": "atl",
            "3": "vod",
          };
          const provider = providerMap[input[5]];

          if (!provider) {
            response = "END Invalid network provider. Please try again.";
            break;
          }

          const session = await convexClient.query(api.session.getVoteSession, {
            sessionId,
          });

          if (!session) {
            response = "END Session expired. Please try again.";
            break;
          }

          const totalCost = (session.voteCount * session.votePrice).toFixed(2);

          try {
            const payRes = await axios.post(
              `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,
              {
                email: "elikwaku37@gmail.com",
                // email: `${phoneNumber}@paynow.com`,
                phone: phoneNumber,
                amount: totalCost,
                provider,
                metadata: { sessionId },
              }
            );

            await convexClient.mutation(api.session.updateVoteSession, {
              sessionId,
              paymentStatus: "pending",
            });

            if (payRes.data.display_text) {
              response = `END ${payRes.data.display_text}`;
            } else {
              response = `END Payment initiated`;
            }
          } catch (e) {
            console.error("Payment initiation error:", e);
            response = `END Failed to initiate payment`;
          }

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
      headers: { "Content-Type": "text/plain" },
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
