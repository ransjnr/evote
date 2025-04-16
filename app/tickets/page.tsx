import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Ticket,
  QrCode,
  ClipboardCheck,
  Calendar,
  UserCircle,
  CreditCard,
  ChevronRight,
} from "lucide-react";

export default function TicketsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="py-4 px-6 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary flex items-center"
          >
            <span className="bg-primary text-white p-1 rounded mr-1">e</span>
            Vote
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/events"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Events
            </Link>
            <Link
              href="/tickets"
              className="text-primary transition-colors font-medium"
            >
              Tickets
            </Link>
            <Link
              href="/features"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              Blog
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/events"
              className="hidden md:block text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Explore Events
            </Link>
            <Link href="/admin/login">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                Ticketing System
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Streamline Your Event Experience with Digital Tickets
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Our comprehensive ticketing system helps organizers manage
                attendance while providing attendees with a seamless experience
                from purchase to check-in.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/events">
                  <Button size="lg" className="w-full sm:w-auto">
                    Browse Events
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Create Your Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Powerful Ticketing Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage tickets for your events
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Multiple Ticket Types
              </h3>
              <p className="text-gray-600 mb-6">
                Create different ticket categories like VIP, Early Bird, or
                Regular with unique pricing and benefits.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></span>
                  Customizable ticket limits
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></span>
                  Unique benefits per type
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></span>
                  Flexible pricing options
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <QrCode className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Secure QR Code Tickets
              </h3>
              <p className="text-gray-600 mb-6">
                Generate secure, unique QR codes for each ticket that can be
                easily verified at your venue.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-2"></span>
                  Tamper-proof digital tickets
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-2"></span>
                  Easy sharing options
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-2"></span>
                  Print or digital format
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <ClipboardCheck className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Effortless Check-in
              </h3>
              <p className="text-gray-600 mb-6">
                Make entry management simple with our mobile scanning solution
                for fast, accurate check-ins.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mr-2"></span>
                  Real-time attendance tracking
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mr-2"></span>
                  Prevent duplicate entries
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mr-2"></span>
                  Works offline when needed
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How Our Ticketing System Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A seamless process from setup to check-in
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 left-16 bottom-0 w-1 bg-gray-200 hidden md:block"></div>

              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-start mb-12 relative">
                <div className="flex-shrink-0 mr-8 mb-4 md:mb-0 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center md:border-4 md:border-white">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-grow bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
                    Create Event & Ticket Types
                  </h3>
                  <p className="text-gray-600">
                    Set up your event details and create different ticket types
                    with customized pricing, availability periods, and
                    capacities.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-start mb-12 relative">
                <div className="flex-shrink-0 mr-8 mb-4 md:mb-0 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center md:border-4 md:border-white">
                    <UserCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex-grow bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
                    Attendees Make Reservations
                  </h3>
                  <p className="text-gray-600">
                    Attendees can browse available tickets, select their
                    preferred type, and complete the reservation process with
                    their details.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-start mb-12 relative">
                <div className="flex-shrink-0 mr-8 mb-4 md:mb-0 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center md:border-4 md:border-white">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex-grow bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
                    Process Payments
                  </h3>
                  <p className="text-gray-600">
                    Secure payment processing with multiple payment methods
                    available. Payments are verified in real-time.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-start relative">
                <div className="flex-shrink-0 mr-8 mb-4 md:mb-0 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center md:border-4 md:border-white">
                    <QrCode className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex-grow bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
                    Generate & Distribute Tickets
                  </h3>
                  <p className="text-gray-600">
                    QR code tickets are automatically generated after payment.
                    Attendees can download, print, or access them on their
                    mobile devices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Simplify Your Event Management?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of event organizers who trust our platform for
              their ticketing needs
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/admin/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                >
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="text-2xl font-bold flex items-center">
                <span className="bg-white text-primary p-1 rounded mr-1">
                  e
                </span>
                <span className="text-white">Vote</span>
              </Link>
            </div>
            <div className="flex gap-8">
              <Link href="/events" className="text-gray-300 hover:text-white">
                Events
              </Link>
              <Link href="/tickets" className="text-gray-300 hover:text-white">
                Tickets
              </Link>
              <Link href="/features" className="text-gray-300 hover:text-white">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white">
                Pricing
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} eVote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
