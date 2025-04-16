"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial, TUTORIALS, Tutorial } from "./tutorial-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  HelpCircle,
  ChevronDown,
  Lightbulb,
  PlayCircle,
  CheckCircle,
  Award,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TutorialMenu: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { startTutorial, isTutorialCompleted } = useTutorial();
  const { admin } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Filter tutorials based on user role - memoize to avoid recalculation on every render
  const filteredTutorials = React.useMemo(() => {
    return TUTORIALS.filter((tutorial) => {
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
  }, [admin?.role]);

  // Group tutorials by category - memoize to avoid recalculation on every render
  const groupedTutorials = React.useMemo(() => {
    const grouped: Record<string, Tutorial[]> = {
      general: [],
      admin: [],
      superadmin: [],
    };

    filteredTutorials.forEach((tutorial) => {
      grouped[tutorial.category].push(tutorial);
    });

    return grouped;
  }, [filteredTutorials]);

  // Memoize handler to avoid recreating on every render
  const handleStartTutorial = React.useCallback(
    (tutorialId: string) => {
      startTutorial(tutorialId);
      setIsOpen(false);
    },
    [startTutorial]
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 text-gray-600 hover:text-primary hover:bg-primary/10 transition-all",
            className
          )}
          aria-label="Tutorial menu"
        >
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="hidden md:inline">Tutorials</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center">
          <Lightbulb className="h-4 w-4 text-primary mr-2" />
          <span>Interactive Tutorials</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* General tutorials */}
        {groupedTutorials.general.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500 px-2 py-1">
              General
            </DropdownMenuLabel>
            {groupedTutorials.general.map((tutorial) => (
              <TutorialMenuItem
                key={tutorial.id}
                tutorial={tutorial}
                isCompleted={isTutorialCompleted(tutorial.id)}
                onStart={() => handleStartTutorial(tutorial.id)}
              />
            ))}
          </>
        )}

        {/* Admin tutorials */}
        {groupedTutorials.admin.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500 px-2 py-1">
              Admin Features
            </DropdownMenuLabel>
            {groupedTutorials.admin.map((tutorial) => (
              <TutorialMenuItem
                key={tutorial.id}
                tutorial={tutorial}
                isCompleted={isTutorialCompleted(tutorial.id)}
                onStart={() => handleStartTutorial(tutorial.id)}
              />
            ))}
          </>
        )}

        {/* Super Admin tutorials */}
        {groupedTutorials.superadmin.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500 px-2 py-1">
              Super Admin Tools
            </DropdownMenuLabel>
            {groupedTutorials.superadmin.map((tutorial) => (
              <TutorialMenuItem
                key={tutorial.id}
                tutorial={tutorial}
                isCompleted={isTutorialCompleted(tutorial.id)}
                onStart={() => handleStartTutorial(tutorial.id)}
              />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type TutorialMenuItemProps = {
  tutorial: Tutorial;
  isCompleted: boolean;
  onStart: () => void;
};

const TutorialMenuItem: React.FC<TutorialMenuItemProps> = ({
  tutorial,
  isCompleted,
  onStart,
}) => {
  return (
    <DropdownMenuItem
      onClick={onStart}
      className="flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-primary/10 transition-colors"
    >
      <div className="flex items-center">
        {isCompleted ? (
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
        ) : (
          <PlayCircle className="h-4 w-4 text-primary mr-2" />
        )}
        <span
          className={cn(
            "text-sm",
            isCompleted ? "text-gray-500" : "text-gray-700"
          )}
        >
          {tutorial.name}
        </span>
      </div>
      {isCompleted && (
        <div className="flex items-center gap-1">
          <Award className="h-3 w-3 text-amber-500" />
          <span className="text-xs text-amber-500">Completed</span>
        </div>
      )}
    </DropdownMenuItem>
  );
};
