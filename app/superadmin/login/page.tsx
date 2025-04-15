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
import { ArrowRight, Lock, Mail, Shield, CheckCircle } from "lucide-react";

// Define error type
interface ConvexError {
  message: string;
}

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [eLogoHover, setELogoHover] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const login = useAuthStore((state) => state.login);

  // Check if form is complete
  useEffect(() => {
    if (email && password) {
      setFormComplete(true);
    } else {
      setFormComplete(false);
    }
  }, [email, password]);

  const loginAdmin = useMutation(api.auth.loginAdmin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginAdmin({
        email,
        password,
      });

      if (result.success) {
        // Check if the user is a super admin
        if (result.admin.role !== "super_admin") {
          toast.error("Access denied. This login is for Super Admins only.");
          setIsLoading(false);
          return;
        }

        // Add delay for visual feedback
        toast.success("Super Admin login successful! Redirecting...");

        // Generate a simple token (in a real app, you'd use JWT or similar)
        const token = btoa(`${result.admin._id}:${Date.now()}`);
        login(result.admin, token);

        // Delay redirect for better UX
        setTimeout(() => {
          router.push("/superadmin/dashboard");
        }, 1000);
      }
    } catch (error: unknown) {
      const convexError = error as ConvexError;
      toast.error(convexError.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f4f9 0%, #e9ecef 100%)",
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
          <span
            className={`${
              eLogoHover ? "bg-indigo-600" : "bg-primary"
            } text-white p-1 rounded mr-1 transition-all duration-300 ease-in-out transform ${
              eLogoHover ? "scale-110" : "scale-100"
            }`}
          >
            e
          </span>
          <span
            className={`transition-colors duration-300 ${
              eLogoHover ? "text-indigo-700" : "text-gray-800"
            }`}
          >
            Vote
          </span>
          <span className="text-xs ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            Super Admin
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 px-6 py-10">
        {/* Login Card with subtle animations */}
        <Card className="backdrop-blur-sm bg-white/90 border border-gray-100 shadow-xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div
            className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
            style={{
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
            }}
          ></div>

          <CardHeader className="space-y-1 pb-6">
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-2 relative bg-blue-50">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Super Admin Access
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Secure login for system administrators only
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div
                className={`space-y-2 transition-all duration-300 ${
                  focused === "email" ? "scale-[1.02]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="email"
                    className={`text-sm font-medium transition-colors duration-300 ${
                      focused === "email" ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    Email
                  </label>
                  {email && (
                    <span className="text-xs text-blue-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                      focused === "email" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="superadmin@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 ${
                      focused === "email"
                        ? "border-blue-600 bg-white shadow-sm"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                    required
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transform transition-all duration-300 ease-out ${
                      focused === "email" ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              </div>

              <div
                className={`space-y-2 transition-all duration-300 ${
                  focused === "password" ? "scale-[1.02]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className={`text-sm font-medium transition-colors duration-300 ${
                      focused === "password" ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    Password
                  </label>
                  <Link
                    href="/superadmin/forgot-password"
                    className="text-xs text-blue-600 hover:text-indigo-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                      focused === "password" ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-600/20 ${
                      focused === "password"
                        ? "border-blue-600 bg-white shadow-sm"
                        : "border-gray-200 bg-gray-50/50"
                    }`}
                    required
                  />
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transform transition-all duration-300 ease-out ${
                      focused === "password" ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="bg-amber-50 px-4 py-3 rounded-lg border border-amber-100 text-sm text-amber-800">
                <p className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-amber-600" />
                  This portal is restricted to authorized super administrators
                  only.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
              <Button
                type="submit"
                className={`w-full rounded-lg relative overflow-hidden group transition-all duration-300 ease-out transform hover:-translate-y-[2px] ${
                  formComplete ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300"
                } ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
                disabled={!formComplete || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
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
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Secure Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Need help?{" "}
                <a
                  href="mailto:support@evote.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Contact Support
                </a>
                {" • "}
                <Link
                  href="/system/migrate"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Fix Schema Issues
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
