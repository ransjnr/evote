"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTutorial } from "./tutorial-provider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Portal component to handle highlighting elements
export const TutorialOverlay: React.FC = () => {
  const {
    activeTutorial,
    currentStep,
    nextStep,
    prevStep,
    endTutorial,
    skipTutorial,
    currentStepIndex,
  } = useTutorial();

  const [highlight, setHighlight] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Memoize event handlers to avoid dependency changes
  const handleNextStep = React.useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handlePrevStep = React.useCallback(() => {
    prevStep();
  }, [prevStep]);

  const handleSkipTutorial = React.useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  // Handle element click for steps that require clicking
  useEffect(() => {
    if (!currentStep?.requireClick || !currentStep.elementSelector) return;

    const handleElementClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.matches(currentStep.elementSelector!) ||
        target.closest(currentStep.elementSelector!)
      ) {
        handleNextStep();
      }
    };

    document.addEventListener("click", handleElementClick);
    return () => {
      document.removeEventListener("click", handleElementClick);
    };
  }, [currentStep, handleNextStep]);

  // Position the highlight and tooltip based on the target element
  useEffect(() => {
    if (!currentStep?.elementSelector) {
      // If no element selector, position the tooltip in the center of the screen
      console.log("Tutorial Debug: No element selector, using center position");
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setHighlight(null);
      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const top = window.innerHeight / 2 - tooltipRect.height / 2 + scrollY;
        const left = window.innerWidth / 2 - tooltipRect.width / 2 + scrollX;
        setTooltipPosition({ top, left });
      }
      return;
    }

    const positionElements = () => {
      // Try to find element by selector
      let targetElement = document.querySelector(currentStep.elementSelector!);

      // If target element not found, search elements by their text content
      if (!targetElement) {
        console.log("Tutorial Debug: Element not found, trying text search");

        // Text to look for based on the current step
        let textToSearch = "";

        // Try to determine what text to look for based on the step
        if (
          currentStep.id === "welcome" ||
          currentStep.title.includes("Welcome")
        ) {
          textToSearch = "Dashboard";
        } else if (currentStep.id === "events-section") {
          textToSearch = "Events";
        } else if (currentStep.id === "nominees-section") {
          textToSearch = "Nominees";
        } else if (currentStep.id === "create-event") {
          textToSearch = "Create";
        } else if (currentStep.id === "dept-list") {
          textToSearch = "Department";
        }

        if (textToSearch) {
          console.log(`Tutorial Debug: Searching for text "${textToSearch}"`);

          // Search all elements for matching text content
          const allElements = document.querySelectorAll("*");
          for (const el of allElements) {
            if (el.textContent?.includes(textToSearch)) {
              targetElement = el;
              console.log("Tutorial Debug: Found element by text content", el);
              break;
            }
          }
        }
      }

      console.log(
        "Tutorial Debug: Looking for element",
        currentStep.elementSelector
      );

      if (!targetElement) {
        console.log(
          "Tutorial Debug: Element not found!",
          currentStep.elementSelector
        );
        setHighlight(null);
        setTooltipPosition(null);
        return;
      }

      console.log("Tutorial Debug: Element found", targetElement);

      const rect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Set highlight dimensions and position
      setHighlight({
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
      });

      console.log("Tutorial Debug: Highlight set", {
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
      });

      // Calculate tooltip position
      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const position = currentStep.position || "bottom";

        let top = 0;
        let left = 0;

        switch (position) {
          case "top":
            top = rect.top + scrollY - tooltipRect.height - 10;
            left = rect.left + scrollX + rect.width / 2 - tooltipRect.width / 2;
            break;
          case "bottom":
            top = rect.bottom + scrollY + 10;
            left = rect.left + scrollX + rect.width / 2 - tooltipRect.width / 2;
            break;
          case "left":
            top = rect.top + scrollY + rect.height / 2 - tooltipRect.height / 2;
            left = rect.left + scrollX - tooltipRect.width - 10;
            break;
          case "right":
            top = rect.top + scrollY + rect.height / 2 - tooltipRect.height / 2;
            left = rect.right + scrollX + 10;
            break;
          default:
            // center positioning for fallback
            top = window.innerHeight / 2 - tooltipRect.height / 2 + scrollY;
            left = window.innerWidth / 2 - tooltipRect.width / 2 + scrollX;
        }

        // Keep tooltip within viewport bounds
        top = Math.max(scrollY + 10, top);
        top = Math.min(
          scrollY + window.innerHeight - tooltipRect.height - 10,
          top
        );
        left = Math.max(scrollX + 10, left);
        left = Math.min(
          scrollX + window.innerWidth - tooltipRect.width - 10,
          left
        );

        setTooltipPosition({ top, left });
      }
    };

    // Position elements initially and on resize/scroll
    positionElements();

    // Add event listeners
    const handleResize = () => requestAnimationFrame(positionElements);
    const handleScroll = () => requestAnimationFrame(positionElements);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // If the element requires a click, make it noticeable
    if (currentStep.requireClick && currentStep.elementSelector) {
      const element = document.querySelector(currentStep.elementSelector);
      if (element) {
        element.classList.add("tutorial-highlight-pulse");
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);

      // Clean up highlights
      const elements = document.querySelectorAll(".tutorial-highlight-pulse");
      elements.forEach((el) => el.classList.remove("tutorial-highlight-pulse"));
    };
  }, [currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkipTutorial();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNextStep();
      } else if (e.key === "ArrowLeft") {
        handlePrevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNextStep, handlePrevStep, handleSkipTutorial]);

  // If no active tutorial, don't render anything
  if (!activeTutorial || !currentStep) {
    return null;
  }

  // Calculate progress percentage
  const progressPercentage =
    ((currentStepIndex + 1) / activeTutorial.steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[999] pointer-events-auto" />

      {/* Highlight */}
      {highlight && (
        <div
          ref={highlightRef}
          className="fixed z-[1000] pointer-events-none rounded-md ring-4 ring-primary ring-offset-2 transition-all duration-300"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[1001] bg-card shadow-lg rounded-lg p-4 max-w-md w-full transition-opacity pointer-events-auto",
          !tooltipPosition && "opacity-0"
        )}
        style={{
          top: tooltipPosition?.top || 0,
          left: tooltipPosition?.left || 0,
        }}
      >
        {/* Tooltip Content */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{currentStep.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Close tutorial"
            onClick={handleSkipTutorial}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          {currentStep.description}

          {currentStep.elementSelector && !highlight && (
            <div className="mt-2 text-amber-500 text-sm border border-amber-200 bg-amber-50 p-2 rounded">
              <p>
                <strong>Note:</strong> Some elements of this tutorial couldn't
                be found on the current page. You may need to navigate to the
                correct page or contact support if this persists.
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <div>
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                aria-label="Go back to previous step"
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipTutorial}
              aria-label="Skip tutorial"
            >
              Skip
            </Button>

            {currentStepIndex < activeTutorial.steps.length - 1 ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleNextStep}
                className={cn(
                  currentStep.requireClick &&
                    currentStep.elementSelector &&
                    "opacity-50"
                )}
                disabled={
                  currentStep.requireClick && currentStep.elementSelector
                }
                aria-label="Go to next step"
              >
                {currentStep.requireClick && currentStep.elementSelector
                  ? "Click Element to Continue"
                  : "Next"}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={endTutorial}
                aria-label="Finish tutorial"
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
