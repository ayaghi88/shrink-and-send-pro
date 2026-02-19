import { useState, useEffect } from "react";

const TEST_MODE_KEY = "shrink_test_mode";
const TEST_MODE_SECRET = "shrink2026";

export const useTestMode = () => {
  const [isTestMode, setIsTestMode] = useState(() => {
    return sessionStorage.getItem(TEST_MODE_KEY) === "true";
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("testmode") === TEST_MODE_SECRET) {
      sessionStorage.setItem(TEST_MODE_KEY, "true");
      setIsTestMode(true);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("testmode");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const disableTestMode = () => {
    sessionStorage.removeItem(TEST_MODE_KEY);
    setIsTestMode(false);
  };

  return { isTestMode, disableTestMode };
};
