import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publicClient } from "./public-client.server";

export interface BlogCategory { id: string; slug: string; name: string; description: string | null }
export interface BlogPostSummary {
  id: string; slug: string; title: string; excerpt: string | null; cover_url: string | null;
  tags: string[]; category_id: string | null; published_at: string | null; views: number;
}
export interface BlogPost extends BlogPostSummary { content: string }

/** Published posts + categories (public, SSR-safe). */
export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [posts, cats] = await Promise.all([
    db.from("posts")
      .select("id, slug, title, excerpt, cover_url, tags, category_id, published_at, views")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    db.from("post_categories").select("id, slug, name, description").order("order_index"),
  ]);
  return {
    posts: (posts.data ?? []) as BlogPostSummary[],
    categories: (cats.data ?? []) as BlogCategory[],
  };
});

/** One published post by slug. */
export const getPost = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string().min(1) }).parse(i))
  .handler(async ({ data }): Promise<BlogPost | null> => {
    const db = publicClient();
    const { data: post } = await db
      .from("posts")
      .select("id, slug, title, excerpt, content, cover_url, tags, category_id, published_at, views")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return (post as BlogPost) ?? null;
  });

/** All posts including drafts — editors/admins only. */
export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const PostInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(200),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().max(100000).default(""),
  cover_url: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string().max(40)).max(12).default([]),
  category_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => PostInput.parse(i))
  .handler(async ({ data, context }) => {
    const values = {
      ...data,
      author_id: context.userId,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };
    const { data: row, error } = await context.supabase.from("posts").upsert(values).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(2).max(80), slug: z.string().trim().min(2).max(80) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("post_categories").upsert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });
