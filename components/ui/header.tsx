"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  const getLinkClass = (path: string) => {
    const baseClass =
      "text-gray-600 hover:text-primary transition-colors font-medium";
    return isActivePath(path)
      ? `${baseClass} text-primary font-bold border-b-2 border-primary`
      : baseClass;
  };

  const navLinks = [
    // { href: "/events", label: "Events" },
    { href: "/etickets", label: "eTicketing" },
    { href: "/nominations", label: "Nominations" },
    // { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    // { href: "/blog", label: "Blog" },
  ];

  return (
    <header
      className={`py-4 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 ${className}`}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-primary flex items-center"
        >
          <Image
            src="/Pollix.png"
            alt="Pollix"
            width={75}
            height={75}
            className="mr-2 rounded"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={getLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/events"
            className="text-gray-700 hover:text-primary font-medium transition-colors"
          >
            Explore Events
          </Link>
          <Link href="/admin/login">
            <Button className="rounded-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
          <nav className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 ${getLinkClass(link.href)}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Link
                href="/events"
                className="block py-2 text-gray-700 hover:text-primary font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Events
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button className="w-full rounded-full">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
