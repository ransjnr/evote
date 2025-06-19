"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ArrowRight, Lock, Mail, CheckCircle } from "lucide-react";

// Define error type
interface ConvexError {
  message: string;
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [eLogoHover, setELogoHover] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const loginAdmin = useMutation(api.auth.loginAdmin);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Already authenticated, redirecting to dashboard");
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  // Check if form is complete
  useEffect(() => {
    if (email && password) {
      setFormComplete(true);
    } else {
      setFormComplete(false);
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting to log in with email:", email);
      const result = await loginAdmin({
        email,
        password,
      });

      if (result.success) {
        // Detailed log of the admin data received from server
        console.log("Login successful, full admin data:", result.admin);
        console.log("Verification status:", result.admin.isVerified);

        // Check if the admin account is verified
        if (!result.admin.isVerified) {
          console.log(
            "Admin account is NOT verified, redirecting to verification page"
          );
          // If not verified, redirect to verification pending page instead of logging in
          toast.info("Your account is pending verification by a super admin");

          // Store minimal admin info in local storage for checking verification status later
          const pendingAdminData = {
            _id: result.admin._id,
            email: result.admin.email,
            name: result.admin.name,
          };
          console.log("Storing in localStorage:", pendingAdminData);

          localStorage.setItem(
            "pendingAdmin",
            JSON.stringify(pendingAdminData)
          );

          // Redirect immediately to avoid race conditions
          router.push("/admin/verification-pending");
          return;
        }

        console.log("Admin account IS verified, proceeding with login");
        // Add delay for visual feedback
        toast.success("Login successful! Redirecting...");

        // Generate a simple token (in a real app, you'd use JWT or similar)
        const token = btoa(`${result.admin._id}:${Date.now()}`);

        // First update the auth store
        login(result.admin, token);

        // Small delay to ensure the state is updated before navigation
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          window.location.href = "/admin/dashboard";
        }, 500);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      console.error("Login error:", error);
      toast.error(convexError.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          onMouseEnter={() => setELogoHover(true)}
          onMouseLeave={() => setELogoHover(false)}
        >
          <img
            src="/Pollix icon.png"
            alt="Pollix"
            width="32"
            height="32"
            className={`mr-2 rounded transition-all duration-300 ease-in-out transform ${eLogoHover ? "scale-110" : "scale-100"}`}
          />
          <span
            className={`transition-colors duration-300 ${eLogoHover ? "text-indigo-700" : "text-gray-800"}`}
          >
            Pollix
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 px-6 py-10">
        {/* Login Card with subtle animations */}
        <Card className="backdrop-blur-sm bg-white/90 border border-gray-100 shadow-xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div
            className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary via-indigo-500 to-primary"
            style={{
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
            }}
          ></div>

          <CardHeader className="space-y-1 pb-6">
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-2 relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Sign in to access your admin dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div
                className={`space-y-2 transition-all duration-300 ${focused === "email" ? "scale-[1.02]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className={`text-sm font-medium transition-colors duration-300 ${focused === "email" ? "text-primary" : "text-gray-700"}`}
                  >
                    Email
                  </label>
                  {email && (
                    <span className="text-xs text-primary flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "email" ? "text-primary" : "text-gray-400"}`}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                      focused === "email"
                        ? "border-primary bg-white shadow-sm"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                    required
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${
                      focused === "email" ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              </div>

              <div
                className={`space-y-2 transition-all duration-300 ${focused === "password" ? "scale-[1.02]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className={`text-sm font-medium transition-colors duration-300 ${focused === "password" ? "text-primary" : "text-gray-700"}`}
                  >
                    Password
                  </label>
                  <Link
                    href="/admin/forgot-password"
                    className="text-xs text-primary hover:text-indigo-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "password" ? "text-primary" : "text-gray-400"}`}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                      focused === "password"
                        ? "border-primary bg-white shadow-sm"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                    required
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${
                      focused === "password" ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
              <Button
                type="submit"
                className={`w-full rounded-lg relative overflow-hidden group transition-all duration-300 ease-out transform hover:-translate-y-[2px] ${
                  formComplete
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-gray-300"
                } ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
                disabled={isLoading || !formComplete}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>

                {isLoading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center relative z-10">
                    <span>Sign in</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </div>
                )}
              </Button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">
                    or
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Don&apos;t have an account?
                </div>
                <Link
                  href="/admin/register"
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-primary hover:text-white border border-primary rounded-lg hover:bg-primary transition-all duration-300 ease-out"
                >
                  Register your department
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="absolute bottom-4 text-center w-full text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Pollix Platform. All rights reserved.
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
