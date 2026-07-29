"use client";

import { useEffect } from "react";
import { track } from "../lib/analytics";

/* Page-view events for the home and landing pages. */
export default function HomeAnalytics({ page }) {
  useEffect(() => {
    track(page === "home" ? "homepage_viewed" : "landing_page_viewed",
      page === "home" ? {} : { page }, true);
    track("promotion_viewed", { promotion: "buy6_get1", trigger: "announcement_bar" }, true);
  }, [page]);
  return null;
}
