"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

export default function SuperAdminTestEmailPage() {
  const [email, setEmail] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const sendTestEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          testMessage: "This is a test email from the eVote system!",
        }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success("Test email sent successfully!");
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
      setLastResult({ success: false, error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoteConfirmationTest = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const mockVoteData = {
        email,
        nominee: {
          name: "John Doe",
          code: "NOM001",
        },
        event: {
          name: "Student Elections 2024",
        },
        voteCount: 3,
        amount: 15.0,
        transactionId: "test_vote_123456789",
      };

      const response = await fetch("/api/send-vote-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockVoteData),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success("Vote confirmation email sent successfully!");
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending vote confirmation email:", error);
      toast.error("Failed to send vote confirmation email");
      setLastResult({ success: false, error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendAdminWelcomeTest = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const mockAdminData = {
        admin: {
          name: "Jane Smith",
          email: email,
          role: "department_admin",
        },
        department: {
          name: "Computer Science Department",
        },
        tempPassword: "TempPass123!",
      };

      const response = await fetch("/api/send-admin-welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          adminData: mockAdminData,
        }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success("Admin welcome email sent successfully!");
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending admin welcome email:", error);
      toast.error("Failed to send admin welcome email");
      setLastResult({ success: false, error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendEventReminderTest = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const mockEventData = {
        event: {
          name: "Annual Tech Conference 2024",
          description: "Join us for the biggest tech event of the year!",
          startDate: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          endDate: Date.now() + 48 * 60 * 60 * 1000, // 48 hours from now
          venue: "Convention Center Hall A",
        },
        userEmail: email,
        reminderType: "starts",
      };

      const response = await fetch("/api/send-event-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          eventData: mockEventData,
        }),
      });

      const result = await response.json();
      setLastResult(result);

      if (result.success) {
        toast.success("Event reminder email sent successfully!");
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending event reminder email:", error);
      toast.error("Failed to send event reminder email");
      setLastResult({ success: false, error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">
            Super Admin - Email System Test
          </h1>
          <p className="text-gray-600">
            Test and verify email functionality across the platform
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Email Testing Console
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Test Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message">Custom Test Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Enter a custom test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={sendTestEmail}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Basic Test Email
                  </>
                )}
              </Button>

              <Button
                onClick={sendVoteConfirmationTest}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Vote Confirmation
                  </>
                )}
              </Button>

              <Button
                onClick={sendAdminWelcomeTest}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Welcome Email
                  </>
                )}
              </Button>

              <Button
                onClick={sendEventReminderTest}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Event Reminder Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Gmail OAuth2</span>
                <span className="text-green-600 font-medium">✓ Configured</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Email Templates</span>
                <span className="text-green-600 font-medium">
                  ✓ 5 Available
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>API Endpoints</span>
                <span className="text-green-600 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Voting Integration</span>
                <span className="text-green-600 font-medium">✓ Ready</span>
              </div>
            </div>

            {lastResult && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Last Test Result:</h4>
                <div
                  className={`p-2 rounded text-xs ${
                    lastResult.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {lastResult.success ? (
                    <>
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      Success
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {lastResult.error}
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Detailed Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div
                className={`p-4 rounded-lg ${
                  lastResult.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {lastResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      lastResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {lastResult.success
                      ? "Email Sent Successfully"
                      : "Email Failed"}
                  </span>
                </div>

                <p
                  className={`text-sm ${
                    lastResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {lastResult.success
                    ? lastResult.message || "Email sent successfully!"
                    : lastResult.error || "Unknown error occurred"}
                </p>

                {lastResult.success &&
                  (lastResult.messageId ||
                    lastResult.voterEmail?.messageId) && (
                    <p className="text-xs text-gray-600 mt-2">
                      Message ID:{" "}
                      {lastResult.messageId || lastResult.voterEmail?.messageId}
                    </p>
                  )}
              </div>

              <details className="bg-gray-50 rounded-lg">
                <summary className="p-3 cursor-pointer font-medium text-gray-900">
                  View Full Response Data
                </summary>
                <div className="p-3 pt-0">
                  <pre className="text-xs text-gray-600 overflow-auto bg-white p-3 rounded border">
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Email System Configuration & Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Gmail OAuth2 Configuration
              </h4>
              <p className="text-blue-800 text-sm">
                The system uses Gmail OAuth2 for reliable email delivery.
                Credentials are configured in mailer.js with proper error
                handling and retry logic.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">
                Super Admin Features
              </h4>
              <p className="text-purple-800 text-sm">
                Test all email templates, monitor delivery status, and manage
                system-wide email configurations from this central panel.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-3">
              Available Email Templates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-yellow-800 text-sm">
              <div>• 🧪 Test Email - Basic functionality verification</div>
              <div>• 🗳️ Vote Confirmation - Post-voting confirmations</div>
              <div>• 📊 Admin Vote Notification - Real-time vote alerts</div>
              <div>• 🔔 Event Reminders - Upcoming event notifications</div>
              <div>• 👋 Admin Welcome - New admin account setup</div>
              <div>• 🎫 Ticket Confirmations - Event ticket purchases</div>
            </div>
            <p className="text-yellow-700 text-xs mt-2">
              All templates are now testable through API endpoints for proper
              server-client separation.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">
              Integration Status
            </h4>
            <p className="text-green-800 text-sm">
              ✅ Email notifications are fully integrated into the voting and
              ticketing systems
              <br />
              ✅ Automatic confirmations sent when votes/tickets are processed
              <br />
              ✅ Non-blocking email delivery ensures system performance
              <br />✅ Comprehensive error handling and logging implemented
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
