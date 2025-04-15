"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowRight, Mail } from "lucide-react";

export default function RegistrationSuccess() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f9f9f9 0%, #f5f5f7 100%)",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full"></div>
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-indigo-100/20 rounded-full"></div>
        <div
          className="absolute top-1/4 left-1/3 w-10 h-10 bg-primary/10 rounded-full"
          style={{
            animation: "float 8s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-indigo-300/10 rounded-full"
          style={{
            animation: "float 6s ease-in-out infinite",
            animationDelay: "1s",
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full px-6 pt-6 z-20">
        <Link
          href="/"
          className="text-2xl font-bold flex items-center transition-all duration-300"
        >
          <span className="bg-primary text-white p-1 rounded mr-1">e</span>
          <span className="text-gray-800">Vote</span>
        </Link>
      </div>

      <div className="w-full max-w-lg relative z-10 px-6 py-10">
        <Card className="backdrop-blur-sm bg-white/90 border border-gray-100 shadow-xl rounded-2xl overflow-hidden transition-all duration-500">
          <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-green-400 via-green-500 to-green-400"></div>

          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-gray-500">
              Your account has been created and is pending verification.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Verification Pending
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your administrator account is currently pending
                      verification by a super admin. You will receive an email
                      notification once your account has been verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">
                    What happens next?
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>1. A super admin will review your account details</p>
                    <p>
                      2. Once verified, you'll receive an email notification
                    </p>
                    <p>
                      3. You can then log in to your administrator dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2 pb-8 px-8">
            <Link href="/admin/verification-pending" className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <ArrowRight className="h-4 w-4 mr-2" />
                Check Verification Status
              </Button>
            </Link>

            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need assistance?{" "}
          <a
            href="mailto:support@evote.com"
            className="text-primary hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
