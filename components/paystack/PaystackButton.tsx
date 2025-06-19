import React, { useCallback } from "react";
import { toast } from "sonner";

interface PaystackButtonProps {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  text?: string;
  onSuccess: (response: {
    reference: string;
    message: string;
    status: string;
  }) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({
  publicKey,
  email,
  amount,
  currency = "GHS",
  reference,
  text = "Pay Now",
  onSuccess,
  onClose,
  metadata = {},
  className = "",
  disabled = false,
  children,
}) => {
  const initializePayment = useCallback(async () => {
    if (disabled) return;

    try {
      // Dynamically import PaystackPop to avoid SSR issues
      const PaystackPop = await import("@paystack/inline-js");
      const paystack = new PaystackPop.default();

      paystack.newTransaction({
        key: publicKey,
        email,
        amount,
        currency,
        ref: reference,
        metadata,
        callback: (response: any) => {
          onSuccess({
            reference: response.reference || response.trxref,
            message: response.message || "Payment successful",
            status: response.status || "success",
          });
        },
        onClose: () => {
          onClose();
        },
        onError: (error: any) => {
          console.error("Paystack error:", error);
          toast.error("Payment failed. Please try again.");
          onClose();
        },
      });
    } catch (error) {
      console.error("Failed to load Paystack:", error);
      toast.error(
        "Payment provider could not be loaded. Please try again later."
      );
    }
  }, [
    publicKey,
    email,
    amount,
    currency,
    reference,
    metadata,
    onSuccess,
    onClose,
    disabled,
  ]);

  if (children) {
    return (
      <div
        onClick={initializePayment}
        className={className}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={initializePayment}
      className={className}
      disabled={disabled}
      type="button"
    >
      {text}
    </button>
  );
};

export default PaystackButton;
