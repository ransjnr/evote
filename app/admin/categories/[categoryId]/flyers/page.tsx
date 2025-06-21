"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NomineeFlyer } from "@/components/ui/nominee-flyer";
import { toast } from "sonner";
import { ArrowLeft, Download, FileImage, Printer, Share2 } from "lucide-react";

export default function CategoryFlyers() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as Id<"categories">;
  const [isGenerating, setIsGenerating] = useState(false);
  const flyersRef = useRef<HTMLDivElement>(null);

  // Get category details
  const category = useQuery(api.categories.getCategory, { categoryId });

  // Get event details if category is loaded
  const event = useQuery(
    api.events.getEvent,
    category ? { eventId: category.eventId } : "skip"
  );

  // Get department details if event is loaded
  const department = useQuery(
    api.departments.getDepartment,
    event ? { departmentId: event.departmentId } : "skip"
  );

  // Get nominees for this category
  const nominees = useQuery(api.nominees.listNomineesByCategory, {
    categoryId,
  });

  const generateVotingUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/events/${event?._id}`;
  };

  const getUSSDCode = () => {
    return "*920*1234#";
  };

  const handleDownloadAllFlyers = async () => {
    if (!flyersRef.current || !nominees) return;

    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import("html2canvas");

      // Get all flyer elements
      const flyerElements =
        flyersRef.current.querySelectorAll(".nominee-flyer");

      for (let i = 0; i < flyerElements.length; i++) {
        const flyerElement = flyerElements[i] as HTMLElement;
        const nominee = nominees[i];

        const canvas = await html2canvas(flyerElement, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });

        const link = document.createElement("a");
        link.download = `${nominee.name.replace(/\s+/g, "_")}_flyer.png`;
        link.href = canvas.toDataURL();
        link.click();

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success(`Downloaded ${nominees.length} flyers successfully!`);
    } catch (error) {
      console.error("Error downloading flyers:", error);
      toast.error("Failed to download flyers");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintAllFlyers = () => {
    if (!flyersRef.current) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Flyers - ${category?.name}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .flyer-page { page-break-after: always; margin-bottom: 20px; }
              .flyer-page:last-child { page-break-after: auto; }
              @media print {
                body { margin: 0; padding: 0; }
                .flyer-page { 
                  page-break-after: always; 
                  margin: 0; 
                  padding: 0.5in;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                @page { size: A4 portrait; margin: 0.5in; }
              }
            </style>
          </head>
          <body>
            ${flyersRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!category || !event || !department || !nominees) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-500 mb-4">
            Please wait while we load the category details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Flyers</h1>
          <p className="text-gray-500">
            {category.name} • {event.name} • {department.name}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {nominees.length} nominee{nominees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleDownloadAllFlyers}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Download All"}
          </Button>
          <Button
            onClick={handlePrintAllFlyers}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print All
          </Button>
          <Link href={`/admin/categories/${categoryId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Bulk Flyer Generation
          </CardTitle>
          <CardDescription>
            Generate professional campaign flyers for all nominees in this
            category. Perfect for distributing to supporters and campaign teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Download All:</strong> Saves all flyers as individual
                PNG files
              </li>
              <li>
                • <strong>Print All:</strong> Opens print dialog with all flyers
                formatted for printing
              </li>
              <li>
                • Each flyer includes voting instructions, nominee code, and
                contact details
              </li>
              <li>• Share these with campaign teams and supporters</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Flyers Grid */}
      <div
        ref={flyersRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {nominees.map((nominee) => (
          <div key={nominee._id} className="nominee-flyer flyer-page">
            <NomineeFlyer
              nominee={{
                name: nominee.name,
                code: nominee.code,
                description: nominee.description,
                imageUrl: nominee.imageUrl,
              }}
              category={{
                name: category.name,
              }}
              event={{
                name: event.name,
                votePrice: event.votePrice,
              }}
              department={{
                name: department.name,
              }}
              votingUrl={generateVotingUrl()}
              ussdCode={getUSSDCode()}
            />
          </div>
        ))}
      </div>

      {nominees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No nominees found
            </h3>
            <p className="text-gray-500 mb-4">
              There are no nominees in this category yet.
            </p>
            <Link href={`/admin/categories/${categoryId}`}>
              <Button>Add Nominees</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
