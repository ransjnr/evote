"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function FixDepartmentRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the fix page after a brief delay
    const timer = setTimeout(() => {
      router.push("/admin/fix-department");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Department Configuration Issue
        </h1>
        <p className="text-gray-600 mb-6">
          We've detected an issue with your department configuration.
          Redirecting you to the fix page...
        </p>

        <div className="animate-pulse mb-6">
          <div className="h-2 bg-amber-200 rounded w-full"></div>
        </div>

        <Link href="/admin/fix-department">
          <Button className="w-full">
            Go to Fix Page Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <div className="mt-6 text-xs text-gray-500">
          If you're not redirected automatically, click the button above.
        </div>
      </div>
    </div>
  );
}
