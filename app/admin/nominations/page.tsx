"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
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
  Search,
  Plus,
  Users,
  Trophy,
  Vote,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  FileText,
  Share2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function NominationsPage() {
  const { admin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get department info using slug
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Fetch nomination campaigns for this department
  const campaigns =
    useQuery(
      api.nominations.listNominationCampaigns,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || campaign.type === typeFilter;

    const now = Date.now();
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus =
        campaign.isActive &&
        now >= campaign.startDate &&
        now <= campaign.endDate;
    } else if (statusFilter === "upcoming") {
      matchesStatus = campaign.isActive && now < campaign.startDate;
    } else if (statusFilter === "ended") {
      matchesStatus = !campaign.isActive || now > campaign.endDate;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (campaign: any) => {
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
          Upcoming
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

    return (
      <Badge variant="outline" className="text-green-600 border-green-200">
        Active
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "awards":
        return <Trophy className="h-4 w-4" />;
      case "voting":
        return <Vote className="h-4 w-4" />;
      case "event_portfolio":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
        return type;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nominations
          </h1>
          <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">
            Manage nomination campaigns for awards, voting portfolios, and event
            management positions.
          </p>
        </div>
        <Link href="/admin/nominations/new">
          <Button className="w-full sm:w-auto rounded-md text-xs sm:text-sm py-2">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs sm:text-sm"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="awards">Awards</SelectItem>
            <SelectItem value="voting">Voting Portfolio</SelectItem>
            <SelectItem value="event_portfolio">Event Portfolio</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Campaigns
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {campaigns.length}
                </p>
              </div>
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Active
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {
                    campaigns.filter((c) => {
                      const now = Date.now();
                      return (
                        c.isActive && now >= c.startDate && now <= c.endDate
                      );
                    }).length
                  }
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Nominations
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {campaigns.reduce((sum, c) => sum + c.nominationsCount, 0)}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Categories
                </p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {campaigns.reduce((sum, c) => sum + c.categoriesCount, 0)}
                </p>
              </div>
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <Card
            key={campaign._id}
            className="hover:shadow-lg transition-shadow rounded-lg"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(campaign.type)}
                  <CardTitle className="text-base sm:text-lg">
                    {campaign.name}
                  </CardTitle>
                </div>
                {getStatusBadge(campaign)}
              </div>
              <CardDescription className="space-y-1">
                <span className="block text-xs sm:text-sm">
                  {getTypeLabel(campaign.type)} • {campaign.department?.name}
                </span>
                {campaign.description && (
                  <span className="text-xs sm:text-sm block">
                    {campaign.description}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(campaign.startDate)} -{" "}
                    {formatDate(campaign.endDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500">Categories</p>
                    <p className="font-semibold">{campaign.categoriesCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nominations</p>
                    <p className="font-semibold">{campaign.nominationsCount}</p>
                  </div>
                </div>
                {campaign.event && (
                  <div className="text-xs sm:text-sm">
                    <p className="text-gray-500">Related Event</p>
                    <p className="font-medium">{campaign.event.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Link
                  href={`/admin/nominations/${campaign.slug}/${campaign._id}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-md text-xs sm:text-sm py-2"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/nominations/${campaign.slug}`;
                    navigator.clipboard.writeText(publicUrl);
                    toast.success("Public link copied to clipboard!");
                  }}
                  className="flex-1 rounded-md text-xs sm:text-sm py-2"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              <Link href={`/nominations/${campaign.slug}`} className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  View Public Page
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
