"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, QrCode } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TicketScannerProps {
  eventId: Id<"events">;
}

export const TicketScanner = ({ eventId }: TicketScannerProps) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { admin } = useAuthStore();
  
  // Get the check-in mutation
  const checkInTicket = useMutation(api.ticketReservations.checkInTicket);

  // Start the scanner
  const startScanner = async () => {
    setScanning(true);
    setError(null);
    setResult(null);
    
    try {
      const constraints = {
        video: {
          facingMode: "environment",
        },
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Start processing frames for QR code detection
        // Here we would typically use a library like jsQR or a similar QR code scanner
        // For simplicity, we'll simulate scanning with manual input in this example
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions and try again.");
      setScanning(false);
    }
  };

  // Stop the scanner
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
  };

  // Process a scanned QR code
  const processScannedCode = async (ticketCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!admin?._id) {
        throw new Error("Admin not authenticated");
      }
      
      const result = await checkInTicket({
        ticketCode,
        eventId,
        adminId: admin._id as Id<"admins">,
      });
      
      setResult(result);
      toast({
        title: "Check-in Successful",
        description: `Ticket for ${result.buyerName} has been checked in.`,
      });
    } catch (err: any) {
      console.error("Error checking in ticket:", err);
      setError(err.message || "Failed to check in ticket");
      toast({
        title: "Check-in Failed",
        description: err.message || "Failed to check in ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      stopScanner();
    }
  };

  // Manually input a ticket code (for demo purposes)
  const [manualCode, setManualCode] = useState("");
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processScannedCode(manualCode.trim());
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Ticket Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Alert variant="success" className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Checked In</AlertTitle>
            <AlertDescription className="text-green-700">
              <div className="space-y-1">
                <p><strong>Attendee:</strong> {result.buyerName}</p>
                <p><strong>Ticket Type:</strong> {result.ticketType?.name}</p>
                <p><strong>Quantity:</strong> {result.quantity}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {scanning ? (
            <div className="space-y-4">
              <div className="bg-black relative overflow-hidden rounded-lg aspect-square max-w-sm mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                ></video>
                <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none"></div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={stopScanner}
              >
                Cancel Scanning
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={startScanner}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan Ticket QR Code
                </>
              )}
            </Button>
          )}
          
          {/* Manual input form for testing or fallback */}
          <div className="pt-4 border-t">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="ticketCode" className="block text-sm font-medium text-gray-700">
                  Manual Ticket Code Entry
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="ticketCode"
                    id="ticketCode"
                    disabled={scanning || loading}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                    placeholder="Enter ticket code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    disabled={!manualCode.trim() || scanning || loading}
                    className="ml-2"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 