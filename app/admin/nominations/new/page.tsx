"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Trophy, Vote, Briefcase } from "lucide-react";
import Link from "next/link";

export default function NewNominationCampaignPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    eventId: "",
    startDate: "",
    endDate: "",
    maxNominationsPerUser: "",
    allowSelfNomination: false,
  });

  // Get department info using slug
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Fetch events for this department
  const events =
    useQuery(
      api.events.listEventsByDepartment,
      department ? { departmentId: department._id } : "skip"
    ) || [];

  const createCampaign = useMutation(api.nominations.createNominationCampaign);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admin || !department) {
      toast.error("Admin or department information not found");
      return;
    }

    if (
      !formData.name ||
      !formData.type ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(formData.startDate).getTime();
    const endDate = new Date(formData.endDate).getTime();

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (startDate < Date.now()) {
      toast.error("Start date cannot be in the past");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCampaign({
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type as "awards" | "voting" | "event_portfolio",
        eventId:
          formData.eventId && formData.eventId !== "none"
            ? formData.eventId
            : undefined,
        departmentId: department._id,
        startDate,
        endDate,
        maxNominationsPerUser: formData.maxNominationsPerUser
          ? parseInt(formData.maxNominationsPerUser)
          : undefined,
        allowSelfNomination: formData.allowSelfNomination,
        createdBy: admin._id,
      });

      if (result.success) {
        toast.success("Nomination campaign created successfully!");
        router.push(`/admin/nominations/${result.campaignId}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/nominations">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Nomination Campaign
          </h1>
          <p className="mt-2 text-gray-600">
            Set up a new nomination campaign for your department.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details for your nomination campaign.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Annual Student Awards 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe the purpose and goals of this nomination campaign..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Campaign Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awards">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>Awards - For recognizing achievements</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="voting">
                        <div className="flex items-center space-x-2">
                          <Vote className="h-4 w-4" />
                          <span>
                            Voting Portfolio - For student leadership positions
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="event_portfolio">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            Event Portfolio - For event management roles
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventId">Related Event (Optional)</Label>
                  <Select
                    value={formData.eventId}
                    onValueChange={(value) =>
                      handleInputChange("eventId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No related event</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>
                  Set when the nomination period will be active.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      min={
                        formData.startDate ||
                        new Date().toISOString().slice(0, 16)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rules & Limitations</CardTitle>
                <CardDescription>
                  Configure nomination rules and limitations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxNominations">
                    Maximum Nominations per User
                  </Label>
                  <Input
                    id="maxNominations"
                    type="number"
                    value={formData.maxNominationsPerUser}
                    onChange={(e) =>
                      handleInputChange("maxNominationsPerUser", e.target.value)
                    }
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Limit how many people each user can nominate. Leave empty
                    for no limit.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowSelfNomination"
                    checked={formData.allowSelfNomination}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowSelfNomination", checked)
                    }
                  />
                  <Label htmlFor="allowSelfNomination">
                    Allow self-nomination
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  When enabled, users can nominate themselves for positions or
                  awards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(formData.type)}
                  <span className="font-medium">
                    {formData.name || "Campaign Name"}
                  </span>
                </div>

                {formData.description && (
                  <p className="text-sm text-gray-600">
                    {formData.description}
                  </p>
                )}

                {formData.startDate && formData.endDate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(formData.startDate).toLocaleDateString()} -{" "}
                      {new Date(formData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">
                      {formData.type === "awards" && "Awards"}
                      {formData.type === "voting" && "Voting Portfolio"}
                      {formData.type === "event_portfolio" && "Event Portfolio"}
                      {!formData.type && "Not selected"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Max nominations:</span>
                    <span className="font-medium">
                      {formData.maxNominationsPerUser || "Unlimited"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Self-nomination:</span>
                    <span className="font-medium">
                      {formData.allowSelfNomination ? "Allowed" : "Not allowed"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  After creating the campaign, you'll be able to:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add nomination categories</li>
                  <li>• Set category requirements</li>
                  <li>• Review submitted nominations</li>
                  <li>• Convert nominations to nominees</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link href="/admin/nominations">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </div>
  );
}
