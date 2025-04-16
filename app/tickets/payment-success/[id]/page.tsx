import { PaymentSuccess } from "@/components/ticket/payment-success";
import { Container } from "@/components/ui/container";

interface PaymentSuccessPageProps {
  params: {
    id: string;
  };
}

export default function PaymentSuccessPage({
  params,
}: PaymentSuccessPageProps) {
  return (
    <Container className="py-10">
      <div className="max-w-xl mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Payment Successful</h1>
            <p className="text-muted-foreground">
              Your ticket has been confirmed and is ready for use.
            </p>
          </div>

          <PaymentSuccess reservationId={params.id} />

          <div className="text-center text-sm text-muted-foreground">
            <p>
              A copy of your ticket has been sent to your email. You can also
              access it anytime by visiting this page.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
