import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with the Ghana Cedi symbol
 */
export function formatCurrency(amount: number): string {
  return `₵${amount.toFixed(2)}`;
}
