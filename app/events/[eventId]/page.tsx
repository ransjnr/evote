"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/ui/footer";
import { NomineeCard, NomineeCardSkeleton } from "@/components/ui/nominee-card";
import { Check, ThumbsUp } from "lucide-react";
import confetti from "canvas-confetti";

// Define error type
interface ConvexError {
  message: string;
}

// Define types for payment handling
interface PaymentMetadata {
  eventName: string;
  nomineeName: string;
  categoryName: string;
  voteCount?: number;
}

interface PaymentProps {
  amount: number;
  email?: string;
  metadata: PaymentMetadata;
  onSuccess: (response: { reference: string }) => void;
  onClose: () => void;
}

interface PaymentResponse {
  reference: string;
}

interface NomineeType {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryId: string;
}

interface CategoryType {
  _id: string;
  name: string;
  description?: string;
  eventId: string;
  type: "popular_vote" | "judge_vote";
}

// Real Paystack implementation
const PaystackCheckout = ({
  amount,
  email = "",
  metadata,
  onSuccess,
  onClose,
}: PaymentProps) => {
  const [userEmail, setUserEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Validate email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(userEmail));
  }, [userEmail]);

  // Initialize Paystack
  const initializePayment = () => {
    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Convert amount to kobo (pesewas) for Paystack (multiply by 100)
    const amountInKobo = Math.round(amount * 100);

    // Load Paystack dynamically to avoid SSR issues
    import("@paystack/inline-js")
      .then((PaystackPop) => {
        const paystack = new PaystackPop.default();
        paystack.newTransaction({
          key:
            process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
            "pk_test_yourkeyhere", // Replace with your Paystack public key
          email: userEmail,
          amount: amountInKobo,
          currency: "GHS",
          ref: `vote_ref_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          metadata: {
            custom_fields: [
              {
                display_name: "Event Name",
                variable_name: "event_name",
                value: metadata.eventName,
              },
              {
                display_name: "Nominee Name",
                variable_name: "nominee_name",
                value: metadata.nomineeName,
              },
              {
                display_name: "Vote Count",
                variable_name: "vote_count",
                value: metadata.voteCount || 1,
              },
            ],
          },
          callback: (response: PaymentResponse) => {
            onSuccess(response);
          },
          onClose: () => {
            onClose();
          },
        });
      })
      .catch((error) => {
        console.error("Failed to load Paystack:", error);
        toast.error(
          "Payment provider could not be loaded. Please try again later."
        );
      });
  };

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md">
        <h3 className="text-lg font-medium mb-4">Payment Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-bold">₵{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Votes:</span>
            <span>
              {metadata.voteCount || 1} vote
              {(metadata.voteCount || 1) > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Event:</span>
            <span>{metadata.eventName}</span>
          </div>
          <div className="flex justify-between">
            <span>Nominee:</span>
            <span>{metadata.nomineeName}</span>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your receipt will be sent to this email
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={initializePayment}
          className="flex-1"
          disabled={!isEmailValid}
        >
          Pay with Paystack
        </Button>
      </div>
    </div>
  );
};

export default function EventPage() {
  const router = useRouter();
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedNominee, setSelectedNominee] = useState<NomineeType | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [voteCastCount, setVoteCastCount] = useState(0);

  // Get event details
  const event = useQuery(
    api.events.getEvent,
    eventId ? { eventId: eventId as string } : "skip"
  );

  // Determine event status
  const getEventStatus = (event: any) => {
    if (!event) return "loading";

    const now = Date.now();
    if (now > event.endDate) {
      return "ended";
    } else if (now >= event.startDate && now <= event.endDate) {
      return "running";
    } else {
      return "upcoming";
    }
  };

  const eventStatus = event ? getEventStatus(event) : "loading";

  // Get event categories
  const categories =
    useQuery(
      api.categories.listCategoriesByEvent,
      eventId ? { eventId: eventId as string } : "skip"
    ) || [];

  // Set first category as active when data loads
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]._id);
    }
  }, [categories, activeTab]);

  // Get nominees for the active category
  const nominees =
    useQuery(
      api.nominees.listNomineesByCategory,
      activeTab ? { categoryId: activeTab } : "skip"
    ) || [];

  // Loading state for nominees
  const isLoadingNominees =
    nominees.length === 0 &&
    activeTab &&
    !categories.find((c) => c._id === activeTab)?.type;

  // Initialize payment and verify payment mutations
  const initializePayment = useMutation(api.voting.initializePayment);
  const verifyPayment = useMutation(api.voting.verifyPayment);

  // State for vote count
  const [voteCount, setVoteCount] = useState(1);

  // Calculate total price based on vote count
  const totalPrice = useMemo(() => {
    return event ? event.votePrice * voteCount : 0;
  }, [event, voteCount]);

  // Trigger confetti effect when success modal is opened
  useEffect(() => {
    if (isSuccessModalOpen) {
      // Create confetti effect
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [isSuccessModalOpen]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading event details...</p>
      </div>
    );
  }

  const handleVoteClick = async (
    nominee: NomineeType,
    category: CategoryType
  ) => {
    // Don't allow voting if event has ended
    if (eventStatus === "ended") {
      toast.error("This event has ended. Voting is no longer available.");
      return;
    }

    // Don't allow voting if event hasn't started
    if (eventStatus === "upcoming") {
      toast.error(
        "This event hasn't started yet. Please check back during the event period."
      );
      return;
    }

    setSelectedNominee(nominee);
    setSelectedCategory(category);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (response: PaymentResponse) => {
    if (!selectedNominee || !selectedCategory || !event) return;

    setIsVoting(true);

    try {
      // Initialize the payment
      const initResult = await initializePayment({
        nomineeId: selectedNominee._id,
        categoryId: selectedCategory._id,
        eventId: event._id,
        voteCount: voteCount, // Pass the selected vote count
      });

      if (initResult.success) {
        // Get the vote count from the result or fall back to our UI value
        const finalVoteCount = initResult.payment.voteCount || voteCount;

        // Verify the payment
        const verifyResult = await verifyPayment({
          transactionId: initResult.payment.transactionId,
          paymentReference: response.reference,
          nomineeId: selectedNominee._id,
          categoryId: selectedCategory._id,
          eventId: event._id,
          voteCount: finalVoteCount, // Use the vote count from the transaction
        });

        if (verifyResult.success) {
          // Reset vote count for next transaction
          setVoteCount(1);
          // Use the total votes from the result or fall back to our value
          const displayVotes = verifyResult.totalVotes || finalVoteCount;

          // Close payment dialog
          setIsPaymentOpen(false);

          // Store vote count for success modal
          setVoteCastCount(displayVotes);

          // Show success modal instead of toast
          setIsSuccessModalOpen(true);
        }
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Failed to process your vote");
    } finally {
      setIsVoting(false);
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "running":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b py-4 px-6 bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            eVote
          </Link>
          <div className="space-x-4">
            <Link href="/events">
              <Button variant="outline">Back to Events</Button>
            </Link>
            <Link href="/admin/login">
              <Button>Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Event Hero */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {event.name}
            </h1>
            <div
              className={`px-3 py-1 rounded text-sm ${
                eventStatus === "upcoming"
                  ? "bg-blue-700 text-white"
                  : eventStatus === "running"
                    ? "bg-green-700 text-white"
                    : "bg-gray-700 text-white"
              }`}
            >
              {eventStatus === "upcoming"
                ? "Upcoming"
                : eventStatus === "running"
                  ? "Running"
                  : "Ended"}
            </div>
          </div>
          <p className="text-lg mb-4 max-w-3xl">
            {event.description ||
              "Vote for your favorite nominees in this exciting event!"}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm">
              {new Date(event.startDate).toLocaleDateString()} -{" "}
              {new Date(event.endDate).toLocaleDateString()}
            </div>
            <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm">
              Vote Price: ₵{event.votePrice.toFixed(2)}
            </div>
          </div>

          {eventStatus === "ended" && (
            <div className="mt-6 bg-red-500/20 text-white p-4 rounded-md">
              This event has ended. Voting is no longer available.
            </div>
          )}

          {eventStatus === "upcoming" && (
            <div className="mt-6 bg-blue-500/20 text-white p-4 rounded-md">
              This event hasn't started yet. Voting will be available during the
              event period.
            </div>
          )}
        </div>
      </div>

      {/* Categories and Nominees */}
      <main className="flex-1 container mx-auto py-12 px-6">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No categories available
            </h3>
            <p className="text-gray-500 mb-8">
              This event doesn&apos;t have any voting categories yet.
            </p>
            <Link href="/events">
              <Button>Browse Other Events</Button>
            </Link>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="flex flex-wrap justify-start mb-2">
              {categories.map((category) => (
                <TabsTrigger
                  key={category._id}
                  value={category._id}
                  className="text-sm md:text-base"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent
                key={category._id}
                value={category._id}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                  <p className="text-gray-600">
                    {category.description ||
                      "Vote for your favorite nominee in this category."}
                  </p>
                </div>

                {nominees.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    {isLoadingNominees ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                          <NomineeCardSkeleton key={index} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No nominees available for this category.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {nominees.map((nominee) => (
                      <NomineeCard
                        key={nominee._id}
                        nominee={{
                          id: nominee._id,
                          name: nominee.name,
                          description: nominee.description,
                          image: nominee.imageUrl,
                        }}
                        eventStatus={eventStatus}
                        votePrice={event.votePrice}
                        onVoteClick={(nomineeId) =>
                          handleVoteClick(
                            nominees.find((n) => n._id === nomineeId)!,
                            category
                          )
                        }
                        isVoting={
                          isVoting && selectedNominee?._id === nominee._id
                        }
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Vote</DialogTitle>
            <DialogDescription>
              Make a payment to cast your vote{voteCount > 1 ? "s" : ""} for{" "}
              {selectedNominee?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedNominee && selectedCategory && event && (
            <>
              <div className="space-y-4 py-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="voteCount">Number of Votes</Label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
                      disabled={voteCount <= 1}
                      className="rounded-r-none"
                    >
                      -
                    </Button>
                    <Input
                      id="voteCount"
                      type="number"
                      min="1"
                      max="100"
                      value={voteCount}
                      onChange={(e) =>
                        setVoteCount(
                          Math.min(
                            100,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="w-16 text-center mx-0 rounded-none"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVoteCount(Math.min(100, voteCount + 1))}
                      disabled={voteCount >= 100}
                      className="rounded-l-none"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between font-medium">
                    <span>Price per vote:</span>
                    <span>₵{event.votePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium mt-1">
                    <span>Number of votes:</span>
                    <span>{voteCount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                    <span>Total amount:</span>
                    <span>₵{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <PaystackCheckout
                amount={totalPrice}
                metadata={{
                  eventName: event.name,
                  nomineeName: selectedNominee.name,
                  categoryName: selectedCategory.name,
                  voteCount: voteCount,
                }}
                onSuccess={handlePaymentSuccess}
                onClose={() => setIsPaymentOpen(false)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">
              Vote Successful!
            </DialogTitle>
            <DialogDescription className="mb-6">
              Your {voteCastCount} vote{voteCastCount > 1 ? "s have" : " has"}{" "}
              been successfully cast for{" "}
              <span className="font-semibold">{selectedNominee?.name}</span>.
            </DialogDescription>

            <div className="bg-muted p-4 rounded-md w-full mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Nominee:</span>
                <span className="text-sm font-medium">
                  {selectedNominee?.name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Category:</span>
                <span className="text-sm font-medium">
                  {selectedCategory?.name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Event:</span>
                <span className="text-sm font-medium">{event.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="text-sm font-medium">Total votes:</span>
                <span className="text-sm font-bold">{voteCastCount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Continue Voting
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  router.push("/events");
                }}
              >
                <ThumbsUp className="h-4 w-4" />
                Finish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
}
