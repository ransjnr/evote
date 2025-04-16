import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { TutorialProvider } from "@/components/ui/tutorial/tutorial-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "eVote - Secure Pay-to-Vote Platform",
  description:
    "A secure, real-time, feature-rich pay-to-vote eVoting platform for school awards and events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ConvexClientProvider>
          <TutorialProvider>
            {children}
            <Toaster />
          </TutorialProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
