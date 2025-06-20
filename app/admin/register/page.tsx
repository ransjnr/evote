"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
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
import {
  ArrowRight,
  Check,
  User,
  Mail,
  Lock,
  Building,
  FileText,
  Link as LinkIcon,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Shield,
  Award,
  Star,
  LogIn,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

// Define error type
interface ConvexError {
  message: string;
}

export default function AdminRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [departmentDesc, setDepartmentDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);
  const [eLogoHover, setELogoHover] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const login = useAuthStore((state) => state.login);

  // State for the verification waiting modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredAdminId, setRegisteredAdminId] =
    useState<Id<"admins"> | null>(null);
  const [dots, setDots] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Processing registration..."
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const { ref: adminFormRef, inView: adminFormInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: departmentFormRef, inView: departmentFormInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const registerAdmin = useMutation(api.auth.registerAdmin);
  const createDepartment = useMutation(api.departments.createDepartment);
  const checkEmail = useQuery(api.auth.checkEmailExists, { email });

  // Define isEmailTaken here before it's used in the effect below
  const isEmailTaken = checkEmail === true;

  // Track verification status locally
  const [adminVerified, setAdminVerified] = useState(false);

  // Create a separate component to handle admin verification checking
  const CheckAdminVerification = ({ adminId }: { adminId: Id<"admins"> }) => {
    // This query will only run in this component when adminId is available
    const adminData = useQuery(api.auth.getAdmin, { adminId });

    useEffect(() => {
      if (adminData && !adminData.isVerified) {
        // Redirect to verification pending page
        router.push("/admin/verification-pending");
      } else if (adminData && adminData.isVerified) {
        // Show success toast and handle redirect to login
        toast.success("🎉 Your account has been verified!");
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      }
    }, [adminData]);

    return null; // This component doesn't render anything
  };

  // Animation for the waiting dots
  useEffect(() => {
    if (showVerificationModal) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [showVerificationModal]);

  // Timer for seconds elapsed
  useEffect(() => {
    if (showVerificationModal) {
      const interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showVerificationModal]);

  // Rotate messages to keep the user engaged
  useEffect(() => {
    if (showVerificationModal) {
      const messages = [
        "Creating your department...",
        "Setting up administrator account...",
        "Preparing dashboard access...",
        "Almost there, finalizing details...",
        "Your account is being created...",
        "We're excited to have you onboard!",
        "Just a few moments more...",
      ];

      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        setStatusMessage(messages[randomIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showVerificationModal]);

  // Check if form is complete
  useEffect(() => {
    if (step === 1) {
      if (
        name &&
        email &&
        password &&
        confirmPassword &&
        password === confirmPassword &&
        !isEmailTaken &&
        password.length >= 8
      ) {
        setFormComplete(true);
      } else {
        setFormComplete(false);
      }
    } else {
      if (departmentName && departmentSlug) {
        setFormComplete(true);
      } else {
        setFormComplete(false);
      }
    }
  }, [
    name,
    email,
    password,
    confirmPassword,
    departmentName,
    departmentSlug,
    step,
    isEmailTaken,
  ]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(strength);
  }, [password]);

  // Generate slug from department name
  const handleDepartmentNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDepartmentName(value);

    // Auto-generate slug from department name
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    setDepartmentSlug(slug);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (isEmailTaken) {
      toast.error("Email is already registered");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Register admin with department details
      const adminData = {
        email,
        password,
        name,
        departmentId: departmentSlug,
        role: "department_admin" as const,
        departmentName,
        departmentDescription: departmentDesc,
      };

      const result = await registerAdmin(adminData);

      if (!result.success) {
        throw new Error("Failed to register admin");
      }

      setRegisteredAdminId(result.adminId as Id<"admins">);

      // Store admin info in localStorage for verification page
      localStorage.setItem(
        "pendingAdmin",
        JSON.stringify({
          _id: result.adminId,
          email: email,
          name: name,
        })
      );

      // Show success toast
      toast.success(
        "Registration successful! Redirecting to verification page..."
      );

      // Delay redirect for better UX and to ensure localStorage is set
      setTimeout(() => {
        router.push("/admin/verification-pending");
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || "Registration failed!");
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return null;
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    if (passwordStrength === 4) return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    if (passwordStrength === 4) return "bg-green-500";
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
          <Image
            src="/Pollix.png"
            alt="Pollix"
            width="75"
            height="75"
            className={`mr-2 rounded transition-all duration-300 ease-in-out transform ${eLogoHover ? "scale-110" : "scale-100"}`}
          />
        </Link>
      </div>

      <div className="w-full max-w-xl relative z-10 px-6 py-10">
        {/* Registration Card with subtle animations */}
        <Card className="backdrop-blur-sm bg-white/90 border border-gray-100 shadow-xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div
            className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary via-indigo-500 to-primary"
            style={{
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
            }}
          ></div>

          <CardHeader className="space-y-1 pb-4 px-8">
            <div className="flex justify-center mb-2">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${step === 1 ? "bg-primary" : "bg-gray-200"} text-white font-medium
                  transition-all duration-300`}
                >
                  1
                </div>
                <div className="w-20 h-1 mx-1 bg-gray-200 relative">
                  <div
                    className={`h-full absolute left-0 top-0 ${step >= 2 ? "bg-primary" : "bg-gray-200"} transition-all duration-500`}
                    style={{ width: step >= 2 ? "100%" : "0%" }}
                  ></div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${step === 2 ? "bg-primary" : "bg-gray-200"} text-white font-medium
                  transition-all duration-300`}
                >
                  2
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              {step === 1 ? "Create Your Account" : "Set Up Your Department"}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {step === 1
                ? "Enter your details to create an admin account"
                : "Configure your department information"}
            </CardDescription>
          </CardHeader>

          {step === 1 && (
            <form onSubmit={handleContinue}>
              <CardContent className="space-y-5 pt-2 px-8">
                <div
                  className={`space-y-2 transition-all duration-300 ${focused === "name" ? "scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="name"
                      className={`text-sm font-medium transition-colors duration-300 ${focused === "name" ? "text-primary" : "text-gray-700"}`}
                    >
                      Full Name
                    </label>
                    {name && (
                      <span className="text-xs text-primary flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "name" ? "text-primary" : "text-gray-400"}`}
                    />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                      className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${focused === "name" ? "border-primary bg-white shadow-sm" : "border-gray-200 bg-gray-50/50"}`}
                      required
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${focused === "name" ? "w-full" : "w-0"}`}
                    ></div>
                  </div>
                </div>

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
                    {email && !isEmailTaken && (
                      <span className="text-xs text-primary flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Available
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
                          : isEmailTaken
                            ? "border-red-500 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                      }`}
                      required
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 ${isEmailTaken ? "bg-red-500" : "bg-primary"} transform transition-all duration-300 ease-out ${
                        focused === "email" ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  {isEmailTaken && (
                    <p className="text-xs text-red-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      This email is already registered
                    </p>
                  )}
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
                    {passwordStrength > 0 && (
                      <span
                        className={`text-xs flex items-center
                          ${
                            passwordStrength === 1
                              ? "text-red-500"
                              : passwordStrength === 2
                                ? "text-orange-500"
                                : passwordStrength === 3
                                  ? "text-yellow-500"
                                  : "text-green-500"
                          }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "password" ? "text-primary" : "text-gray-400"}`}
                    />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
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
                      minLength={8}
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${
                        focused === "password" ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  {password && (
                    <div className="mt-1">
                      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength * 25}%` }}
                        ></div>
                      </div>
                      <ul className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${password.length >= 8 ? "text-green-500" : "text-gray-400"}`}
                          >
                            {password.length >= 8 ? <Check size={12} /> : "•"}
                          </span>
                          8+ characters
                        </li>
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          >
                            {/[A-Z]/.test(password) ? <Check size={12} /> : "•"}
                          </span>
                          Uppercase
                        </li>
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          >
                            {/[0-9]/.test(password) ? <Check size={12} /> : "•"}
                          </span>
                          Number
                        </li>
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          >
                            {/[^A-Za-z0-9]/.test(password) ? (
                              <Check size={12} />
                            ) : (
                              "•"
                            )}
                          </span>
                          Special char
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div
                  className={`space-y-2 transition-all duration-300 ${focused === "confirmPassword" ? "scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="confirmPassword"
                      className={`text-sm font-medium transition-colors duration-300 ${focused === "confirmPassword" ? "text-primary" : "text-gray-700"}`}
                    >
                      Confirm Password
                    </label>
                    {confirmPassword && password === confirmPassword && (
                      <span className="text-xs text-green-500 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Matched
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "confirmPassword" ? "text-primary" : "text-gray-400"}`}
                    />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocused("confirmPassword")}
                      onBlur={() => setFocused(null)}
                      className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                        focused === "confirmPassword"
                          ? "border-primary bg-white shadow-sm"
                          : confirmPassword && password !== confirmPassword
                            ? "border-red-500 bg-red-50/30"
                            : "border-gray-200 bg-gray-50/50"
                      }`}
                      required
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 ${confirmPassword && password !== confirmPassword ? "bg-red-500" : "bg-primary"} transform transition-all duration-300 ease-out ${
                        focused === "confirmPassword" ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Passwords don&apos;t match
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-8">
                <Button
                  type="submit"
                  className={`w-full rounded-lg relative overflow-hidden group transition-all duration-300 ease-out transform hover:-translate-y-[2px] ${
                    formComplete
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-300"
                  } ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
                  disabled={!formComplete || isLoading}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>

                  <div className="flex items-center justify-center relative z-10">
                    <span>Continue</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </div>
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
                    Already have an account?
                  </div>
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-primary hover:text-white border border-primary rounded-lg hover:bg-primary transition-all duration-300 ease-out"
                  >
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-2">
                <div
                  className={`space-y-2 transition-all duration-300 ${focused === "departmentName" ? "scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="departmentName"
                      className={`text-sm font-medium transition-colors duration-300 ${focused === "departmentName" ? "text-primary" : "text-gray-700"}`}
                    >
                      Department Name
                    </label>
                    {departmentName && (
                      <span className="text-xs text-primary flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Building
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "departmentName" ? "text-primary" : "text-gray-400"}`}
                    />
                    <Input
                      id="departmentName"
                      placeholder="e.g. Computer Science Department"
                      value={departmentName}
                      onChange={handleDepartmentNameChange}
                      onFocus={() => setFocused("departmentName")}
                      onBlur={() => setFocused(null)}
                      className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                        focused === "departmentName"
                          ? "border-primary bg-white shadow-sm"
                          : "border-gray-200 bg-gray-50/50"
                      }`}
                      required
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${
                        focused === "departmentName" ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                </div>

                <div
                  className={`space-y-2 transition-all duration-300 ${focused === "departmentSlug" ? "scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="departmentSlug"
                      className={`text-sm font-medium transition-colors duration-300 ${focused === "departmentSlug" ? "text-primary" : "text-gray-700"}`}
                    >
                      URL Slug
                    </label>
                  </div>
                  <div className="relative">
                    <LinkIcon
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "departmentSlug" ? "text-primary" : "text-gray-400"}`}
                    />
                    <Input
                      id="departmentSlug"
                      placeholder="department-url-slug"
                      value={departmentSlug}
                      onChange={(e) => setDepartmentSlug(e.target.value)}
                      onFocus={() => setFocused("departmentSlug")}
                      onBlur={() => setFocused(null)}
                      className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                        focused === "departmentSlug"
                          ? "border-primary bg-white shadow-sm"
                          : "border-gray-200 bg-gray-50/50"
                      }`}
                      required
                      pattern="[a-z0-9\-]+"
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${
                        focused === "departmentSlug" ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                  {departmentSlug && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <Check className="h-3 w-3 mr-1 text-primary" />
                      Your URL: pollix.com/
                      <span className="font-medium">{departmentSlug}</span>
                    </p>
                  )}
                </div>

                <div
                  className={`space-y-2 transition-all duration-300 ${focused === "departmentDesc" ? "scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="departmentDesc"
                      className={`text-sm font-medium transition-colors duration-300 ${focused === "departmentDesc" ? "text-primary" : "text-gray-700"}`}
                    >
                      Description (Optional)
                    </label>
                  </div>
                  <div className="relative">
                    <FileText
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${focused === "departmentDesc" ? "text-primary" : "text-gray-400"}`}
                    />
                    <Input
                      id="departmentDesc"
                      placeholder="A short description of your department"
                      value={departmentDesc}
                      onChange={(e) => setDepartmentDesc(e.target.value)}
                      onFocus={() => setFocused("departmentDesc")}
                      onBlur={() => setFocused(null)}
                      className={`pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                        focused === "departmentDesc"
                          ? "border-primary bg-white shadow-sm"
                          : "border-gray-200 bg-gray-50/50"
                      }`}
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transform transition-all duration-300 ease-out ${
                        focused === "departmentDesc" ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-4">
                <Button
                  type="submit"
                  className={`w-full rounded-lg relative overflow-hidden group transition-all duration-300 ease-out transform hover:-translate-y-[2px] ${
                    formComplete
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-300"
                  } ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
                  disabled={!formComplete || isLoading}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-400 to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                  <div className="flex items-center justify-center relative z-10">
                    <span>Complete Registration</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </div>
                </Button>
              </CardFooter>
            </form>
          )}
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

      {/* Verification Waiting Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <AnimatePresence mode="wait">
            {registeredAdminId && (
              <CheckAdminVerification adminId={registeredAdminId} />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
