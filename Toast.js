"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

/* Fall back to a placeholder URL if the env var is missing so builds and
   prerenders never hard-fail — auth/data features just stay disconnected. */
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://unconfigured.convex.cloud"
);

export default function ConvexClientProvider({ children }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
