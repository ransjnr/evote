"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Lock,
  UserCheck,
  Star,
  Award,
  PartyPopper,
  LogIn,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// Route protection wrapper
export default function VerificationPendingPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [pendingAdmin, setPendingAdmin] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dots, setDots] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Checking verification status"
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Try to get admin from localStorage if not in auth store
  useEffect(() => {
    const getAdminData = async () => {
      setIsLoading(true);
      if (!admin) {
        const stored = localStorage.getItem("pendingAdmin");
        if (stored) {
          try {
            const parsedAdmin = JSON.parse(stored);
            console.log("Found pending admin in localStorage:", parsedAdmin);
            setPendingAdmin(parsedAdmin);
          } catch (e) {
            console.error("Error parsing pendingAdmin", e);
            setHasError(true);
          }
        } else {
          console.log("No pending admin found in localStorage");
          // No stored admin found - this might happen if someone visits this page directly
          setHasError(true);
        }
      } else {
        console.log("Using admin from auth store:", admin);
      }
      setIsLoading(false);
    };

    getAdminData();
  }, [admin]);

  // Use either auth store admin or localStorage admin
  const activeAdmin = admin || pendingAdmin;

  // Always call useQuery at the top level with conditional arguments
  // This fixes the hooks ordering issue
  const checkAdmin = useQuery(
    api.auth.getAdmin,
    activeAdmin ? { adminId: activeAdmin._id } : "skip"
  );

  // Check if we're already authenticated with a verified account
  // If so, we should redirect to dashboard instead of showing this page
  useEffect(() => {
    // If the user is already fully authenticated and verified, redirect to dashboard
    if (admin && admin.isVerified === true) {
      console.log(
        "User is already verified and authenticated. Redirecting to dashboard."
      );
      router.push("/admin/dashboard");
      return;
    }
  }, [admin, router]);

  // Update dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Increment seconds counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update message periodically to keep the user engaged
  useEffect(() => {
    const messages = [
      "Super Admin is reviewing your details",
      "Waiting for verification approval",
      "Almost there, just a little longer",
      "Verification usually takes 5-10 minutes",
      "Thank you for your patience",
      "Your details are being verified",
      "We're excited to have you onboard",
    ];

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setStatusMessage(messages[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Debug logging
  useEffect(() => {
    if (checkAdmin) {
      console.log("Admin verification status:", checkAdmin.isVerified);
    }
  }, [checkAdmin]);

  // Check if the admin has been verified
  useEffect(() => {
    console.log("Checking admin verification status:");
    console.log("- activeAdmin:", activeAdmin);
    console.log("- checkAdmin data:", checkAdmin);

    // Guard clause: only proceed if we have valid data
    if (!checkAdmin) {
      console.log("No checkAdmin data available yet");
      return;
    }

    // Make sure isVerified property exists and is strictly boolean true (not truthy)
    if (checkAdmin.isVerified === true) {
      console.log("VERIFIED: Admin account has been verified by super admin");

      // Clear pendingAdmin from localStorage if it exists
      try {
        localStorage.removeItem("pendingAdmin");
        console.log("Cleared pendingAdmin from localStorage");
      } catch (e) {
        console.error("Error removing pendingAdmin from localStorage", e);
      }

      setShowSuccess(true);
      toast.success("🎉 Your account has been verified!");

      // Redirect to login after showing success message for a few seconds
      const timer = setTimeout(() => {
        router.push("/admin/login");
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      console.log("PENDING: Admin verification status is still pending");
      console.log("isVerified value:", checkAdmin.isVerified);
      // Ensure success is not displayed
      setShowSuccess(false);
    }
  }, [checkAdmin, router, pendingAdmin, activeAdmin]);

  // Format time elapsed in a user-friendly way
  const formatTimeElapsed = () => {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;

    if (minutes === 0) {
      return `${seconds} seconds`;
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} seconds`;
  };

  // Random animated elements
  const floatingElements = [
    { icon: ShieldCheck, color: "text-blue-500", delay: 0 },
    { icon: UserCheck, color: "text-green-500", delay: 1.5 },
    { icon: Star, color: "text-yellow-500", delay: 0.8 },
    { icon: Award, color: "text-purple-500", delay: 2.2 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating animation elements */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: Math.random() * 100 - 50 + "%",
              y: Math.random() * 100 - 50 + "%",
              opacity: 0,
            }}
            animate={{
              x: [
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
              ],
              y: [
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%",
              ],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 15 + Math.random() * 10,
              delay: element.delay,
              ease: "easeInOut",
            }}
          >
            <element.icon className={`h-12 w-12 ${element.color} opacity-20`} />
          </motion.div>
        ))}

        {/* Background decoration circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div className="w-full max-w-md px-4 z-10">
        <Link
          href="/"
          className="flex items-center justify-center text-2xl font-bold mb-6"
        >
          <img
            src="/Pollix icon.png"
            alt="Pollix"
            width="32"
            height="32"
            className="mr-2 rounded"
          />
          <span className="text-gray-800">Pollix</span>
        </Link>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border border-gray-200 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-2 mb-4">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    />
                    <motion.div
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    />
                  </div>
                  <p className="text-gray-600">
                    Loading verification status...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-gray-200 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
                <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-red-400 to-red-500"></div>

                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">
                    Verification Error
                  </CardTitle>
                  <CardDescription className="text-center">
                    We couldn't find your account information
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-2">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-red-800 text-sm">
                      We couldn't retrieve your account details. This might
                      happen if:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>
                          You accessed this page directly without registering
                        </li>
                        <li>Your browser storage was cleared</li>
                        <li>There was a technical error during registration</li>
                      </ul>
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 pt-2 pb-6">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => router.push("/admin/login")}
                  >
                    Try Logging In
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/admin/register")}
                  >
                    Register Again
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : !showSuccess ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-gray-200 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
                <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-gradient"></div>

                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Clock className="h-10 w-10 text-blue-500" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-xl text-center">
                    Verification Pending
                  </CardTitle>
                  <CardDescription className="text-center">
                    Your account is awaiting approval from a Super Admin
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-2">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-blue-800 text-sm flex items-start">
                      <ShieldCheck className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                      <span>
                        <span className="font-medium">
                          {statusMessage}
                          {dots}
                        </span>
                        <br />
                        <span className="text-blue-600 text-xs">
                          Time elapsed: {formatTimeElapsed()}
                        </span>
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      What happens next?
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-blue-700 text-xs">1</span>
                        </div>
                        A Super Admin will review your details and approve your
                        account
                      </li>
                      <li className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-blue-700 text-xs">2</span>
                        </div>
                        You'll receive a notification when your account is
                        verified
                      </li>
                      <li className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-blue-700 text-xs">3</span>
                        </div>
                        You can then log in to your admin dashboard and get
                        started
                      </li>
                    </ul>
                  </div>

                  {/* Loading indicator */}
                  <div className="flex justify-center items-center py-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-500 mx-1"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-500 mx-1"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-500 mx-1"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 pt-2 pb-6">
                  <p className="text-xs text-center text-gray-500">
                    You will be automatically redirected once your account is
                    verified.
                    <br />
                    Feel free to check back later.
                  </p>
                  <div className="flex space-x-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push("/")}
                    >
                      Go to Home
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-gray-200 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm">
                <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-green-500 via-green-400 to-green-500"></div>

                <CardHeader className="pb-4">
                  <motion.div
                    className="flex justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-xl text-center">
                    Verification Complete!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Your account has been verified successfully
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex">
                      <PartyPopper className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <p className="text-green-800 text-sm">
                        <span className="font-medium">Congratulations!</span>
                        <br />
                        <span className="text-green-700">
                          You now have full access to the Pollix admin
                          dashboard.
                        </span>
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className="flex justify-center py-2"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </motion.div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3 pt-2 pb-6">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => router.push("/admin/login")}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Continue to Login
                    </Button>
                  </motion.div>
                  <p className="text-xs text-center text-gray-500">
                    You will be redirected automatically in a few seconds...
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
