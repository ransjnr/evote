"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useInView } from "react-intersection-observer";
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
  Calendar,
  Search,
  ArrowRight,
  Vote,
  Award,
  Filter,
  X,
  Check,
  Users,
  Menu,
  Sparkles,
  Tag,
  Clock,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";

// Define a type for the event
interface Event {
  _id: string;
  name: string;
  description?: string;
  startDate: number;
  endDate: number;
  createdBy: string;
  createdAt: number;
  votePrice: number;
  organization?: string;
}

// Define event status types
type EventStatus = "all" | "upcoming" | "running" | "ended";

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // For smooth parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // For scroll-based animations
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [eventsRef, eventsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Fetch all active events
  const activeEvents = useQuery(api.events.listActiveEvents) || [];

  // Determine event status
  const getEventStatus = (event: Event): EventStatus => {
    const now = Date.now();
    if (now > event.endDate) {
      return "ended";
    } else if (now >= event.startDate && now <= event.endDate) {
      return "running";
    } else {
      return "upcoming";
    }
  };

  // Create categorized events for UI display
  const categorizedEvents = useMemo(() => {
    return {
      upcoming: activeEvents.filter(
        (event) => getEventStatus(event) === "upcoming"
      ),
      running: activeEvents.filter(
        (event) => getEventStatus(event) === "running"
      ),
      ended: activeEvents.filter((event) => getEventStatus(event) === "ended"),
    };
  }, [activeEvents]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return activeEvents.filter((event) => {
      // Apply search filter
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Apply status filter
      const eventStatus = getEventStatus(event);
      const matchesStatus =
        statusFilter === "all" || statusFilter === eventStatus;

      return matchesSearch && matchesStatus;
    });
  }, [activeEvents, searchQuery, statusFilter]);

  // Get counts for UI
  const eventCounts = useMemo(
    () => ({
      all: activeEvents.length,
      upcoming: categorizedEvents.upcoming.length,
      running: categorizedEvents.running.length,
      ended: categorizedEvents.ended.length,
    }),
    [activeEvents, categorizedEvents]
  );

  // Status badge style
  const getStatusBadgeStyle = (status: EventStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Status badge icon
  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-3 w-3 mr-1" />;
      case "running":
        return <Sparkles className="h-3 w-3 mr-1" />;
      case "ended":
        return <Check className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar - Updated to match the image */}
      <header className="border-b py-4 bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="bg-primary text-white p-1 rounded mr-1">e</span>
            Vote
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/events"
              className="text-foreground hover:text-primary transition-colors"
            >
              Events
            </Link>
            <Link
              href="/features"
              className="text-foreground hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-foreground hover:text-primary transition-colors"
            >
              Blog
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/events">
              <Button variant="outline" className="rounded-full">
                Explore Events
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button className="rounded-full">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero section with animated elements */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 px-6">
          {/* Animated decorative elements */}
          <motion.div
            className="absolute w-40 h-40 bg-blue-200 rounded-full blur-circle -top-10 -right-10 md:right-10"
            animate={{
              x: mousePosition.x * -15,
              y: mousePosition.y * -15,
            }}
            transition={{ type: "spring", damping: 50 }}
          />
          <motion.div
            className="absolute w-32 h-32 bg-green-200 rounded-full blur-circle -bottom-10 -left-10"
            animate={{
              x: mousePosition.x * 20,
              y: mousePosition.y * 20,
            }}
            transition={{ type: "spring", damping: 50 }}
          />
          <motion.div
            className="absolute w-20 h-20 bg-yellow-200 rounded-full blur-circle bottom-20 right-20"
            animate={{
              x: mousePosition.x * 10,
              y: mousePosition.y * 10,
            }}
            transition={{ type: "spring", damping: 30 }}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/grid-pattern.svg")',
              opacity: 0.04,
            }}
          ></div>

          <div className="container mx-auto relative z-10">
            <motion.div
              ref={heroRef}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3"
              >
                <span className="flex items-center">
                  <Vote className="h-4 w-4 mr-1" />
                  Browse & Vote
                </span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
              >
                All Voting Events
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Browse voting events from various departments. Filter by
                upcoming, running, or ended events.
              </motion.p>
            </motion.div>

            {/* Search and filters with animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="p-1 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search events by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 rounded-l-xl pl-12 h-14 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="md:w-auto p-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      className="w-full md:w-auto h-10 flex items-center gap-2 rounded-xl"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {statusFilter !== "all" && (
                        <Badge className="ml-1 bg-primary text-white">1</Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expandable filter panel */}
              <motion.div
                initial={false}
                animate={{
                  height: showFilters ? "auto" : 0,
                  opacity: showFilters ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden bg-white rounded-xl mt-2 shadow-md"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Event Status</h3>
                    {statusFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className="text-xs h-7 px-2"
                      >
                        Clear <X className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      onClick={() => setStatusFilter("all")}
                      variant={statusFilter === "all" ? "default" : "outline"}
                      className="justify-start"
                      size="sm"
                    >
                      All ({eventCounts.all})
                    </Button>
                    <Button
                      onClick={() => setStatusFilter("upcoming")}
                      variant={
                        statusFilter === "upcoming" ? "default" : "outline"
                      }
                      className="justify-start"
                      size="sm"
                    >
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      Upcoming ({eventCounts.upcoming})
                    </Button>
                    <Button
                      onClick={() => setStatusFilter("running")}
                      variant={
                        statusFilter === "running" ? "default" : "outline"
                      }
                      className="justify-start"
                      size="sm"
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      Running ({eventCounts.running})
                    </Button>
                    <Button
                      onClick={() => setStatusFilter("ended")}
                      variant={statusFilter === "ended" ? "default" : "outline"}
                      className="justify-start"
                      size="sm"
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Ended ({eventCounts.ended})
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Events grid - Enhanced UI */}
        <section className="container mx-auto px-6 py-12">
          <motion.div
            ref={eventsRef}
            initial="hidden"
            animate={eventsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="mb-8"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl font-bold mb-2">
              {statusFilter === "all"
                ? "All Events"
                : statusFilter === "upcoming"
                  ? "Upcoming Events"
                  : statusFilter === "running"
                    ? "Running Events"
                    : "Ended Events"}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} available
            </motion.p>
          </motion.div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <motion.div variants={fadeInUp}>
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "No events match your search criteria. Try different filters."
                    : "There are no active events at the moment. Please check back later."}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event);
                return (
                  <motion.div
                    key={event._id}
                    variants={fadeInUp}
                    custom={index}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-100 group">
                      <div
                        className={`h-2 w-full ${
                          status === "upcoming"
                            ? "bg-blue-500"
                            : status === "running"
                              ? "bg-green-500"
                              : "bg-gray-400"
                        }`}
                      ></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {event.name}
                          </CardTitle>
                          <Badge
                            className={`${getStatusBadgeStyle(status)} flex items-center px-2 py-1`}
                          >
                            {getStatusIcon(status)}
                            {status === "upcoming"
                              ? "Upcoming"
                              : status === "running"
                                ? "Running"
                                : "Ended"}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 pt-2">
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString()} -{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {event.description ||
                            "Vote for your favorites in this event!"}
                        </p>

                        <div className="flex items-center">
                          <div className="px-3 py-1.5 bg-primary/10 rounded-lg text-primary font-medium text-sm">
                            ₵{event.votePrice.toFixed(2)} per vote
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-4 pb-6">
                        <Link href={`/events/${event._id}`} className="w-full">
                          <Button
                            className="w-full group-hover:shadow-md transition-all duration-300"
                            variant={status === "ended" ? "outline" : "default"}
                            disabled={status === "ended"}
                          >
                            {status === "ended" ? "Event Ended" : "View & Vote"}
                            {status !== "ended" && (
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
