"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface BlogPostDetail {
  title: string;
  date: string;
  category: string;
  readTime: string;
  gradient: string;
  content: string;
  views: number;
}

export default function BlogPostDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchPostDetail() {
      try {
        const supabase = createClient();

        // 1. Fetch post details (renaming read_time to readTime)
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, excerpt, content, date, category, gradient, readTime:read_time, views, slug")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setPost(data);

        // 2. Increment view count directly
        if (data) {
          await supabase
            .from("posts")
            .update({ views: (data.views || 0) + 1 })
            .eq("slug", slug);
        }
      } catch (error) {
        console.error("Error fetching post detail:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPostDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-coal-950 text-bone pt-28 pb-20 font-sans relative overflow-hidden flex flex-col items-center justify-center animate-pulse">
        <div className="max-w-2xl w-full mx-auto px-5 md:px-8 space-y-6">
          <div className="w-20 h-4 bg-coal-900 rounded-full" />
          <div className="w-32 h-3 bg-coal-900 rounded-full" />
          <div className="w-full h-10 bg-coal-900 rounded-full" />
          <div className="w-full h-64 bg-coal-900 rounded-2xl" />
          <div className="space-y-4">
            <div className="w-full h-4 bg-coal-900 rounded-full" />
            <div className="w-full h-4 bg-coal-900 rounded-full" />
            <div className="w-5/6 h-4 bg-coal-900 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-coal-950 flex flex-col items-center justify-center text-center px-5">
        <Icon icon="solar:danger-circle-bold-duotone" className="text-pine-400 text-6xl mb-4" />
        <h1 className="text-2xl font-bold text-bone mb-2">Article Not Found</h1>
        <p className="text-mist text-sm mb-6">Sorry, the article you are looking for is not available or has been deleted.</p>
        <Link href="/blog" className="inline-flex items-center gap-1.5 bg-pine-400 text-coal-950 text-xs font-bold px-5 py-2.5 rounded-full hover:bg-pine-300 transition">
          <Icon icon="solar:arrow-left-linear" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coal-950 text-bone pt-28 pb-20 font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-pine-700/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-900/10 blur-[100px]" />

      <article className="max-w-2xl mx-auto px-5 md:px-8 relative z-10">
        <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-mist hover:text-pine-400 font-mono transition mb-8">
          <Icon icon="solar:arrow-left-linear" /> Back to Blog
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs font-mono text-pine-400 mb-3">
            <span>{post.date}</span>
            <span>•</span>
            <span className="bg-pine-950/60 border border-pine-800/40 px-2.5 py-0.5 rounded-full text-[10px]">
              {post.category}
            </span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="font-display font-semibold text-2xl sm:text-4xl text-bone leading-snug tracking-tight">
            {post.title}
          </h1>
        </header>

        <div className={`w-full h-64 sm:h-80 rounded-2xl bg-gradient-to-br ${post.gradient} flex items-center justify-center mb-10 overflow-hidden`}>
          <Icon icon="solar:document-text-bold-duotone" className="text-white/20 text-6xl" />
        </div>

        {/* Smart content renderer: HTML (Tiptap) or legacy plain text */}
        {post.content.trim().startsWith("<") ? (
          // HTML content from Tiptap rich editor
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          // Legacy plain text / markdown fallback
          <div className="prose prose-invert prose-pine max-w-none text-mist text-sm sm:text-base leading-relaxed space-y-6">
            {post.content.trim().split("\n\n").map((block, idx) => {
              if (block.startsWith("### ")) {
                return <h3 key={idx} className="font-display font-semibold text-lg sm:text-xl text-bone pt-4">{block.replace("### ", "")}</h3>;
              }
              if (block.startsWith("- ")) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-mist">
                    {block.split("\n").map((item, itemIdx) => (
                      <li key={itemIdx}>{item.replace("- ", "")}</li>
                    ))}
                  </ul>
                );
              }
              if (block.startsWith("1. ")) {
                return (
                  <ol key={idx} className="list-decimal pl-5 space-y-1.5 text-mist">
                    {block.split("\n").map((item, itemIdx) => (
                      <li key={itemIdx}>{item.replace(/^\d+\.\s+/, "")}</li>
                    ))}
                  </ol>
                );
              }
              if (block.startsWith("```")) {
                const lines = block.split("\n");
                const code = lines.slice(1, lines.length - 1).join("\n");
                return (
                  <pre key={idx} className="bg-coal-900 border border-coal-700/50 p-4 rounded-xl font-mono text-xs overflow-x-auto text-pine-300">
                    <code>{code}</code>
                  </pre>
                );
              }
              if (block.startsWith("---")) {
                return <hr key={idx} className="border-coal-700 my-8" />;
              }
              return <p key={idx}>{block.replaceAll("`", "")}</p>;
            })}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-coal-700 flex justify-between items-center">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine-400 hover:text-pine-300 transition">
            <Icon icon="solar:arrow-left-linear" /> Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
