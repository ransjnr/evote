"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Trophy,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { admin } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    requirements: [""],
  });
  const [selectedNomination, setSelectedNomination] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editingNomination, setEditingNomination] = useState<any>(null);
  const [isEditNominationDialogOpen, setIsEditNominationDialogOpen] =
    useState(false);
  const [convertingNomination, setConvertingNomination] = useState<any>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [conversionData, setConversionData] = useState({
    eventId: "",
    categoryId: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxNominationsPerUser: "",
    allowSelfNomination: false,
  });

  const slug = params.slug as string;

  // Get campaign details
  const campaign = useQuery(api.nominations.getNominationCampaignBySlug, {
    slug,
  });

  // Get categories for this campaign
  const categories = useQuery(api.nominations.getNominationCategories, {
    campaignId: campaign?._id,
  });

  // Get nominations for this campaign
  const nominations = useQuery(api.nominations.getUserNominations, {
    campaignId: campaign?._id,
  });

  // Get approved nominations
  const approvedNominations = useQuery(api.nominations.getUserNominations, {
    campaignId: campaign?._id,
    status: "approved",
  });

  // Get department by slug first, then get events
  const department = useQuery(api.departments.getDepartmentBySlug, {
    slug: admin?.departmentId || "",
  });

  // Get events for conversion - only query when we have a valid departmentId
  const events = useQuery(
    api.events.listEventsByDepartment,
    department?._id ? { departmentId: department._id } : "skip"
  );

  // Get categories for selected event - only query when we have a valid eventId
  const eventCategories = useQuery(
    api.categories.listCategoriesByEvent,
    conversionData.eventId
      ? { eventId: conversionData.eventId as Id<"events"> }
      : "skip"
  );

  // Mutations
  const createCategory = useMutation(api.nominations.createNominationCategory);
  const updateCampaign = useMutation(api.nominations.updateNominationCampaign);
  const reviewNomination = useMutation(api.nominations.reviewNomination);
  const updateCategory = useMutation(api.nominations.updateNominationCategory);
  const deleteCategory = useMutation(api.nominations.deleteNominationCategory);
  const updateNomination = useMutation(api.nominations.updateNomination);
  const convertNominationToNominee = useMutation(
    api.nominations.convertNominationToNominee
  );

  const handleAddCategory = async () => {
    if (!admin || !newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const result = await createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        campaignId: campaign?._id,
        requirements: newCategory.requirements.filter((req) => req.trim()),
        createdBy: admin._id,
      });

      if (result.success) {
        toast.success("Category added successfully!");
        setIsAddingCategory(false);
        setNewCategory({ name: "", description: "", requirements: [""] });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add category");
    }
  };

  const handleAddRequirement = () => {
    setNewCategory((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setNewCategory((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    setNewCategory((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? value : req
      ),
    }));
  };

  const handleReviewNomination = async (status: "approved" | "rejected") => {
    if (!admin || !selectedNomination) return;

    try {
      await reviewNomination({
        nominationId: selectedNomination._id,
        status,
        reviewComments: reviewComments.trim() || undefined,
        reviewedBy: admin._id as any,
      });

      toast.success(`Nomination ${status} successfully!`);
      setIsReviewDialogOpen(false);
      setSelectedNomination(null);
      setReviewComments("");
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} nomination`);
    }
  };

  const openReviewDialog = (nomination: any) => {
    setSelectedNomination(nomination);
    setReviewComments("");
    setIsReviewDialogOpen(true);
  };

  const handleToggleActive = async () => {
    if (!campaign) return;

    setIsUpdating(true);
    try {
      await updateCampaign({
        campaignId: campaign._id,
        isActive: !campaign.isActive,
      });

      toast.success(
        `Campaign ${campaign.isActive ? "deactivated" : "activated"} successfully!`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update campaign");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditDialog = () => {
    if (!campaign) return;

    setEditFormData({
      name: campaign.name,
      description: campaign.description || "",
      startDate: new Date(campaign.startDate).toISOString().split("T")[0],
      endDate: new Date(campaign.endDate).toISOString().split("T")[0],
      maxNominationsPerUser: campaign.maxNominationsPerUser?.toString() || "",
      allowSelfNomination: campaign.allowSelfNomination,
    });
    setIsSettingsDialogOpen(true);
  };

  const handleEditFormChange = (field: string, value: string | boolean) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCampaign = async () => {
    if (!campaign) return;

    if (!editFormData.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    const startDate = new Date(editFormData.startDate).getTime();
    const endDate = new Date(editFormData.endDate).getTime();

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    setIsUpdating(true);
    try {
      await updateCampaign({
        campaignId: campaign._id,
        name: editFormData.name.trim(),
        description: editFormData.description.trim() || undefined,
        startDate,
        endDate,
        maxNominationsPerUser: editFormData.maxNominationsPerUser
          ? parseInt(editFormData.maxNominationsPerUser)
          : undefined,
        allowSelfNomination: editFormData.allowSelfNomination,
      });

      toast.success("Campaign updated successfully!");
      setIsSettingsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update campaign");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditCategoryDialog = (category: any) => {
    setEditingCategory({
      ...category,
      requirements: category.requirements || [""],
    });
    setIsEditCategoryDialogOpen(true);
  };

  const handleEditCategoryChange = (
    field: string,
    value: string | string[]
  ) => {
    setEditingCategory((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditCategoryRequirementChange = (
    index: number,
    value: string
  ) => {
    setEditingCategory((prev: any) => ({
      ...prev,
      requirements: prev.requirements.map((req: string, i: number) =>
        i === index ? value : req
      ),
    }));
  };

  const handleAddEditCategoryRequirement = () => {
    setEditingCategory((prev: any) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const handleRemoveEditCategoryRequirement = (index: number) => {
    setEditingCategory((prev: any) => ({
      ...prev,
      requirements: prev.requirements.filter(
        (_: string, i: number) => i !== index
      ),
    }));
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsUpdating(true);
    try {
      await updateCategory({
        categoryId: editingCategory._id,
        name: editingCategory.name.trim(),
        description: editingCategory.description.trim() || undefined,
        requirements: editingCategory.requirements.filter((req: string) =>
          req.trim()
        ),
      });

      toast.success("Category updated successfully!");
      setIsEditCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      await deleteCategory({
        categoryId: categoryId as Id<"nominationCategories">,
      });
      toast.success("Category deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditNominationDialog = (nomination: any) => {
    setEditingNomination({
      _id: nomination._id,
      nomineeName: nomination.nomineeName,
      nomineeEmail: nomination.nomineeEmail || "",
      nomineeDescription: nomination.nomineeDescription,
      nominatorName: nomination.nominatorName,
      nominatorEmail: nomination.nominatorEmail,
    });
    setIsEditNominationDialogOpen(true);
  };

  const handleEditNominationChange = (field: string, value: string) => {
    setEditingNomination((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveNomination = async () => {
    if (!editingNomination) return;

    if (!editingNomination.nomineeName.trim()) {
      toast.error("Nominee name is required");
      return;
    }

    if (!editingNomination.nominatorName.trim()) {
      toast.error("Nominator name is required");
      return;
    }

    if (!editingNomination.nominatorEmail.trim()) {
      toast.error("Nominator email is required");
      return;
    }

    setIsUpdating(true);
    try {
      await updateNomination({
        nominationId: editingNomination._id,
        nomineeName: editingNomination.nomineeName.trim(),
        nomineeEmail: editingNomination.nomineeEmail.trim() || undefined,
        nomineeDescription: editingNomination.nomineeDescription.trim(),
        nominatorName: editingNomination.nominatorName.trim(),
        nominatorEmail: editingNomination.nominatorEmail.trim(),
      });

      toast.success("Nomination updated successfully!");
      setIsEditNominationDialogOpen(false);
      setEditingNomination(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update nomination");
    } finally {
      setIsUpdating(false);
    }
  };

  const openConvertDialog = (nomination: any) => {
    setConvertingNomination(nomination);
    setConversionData({
      eventId: "",
      categoryId: "",
      imageUrl: "",
      videoUrl: "",
    });
    setIsConvertDialogOpen(true);
  };

  const handleConversionDataChange = (field: string, value: string) => {
    setConversionData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConvertToNominee = async () => {
    if (!convertingNomination || !admin) return;

    if (!conversionData.eventId || !conversionData.categoryId) {
      toast.error("Please select an event and category");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await convertNominationToNominee({
        nominationId: convertingNomination._id,
        categoryId: conversionData.categoryId as Id<"categories">,
        imageUrl: conversionData.imageUrl || undefined,
        videoUrl: conversionData.videoUrl || undefined,
        createdBy: admin._id,
      });

      if (result.success) {
        toast.success("Nomination converted to nominee successfully!");
        setIsConvertDialogOpen(false);
        setConvertingNomination(null);
        setConversionData({
          eventId: "",
          categoryId: "",
          imageUrl: "",
          videoUrl: "",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to convert nomination");
    } finally {
      setIsUpdating(false);
    }
  };

  // Status calculations
  const now = Date.now();
  const isActive =
    campaign?.isActive && now >= campaign.startDate && now <= campaign.endDate;
  const isUpcoming = campaign?.isActive && now < campaign.startDate;
  const isEnded = !campaign?.isActive || now > campaign.endDate;

  const getStatusBadge = () => {
    if (!campaign) return null;

    if (!campaign.isActive) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-200">
          Inactive
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Upcoming
        </Badge>
      );
    }
    if (isEnded) {
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
        return <Users className="h-4 w-4" />;
      case "event_portfolio":
        return <Settings className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "converted":
        return <Trophy className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-6 space-y-4 sm:space-y-6">
      {/* Header: Campaign Name, Status, Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex flex-col xs:flex-row xs:items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight break-words max-w-[80vw]">
              {campaign.name}
            </h1>
            {getStatusBadge()}
          </div>
          <div className="flex gap-2 mt-2 xs:mt-0">
            <Button
              variant={campaign.isActive ? "outline" : "default"}
              onClick={handleToggleActive}
              disabled={isUpdating}
              className="rounded-md text-xs sm:text-sm px-3 py-1"
            >
              {campaign.isActive ? (
                <>
                  <XCircle className="mr-1 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={openEditDialog}
              className="rounded-md text-xs sm:text-sm px-3 py-1"
            >
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        {campaign.description && (
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-[90vw]">
            {campaign.description}
          </p>
        )}
      </div>

      {/* Stats: Unified Card with 2x2 grid */}
      <Card className="p-0">
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-gray-500">Categories</span>
              <span className="text-lg font-bold text-blue-600">
                {categories?.length || 0}
              </span>
              <Trophy className="h-5 w-5 text-blue-600 mt-1" />
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-gray-500">Total Nominations</span>
              <span className="text-lg font-bold text-green-600">
                {nominations?.length || 0}
              </span>
              <Users className="h-5 w-5 text-green-600 mt-1" />
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-gray-500">Pending</span>
              <span className="text-lg font-bold text-yellow-600">
                {nominations?.filter((n) => n.status === "pending").length || 0}
              </span>
              <Clock className="h-5 w-5 text-yellow-600 mt-1" />
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-xs text-gray-500">Approved</span>
              <span className="text-lg font-bold text-green-600">
                {nominations?.filter((n) => n.status === "approved").length ||
                  0}
              </span>
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Compact, scrollable if needed */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="overflow-x-auto"
      >
        <TabsList className="flex flex-nowrap gap-2 border-b border-gray-200 bg-gray-50 rounded-md px-1 py-1">
          <TabsTrigger
            value="overview"
            className="text-xs sm:text-sm px-2 py-1"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="text-xs sm:text-sm px-2 py-1"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="nominations"
            className="text-xs sm:text-sm px-2 py-1"
          >
            Nominations
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="text-xs sm:text-sm px-2 py-1"
          >
            Approved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    <strong>Start:</strong> {formatDate(campaign.startDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    <strong>End:</strong> {formatDate(campaign.endDate)}
                  </span>
                </div>
                <div className="text-sm">
                  <strong>Department:</strong> {campaign.department?.name}
                </div>
                <div className="text-sm">
                  <strong>Type:</strong> {campaign.type.replace("_", " ")}
                </div>
                {campaign.maxNominationsPerUser && (
                  <div className="text-sm">
                    <strong>Max nominations per user:</strong>{" "}
                    {campaign.maxNominationsPerUser}
                  </div>
                )}
                <div className="text-sm">
                  <strong>Self-nomination:</strong>{" "}
                  {campaign.allowSelfNomination ? "Allowed" : "Not allowed"}
                </div>
                {campaign.event && (
                  <div className="text-sm">
                    <strong>Related event:</strong> {campaign.event.name}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {nominations && nominations.length > 0 ? (
                  <div className="space-y-3">
                    {nominations.slice(0, 5).map((nomination) => (
                      <div
                        key={nomination._id}
                        className="flex items-start space-x-3 text-sm"
                      >
                        {getStatusIcon(nomination.status)}
                        <div className="flex-1">
                          <p className="font-medium">
                            {nomination.nomineeName}
                          </p>
                          <p className="text-gray-500">
                            Nominated by {nomination.nominatorName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDateTime(nomination.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No nominations yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Nomination Categories</h3>
              <Dialog
                open={isAddingCategory}
                onOpenChange={setIsAddingCategory}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new category for this nomination campaign.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Category Name *</Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Best Student Leader"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe what this category is for..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Requirements</Label>
                      <div className="space-y-2">
                        {newCategory.requirements.map((req, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={req}
                              onChange={(e) =>
                                handleRequirementChange(index, e.target.value)
                              }
                              placeholder="Add a requirement..."
                            />
                            {newCategory.requirements.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveRequirement(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddRequirement}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Requirement
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingCategory(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>Add Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Card key={category._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {category.name}
                          </CardTitle>
                          <CardDescription>
                            {category.description || "No description"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {category.nominationsCount} nominations
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.requirements &&
                        category.requirements.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Requirements:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {category.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditCategoryDialog(category)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No categories yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add categories to define what people can be nominated for.
                  </p>
                  <Button onClick={() => setIsAddingCategory(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nominations">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Submitted Nominations</h3>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Review Pending
                </Button>
              </div>
            </div>

            {nominations && nominations.length > 0 ? (
              <Card>
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nominee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Nominator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nominations.map((nomination) => (
                      <TableRow key={nomination._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {nomination.nomineeName}
                            </p>
                            {nomination.nomineeEmail && (
                              <p className="text-sm text-gray-500">
                                {nomination.nomineeEmail}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {nomination.category?.name || "Unknown Category"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {nomination.nominatorName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {nomination.nominatorEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(nomination.status)}
                            <span className="capitalize">
                              {nomination.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(nomination.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDialog(nomination)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openEditNominationDialog(nomination)
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {nomination.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedNomination(nomination);
                                    handleReviewNomination("approved");
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedNomination(nomination);
                                    handleReviewNomination("rejected");
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No nominations yet
                  </h3>
                  <p className="text-gray-500">
                    Once people start submitting nominations, they'll appear
                    here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Approved Nominations</h3>
              <div className="flex space-x-2">
                <Badge variant="outline">
                  {approvedNominations?.length || 0} approved
                </Badge>
              </div>
            </div>

            {approvedNominations && approvedNominations.length > 0 ? (
              <Card>
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nominee</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedNominations.map((nomination) => (
                      <TableRow key={nomination._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {nomination.nomineeName}
                            </p>
                            {nomination.nomineeEmail && (
                              <p className="text-sm text-gray-500">
                                {nomination.nomineeEmail}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {nomination.category?.name || "Unknown Category"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {nomination.status === "converted" ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-600 font-medium">
                                  Converted to Nominee
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-600">
                                  Ready to Convert
                                </span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {nomination.reviewedAt
                            ? formatDateTime(nomination.reviewedAt)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewDialog(nomination)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {nomination.status === "approved" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openConvertDialog(nomination)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Convert to Nominee
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No approved nominations yet
                  </h3>
                  <p className="text-gray-500">
                    Once nominations are approved, they'll appear here and can
                    be converted to nominees for voting events.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Nomination</DialogTitle>
            <DialogDescription>
              Review and approve or reject this nomination.
            </DialogDescription>
          </DialogHeader>
          {selectedNomination && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nominee</Label>
                  <p className="font-medium">
                    {selectedNomination.nomineeName}
                  </p>
                  {selectedNomination.nomineeEmail && (
                    <p className="text-sm text-gray-500">
                      {selectedNomination.nomineeEmail}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Nominator</Label>
                  <p className="font-medium">
                    {selectedNomination.nominatorName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedNomination.nominatorEmail}
                  </p>
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <p className="font-medium">
                  {selectedNomination.category?.name}
                </p>
              </div>
              <div>
                <Label>Nomination Description</Label>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {selectedNomination.nomineeDescription}
                </p>
              </div>
              <div>
                <Label htmlFor="reviewComments">
                  Review Comments (Optional)
                </Label>
                <Textarea
                  id="reviewComments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add any comments about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleReviewNomination("rejected")}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => handleReviewNomination("approved")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Edit Settings Dialog */}
      <Dialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign Settings</DialogTitle>
            <DialogDescription>
              Update campaign details, dates, and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={editFormData.name}
                    onChange={(e) =>
                      handleEditFormChange("name", e.target.value)
                    }
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="campaignDescription">Description</Label>
                  <Textarea
                    id="campaignDescription"
                    value={editFormData.description}
                    onChange={(e) =>
                      handleEditFormChange("description", e.target.value)
                    }
                    placeholder="Describe the campaign..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Campaign Dates */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Campaign Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) =>
                      handleEditFormChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) =>
                      handleEditFormChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Nomination Rules */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Nomination Rules</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="maxNominations">
                    Max Nominations Per User
                  </Label>
                  <Input
                    id="maxNominations"
                    type="number"
                    min="1"
                    value={editFormData.maxNominationsPerUser}
                    onChange={(e) =>
                      handleEditFormChange(
                        "maxNominationsPerUser",
                        e.target.value
                      )
                    }
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Limit how many nominations each person can submit
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowSelfNomination"
                    checked={editFormData.allowSelfNomination}
                    onChange={(e) =>
                      handleEditFormChange(
                        "allowSelfNomination",
                        e.target.checked
                      )
                    }
                    className="rounded"
                    placeholder="Allow self-nomination"
                  />
                  <Label htmlFor="allowSelfNomination">
                    Allow Self-Nomination
                  </Label>
                  <p className="text-sm text-gray-600">
                    Allow people to nominate themselves
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Campaign Status</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Active Status</h4>
                  <p className="text-sm text-gray-600">
                    {campaign.isActive
                      ? "Campaign is currently active and accepting nominations"
                      : "Campaign is inactive - users cannot submit nominations"}
                  </p>
                </div>
                <Button
                  variant={campaign.isActive ? "outline" : "default"}
                  onClick={handleToggleActive}
                  disabled={isUpdating}
                  size="sm"
                >
                  {campaign.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>

            {/* Current Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Current Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {categories?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">
                    {nominations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Nominations</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {nominations?.filter((n) => n.status === "pending")
                      .length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">
                    {nominations?.filter((n) => n.status === "approved")
                      .length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCampaign} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={isEditCategoryDialogOpen}
        onOpenChange={setIsEditCategoryDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name, description, and requirements.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategoryName">Category Name *</Label>
                <Input
                  id="editCategoryName"
                  value={editingCategory.name}
                  onChange={(e) =>
                    handleEditCategoryChange("name", e.target.value)
                  }
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="editCategoryDescription">Description</Label>
                <Textarea
                  id="editCategoryDescription"
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    handleEditCategoryChange("description", e.target.value)
                  }
                  placeholder="Describe what this category is for..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Requirements</Label>
                <div className="space-y-2">
                  {editingCategory.requirements.map(
                    (req: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={req}
                          onChange={(e) =>
                            handleEditCategoryRequirementChange(
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Enter requirement..."
                        />
                        {editingCategory.requirements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleRemoveEditCategoryRequirement(index)
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEditCategoryRequirement}
                  >
                    Add Requirement
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCategoryDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Nomination Dialog */}
      <Dialog
        open={isEditNominationDialogOpen}
        onOpenChange={setIsEditNominationDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Nomination</DialogTitle>
            <DialogDescription>
              Update the nomination details below.
            </DialogDescription>
          </DialogHeader>
          {editingNomination && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editNomineeName">Nominee Name *</Label>
                  <Input
                    id="editNomineeName"
                    value={editingNomination.nomineeName}
                    onChange={(e) =>
                      handleEditNominationChange("nomineeName", e.target.value)
                    }
                    placeholder="Enter nominee name"
                  />
                </div>
                <div>
                  <Label htmlFor="editNomineeEmail">Nominee Email</Label>
                  <Input
                    id="editNomineeEmail"
                    type="email"
                    value={editingNomination.nomineeEmail}
                    onChange={(e) =>
                      handleEditNominationChange("nomineeEmail", e.target.value)
                    }
                    placeholder="Enter nominee email (optional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editNomineeDescription">
                  Nomination Description *
                </Label>
                <Textarea
                  id="editNomineeDescription"
                  value={editingNomination.nomineeDescription}
                  onChange={(e) =>
                    handleEditNominationChange(
                      "nomineeDescription",
                      e.target.value
                    )
                  }
                  placeholder="Describe why this person deserves to be nominated..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editNominatorName">Nominator Name *</Label>
                  <Input
                    id="editNominatorName"
                    value={editingNomination.nominatorName}
                    onChange={(e) =>
                      handleEditNominationChange(
                        "nominatorName",
                        e.target.value
                      )
                    }
                    placeholder="Enter nominator name"
                  />
                </div>
                <div>
                  <Label htmlFor="editNominatorEmail">Nominator Email *</Label>
                  <Input
                    id="editNominatorEmail"
                    type="email"
                    value={editingNomination.nominatorEmail}
                    onChange={(e) =>
                      handleEditNominationChange(
                        "nominatorEmail",
                        e.target.value
                      )
                    }
                    placeholder="Enter nominator email"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditNominationDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNomination} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Nominee Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convert to Nominee</DialogTitle>
            <DialogDescription>
              Convert this approved nomination to a nominee for voting in an
              event.
            </DialogDescription>
          </DialogHeader>
          {convertingNomination && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Nomination Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nominee:</span>
                    <span className="ml-2 font-medium">
                      {convertingNomination.nomineeName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">
                      {convertingNomination.category?.name}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-1 text-sm text-gray-700">
                    {convertingNomination.nomineeDescription}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventSelect">Select Event *</Label>
                  <Select
                    value={conversionData.eventId}
                    onValueChange={(value) =>
                      handleConversionDataChange("eventId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events
                        ?.filter(
                          (event) => event && event._id && department?._id
                        )
                        ?.map((event) => (
                          <SelectItem key={event._id} value={event._id}>
                            {event.name} (
                            {event.isActive ? "Active" : "Inactive"})
                          </SelectItem>
                        )) || []}
                    </SelectContent>
                  </Select>
                </div>

                {conversionData.eventId && (
                  <div>
                    <Label htmlFor="categorySelect">Select Category *</Label>
                    <Select
                      value={conversionData.categoryId}
                      onValueChange={(value) =>
                        handleConversionDataChange("categoryId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(eventCategories || []).map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name} ({category.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={conversionData.imageUrl}
                    onChange={(e) =>
                      handleConversionDataChange("imageUrl", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Add a profile image for the nominee
                  </p>
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={conversionData.videoUrl}
                    onChange={(e) =>
                      handleConversionDataChange("videoUrl", e.target.value)
                    }
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Add a campaign video for the nominee
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • The nominee will be added to the selected event category
                  </li>
                  <li>
                    • A unique voting code will be automatically generated
                  </li>
                  <li>
                    • The nomination status will be updated to "converted"
                  </li>
                  <li>• Voters can then vote for this nominee in the event</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConvertDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvertToNominee}
              disabled={
                isUpdating ||
                !conversionData.eventId ||
                !conversionData.categoryId
              }
            >
              {isUpdating ? "Converting..." : "Convert to Nominee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
