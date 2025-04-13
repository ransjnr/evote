import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Users,
  ArrowUpRight,
  Vote,
  Menu,
  X,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="py-4 px-6 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container-custom mx-auto flex justify-between items-center">
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
      <section className="hero-section">
        <div className="absolute inset-0 noise-overlay"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full blur-circle animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full blur-circle animate-pulse-slow"></div>

        <div className="container-custom relative mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 border border-white/20">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium">
                Secure voting platform for events
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-4xl">
              Secure{" "}
              <span className="relative inline-block">
                Pay-to-Vote
                <span className="absolute bottom-1 left-0 w-full h-2 bg-primary opacity-30"></span>
              </span>{" "}
              Platform for Events & Awards
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">
              A real-time voting platform where your department can manage
              events, nominees, categories, and secure payment-based voting all
              in one place.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/events">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white text-gray-800 border-none"
                >
                  Explore Events
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button
                  size="lg"
                  variant="gradient"
                  className="w-full sm:w-auto"
                >
                  Admin Dashboard
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="relative bg-green-100 p-8 rounded-3xl shadow-xl">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Vote className="h-6 w-6 text-white" />
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="font-bold mb-2">
                  Department of Computer Science
                </h3>
                <p className="text-gray-500 text-sm mb-4">Annual Awards 2024</p>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        1
                      </div>
                      <span>Best Student</span>
                    </div>
                    <span className="text-xs text-gray-500">12 nominees</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        2
                      </div>
                      <span>Best Project</span>
                    </div>
                    <span className="text-xs text-gray-500">8 nominees</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                        3
                      </div>
                      <span>Most Innovative</span>
                    </div>
                    <span className="text-xs text-gray-500">6 nominees</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full" variant="gradient">
                    Vote Now
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-bold text-gray-700">200+</span> votes
                  today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern bridge/divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <div className="relative h-20">
            {/* Overlapping curved shapes */}
            <div className="absolute bottom-0 w-full">
              <svg
                viewBox="0 0 1440 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                <path
                  d="M0 96L1440 96V54.6C1314 78.6 1186 96 1080 96C891 96 697 32 471 32C331 32 160 49.3 0 84V96Z"
                  fill="rgba(255, 255, 255, 0.2)"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 w-full">
              <svg
                viewBox="0 0 1440 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                <path
                  d="M0 80L1440 80V39C1321.5 15.5 1193 0 1080 0C891 0 699 64 471 64C331 64 160 48 0 15V80Z"
                  fill="rgba(255, 255, 255, 0.25)"
                />
              </svg>
            </div>
            <div className="absolute bottom-0 w-full">
              <svg
                viewBox="0 0 1440 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
              >
                <path
                  d="M0 64L1440 64V24C1379 35 1325 40 1080 40C891 40 688 8 471 8C331 8 150 16 0 32V64Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="py-16 bg-white">
        <div className="container-custom mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-gray-500 mb-2">
              Trusted by Organizations Across Education
            </h2>
            <div className="w-20 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="w-36 h-16 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300 p-3">
              <span className="text-xl font-bold text-primary">UNIVERSITY</span>
            </div>
            <div className="w-36 h-16 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300 p-3">
              <span className="text-xl font-bold text-blue-600">SCHOOL</span>
            </div>
            <div className="w-36 h-16 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300 p-3">
              <span className="text-xl font-bold text-purple-600">COLLEGE</span>
            </div>
            <div className="w-36 h-16 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300 p-3">
              <span className="text-xl font-bold text-amber-600">ACADEMY</span>
            </div>
            <div className="w-36 h-16 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-300 p-3">
              <span className="text-xl font-bold text-indigo-600">
                INSTITUTE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Smarter voting with less effort
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform simplifies the entire voting process while providing
              powerful tools for organizers and voters alike.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Multi-Department Support
              </h3>
              <p className="text-gray-600">
                Each department manages its own voting sessions and nominees
                from a department-specific admin dashboard.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Secure Pay-to-Vote System
              </h3>
              <p className="text-gray-600">
                All voters remain anonymous and must pay a small token before
                they can cast a vote, ensuring fair participation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Real-time Analytics
              </h3>
              <p className="text-gray-600">
                Track voting patterns, view charts, and generate detailed
                reports in real-time for informed decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-24 bg-white">
        <div className="container-custom mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-2">
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Organize, automate, and manage voting
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              eVote makes it simple to set up and manage voting events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mt-20">
            <div className="bg-white p-6 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src="/feature-illustration.svg"
                alt="eVote platform illustration"
                className="w-full h-auto rounded-xl"
              />
            </div>
            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Create events and categories
                  </h3>
                  <p className="text-gray-600">
                    Quickly set up events with custom categories and nominees.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Secure payment processing
                  </h3>
                  <p className="text-gray-600">
                    Integrated payment system for vote purchases with real-time
                    tracking.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Track results and analytics
                  </h3>
                  <p className="text-gray-600">
                    Monitor voting progress and generate detailed reports on
                    results.
                  </p>
                </div>
              </div>

              <div>
                <Link href="/admin/register">
                  <Button variant="gradient" size="lg">
                    Start your first event
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-400/40 rounded-full blur-circle"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400/40 rounded-full blur-circle"></div>

        <div className="container-custom mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Boost your events with eVote today
            </h2>
            <p className="text-xl mb-10 text-white/80">
              Start for free with no credit card required
            </p>
            <Link href="/admin/register">
              <Button
                size="lg"
                className="bg-white text-gray-800 hover:bg-white/90"
              >
                Get started for free
              </Button>
            </Link>
            <p className="mt-4 text-sm text-white/60">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container-custom mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-2">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get answers to common questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our platform
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  How do I get started with eVote?
                </AccordionTrigger>
                <AccordionContent>
                  Getting started with eVote is easy! Simply click on the
                  &apos;Register&apos; button, create a department account, and
                  you&apos;ll be guided through setting up your first voting
                  event. You can add categories, nominees, and customize your
                  voting experience in minutes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Can I use eVote for free?</AccordionTrigger>
                <AccordionContent>
                  Yes! eVote offers a free tier that allows you to create and
                  manage basic voting events. For more advanced features like
                  custom branding, API access, and premium support, we offer
                  affordable paid plans that scale with your needs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Is the voting system secure?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. Security is our top priority. All voting
                  transactions are processed server-side with Convex, and our
                  pay-to-vote system adds an additional layer of verification.
                  We implement industry-standard encryption and follow best
                  practices to protect your data.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  How does eVote handle payments?
                </AccordionTrigger>
                <AccordionContent>
                  eVote integrates with trusted payment processors to handle
                  vote purchases securely. Voters can pay using various methods
                  including credit cards and mobile money. As an admin,
                  you&apos;ll receive detailed reports of all transactions and
                  can track revenue in real-time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Does eVote work for teams and individuals?
                </AccordionTrigger>
                <AccordionContent>
                  eVote is designed to be flexible! Whether you&apos;re
                  organizing a small classroom award or a large departmental
                  event with thousands of participants, our platform scales to
                  meet your needs. Multi-department support makes it perfect for
                  organizations of any size.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-bg py-16 text-white relative">
        <div className="absolute inset-0 noise-overlay"></div>
        <div className="container-custom mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <Link
                href="/"
                className="text-2xl font-bold flex items-center mb-6"
              >
                <span className="bg-white text-primary p-1 rounded mr-1">
                  e
                </span>
                <span className="text-white">Vote</span>
              </Link>
              <p className="text-white/70 mb-6">
                A secure, real-time, feature-rich pay-to-vote platform for
                school awards and events
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Guides
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-sm text-white/50">
            <p>
              © {new Date().getFullYear()} eVote Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
