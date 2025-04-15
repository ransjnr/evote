"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function SystemLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
} 