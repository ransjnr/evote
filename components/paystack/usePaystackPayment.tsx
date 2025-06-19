import { useCallback } from "react";
import { toast } from "sonner";

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

interface PaystackResponse {
  reference: string;
  message: string;
  status: string;
}

type PaystackSuccessCallback = (response: PaystackResponse) => void;
type PaystackCloseCallback = () => void;

export const usePaystackPayment = (config: PaystackConfig) => {
  const initializePayment = useCallback(
    async (
      onSuccess: PaystackSuccessCallback,
      onClose?: PaystackCloseCallback
    ) => {
      try {
        // Dynamically import PaystackPop to avoid SSR issues
        const PaystackPop = await import("@paystack/inline-js");
        const paystack = new PaystackPop.default();

        paystack.newTransaction({
          key: config.publicKey,
          email: config.email,
          amount: config.amount,
          currency: config.currency || "GHS",
          ref:
            config.reference ||
            `payment_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          metadata: config.metadata || {},
          callback: (response: any) => {
            onSuccess({
              reference: response.reference || response.trxref,
              message: response.message || "Payment successful",
              status: response.status || "success",
            });
          },
          onClose: () => {
            if (onClose) onClose();
          },
          onError: (error: any) => {
            console.error("Paystack error:", error);
            toast.error("Payment failed. Please try again.");
            if (onClose) onClose();
          },
        });
      } catch (error) {
        console.error("Failed to load Paystack:", error);
        toast.error(
          "Payment provider could not be loaded. Please try again later."
        );
      }
    },
    [config]
  );

  return initializePayment;
};

export default usePaystackPayment;
