"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  DialogTrigger,
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
  Clock,
  Star,
  Send,
  Plus,
  CheckCircle,
} from "lucide-react";

export default function NominationsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeEmail: "",
    nomineePhone: "",
    nomineeDescription: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhone: "",
  });

  // Get active campaigns
  const campaigns = useQuery(api.nominations.getActiveCampaigns) || [];

  // Submit nomination mutation
  const submitNomination = useMutation(api.nominations.submitNomination);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openSubmitDialog = (campaign: any) => {
    setSelectedCampaign(campaign);
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
    if (!selectedCampaign || !selectedCategory) {
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

    try {
      const result = await submitNomination({
        campaignId: selectedCampaign._id,
        categoryId: selectedCategory,
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
        setSelectedCampaign(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit nomination");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            Submit Your Nominations
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Nominate outstanding individuals for awards, leadership positions,
            and event management roles. Your voice matters in recognizing
            excellence in our community.
          </p>
        </motion.div>

        {/* Active Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Active Nomination Campaigns
          </h2>

          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105 rounded-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getTypeIcon(campaign.type)}
                          </div>
                          <div>
                            <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                              {campaign.name}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              {getTypeLabel(campaign.type)} •{" "}
                              {campaign.department?.name}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 text-xs sm:text-sm"
                        >
                          {getDaysRemaining(campaign.endDate)} days left
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-4">
                      {campaign.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {campaign.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Ends {formatDate(campaign.endDate)}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                        <Trophy className="h-4 w-4" />
                        <span>
                          {campaign.categories.length}{" "}
                          {campaign.categories.length === 1
                            ? "category"
                            : "categories"}{" "}
                          available
                        </span>
                      </div>

                      <div className="pt-2 space-y-2 flex flex-col">
                        <Link href={`/nominations/${campaign.slug}`}>
                          <Button
                            variant="outline"
                            className="w-full rounded-md text-xs sm:text-sm py-2"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            View Campaign
                          </Button>
                        </Link>
                        <Button
                          className="w-full rounded-md text-xs sm:text-sm py-2"
                          onClick={() => openSubmitDialog(campaign)}
                          disabled={getDaysRemaining(campaign.endDate) === 0}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit Nomination
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8 sm:py-16"
            >
              <div className="max-w-md mx-auto">
                <Clock className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Active Campaigns
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  There are currently no active nomination campaigns. Check back
                  later for new opportunities to nominate outstanding
                  individuals.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                Choose a Campaign
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Select from active nomination campaigns for awards, leadership,
                or event management positions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                Submit Nomination
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Fill out the nomination form with details about why your nominee
                deserves recognition.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                Review Process
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Admins review all nominations and approved nominees may be added
                to voting ballots.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nomination Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-full w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-2 sm:p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-2xl">
              Submit Nomination
            </DialogTitle>
            <DialogDescription>
              {selectedCampaign && (
                <>Submit a nomination for {selectedCampaign.name}</>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-4 sm:space-y-6">
              {/* Category Selection */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCampaign.categories.map((category: any) => (
                      <SelectItem
                        key={category._id}
                        value={category._id}
                        className="text-xs sm:text-sm"
                      >
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nominee Information */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">
                  Nominee Information
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <Label htmlFor="nomineeName">Full Name *</Label>
                    <Input
                      id="nomineeName"
                      value={formData.nomineeName}
                      onChange={(e) =>
                        handleInputChange("nomineeName", e.target.value)
                      }
                      placeholder="Enter nominee's full name"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nomineeEmail">Email</Label>
                    <Input
                      id="nomineeEmail"
                      type="email"
                      value={formData.nomineeEmail}
                      onChange={(e) =>
                        handleInputChange("nomineeEmail", e.target.value)
                      }
                      placeholder="Enter nominee's email (optional)"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nomineePhone">Phone Number</Label>
                  <Input
                    id="nomineePhone"
                    value={formData.nomineePhone}
                    onChange={(e) =>
                      handleInputChange("nomineePhone", e.target.value)
                    }
                    placeholder="Enter nominee's phone number (optional)"
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="nomineeDescription">
                    Why are you nominating this person? *
                  </Label>
                  <Textarea
                    id="nomineeDescription"
                    value={formData.nomineeDescription}
                    onChange={(e) =>
                      handleInputChange("nomineeDescription", e.target.value)
                    }
                    placeholder="Describe their achievements, qualities, and why they deserve this nomination..."
                    rows={4}
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Nominator Information */}
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">
                  Your Information
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <Label htmlFor="nominatorName">Your Full Name *</Label>
                    <Input
                      id="nominatorName"
                      value={formData.nominatorName}
                      onChange={(e) =>
                        handleInputChange("nominatorName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nominatorEmail">Your Email *</Label>
                    <Input
                      id="nominatorEmail"
                      type="email"
                      value={formData.nominatorEmail}
                      onChange={(e) =>
                        handleInputChange("nominatorEmail", e.target.value)
                      }
                      placeholder="Enter your email address"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nominatorPhone">Your Phone</Label>
                  <Input
                    id="nominatorPhone"
                    value={formData.nominatorPhone}
                    onChange={(e) =>
                      handleInputChange("nominatorPhone", e.target.value)
                    }
                    placeholder="Enter your phone number (optional)"
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Selected Category Requirements */}
              {selectedCategory && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Category Requirements
                  </h4>
                  {(() => {
                    const category = selectedCampaign.categories.find(
                      (c: any) => c._id === selectedCategory
                    );
                    return category?.requirements &&
                      category.requirements.length > 0 ? (
                      <ul className="text-sm text-blue-800 space-y-1">
                        {category.requirements.map(
                          (req: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{req}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-blue-800">
                        No specific requirements for this category.
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
              // disabled={isSubmitting} // This state doesn't exist in the original file, so it's removed.
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNomination}
              className="w-full sm:w-auto"
            >
              {/* {isSubmitting ? ( // This state doesn't exist in the original file, so it's removed.
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : ( */}
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Nomination
              </>
              {/* )} */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
