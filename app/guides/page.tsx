import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Settings, 
  CreditCard, 
  BarChart3, 
  Shield, 
  Zap,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Download,
  Eye
} from "lucide-react";
import Link from "next/link";

export default function GuidesPage() {
  const guideCategories = [
    {
      title: "Getting Started",
      description: "Essential guides for new users",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      guides: [
        {
          title: "Complete Setup Guide",
          description: "Everything you need to know to get started with Pollix",
          duration: "15 min read",
          difficulty: "Beginner",
          rating: 4.9,
          views: "12.5k",
          featured: true
        },
        {
          title: "Account Verification Process",
          description: "Step-by-step guide to verify your department account",
          duration: "5 min read",
          difficulty: "Beginner",
          rating: 4.8,
          views: "8.2k"
        },
        {
          title: "First Event Creation",
          description: "Create your first voting event from start to finish",
          duration: "20 min read",
          difficulty: "Beginner",
          rating: 4.9,
          views: "15.3k"
        }
      ]
    },
    {
      title: "Event Management",
      description: "Master event creation and management",
      icon: Settings,
      color: "bg-green-100 text-green-600",
      guides: [
        {
          title: "Advanced Event Configuration",
          description: "Configure complex voting scenarios and custom rules",
          duration: "25 min read",
          difficulty: "Advanced",
          rating: 4.7,
          views: "6.8k"
        },
        {
          title: "Nominee Management Best Practices",
          description: "Efficiently manage large numbers of nominees",
          duration: "12 min read",
          difficulty: "Intermediate",
          rating: 4.8,
          views: "9.1k"
        },
        {
          title: "Category Setup and Organization",
          description: "Structure your voting categories for maximum engagement",
          duration: "10 min read",
          difficulty: "Intermediate",
          rating: 4.6,
          views: "7.4k"
        }
      ]
    },
    {
      title: "Payment Integration",
      description: "Set up and manage payment processing",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-600",
      guides: [
        {
          title: "Paystack Integration Setup",
          description: "Complete guide to setting up payment processing",
          duration: "18 min read",
          difficulty: "Intermediate",
          rating: 4.9,
          views: "11.2k",
          featured: true
        },
        {
          title: "Revenue Tracking and Reports",
          description: "Monitor and analyze your event revenue",
          duration: "8 min read",
          difficulty: "Beginner",
          rating: 4.7,
          views: "5.9k"
        },
        {
          title: "Refund and Dispute Management",
          description: "Handle payment issues and customer disputes",
          duration: "15 min read",
          difficulty: "Advanced",
          rating: 4.5,
          views: "3.8k"
        }
      ]
    },
    {
      title: "Analytics & Reporting",
      description: "Understand your voting data",
      icon: BarChart3,
      color: "bg-orange-100 text-orange-600",
      guides: [
        {
          title: "Real-time Analytics Dashboard",
          description: "Make the most of your live voting analytics",
          duration: "12 min read",
          difficulty: "Intermediate",
          rating: 4.8,
          views: "8.7k"
        },
        {
          title: "Custom Report Generation",
          description: "Create detailed reports for stakeholders",
          duration: "20 min read",
          difficulty: "Advanced",
          rating: 4.6,
          views: "4.3k"
        },
        {
          title: "Data Export and Integration",
          description: "Export data for external analysis and reporting",
          duration: "10 min read",
          difficulty: "Intermediate",
          rating: 4.7,
          views: "6.1k"
        }
      ]
    },
    {
      title: "Security & Best Practices",
      description: "Keep your events secure and fair",
      icon: Shield,
      color: "bg-red-100 text-red-600",
      guides: [
        {
          title: "Voting Security Best Practices",
          description: "Ensure fair and secure voting processes",
          duration: "16 min read",
          difficulty: "Intermediate",
          rating: 4.9,
          views: "9.8k",
          featured: true
        },
        {
          title: "Fraud Prevention Strategies",
          description: "Identify and prevent voting fraud",
          duration: "22 min read",
          difficulty: "Advanced",
          rating: 4.8,
          views: "5.2k"
        },
        {
          title: "Data Privacy and Compliance",
          description: "Maintain compliance with data protection regulations",
          duration: "14 min read",
          difficulty: "Intermediate",
          rating: 4.7,
          views: "4.9k"
        }
      ]
    },
    {
      title: "User Management",
      description: "Manage voters and administrators",
      icon: Users,
      color: "bg-indigo-100 text-indigo-600",
      guides: [
        {
          title: "Admin Role Management",
          description: "Set up and manage administrative roles",
          duration: "11 min read",
          difficulty: "Intermediate",
          rating: 4.6,
          views: "7.3k"
        },
        {
          title: "Voter Engagement Strategies",
          description: "Increase participation and engagement",
          duration: "13 min read",
          difficulty: "Beginner",
          rating: 4.8,
          views: "10.4k"
        },
        {
          title: "Communication and Notifications",
          description: "Keep users informed throughout the voting process",
          duration: "9 min read",
          difficulty: "Beginner",
          rating: 4.7,
          views: "6.8k"
        }
      ]
    }
  ];

  const featuredGuides = guideCategories.flatMap(category => 
    category.guides.filter(guide => guide.featured)
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Pollix Guides
              </h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
                Step-by-step tutorials, best practices, and expert tips to help you master 
                the Pollix platform and create successful voting events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-purple-600 hover:bg-purple-50">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All Guides
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch Video Tutorials
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Featured Guides */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold">Featured Guides</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGuides.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg pr-20">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {guide.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {guide.views}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        {guide.rating}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Read Guide
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* All Guide Categories */}
          <section>
            <h2 className="text-3xl font-bold mb-8">All Guides by Category</h2>
            <div className="space-y-12">
              {guideCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{category.title}</h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.guides.map((guide, guideIndex) => (
                      <Card key={guideIndex} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{guide.title}</CardTitle>
                          <CardDescription>{guide.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {guide.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {guide.views}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              <Star className="h-3 w-3 fill-current" />
                              {guide.rating}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className={getDifficultyColor(guide.difficulty)}>
                              {guide.difficulty}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Read Guide
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Resources */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-12">Additional Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Video Tutorials</h3>
                  <p className="text-gray-600 mb-4">
                    Watch comprehensive video guides covering all platform features
                  </p>
                  <Button variant="outline" className="w-full">
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">PDF Downloads</h3>
                  <p className="text-gray-600 mb-4">
                    Download printable guides and quick reference sheets
                  </p>
                  <Button variant="outline" className="w-full">
                    Download PDFs
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Quick Start</h3>
                  <p className="text-gray-600 mb-4">
                    Get up and running in minutes with our quick start guide
                  </p>
                  <Link href="/documentation">
                    <Button variant="outline" className="w-full">
                      Quick Start
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Need Personalized Help?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Our expert team is available to provide one-on-one guidance and custom training 
                  sessions for your organization.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Schedule Training
                  </Button>
                  <Link href="/help">
                    <Button variant="outline">
                      Contact Support
                    </Button>
                  </Link>
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