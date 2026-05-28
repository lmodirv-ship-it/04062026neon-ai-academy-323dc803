import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";

// Mounted as a sibling layout component for global toasts.
// The actual app shell + routing lives in __root.tsx + AppLayout.

export const Route = createFileRoute("/_toaster")({
  component: () => <Toaster theme="dark" position="top-right" richColors />,
});
