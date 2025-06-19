/**
 * Ticket utility functions for eVote ticketing system
 */

// Generate a 16-digit ticket code
export function generateTicketCode(): string {
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// Format ticket price for display
export function formatTicketPrice(price: number): string {
  return `₵${price.toFixed(2)}`;
}

// Calculate total price with potential fees
export function calculateTotalPrice(
  basePrice: number,
  quantity: number,
  fees: number = 0
): number {
  return basePrice * quantity + fees;
}

// Generate QR code data for ticket
export function generateQRCodeData(
  ticketCode: string,
  eventId: string,
  eventName: string,
  purchaserName: string
): string {
  return JSON.stringify({
    ticketCode,
    eventId,
    eventName,
    purchaserName,
    timestamp: Date.now(),
    version: "1.0", // For future compatibility
  });
}

// Parse QR code data
export function parseQRCodeData(qrData: string): {
  ticketCode: string;
  eventId: string;
  eventName: string;
  purchaserName: string;
  timestamp: number;
  version?: string;
} | null {
  try {
    const parsed = JSON.parse(qrData);
    if (
      parsed.ticketCode &&
      parsed.eventId &&
      parsed.eventName &&
      parsed.purchaserName &&
      parsed.timestamp
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// Validate ticket code format (16 digits)
export function isValidTicketCode(code: string): boolean {
  return /^\d{16}$/.test(code);
}

// Generate confirmation link
export function generateConfirmationLink(
  transactionId: string,
  baseUrl?: string
): string {
  const url =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");
  return `${url}/tickets/confirmation/${transactionId}`;
}

// Format ticket status for display
export function formatTicketStatus(status: string): string {
  switch (status) {
    case "pending":
      return "⏳ Pending";
    case "confirmed":
      return "✅ Confirmed";
    case "used":
      return "🎯 Used";
    case "cancelled":
      return "❌ Cancelled";
    case "refunded":
      return "💰 Refunded";
    default:
      return status;
  }
}

// Generate unique transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return `TXN-${timestamp}-${random.toUpperCase()}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format (basic)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}

// Generate ticket PDF data (for future PDF generation)
export function generateTicketPDFData(
  ticket: any,
  event: any,
  qrCodeDataURL: string
) {
  return {
    ticketCode: ticket.ticketCode,
    eventName: event.name,
    eventDescription: event.description,
    eventDate: new Date(event.startDate).toLocaleDateString(),
    eventVenue: event.venue,
    purchaserName: ticket.purchaserName,
    purchaserEmail: ticket.purchaserEmail,
    ticketType: ticket.ticketType?.name,
    qrCode: qrCodeDataURL,
    purchaseDate: new Date(ticket.createdAt).toLocaleDateString(),
    transactionId: ticket.transactionId,
  };
}
