import React from "react";
import { usePaystackPayment } from "./usePaystackPayment";

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
  onSuccess: (response: {
    reference: string;
    message: string;
    status: string;
  }) => void;
  onClose: () => void;
}

interface PaystackConsumerProps extends PaystackConfig {
  children: (props: { initializePayment: () => void }) => React.ReactNode;
}

export const PaystackConsumer: React.FC<PaystackConsumerProps> = ({
  children,
  onSuccess,
  onClose,
  ...config
}) => {
  const initializePayment = usePaystackPayment(config);

  const handleInitialize = () => {
    initializePayment(onSuccess, onClose);
  };

  return <>{children({ initializePayment: handleInitialize })}</>;
};

export default PaystackConsumer;
