import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  HelpCircle,
  Users,
  CreditCard,
  Settings,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email - we respond within 24 hours",
      icon: Mail,
      contact: "info@pollix.vercel.app",
      availability: "24/7",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support team",
      icon: Phone,
      contact: "+233 55 151 5552",
      availability: "Mon-Fri, 9AM-6PM GMT",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Live Chat",
      description: "Instant help through our chat system",
      icon: MessageCircle,
      contact: "Available on website",
      availability: "Mon-Fri, 8AM-8PM GMT",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Office Visit",
      description: "Visit our office for in-person consultation",
      icon: MapPin,
      contact: "KNUST, Kumasi, Ghana",
      availability: "By appointment only",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const faqItems = [
    {
      question: "How quickly can I get my account verified?",
      answer:
        "Account verification typically takes 24-48 hours during business days. We'll send you an email notification once your account is approved.",
      category: "Account",
    },
    {
      question: "What are your pricing plans?",
      answer:
        "We operate on a revenue-sharing model with a 10% service fee on vote sales. There are no upfront costs or monthly subscriptions. You only pay when you earn.",
      category: "Billing",
    },
    {
      question: "Can I get technical support during my event?",
      answer:
        "Yes! We provide dedicated technical support during live events. Our team monitors all active events and can provide immediate assistance if needed.",
      category: "Support",
    },
    {
      question: "Do you offer training for new users?",
      answer:
        "Absolutely! We offer comprehensive onboarding sessions, video tutorials, and personalized training for institutional administrators.",
      category: "Training",
    },
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
                Have questions about Pollix? Need help with your voting events?
                We're here to help you succeed. Get in touch with our team.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Contact Methods */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Get In Touch
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <method.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {method.description}
                    </p>
                    <p className="font-medium text-gray-900 mb-2">
                      {method.contact}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {method.availability}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Form and Info */}
          <section className="mb-16">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      placeholder="University of Ghana"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">
                          Technical Support
                        </SelectItem>
                        <SelectItem value="billing">
                          Billing Question
                        </SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="demo">Request Demo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={5}
                    />
                  </div>

                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info & Office Hours */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Office Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Headquarters</h4>
                      <p className="text-gray-600">
                        BUILD SCITECH
                        <br />
                        Accra, Ghana
                        <br />
                        West Africa
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Contact Details</h4>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          info@pollix.vercel.app
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          +233 XX XXX XXXX
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Office Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {officeHours.map((schedule, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="font-medium">{schedule.day}</span>
                          <span className="text-gray-600">
                            {schedule.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Emergency support available 24/7 for active events
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Support</span>
                      <span className="text-sm font-medium text-green-600">
                        Within 24 hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Live Chat</span>
                      <span className="text-sm font-medium text-green-600">
                        Instant
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Phone Support</span>
                      <span className="text-sm font-medium text-green-600">
                        Immediate
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emergency Issues</span>
                      <span className="text-sm font-medium text-red-600">
                        Within 1 hour
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqItems.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg pr-4">
                        {faq.question}
                      </CardTitle>
                      <div className="flex-shrink-0">
                        {faq.category === "Account" && (
                          <Users className="h-5 w-5 text-blue-600" />
                        )}
                        {faq.category === "Billing" && (
                          <CreditCard className="h-5 w-5 text-green-600" />
                        )}
                        {faq.category === "Support" && (
                          <MessageCircle className="h-5 w-5 text-purple-600" />
                        )}
                        {faq.category === "Training" && (
                          <Settings className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Emergency Support */}
          <section>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-red-900">
                  Emergency Support
                </h3>
                <p className="text-red-800 mb-6 max-w-2xl mx-auto">
                  Having critical issues during a live voting event? Our
                  emergency support team is available 24/7 to ensure your events
                  run smoothly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency Hotline
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Priority Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
