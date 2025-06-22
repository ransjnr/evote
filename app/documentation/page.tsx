import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Code, 
  Users, 
  Vote, 
  Settings, 
  BarChart3, 
  Shield, 
  CreditCard,
  FileText,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  const quickStartSteps = [
    {
      step: 1,
      title: "Register Your Department",
      description: "Create an admin account for your department or organization",
      icon: Users
    },
    {
      step: 2,
      title: "Create Your First Event",
      description: "Set up voting events with custom categories and settings",
      icon: Vote
    },
    {
      step: 3,
      title: "Add Nominees",
      description: "Import or manually add nominees to your voting categories",
      icon: FileText
    },
    {
      step: 4,
      title: "Configure Payment",
      description: "Set up payment integration for vote purchases",
      icon: CreditCard
    },
    {
      step: 5,
      title: "Launch & Monitor",
      description: "Go live and track results in real-time",
      icon: BarChart3
    }
  ];

  const features = [
    {
      title: "Multi-Department Support",
      description: "Each department manages its own events independently",
      icon: Users,
      category: "Management"
    },
    {
      title: "Secure Voting System",
      description: "Pay-to-vote mechanism ensures fair participation",
      icon: Shield,
      category: "Security"
    },
    {
      title: "Real-time Analytics",
      description: "Live dashboards and comprehensive reporting",
      icon: BarChart3,
      category: "Analytics"
    },
    {
      title: "Payment Integration",
      description: "Seamless Paystack integration for vote purchases",
      icon: CreditCard,
      category: "Payments"
    },
    {
      title: "Nominee Management",
      description: "Easy nominee import, export, and profile management",
      icon: FileText,
      category: "Management"
    },
    {
      title: "Event Customization",
      description: "Flexible event settings and category configurations",
      icon: Settings,
      category: "Customization"
    }
  ];

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/events",
      description: "Retrieve all public events",
      response: "Array of event objects"
    },
    {
      method: "GET",
      endpoint: "/api/events/[id]",
      description: "Get specific event details",
      response: "Event object with categories and nominees"
    },
    {
      method: "POST",
      endpoint: "/api/votes",
      description: "Submit a vote (requires payment)",
      response: "Vote confirmation object"
    },
    {
      method: "GET",
      endpoint: "/api/results/[eventId]",
      description: "Get voting results for an event",
      response: "Results object with vote counts"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Pollix Documentation
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                Everything you need to know about building, deploying, and managing 
                voting events on the Pollix platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="#quick-start" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Get Started
                </Link>
                <Link href="#api-reference" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  API Reference
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      What is Pollix?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Pollix is a comprehensive electronic voting platform designed for 
                      educational institutions and organizations. It provides secure, 
                      transparent, and efficient voting solutions with built-in payment 
                      processing.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Multi-department support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Secure pay-to-vote system
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Real-time analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Mobile-responsive design
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Transparency</h4>
                        <p className="text-sm text-gray-600">
                          All votes are recorded securely with full audit trails
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Efficiency</h4>
                        <p className="text-sm text-gray-600">
                          Automated vote counting and instant result generation
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Accessibility</h4>
                        <p className="text-sm text-gray-600">
                          Mobile-first design works on any device
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Security</h4>
                        <p className="text-sm text-gray-600">
                          Enterprise-grade security with payment verification
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Architecture Overview</CardTitle>
                  <CardDescription>
                    Understanding the Pollix platform architecture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Frontend</h3>
                      <p className="text-sm text-gray-600">
                        Next.js 14 with TypeScript, Tailwind CSS, and Framer Motion
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Code className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Backend</h3>
                      <p className="text-sm text-gray-600">
                        Convex database with real-time subscriptions and serverless functions
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Payments</h3>
                      <p className="text-sm text-gray-600">
                        Paystack integration for secure payment processing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Start Tab */}
            <TabsContent value="quick-start" className="space-y-8" id="quick-start">
              <div>
                <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
                <p className="text-gray-600 mb-8">
                  Get up and running with Pollix in just a few minutes. Follow these steps to create your first voting event.
                </p>
              </div>

              <div className="space-y-6">
                {quickStartSteps.map((step, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <step.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{step.title}</h3>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                        {index < quickStartSteps.length - 1 && (
                          <ArrowRight className="h-5 w-5 text-gray-400 absolute -bottom-8 left-9" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Pro Tip</h3>
                  </div>
                  <p className="text-blue-800">
                    Start with a test event to familiarize yourself with the platform before launching your main voting campaign. 
                    You can always duplicate successful event configurations for future use.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
                <p className="text-gray-600 mb-8">
                  Explore the comprehensive features that make Pollix the ideal choice for your voting needs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <feature.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <Badge variant="secondary">{feature.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* API Reference Tab */}
            <TabsContent value="api" className="space-y-8" id="api-reference">
              <div>
                <h2 className="text-3xl font-bold mb-4">API Reference</h2>
                <p className="text-gray-600 mb-8">
                  Integrate with Pollix using our RESTful API. All endpoints return JSON responses.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    API requests require authentication using session tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <code className="text-sm">
                      Authorization: Bearer YOUR_SESSION_TOKEN
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 'destructive'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{endpoint.description}</p>
                        <p className="text-xs text-gray-500">Returns: {endpoint.response}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Code Examples</h2>
                <p className="text-gray-600 mb-8">
                  Practical examples to help you integrate with the Pollix API.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fetch Events</CardTitle>
                    <CardDescription>Get all public voting events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`fetch('/api/events')
  .then(response => response.json())
  .then(events => {
    console.log('Events:', events);
  })
  .catch(error => {
    console.error('Error:', error);
  });`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Submit Vote</CardTitle>
                    <CardDescription>Cast a vote for a nominee</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`fetch('/api/votes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    nomineeId: 'nominee_123',
    categoryId: 'category_456',
    paymentReference: 'pay_ref_789'
  })
})
.then(response => response.json())
.then(result => {
  console.log('Vote submitted:', result);
});`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
} 