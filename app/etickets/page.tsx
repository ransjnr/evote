"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Star,
  Building,
  TrendingUp,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";

// Define event interface
interface TicketingEvent {
  _id: string;
  name: string;
  description?: string;
  startDate: number;
  endDate: number;
  venue?: string;
  maxAttendees?: number;
  eventType: "ticketing_only" | "voting_and_ticketing";
  departmentName: string;
  isActive: boolean;
}

export default function ETicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Get all ticketing events
  const events = useQuery(api.events.listTicketingEvents) || [];

  // Filter events based on status
  const getEventStatus = (event: TicketingEvent) => {
    const now = Date.now();
    if (now > event.endDate) return "ended";
    if (now >= event.startDate && now <= event.endDate) return "running";
    return "upcoming";
  };

  // Apply filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.departmentName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const eventStatus = getEventStatus(event);
      const matchesStatus =
        statusFilter === "all" || eventStatus === statusFilter;

      // Type filter
      const matchesType =
        typeFilter === "all" || event.eventType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, searchQuery, statusFilter, typeFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <TrendingUp className="w-3 h-3" />;
      case "upcoming":
        return <Clock className="w-3 h-3" />;
      case "ended":
        return <Calendar className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <header className="py-4 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary flex items-center"
          >
            <img
              src="/Pollix icon.png"
              alt="Pollix"
              width="32"
              height="32"
              className="mr-2 rounded"
            />
            Pollix
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
            <Link
              href="/etickets"
              className="text-primary font-bold border-b-2 border-primary"
            >
              eTicketing
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

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Ticket className="w-4 h-4" />
              E-Ticketing Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Discover Events & Buy Tickets
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Browse exciting events, secure your spot with digital tickets, and
              enjoy seamless entry to memorable experiences.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {events.length}
                </div>
                <div className="text-sm text-gray-600">Events Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {events.filter((e) => getEventStatus(e) === "running").length}
                </div>
                <div className="text-sm text-gray-600">Live Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {
                    events.filter((e) => getEventStatus(e) === "upcoming")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-4 bg-white/50 backdrop-blur-sm border-y border-white/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filter Events</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events, venues, or organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Live Now</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ended">Past Events</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ticketing_only">Tickets Only</SelectItem>
                  <SelectItem value="voting_and_ticketing">
                    Tickets + Voting
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "No ticketing events are currently available"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event);
                const isAvailable =
                  status === "running" || status === "upcoming";

                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card
                      className={`h-full transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                        isAvailable
                          ? "border-2 hover:border-blue-200"
                          : "opacity-75"
                      }`}
                    >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Badge
                            className={`${getStatusColor(status)} flex items-center gap-1 text-xs font-medium px-2 py-1`}
                          >
                            {getStatusIcon(status)}
                            {status === "running"
                              ? "Live Now"
                              : status === "upcoming"
                                ? "Upcoming"
                                : "Ended"}
                          </Badge>
                          {event.eventType === "voting_and_ticketing" && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Voting + Tickets
                            </Badge>
                          )}
                        </div>

                        <div>
                          <CardTitle className="text-xl mb-2 line-clamp-2">
                            {event.name}
                          </CardTitle>
                          {event.description && (
                            <CardDescription className="line-clamp-3">
                              {event.description}
                            </CardDescription>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {formatDate(event.startDate)} -{" "}
                              {formatDate(event.endDate)}
                            </span>
                          </div>

                          {event.venue && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {event.departmentName}
                            </span>
                          </div>

                          {event.maxAttendees && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span>Max {event.maxAttendees} attendees</span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Link
                          href={`/events/${event._id}/tickets`}
                          className="w-full"
                        >
                          <Button
                            className="w-full"
                            disabled={!isAvailable}
                            variant={isAvailable ? "default" : "secondary"}
                          >
                            {status === "ended" ? (
                              "Event Ended"
                            ) : (
                              <>
                                <Ticket className="w-4 h-4 mr-2" />
                                {status === "running"
                                  ? "Buy Tickets Now"
                                  : "Get Tickets"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      {filteredEvents.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Don't Miss Out!</h2>
            <p className="text-xl mb-8 opacity-90">
              Secure your tickets today and be part of amazing events happening
              in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" variant="secondary">
                  Browse All Events
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Organize an Event
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
