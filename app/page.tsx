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
import Image from "next/image";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Header />

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
                  Start Voting Event
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/etickets">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-green-400 text-white border-none"
                >
                  Browse Tickets
                  <ArrowUpRight className="ml-2 h-5 w-5" />
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
                      <span>Best Innovation</span>
                    </div>
                    <span className="text-xs text-gray-500">15 nominees</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">245</div>
                  <div className="text-xs text-gray-500">Total Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">₵1,225</div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">35</div>
                  <div className="text-xs text-gray-500">Nominees</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  📈 +12% from last event
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
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

      {/* Features section */}
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
              Pollix makes it simple to set up and manage voting events
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src="/feature-illustration.svg"
                alt="Pollix platform illustration"
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
                    Track results in real-time
                  </h3>
                  <p className="text-gray-600">
                    Monitor votes, analyze patterns, and export detailed
                    reports.
                  </p>
                </div>
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
              Boost your events with Pollix today
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
      <section className="py-24 bg-gray-50">
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
                  How do I get started with Pollix?
                </AccordionTrigger>
                <AccordionContent>
                  Getting started with Pollix is easy! Simply click on the
                  &apos;Register&apos; button, create a department account, and
                  you&apos;ll be guided through setting up your first voting
                  event. You can add categories, nominees, and customize your
                  voting experience in minutes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Can I use Pollix for free?</AccordionTrigger>
                <AccordionContent>
                  Yes! Pollix offers a free tier that allows you to create and
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
                  How does Pollix handle payments?
                </AccordionTrigger>
                <AccordionContent>
                  Pollix integrates with trusted payment processors to handle
                  vote purchases securely. Voters can pay using various methods
                  including credit cards and mobile money. As an admin,
                  you&apos;ll receive detailed reports of all transactions and
                  can track revenue in real-time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Does Pollix work for teams and individuals?
                </AccordionTrigger>
                <AccordionContent>
                  Pollix is designed to be flexible! Whether you&apos;re
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
      <Footer />
    </div>
  );
}
