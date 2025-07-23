"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Trophy,
  Users,
  Settings,
  Calendar,
  Star,
  Send,
  CheckCircle,
  ArrowLeft,
  Building,
  AlertCircle,
  ExternalLink,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function PublicNominationCampaignPage() {
  const params = useParams();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeEmail: "",
    nomineePhone: "",
    nomineeDescription: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhone: "",
  });

  const slug = params.slug as string;

  // Get campaign details
  const campaign = useQuery(api.nominations.getPublicNominationCampaign, {
    slug,
  });

  // Submit nomination mutation
  const submitNomination = useMutation(api.nominations.submitNomination);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openSubmitDialog = () => {
    setSelectedCategory("");
    setFormData({
      nomineeName: "",
      nomineeEmail: "",
      nomineePhone: "",
      nomineeDescription: "",
      nominatorName: "",
      nominatorEmail: "",
      nominatorPhone: "",
    });
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitNomination = async () => {
    if (!campaign || !selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (
      !formData.nomineeName ||
      !formData.nomineeDescription ||
      !formData.nominatorName ||
      !formData.nominatorEmail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitNomination({
        campaignId: campaign._id,
        categoryId: selectedCategory as Id<"nominationCategories">,
        nomineeName: formData.nomineeName.trim(),
        nomineeEmail: formData.nomineeEmail.trim() || undefined,
        nomineePhone: formData.nomineePhone.trim() || undefined,
        nomineeDescription: formData.nomineeDescription.trim(),
        nominatorName: formData.nominatorName.trim(),
        nominatorEmail: formData.nominatorEmail.trim(),
        nominatorPhone: formData.nominatorPhone.trim() || undefined,
      });

      if (result.success) {
        toast.success("Nomination submitted successfully!");
        setIsSubmitDialogOpen(false);
        setFormData({
          nomineeName: "",
          nomineeEmail: "",
          nomineePhone: "",
          nomineeDescription: "",
          nominatorName: "",
          nominatorEmail: "",
          nominatorPhone: "",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit nomination");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "awards":
        return <Trophy className="h-5 w-5" />;
      case "voting":
        return <Users className="h-5 w-5" />;
      case "event_portfolio":
        return <Settings className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "awards":
        return "Awards";
      case "voting":
        return "Voting Portfolio";
      case "event_portfolio":
        return "Event Portfolio";
      default:
        return "Nomination";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: number) => {
    const now = Date.now();
    const diff = endDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getStatusBadge = () => {
    if (!campaign) return null;

    const now = Date.now();

    if (!campaign.isActive) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-200">
          Inactive
        </Badge>
      );
    }

    if (now < campaign.startDate) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Starting {formatDate(campaign.startDate)}
        </Badge>
      );
    }

    if (now > campaign.endDate) {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-200">
          Ended
        </Badge>
      );
    }

    const daysLeft = getDaysRemaining(campaign.endDate);
    return (
      <Badge variant="outline" className="text-green-600 border-green-200">
        {daysLeft} days remaining
      </Badge>
    );
  };

  const isAcceptingNominations = () => {
    if (!campaign) return false;

    const now = Date.now();
    return (
      campaign.isActive && now >= campaign.startDate && now <= campaign.endDate
    );
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.name || "Nomination Campaign",
          text: `Submit your nomination for: ${campaign?.name}`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading state
  if (campaign === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto py-20 px-4">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (campaign === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto py-20 px-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Campaign Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This nomination campaign doesn't exist or is no longer available.
            </p>
            <Link href="/nominations">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Nominations
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-20">
        {/* Back Navigation */}
        <div className="mb-4 sm:mb-6">
          <Link href="/nominations">
            <Button variant="outline" size="sm" className="rounded-md text-xs sm:text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Nominations
            </Button>
          </Link>
        </div>
        {/* Campaign Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {getTypeIcon(campaign.type)}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              {campaign.name}
            </h1>
            {getStatusBadge()}
          </div>
          {campaign.description && (
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6">
              {campaign.description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span>{campaign.department?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="h-4 w-4" />
              <span>{getTypeLabel(campaign.type)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            {isAcceptingNominations() && (
              <Button onClick={openSubmitDialog} size="lg" className="w-full sm:w-auto rounded-md text-xs sm:text-sm py-2">
                <Send className="mr-2 h-4 w-4" />
                Submit Nomination
              </Button>
            )}
            <Button variant="outline" onClick={handleShare} size="lg" className="w-full sm:w-auto rounded-md text-xs sm:text-sm py-2">
              <Share2 className="mr-2 h-4 w-4" />
              Share Campaign
            </Button>
          </div>
        </motion.div>
        {/* Campaign Status Alert */}
        {!isAcceptingNominations() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900 text-sm sm:text-base">
                      {campaign.isActive
                        ? Date.now() < campaign.startDate
                          ? "Campaign Not Started"
                          : "Campaign Ended"
                        : "Campaign Inactive"}
                    </h3>
                    <p className="text-orange-700 text-xs sm:text-sm">
                      {campaign.isActive
                        ? Date.now() < campaign.startDate
                          ? `Nominations will open on ${formatDate(campaign.startDate)}`
                          : "This nomination campaign has ended and is no longer accepting submissions."
                        : "This campaign is currently inactive and not accepting nominations."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Nomination Categories
          </h2>
          {campaign.categories && campaign.categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaign.categories.map((category) => (
                <Card key={category._id} className="hover:shadow-lg transition-shadow rounded-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base sm:text-lg">{category.name}</CardTitle>
                    {category.description && (
                      <CardDescription className="text-xs sm:text-sm">{category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-4">
                    {category.requirements && category.requirements.length > 0 && (
                      <div className="mb-2 sm:mb-4">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Requirements:</h4>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                          {category.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {isAcceptingNominations() && (
                      <Button className="w-full rounded-md text-xs sm:text-sm py-2"
                        onClick={() => {
                          setSelectedCategory(category._id);
                          openSubmitDialog();
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Nominate for {category.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No Categories Available
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Categories for this nomination campaign haven't been set up yet.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
        {/* Related Event */}
        {campaign.event && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                      Related Event
                    </h3>
                    <p className="text-gray-700 mb-1 text-xs sm:text-sm">{campaign.event.name}</p>
                    {campaign.event.description && (
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {campaign.event.description}
                      </p>
                    )}
                  </div>
                  <Link href={`/events/${campaign.event._id}`}>
                    <Button variant="outline" className="rounded-md text-xs sm:text-sm py-2">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Campaign Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-xl">
                Campaign Rules & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">
                    Submission Rules
                  </h4>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                    {campaign.maxNominationsPerUser && (
                      <li>
                        • Maximum {campaign.maxNominationsPerUser} nominations per person
                      </li>
                    )}
                    <li>
                      • Self-nomination is {campaign.allowSelfNomination ? "allowed" : "not allowed"}
                    </li>
                    <li>• All nominations require admin approval</li>
                    <li>• Provide detailed reasoning for your nomination</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-sm">
                    Important Dates
                  </h4>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <li>• Starts: {formatDate(campaign.startDate)}</li>
                    <li>• Ends: {formatDate(campaign.endDate)}</li>
                    <li>• Days remaining: {getDaysRemaining(campaign.endDate)}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* Nomination Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-full w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-2 sm:p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">Submit Nomination</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your nomination for {campaign.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 sm:space-y-6">
            {/* Category Selection */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {campaign.categories?.map((category) => (
                    <SelectItem key={category._id} value={category._id} className="text-xs sm:text-sm">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Nominee Information */}
            <div className="space-y-2 sm:space-y-4">
              <h4 className="font-semibold text-xs sm:text-lg text-gray-900">Nominee Information</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label htmlFor="nomineeName">Nominee Name *</Label>
                  <Input
                    id="nomineeName"
                    value={formData.nomineeName}
                    onChange={(e) => handleInputChange("nomineeName", e.target.value)}
                    placeholder="Full name of the nominee"
                    required
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="nomineeEmail">Nominee Email</Label>
                  <Input
                    id="nomineeEmail"
                    type="email"
                    value={formData.nomineeEmail}
                    onChange={(e) => handleInputChange("nomineeEmail", e.target.value)}
                    placeholder="nominee@example.com"
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nomineePhone">Nominee Phone</Label>
                <Input
                  id="nomineePhone"
                  type="tel"
                  value={formData.nomineePhone}
                  onChange={(e) => handleInputChange("nomineePhone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label htmlFor="nomineeDescription">Why are you nominating this person? *</Label>
                <Textarea
                  id="nomineeDescription"
                  value={formData.nomineeDescription}
                  onChange={(e) => handleInputChange("nomineeDescription", e.target.value)}
                  placeholder="Describe why this person deserves this nomination. Include specific achievements, qualities, or contributions..."
                  rows={4}
                  required
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
            {/* Nominator Information */}
            <div className="space-y-2 sm:space-y-4">
              <h4 className="font-semibold text-xs sm:text-lg text-gray-900">Your Information</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label htmlFor="nominatorName">Your Name *</Label>
                  <Input
                    id="nominatorName"
                    value={formData.nominatorName}
                    onChange={(e) => handleInputChange("nominatorName", e.target.value)}
                    placeholder="Your full name"
                    required
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="nominatorEmail">Your Email *</Label>
                  <Input
                    id="nominatorEmail"
                    type="email"
                    value={formData.nominatorEmail}
                    onChange={(e) => handleInputChange("nominatorEmail", e.target.value)}
                    placeholder="your@example.com"
                    required
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="nominatorPhone">Your Phone</Label>
                <Input
                  id="nominatorPhone"
                  type="tel"
                  value={formData.nominatorPhone}
                  onChange={(e) => handleInputChange("nominatorPhone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitNomination} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Nomination
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
