import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { trackView } from "@/lib/api/analytics.functions";

function sessionId() {
  let id = localStorage.getItem("hn-ai:sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("hn-ai:sid", id);
  }
  return id;
}

/** Anonymous page-view tracker (no personal data stored). */
export function ViewTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      trackView({ data: { path: pathname, session: sessionId(), referrer: document.referrer || null } }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
