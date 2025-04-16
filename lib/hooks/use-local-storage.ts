"use client";

import { useState, useEffect } from "react";

// Type for the setValue function returned by useLocalStorage
type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

/**
 * Custom hook for persisting state in localStorage
 * Safely handles server-side rendering in Next.js
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Flag to prevent initial effect from running more than once
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state on component mount - only once
  useEffect(() => {
    // Prevent this effect from running more than once
    if (isInitialized) return;

    try {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or return initialValue if none
        if (item) {
          const value = JSON.parse(item);
          setStoredValue(value);
        }
        setIsInitialized(true);
      }
    } catch (error) {
      // If error, use initial value
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, initialValue, isInitialized]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue: SetValue<T> = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage, but only if we're in a browser environment
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Log errors here
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
