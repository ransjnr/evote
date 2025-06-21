"use client";

import React from "react";
import {
  CheckCircle,
  Star,
  Vote,
  Ticket,
  Users,
  Shield,
  Clock,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";

export default function PricingPage() {
  const platformFeatures = {
    voting: [
      "E-voting platform access",
      "USSD voting integration",
      "Real-time vote counting",
      "Secure payment processing",
      "Multiple payment methods (Mobile Money, Cards)",
      "Voter verification systems",
      "Vote transparency and audit trails",
      "Campaign flyer generation",
      "Nominee management system",
    ],
    ticketing: [
      "Event ticket creation and management",
      "QR code ticket generation",
      "Ticket sales with secure payments",
      "Reserved seating management",
      "Ticket validation systems",
      "Revenue tracking and analytics",
      "Digital ticket delivery",
      "Refund and cancellation handling",
    ],
    campaigns: [
      "Free nomination campaign creation",
      "Nominee registration portal",
      "Campaign material templates",
      "Category management",
      "Event setup and configuration",
      "Department administration",
      "User role management",
      "Basic analytics dashboard",
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Pollix Platform Service Agreement
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                Comprehensive electronic voting and event management platform
                with transparent pricing. All platform features included with
                our simple revenue-sharing model.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admin/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Service Overview */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Platform Access
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                One simple pricing model gives you access to our entire platform
                including voting, ticketing, and nomination campaign management.
                No feature restrictions or hidden costs.
              </p>
            </div>

            {/* Main Pricing Card */}
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-green-500 shadow-xl">
                <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex justify-center mb-4">
                    <Badge className="bg-green-500 text-white px-6 py-2 text-lg">
                      Complete Platform Access
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                    Simple Revenue Sharing
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Pollix retains 10% of all incoming transactions as service
                    fee. You receive 90% of all payments within 5 working days
                    after your event.
                  </CardDescription>
                  <div className="mt-8 bg-white rounded-lg p-6 shadow-inner">
                    <div className="flex items-center justify-center text-4xl font-bold text-blue-600 mb-2">
                      10% Service Fee
                    </div>
                    <div className="text-gray-600">
                      Includes all platform features, payment processing, and
                      support
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Vote className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Voting Platform
                      </h3>
                      <p className="text-gray-600">
                        Complete e-voting solution with USSD integration
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Event Ticketing
                      </h3>
                      <p className="text-gray-600">
                        Full ticketing system with QR codes and payments
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Free Campaigns
                      </h3>
                      <p className="text-gray-600">
                        Unlimited nomination campaigns at no extra cost
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Platform Features */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need in One Platform
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Access all features without restrictions. Your 10% service fee
                covers the entire platform ecosystem.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Voting Features */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <Vote className="w-6 h-6 text-green-600 mr-3" />
                    <CardTitle className="text-xl">Voting System</CardTitle>
                  </div>
                  <CardDescription>
                    Complete electronic voting solution with secure payment
                    integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {platformFeatures.voting.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Ticketing Features */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <Ticket className="w-6 h-6 text-green-600 mr-3" />
                    <CardTitle className="text-xl">Event Ticketing</CardTitle>
                  </div>
                  <CardDescription>
                    Professional ticketing system with payment processing and
                    management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {platformFeatures.ticketing.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Campaign Features */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-purple-600 mr-3" />
                    <CardTitle className="text-xl">Free Campaigns</CardTitle>
                  </div>
                  <CardDescription>
                    Nomination campaign management with no additional charges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {platformFeatures.campaigns.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Service Agreement Details */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Agreement Terms
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Clear, transparent terms based on our standard service
                agreement. No surprises, no hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Payment Processing
                </h3>
                <p className="text-sm text-gray-600">
                  We process all payments on your behalf through secure USSD and
                  web platforms
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-green-600 font-bold text-lg">10%</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Service Fee
                </h3>
                <p className="text-sm text-gray-600">
                  Ten percent (10%) retained as service fee, including all taxes
                  and charges
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-purple-600 font-bold text-lg">90%</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Your Revenue
                </h3>
                <p className="text-sm text-gray-600">
                  Ninety percent (90%) transferred to your designated bank
                  account
                </p>
              </div>

              <div className="text-center p-6 bg-amber-50 rounded-lg">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Transfer Timeline
                </h3>
                <p className="text-sm text-gray-600">
                  Funds transferred within five (5) working days after event
                  completion
                </p>
              </div>
            </div>
          </div>

          {/* Platform Guarantees */}
          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Platform Guarantees
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-green-600 mr-3" />
                  Service Availability
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    Platform and USSD application available at all times except
                    scheduled maintenance
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    48-hour advance notice for any scheduled downtime
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    All advertised features operational throughout election
                    period
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-blue-600 mr-3" />
                  Security & Compliance
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    Strict confidentiality maintained for all sensitive
                    information
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    Secure payment processing with fraud protection
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    Governed by the laws of the Republic of Ghana
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What's included in the 10% service fee?
                </h3>
                <p className="text-gray-600 mb-6">
                  The 10% fee covers all platform features (voting, ticketing,
                  campaigns), payment processing, technical support,
                  maintenance, and all applicable taxes.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are nomination campaigns really free?
                </h3>
                <p className="text-gray-600 mb-6">
                  Yes! Creating nomination campaigns, managing nominees, and
                  setting up categories is completely free. You only pay the 10%
                  fee on actual voting transactions.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  When will I receive my funds?
                </h3>
                <p className="text-gray-600">
                  Your 90% share will be transferred to your designated bank
                  account within 5 working days after your voting event is
                  completed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What payment methods are supported?
                </h3>
                <p className="text-gray-600 mb-6">
                  We support all major mobile money services (MTN, Vodafone,
                  AirtelTigo) and major credit/debit cards (Visa, Mastercard)
                  through both web and USSD.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I cancel after voting starts?
                </h3>
                <p className="text-gray-600 mb-6">
                  Once voting services commence, the contract becomes
                  non-terminable until completion to ensure election integrity.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What kind of support do I get?
                </h3>
                <p className="text-gray-600">
                  You get full technical support throughout your event,
                  including platform setup assistance, voter support, and
                  real-time monitoring.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Event?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join organizations across Ghana using Pollix for secure electronic
              voting, professional event ticketing, and free nomination
              campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline">
                  Browse Public Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
