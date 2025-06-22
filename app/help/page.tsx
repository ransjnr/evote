import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  MessageCircle, 
  Book, 
  Video, 
  Mail, 
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Shield
} from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: Book,
      color: "bg-blue-100 text-blue-600",
      faqs: [
        {
          question: "How do I create my first voting event?",
          answer: "To create your first voting event, log in to your admin dashboard, navigate to 'Events', click 'Create New Event', and follow the step-by-step wizard. You'll need to set up event details, categories, and nominees before publishing."
        },
        {
          question: "What information do I need to register my department?",
          answer: "You'll need your department name, contact email, phone number, and institutional affiliation. Make sure to use an official email address as it will be verified during the registration process."
        },
        {
          question: "How long does account verification take?",
          answer: "Account verification typically takes 24-48 hours. You'll receive an email notification once your account is approved. During peak periods, it may take up to 72 hours."
        }
      ]
    },
    {
      title: "Voting Process",
      icon: Users,
      color: "bg-green-100 text-green-600",
      faqs: [
        {
          question: "How does the pay-to-vote system work?",
          answer: "Voters must purchase votes using mobile money or card payments before they can cast their ballot. This ensures fair participation and helps prevent spam voting. Each vote costs a small fee set by the event organizer."
        },
        {
          question: "Can voters vote multiple times for the same nominee?",
          answer: "Yes, voters can purchase multiple votes for the same nominee or distribute their votes across different categories. However, there may be limits set by the event organizer."
        },
        {
          question: "What happens if a payment fails during voting?",
          answer: "If a payment fails, the vote is not recorded and the voter can try again. No charges are applied for failed transactions. Voters will receive immediate feedback about payment status."
        }
      ]
    },
    {
      title: "Payment & Billing",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-600",
      faqs: [
        {
          question: "What payment methods are supported?",
          answer: "We support MTN Mobile Money, Vodafone Cash, AirtelTigo Money, and major credit/debit cards (Visa, Mastercard) through our secure Paystack integration."
        },
        {
          question: "How do I track revenue from my events?",
          answer: "Revenue tracking is available in your admin dashboard under 'Analytics'. You can view real-time revenue, payment breakdowns, and generate financial reports for accounting purposes."
        },
        {
          question: "When do I receive payments from vote sales?",
          answer: "Payments are processed according to our revenue sharing agreement. Typically, funds are transferred to your account within 7-14 business days after the event ends."
        }
      ]
    },
    {
      title: "Technical Issues",
      icon: Settings,
      color: "bg-red-100 text-red-600",
      faqs: [
        {
          question: "The platform is loading slowly. What should I do?",
          answer: "Clear your browser cache, check your internet connection, and try using a different browser. If the issue persists, it may be due to high traffic during peak voting periods."
        },
        {
          question: "I can't upload nominee photos. What's wrong?",
          answer: "Ensure your images are in JPG, PNG, or WebP format and under 5MB in size. Images should be at least 400x400 pixels for best quality. Try compressing large images before uploading."
        },
        {
          question: "Why can't I see real-time vote updates?",
          answer: "Real-time updates require a stable internet connection. Try refreshing the page or checking your network connection. If using mobile data, ensure you have sufficient data allowance."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "24/7",
      action: "Start Chat",
      color: "bg-blue-600"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions via email",
      icon: Mail,
      availability: "Response within 24hrs",
      action: "Send Email",
      color: "bg-green-600"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our technical team",
      icon: Phone,
      availability: "Mon-Fri, 9AM-6PM",
      action: "Call Now",
      color: "bg-purple-600"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: Video,
      availability: "Available 24/7",
      action: "Watch Now",
      color: "bg-orange-600"
    }
  ];

  const quickLinks = [
    {
      title: "Account Setup",
      description: "Learn how to set up your department account",
      icon: Users,
      link: "/guides/account-setup"
    },
    {
      title: "Event Management",
      description: "Complete guide to creating and managing events",
      icon: Settings,
      link: "/guides/event-management"
    },
    {
      title: "Payment Integration",
      description: "Set up payment processing for your events",
      icon: CreditCard,
      link: "/guides/payment-setup"
    },
    {
      title: "Analytics & Reporting",
      description: "Understanding your voting data and reports",
      icon: BarChart3,
      link: "/guides/analytics"
    },
    {
      title: "Security Best Practices",
      description: "Keep your voting events secure and fair",
      icon: Shield,
      link: "/guides/security"
    }
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
                Help Center
              </h1>
              <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
                Find answers to your questions, get support, and learn how to make the most of Pollix.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Search for help articles, guides, or FAQs..."
                    className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder-white/70 backdrop-blur-sm"
                  />
                  <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-green-600 hover:bg-gray-100">
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Support Options */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Get Help Your Way</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <option.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
                      <Clock className="h-3 w-3" />
                      {option.availability}
                    </div>
                    <Button className="w-full" variant="outline">
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Help Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.link}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <link.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{link.title}</h3>
                          <p className="text-sm text-gray-600">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                        <category.icon className="h-5 w-5" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-16">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you with any questions or issues you might have.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Us
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