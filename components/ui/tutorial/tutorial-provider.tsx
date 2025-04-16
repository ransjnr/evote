"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { TutorialOverlay } from "./tutorial-overlay";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { usePathname } from "next/navigation";

// Define the interface for a tutorial step
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: "top" | "right" | "bottom" | "left" | "center";
  spotlightRadius?: number; // Optional spotlight size
  action?: string; // Optional action text for buttons
  image?: string; // Optional image URL
  elementSelector?: string; // CSS selector for the element to highlight
  requireClick?: boolean; // Whether to require a click on the element to proceed
  waitForElement?: boolean; // Whether to wait for the element to appear
}

// Define the interface for a complete tutorial
export interface Tutorial {
  id: string;
  name: string;
  steps: TutorialStep[];
  category: "admin" | "superadmin" | "general";
  requiredRole?: string; // Optional role requirement to see this tutorial
  description: string;
}

// Interface for the tutorial context
interface TutorialContextType {
  activeTutorial: Tutorial | null;
  currentStepIndex: number;
  isTutorialActive: boolean;
  tutorialProgress: Record<string, boolean>; // Track completed tutorials

  // Methods
  startTutorial: (tutorialId: string) => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  markTutorialComplete: (tutorialId: string) => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
  goToStep: (stepIndex: number) => void;
  currentStep: TutorialStep | null;
  completedTutorials: string[];
}

// Create the context
const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

// Define available tutorials
export const TUTORIALS: Tutorial[] = [
  {
    id: "dashboard-intro",
    name: "Dashboard Introduction",
    category: "admin",
    description: "Learn how to navigate and use the admin dashboard",
    steps: [
      {
        id: "welcome",
        title: "Welcome to the Dashboard",
        description:
          "This tutorial will show you around the admin dashboard and help you get started with managing your events and nominees.",
        elementSelector: ".dashboard, main, h1, [role='heading']",
        position: "bottom",
      },
      {
        id: "sidebar",
        title: "Navigation Sidebar",
        description:
          "Use the sidebar to navigate between different sections of the admin dashboard.",
        elementSelector: "aside, nav, div.sidebar, ul, .sidebar",
        position: "right",
      },
      {
        id: "events-section",
        title: "Events Management",
        description:
          "Click here to manage your events. You can create, edit, and delete events from this section.",
        elementSelector: "a[href*='/events'], a[href*='events']",
        position: "right",
        requireClick: true,
      },
      {
        id: "create-event",
        title: "Create New Event",
        description: "Click this button to create a new voting event.",
        elementSelector: "button, a.btn, a.button, .btn, .button",
        position: "bottom",
        waitForElement: true,
      },
      {
        id: "nominees-section",
        title: "Nominees Management",
        description:
          "This section allows you to add and manage nominees for your events.",
        elementSelector: "a[href*='/nominees'], a[href*='nominees']",
        position: "right",
        requireClick: true,
      },
    ],
  },
  {
    id: "event-creation",
    name: "Creating an Event",
    category: "admin",
    description: "Learn how to create and configure a new voting event",
    steps: [
      {
        id: "event-intro",
        title: "Creating a New Event",
        description:
          "This tutorial will guide you through creating a new voting event.",
      },
      {
        id: "event-name",
        title: "Event Name",
        description:
          "Enter a clear and descriptive name for your event. This will be visible to voters.",
        elementSelector:
          "input[name='eventName'], #eventName, input[type='text']",
        position: "bottom",
      },
      {
        id: "event-dates",
        title: "Event Dates",
        description:
          "Set the start and end dates for your voting event. This determines when users can cast votes.",
        elementSelector:
          ".date-picker-container, input[name='startDate'], input[type='date']",
        position: "bottom",
      },
      {
        id: "event-categories",
        title: "Event Categories",
        description:
          "Add categories for your event. Each category can have its own nominees.",
        elementSelector: ".categories-section, .category-input, input, select",
        position: "top",
      },
      {
        id: "publish-event",
        title: "Publishing Your Event",
        description:
          "When you're ready, click this button to publish your event and make it available for voting.",
        elementSelector: "button[type='submit'], .publish-btn, button",
        position: "bottom",
      },
    ],
  },
  {
    id: "results-analysis",
    name: "Analyzing Results",
    category: "admin",
    description: "Learn how to view and analyze voting results",
    steps: [
      {
        id: "results-intro",
        title: "Viewing Voting Results",
        description:
          "This tutorial will show you how to access and interpret voting results.",
      },
      {
        id: "results-dashboard",
        title: "Results Dashboard",
        description:
          "Here you can see an overview of all votes cast in your events.",
        elementSelector:
          ".results-dashboard, .analytics-panel, main, .dashboard",
        position: "bottom",
      },
      {
        id: "charts-graphs",
        title: "Charts and Graphs",
        description:
          "These visualizations help you understand voting patterns and trends.",
        elementSelector: ".charts-container, .graph-container, svg, canvas",
        position: "top",
      },
      {
        id: "export-results",
        title: "Exporting Results",
        description:
          "Click here to export your results as CSV or PDF for further analysis or sharing.",
        elementSelector:
          ".export-btn, button.download-results, a[download], button",
        position: "left",
      },
    ],
  },
  {
    id: "department-management",
    name: "Department Management",
    category: "superadmin",
    requiredRole: "super_admin",
    description: "Learn how to manage departments and department admins",
    steps: [
      {
        id: "dept-intro",
        title: "Managing Departments",
        description:
          "This tutorial will show you how to manage departments and their administrators.",
      },
      {
        id: "dept-list",
        title: "Departments List",
        description: "Here you can see all departments in the system.",
        elementSelector: ".departments-list, .departments-table, table, ul",
        position: "bottom",
      },
      {
        id: "create-dept",
        title: "Create Department",
        description: "Click here to create a new department.",
        elementSelector:
          ".create-dept-btn, button.add-department, button, a.button",
        position: "bottom",
      },
      {
        id: "dept-admins",
        title: "Department Admins",
        description:
          "Manage the administrators for each department from this section.",
        elementSelector: ".admins-list, .admin-management, table, ul",
        position: "top",
      },
      {
        id: "verify-admin",
        title: "Verifying Admins",
        description:
          "Click here to verify or reject admin registration requests.",
        elementSelector: ".verify-btn, .admin-verification, button, a.button",
        position: "right",
      },
    ],
  },
];

// Local storage key for saving tutorial progress
const TUTORIAL_PROGRESS_KEY = "evote-tutorial-progress";
const ACTIVE_TUTORIAL_KEY = "evote-active-tutorial";

// Provider component
export const TutorialProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [tutorialProgress, setTutorialProgress] = useLocalStorage<
    Record<string, boolean>
  >(TUTORIAL_PROGRESS_KEY, {});

  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);

  const currentStep = useMemo(() => {
    return activeTutorial && activeTutorial.steps.length > currentStepIndex
      ? activeTutorial.steps[currentStepIndex]
      : null;
  }, [activeTutorial, currentStepIndex]);

  const checkElement = useCallback(() => {
    if (!currentStep?.target) return false;

    const targetElement = document.querySelector(currentStep.target);
    return !!targetElement;
  }, [currentStep]);

  useEffect(() => {
    if (!currentStep || !currentStep.waitForElement) return;

    const checkInterval = setInterval(() => {
      if (checkElement()) {
        clearInterval(checkInterval);
        setAutoAdvance(true);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [currentStep, checkElement]);

  useEffect(() => {
    if (autoAdvance) {
      setAutoAdvance(false);
      nextStep();
    }
  }, [autoAdvance]);

  const startTutorial = useCallback((tutorialId: string) => {
    console.log("Tutorial Debug: Starting tutorial", tutorialId);

    const tutorial = TUTORIALS.find((t) => t.id === tutorialId);

    if (!tutorial) {
      console.error(`Tutorial with ID ${tutorialId} not found.`);
      return;
    }

    console.log("Tutorial Debug: Found tutorial", tutorial);

    // Save to local storage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem(
        ACTIVE_TUTORIAL_KEY,
        JSON.stringify({
          tutorialId,
          stepIndex: 0,
          timestamp: Date.now(),
        })
      );
    }

    setActiveTutorial(tutorial);
    setCurrentStepIndex(0);
    setAutoAdvance(true);

    console.log("Tutorial Debug: Tutorial activated", { tutorialId, tutorial });
  }, []);

  const endTutorial = useCallback(() => {
    setActiveTutorial(null);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTutorial) return;

    setCurrentStepIndex((prevIndex) => {
      if (prevIndex >= activeTutorial.steps.length - 1) {
        const newProgress = {
          ...tutorialProgress,
          [activeTutorial.id]: true,
        };
        setTutorialProgress(newProgress);

        setActiveTutorial(null);
        return 0;
      }

      return prevIndex + 1;
    });
  }, [activeTutorial, tutorialProgress, setTutorialProgress]);

  const prevStep = useCallback(() => {
    if (!activeTutorial) return;

    setCurrentStepIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return 0;
      }
      return prevIndex - 1;
    });
  }, [activeTutorial]);

  const skipTutorial = useCallback(() => {
    endTutorial();
  }, [endTutorial]);

  const markTutorialComplete = useCallback(
    (tutorialId: string) => {
      setTutorialProgress((prev) => ({
        ...prev,
        [tutorialId]: true,
      }));
    },
    [setTutorialProgress]
  );

  const isTutorialCompleted = useCallback(
    (tutorialId: string) => {
      return !!tutorialProgress[tutorialId];
    },
    [tutorialProgress]
  );

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (!activeTutorial) return;

      if (stepIndex >= 0 && stepIndex < activeTutorial.steps.length) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [activeTutorial]
  );

  const completedTutorials = useMemo(() => {
    return Object.keys(tutorialProgress).filter((key) => tutorialProgress[key]);
  }, [tutorialProgress]);

  const contextValue = useMemo(
    () => ({
      activeTutorial,
      currentStepIndex,
      currentStep,
      isTutorialActive: !!activeTutorial,
      tutorialProgress,
      startTutorial,
      endTutorial,
      nextStep,
      prevStep,
      skipTutorial,
      markTutorialComplete,
      isTutorialCompleted,
      goToStep,
      completedTutorials,
    }),
    [
      activeTutorial,
      currentStepIndex,
      currentStep,
      tutorialProgress,
      startTutorial,
      endTutorial,
      nextStep,
      prevStep,
      skipTutorial,
      markTutorialComplete,
      isTutorialCompleted,
      goToStep,
      completedTutorials,
    ]
  );

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      {activeTutorial && <TutorialOverlay />}
    </TutorialContext.Provider>
  );
};

// Custom hook for accessing the tutorial context
export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
