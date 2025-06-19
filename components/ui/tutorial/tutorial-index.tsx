"use client";

import React from "react";
import { useTutorial, TUTORIALS } from "./tutorial-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const TutorialIndex: React.FC = () => {
  const { startTutorial, isTutorialCompleted } = useTutorial();
  const { admin } = useAuthStore();

  // Filter tutorials based on user role
  const filteredTutorials = TUTORIALS.filter((tutorial) => {
    // If tutorial has required role, check if user has it
    if (tutorial.requiredRole) {
      return admin?.role === tutorial.requiredRole;
    }
    // Otherwise show admin tutorials to admins and superadmins
    return (
      tutorial.category === "general" ||
      tutorial.category === "admin" ||
      (tutorial.category === "superadmin" && admin?.role === "super_admin")
    );
  });

  // Group tutorials by category
  const groupedTutorials = {
    admin: filteredTutorials.filter((t) => t.category === "admin"),
    superadmin: filteredTutorials.filter((t) => t.category === "superadmin"),
    general: filteredTutorials.filter((t) => t.category === "general"),
  };

  // Format step duration roughly
  const formatDuration = (steps: number) => {
    // Assume each step takes about 30 seconds
    const minutes = Math.max(1, Math.round((steps * 30) / 60));
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6 space-x-4">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Tutorial Library</h1>
      </div>

      <p className="text-gray-600 mb-8 max-w-3xl">
        Welcome to the Pollix tutorial library. Here you'll find interactive
        guides to help you learn how to use all features of the platform. Click
        on any tutorial to get started.
      </p>

      {/* Admin Tutorials */}
      {groupedTutorials.admin.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded mr-2">
              ADMIN
            </span>
            Administrator Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTutorials.admin.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                isCompleted={isTutorialCompleted(tutorial.id)}
                onStart={() => startTutorial(tutorial.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Super Admin Tutorials */}
      {groupedTutorials.superadmin.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mr-2">
              SUPER ADMIN
            </span>
            Super Administrator Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTutorials.superadmin.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                isCompleted={isTutorialCompleted(tutorial.id)}
                onStart={() => startTutorial(tutorial.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* General Tutorials */}
      {groupedTutorials.general.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded mr-2">
              GENERAL
            </span>
            General Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTutorials.general.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                isCompleted={isTutorialCompleted(tutorial.id)}
                onStart={() => startTutorial(tutorial.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type TutorialCardProps = {
  tutorial: (typeof TUTORIALS)[0];
  isCompleted: boolean;
  onStart: () => void;
};

const TutorialCard: React.FC<TutorialCardProps> = ({
  tutorial,
  isCompleted,
  onStart,
}) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{tutorial.name}</CardTitle>
          {isCompleted ? (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 hover:bg-green-200"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(tutorial.steps.length)}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">
          {tutorial.steps[0].description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 text-xs text-gray-500">
        <div className="flex gap-1 flex-wrap">
          {tutorial.steps.slice(1, 4).map((step) => (
            <Badge
              key={step.id}
              variant="outline"
              className="bg-gray-50 font-normal"
            >
              {step.title}
            </Badge>
          ))}
          {tutorial.steps.length > 4 && (
            <Badge variant="outline" className="bg-gray-50 font-normal">
              +{tutorial.steps.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={onStart}
          variant={isCompleted ? "outline" : "default"}
          className="w-full"
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          {isCompleted ? "Review Again" : "Start Tutorial"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper function to format the duration of a tutorial
const formatDuration = (steps: number) => {
  // Assume average of 30 seconds per step
  const minutes = Math.max(1, Math.round((steps * 30) / 60));
  return `${minutes} min${minutes !== 1 ? "s" : ""}`;
};
