"use client";

import { useReportWebVitals } from "next/web-vitals";

import { logger } from "@/lib/logger";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    logger.debug("web-vital", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  });

  return null;
}
