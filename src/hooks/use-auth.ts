import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "admin" | "editor" | "student";

/** What each role is allowed to do inside the console. */
export type Capability =
  | "console"        // access the console at all
  | "content"        // create/edit courses, lessons, quizzes, blog
  | "students"       // view/manage learners
  | "analytics"      // analytics & traffic reports
  | "billing"        // plans, transactions, coupons
  | "system";        // settings, security, logs, users, notifications

const CAPS: Record<AppRole, Capability[]> = {
  owner: ["console", "content", "students", "analytics", "billing", "system"],
  admin: ["console", "content", "students", "analytics", "billing", "system"],
  editor: ["console", "content", "analytics"],
  student: [],
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [role, setRole] = useState<AppRole | null>(null);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        setRole(null);
        setRoles([]);
        setRolesLoaded(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (!data.session) setRolesLoaded(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        const list = (data ?? []).map((r) => r.role as AppRole);
        setRoles(list);
        setRole(
          list.includes("owner") ? "owner"
            : list.includes("admin") ? "admin"
            : list.includes("editor") ? "editor"
            : "student",
        );
        setRolesLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const effective: AppRole = role ?? "student";
  const caps = CAPS[effective] ?? [];

  return {
    session,
    user,
    role,
    roles,
    loading,
    rolesLoaded,
    /** owner/admin have every capability */
    can: (c: Capability) => caps.includes(c),
    isAdmin: effective === "admin" || effective === "owner",
    isEditor: effective === "admin" || effective === "owner" || effective === "editor",
    signOut: () => supabase.auth.signOut(),
  };
}
