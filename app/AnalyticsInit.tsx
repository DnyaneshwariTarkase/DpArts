"use client";

import { ReactNode, useEffect } from "react";
import { initializeAnalytics } from "avi-analytics-sdk";

export default function AnalyticsInit() {
  useEffect(() => {
    initializeAnalytics({
      apiKey: "5df17681-330f-477c-942f-148f8aba58b1",
    });
  }, []);

  return null;
}

export function AnalyticsWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsInit />
      {children}
    </>
  );
}