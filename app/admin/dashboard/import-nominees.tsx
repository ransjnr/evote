"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  FileUp,
  AlertCircle,
  Check,
  Download,
  Trash,
  Info,
} from "lucide-react";
import Link from "next/link";

// Interface for CSV data
interface CSVNominee {
  name: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export default function ImportNomineesPage() {
  const router = useRouter();
  const { admin } = useAuthStore();
  const [csvData, setCSVData] = useState<CSVNominee[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<Id<"categories"> | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get department info
  const department = useQuery(
    api.departments.getDepartmentBySlug,
    admin?.departmentId ? { slug: admin.departmentId } : "skip"
  );

  // Get events for this department
  const events =
    useQuery(
      api.events.listEventsByDepartment,
      department?._id ? { departmentId: department._id } : "skip"
    ) || [];

  // Get categories for selected event
  const categories =
    useQuery(
      api.categories.listCategoriesByEvent,
      selectedEventId ? { eventId: selectedEventId } : "skip"
    ) || [];

  // Create nominee mutation
  const createNominee = useMutation(api.nominees.createNominee);

  const downloadSampleCSV = () => {
    const sampleData = `name,description,imageUrl,videoUrl
John Doe,Best student in Computer Science,https://example.com/john.jpg,https://youtube.com/watch?v=example1
Jane Smith,Excellence in Mathematics,https://example.com/jane.jpg,
Alex Johnson,Outstanding Leadership,,,`;

    const blob = new Blob([sampleData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "nominees-sample.csv");
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        // Parse the CSV content
        const nominees = parseCSV(csvContent);
        setCSVData(nominees);
        toast.success(
          `CSV parsed successfully: ${nominees.length} nominees found.`
        );
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file. Please check the format.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvContent: string): CSVNominee[] => {
    // Split by lines (handling different line endings)
    const lines = csvContent.split(/\r?\n/);

    // Get header row
    const headers = lines[0].split(",").map((h) => h.trim());

    // Map expected headers to indices
    const nameIndex = headers.findIndex(
      (h) => h.toLowerCase() === "name" || h.toLowerCase() === "nominee name"
    );
    const descIndex = headers.findIndex(
      (h) => h.toLowerCase() === "description" || h.toLowerCase() === "desc"
    );
    const imageIndex = headers.findIndex(
      (h) =>
        h.toLowerCase() === "image" ||
        h.toLowerCase() === "imageurl" ||
        h.toLowerCase() === "image url"
    );
    const videoIndex = headers.findIndex(
      (h) =>
        h.toLowerCase() === "video" ||
        h.toLowerCase() === "videourl" ||
        h.toLowerCase() === "video url"
    );

    // Name is required
    if (nameIndex === -1) {
      throw new Error("CSV must contain a 'name' column");
    }

    // Process data rows
    const nominees: CSVNominee[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(",").map((v) => v.trim());
      if (values.length <= 1) continue; // Skip invalid lines

      const nominee: CSVNominee = {
        name: values[nameIndex] || "",
      };

      // Add optional fields if available
      if (descIndex > -1 && values[descIndex])
        nominee.description = values[descIndex];
      if (imageIndex > -1 && values[imageIndex])
        nominee.imageUrl = values[imageIndex];
      if (videoIndex > -1 && values[videoIndex])
        nominee.videoUrl = values[videoIndex];

      // Only add if name is provided
      if (nominee.name) {
        nominees.push(nominee);
      }
    }

    return nominees;
  };

  const clearUpload = () => {
    setCSVData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    if (!admin || !selectedCategoryId) {
      toast.error("Please select a category to import nominees into");
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Process nominees sequentially
      for (const nominee of csvData) {
        try {
          await createNominee({
            name: nominee.name,
            description: nominee.description,
            imageUrl: nominee.imageUrl,
            videoUrl: nominee.videoUrl,
            categoryId: selectedCategoryId,
            adminId: admin._id as Id<"admins">,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import nominee ${nominee.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} nominees`);
        if (errorCount > 0) {
          toast.error(`Failed to import ${errorCount} nominees`);
        }
        // Navigate to category page
        router.push(`/admin/categories/${selectedCategoryId}`);
      } else {
        toast.error("Failed to import any nominees");
      }
    } catch (error) {
      toast.error("An error occurred during import");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Nominees</h1>
          <p className="text-gray-500">Bulk import nominees from a CSV file</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import Tool</CardTitle>
          <CardDescription>
            Upload a CSV file to bulk import nominees for a category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Event</Label>
                <Select
                  value={selectedEventId ? selectedEventId : ""}
                  onValueChange={(value) => {
                    setSelectedEventId(value ? (value as Id<"events">) : null);
                    setSelectedCategoryId(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event._id} value={event._id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Category</Label>
                <Select
                  value={selectedCategoryId ? selectedCategoryId : ""}
                  onValueChange={(value) =>
                    setSelectedCategoryId(
                      value ? (value as Id<"categories">) : null
                    )
                  }
                  disabled={!selectedEventId || categories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedEventId
                          ? "Select an event first"
                          : categories.length === 0
                            ? "No categories available"
                            : "Select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEventId && categories.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No categories found for this event. Please create a category
                    first.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-sm font-medium mb-2">CSV Format</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Your CSV file should contain these columns:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                  <li>
                    <span className="font-semibold">name</span> (required): The
                    nominee's name
                  </li>
                  <li>
                    <span className="font-semibold">description</span>: A
                    description of the nominee
                  </li>
                  <li>
                    <span className="font-semibold">imageUrl</span>: URL to the
                    nominee's image
                  </li>
                  <li>
                    <span className="font-semibold">videoUrl</span>: URL to a
                    video (e.g., YouTube)
                  </li>
                </ul>
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={downloadSampleCSV}
                  >
                    <Download className="h-3 w-3" />
                    Download Sample CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading || isImporting || !selectedCategoryId}
                className="flex-1"
              />
              {csvData.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearUpload}
                  disabled={isImporting}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {!selectedCategoryId
                ? "Please select a category before uploading a CSV file"
                : "Upload a CSV file containing nominee details"}
            </p>
          </div>

          {csvData.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Preview ({csvData.length} nominees)
                </h3>
                <span className="text-xs text-muted-foreground">
                  Showing up to 5 entries
                </span>
              </div>
              <div className="border rounded-md max-h-60 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Image URL</TableHead>
                      <TableHead>Video URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((nominee, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {nominee.name}
                        </TableCell>
                        <TableCell>
                          {nominee.description
                            ? nominee.description.length > 30
                              ? nominee.description.substring(0, 30) + "..."
                              : nominee.description
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {nominee.imageUrl ? (
                            <span
                              className="text-blue-500 hover:underline cursor-pointer"
                              onClick={() =>
                                window.open(nominee.imageUrl, "_blank")
                              }
                            >
                              View
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {nominee.videoUrl ? (
                            <span
                              className="text-blue-500 hover:underline cursor-pointer"
                              onClick={() =>
                                window.open(nominee.videoUrl, "_blank")
                              }
                            >
                              View
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center text-sm p-3 bg-amber-50 text-amber-800 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                <span>
                  Make sure your nominees are correctly formatted before
                  importing. This action cannot be undone.
                </span>
              </div>
            </div>
          )}

          {!csvData.length && !isUploading && selectedCategoryId && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ready to Import</p>
                <p className="text-sm mt-1">
                  Upload a CSV file with nominee details to bulk import them to
                  the selected category. This is much faster than adding
                  nominees one by one.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              isImporting || csvData.length === 0 || !selectedCategoryId
            }
            className="gap-2"
          >
            {isImporting ? (
              <>Processing...</>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Import {csvData.length} Nominees
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
