// Generate a unique ticket code
export function generateTicketCode(): string {
  const prefix = "TKT";
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random 6 chars
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Validates a ticket code format
 * @param code The ticket code to validate
 * @returns boolean indicating if the code format is valid
 */
export function isValidTicketCode(code: string): boolean {
  const pattern = /^[23456789A-HJ-NP-Z]{4}-[23456789A-HJ-NP-Z]{4}-[23456789A-HJ-NP-Z]{4}$/;
  return pattern.test(code);
}

// Validate ticket code format
export function isValidTicketCodeFormat(code: string): boolean {
  const ticketCodeRegex = /^TKT-\d{6}-[A-Z0-9]{6}$/;
  return ticketCodeRegex.test(code);
}

// Format ticket price
export function formatTicketPrice(price: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(price);
}

// Calculate total ticket price
export function calculateTotalPrice(price: number, quantity: number): number {
  return price * quantity;
}

// Generate QR code data for ticket
export function generateQRCodeData(ticketCode: string, eventId: string): string {
  return JSON.stringify({
    ticketCode,
    eventId,
    timestamp: Date.now(),
  });
}

// Parse QR code data
export function parseQRCodeData(qrData: string): {
  ticketCode: string;
  eventId: string;
  timestamp: number;
} | null {
  try {
    const parsed = JSON.parse(qrData);
    if (parsed.ticketCode && parsed.eventId && parsed.timestamp) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
} 