import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getPost } from "@/lib/api/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — مدونة HN-AI` : "مقال — مدونة HN-AI";
    const desc = loaderData?.excerpt ?? "مقال من مدونة HN-AI حول الذكاء الاصطناعي.";
    const img = loaderData?.cover_url && /^https:\/\//.test(loaderData.cover_url) ? loaderData.cover_url : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  errorComponent: ({ error }) => <div className="py-20 text-center text-neon-pink">{(error as Error).message}</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">المقال غير موجود.</div>,
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();
  return (
    <article className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-neon-cyan">
        <ArrowRight className="size-4" /> كل المقالات
      </Link>
      {post.cover_url && <img src={post.cover_url} alt={post.title} className="w-full rounded-3xl object-cover max-h-80" />}
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-gold">{post.title}</h1>
      {post.published_at && (
        <div className="text-xs text-muted-foreground">{new Date(post.published_at).toLocaleDateString("ar")}</div>
      )}
      <div className="glass rounded-2xl p-6 leading-loose whitespace-pre-wrap text-[15px]">{post.content}</div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt ?? undefined,
            datePublished: post.published_at ?? undefined,
            image: post.cover_url ?? undefined,
            author: { "@type": "Organization", name: "HN-Group" },
          }),
        }}
      />
    </article>
  );
}
