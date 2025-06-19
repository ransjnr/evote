"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "./tutorial-provider";
import { Button } from "@/components/ui/button";
import { PlayCircle, X, ChevronsRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

const WELCOME_TUTORIAL_VIEWED = "evote_welcome_tutorial_viewed";

export const WelcomeTutorial: React.FC = () => {
  const { startTutorial } = useTutorial();
  const [isVisible, setIsVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage(
    WELCOME_TUTORIAL_VIEWED,
    false
  );

  useEffect(() => {
    // If not seen before, show it after a slight delay
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome]);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenWelcome(true);
  };

  const handleNext = () => {
    if (currentScreen < welcomeScreens.length - 1) {
      setCurrentScreen((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleStartTour = () => {
    handleClose();
    startTutorial("dashboard-intro");
  };

  // Welcome screens content
  const welcomeScreens = [
    {
      title: "Welcome to Pollix Admin",
      description:
        "We've created an interactive onboarding experience to help you get familiar with the platform.",
      image: "/tutorial/welcome.svg",
      action: "Next",
    },
    {
      title: "Interactive Tutorials",
      description:
        "Our step-by-step tutorials will guide you through different features of the platform.",
      image: "/tutorial/tutorial-concept.svg",
      action: "Next",
    },
    {
      title: "Start Your Journey",
      description:
        "Ready to explore? Start with our dashboard introduction or access tutorials anytime from the help menu.",
      image: "/tutorial/tutorial-menu.svg",
      action: "Start Tour",
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Colored header bar */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-indigo-600"></div>

              {/* Indicator dots */}
              <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                <div className="flex space-x-1.5">
                  {welcomeScreens.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        index === currentScreen
                          ? "w-4 bg-primary"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Screen content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-10"
                >
                  <div className="flex justify-center mb-6">
                    <div className="relative h-40 w-40">
                      <Image
                        src={welcomeScreens[currentScreen].image}
                        alt={welcomeScreens[currentScreen].title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
                    {welcomeScreens[currentScreen].title}
                  </h2>

                  <p className="text-center text-gray-600 mb-8">
                    {welcomeScreens[currentScreen].description}
                  </p>

                  <div className="flex justify-center">
                    {currentScreen === welcomeScreens.length - 1 ? (
                      <Button onClick={handleStartTour} className="px-5 gap-2">
                        <PlayCircle size={16} />
                        {welcomeScreens[currentScreen].action}
                      </Button>
                    ) : (
                      <Button onClick={handleNext} className="px-5 gap-2">
                        {welcomeScreens[currentScreen].action}
                        <ArrowRight size={16} />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Skip all button */}
              <div className="p-4 text-center border-t border-gray-100">
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-500 hover:text-primary transition-colors"
                >
                  Skip all tutorials
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
