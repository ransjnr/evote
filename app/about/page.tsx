import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Heart, 
  Users, 
  Globe, 
  Award, 
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Mail,
  Linkedin,
  Twitter,
  Github
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const stats = [
    {
      value: "50,000+",
      label: "Votes Cast",
      icon: Users
    },
    {
      value: "200+",
      label: "Events Hosted",
      icon: Award
    },
    {
      value: "25+",
      label: "Institutions",
      icon: Globe
    },
    {
      value: "99.9%",
      label: "Uptime",
      icon: Shield
    }
  ];

  const values = [
    {
      title: "Transparency",
      description: "We believe in open, transparent voting processes that build trust and confidence in democratic participation.",
      icon: Shield,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge solutions that make voting more accessible and efficient.",
      icon: Zap,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Integrity",
      description: "Every vote matters. We ensure the highest standards of security and fairness in all our voting systems.",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Accessibility",
      description: "Technology should be inclusive. We design our platform to be accessible to everyone, regardless of technical expertise.",
      icon: Heart,
      color: "bg-red-100 text-red-600"
    }
  ];

  const timeline = [
    {
      year: "2023",
      title: "The Beginning",
      description: "Founded with the vision to democratize voting processes in educational institutions across Ghana."
    },
    {
      year: "2024",
      title: "First Major Launch",
      description: "Successfully launched our beta platform with 5 universities and processed over 10,000 votes."
    },
    {
      year: "2024",
      title: "Payment Integration",
      description: "Integrated secure payment processing to ensure fair participation and prevent fraud."
    },
    {
      year: "2025",
      title: "Nationwide Expansion",
      description: "Expanded to serve institutions across Ghana with advanced analytics and reporting features."
    }
  ];

  const team = [
    {
      name: "Ransford Oppong",
      role: "Founder & CEO",
      bio: "Passionate about leveraging technology to improve democratic processes in educational institutions.",
      image: "/team/ransford.jpg",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Sarah Mensah",
      role: "CTO",
      bio: "Expert in scalable web applications and security systems with 8+ years of experience.",
      image: "/team/sarah.jpg",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#"
      }
    },
    {
      name: "Kwame Asante",
      role: "Head of Operations",
      bio: "Ensures smooth operations and customer success across all our institutional partnerships.",
      image: "/team/kwame.jpg",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Akosua Darko",
      role: "Lead Designer",
      bio: "Creates intuitive and accessible user experiences that make voting simple for everyone.",
      image: "/team/akosua.jpg",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Pollix
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                We're on a mission to revolutionize how educational institutions 
                conduct voting, making it more secure, transparent, and accessible for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  To democratize voting processes in educational institutions by providing 
                  secure, transparent, and user-friendly digital voting solutions that 
                  enhance student engagement and institutional governance.
                </p>
                <p className="text-gray-600 mb-8">
                  We believe that every voice matters and every vote counts. Our platform 
                  ensures that voting is not just secure and fair, but also accessible 
                  to all members of the academic community.
                </p>
                <div className="flex items-center gap-4">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Our Vision</h3>
                    <p className="text-gray-600">
                      To be the leading digital voting platform for educational institutions across Africa.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Why We Started Pollix</h3>
                  <p className="mb-4">
                    Traditional voting methods in educational institutions often suffer from 
                    low participation, security concerns, and transparency issues.
                  </p>
                  <p>
                    We founded Pollix to address these challenges with modern technology, 
                    creating a platform that students and administrators can trust.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do and shape how we build our platform and serve our community.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${value.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <value.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From a simple idea to a platform trusted by institutions across Ghana.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <Badge className="mb-3">{item.year}</Badge>
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="relative z-10">
                      <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The passionate individuals behind Pollix, working tirelessly to improve democratic processes in education.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                    <div className="flex justify-center gap-3">
                      {member.social.linkedin && (
                        <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.social.github && (
                        <a href={member.social.github} className="text-gray-400 hover:text-gray-900">
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Voting Process?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Join the growing community of institutions using Pollix to conduct fair, 
              secure, and transparent voting events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin/register">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 