"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";

interface BlogPostDetail {
  category: string;
  content: string;
  date: string;
  gradient: string;
  readTime: string;
  slug: string;
  title: string;
  views: number;
}

interface BlogPostClientProps {
  post: BlogPostDetail;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  // Increment view count on mount (client-side)
  useEffect(() => {
    const increment = async () => {
      const supabase = createClient();
      await supabase
        .from("posts")
        .update({ views: (post.views || 0) + 1 })
        .eq("slug", post.slug);
    };
    increment();
  }, [post.slug, post.views]);

  return (
    <div className="min-h-screen bg-coal-950 text-bone pt-28 pb-20 font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-pine-700/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-900/10 blur-[100px]" />

      <article className="max-w-2xl mx-auto px-5 md:px-8 relative z-10">
        <Link href="/blog" className="inline-flex items-center gap-1 text-xs text-mist hover:text-pine-400 font-mono transition mb-8">
          <Icon icon="solar:arrow-left-linear" /> Back to Blog
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 text-xs font-mono text-pine-400 mb-2.5">
            <span>{post.date}</span>
            <span>•</span>
            <span className="bg-coal-900 border border-pine-800 px-2 py-0.5 rounded-sm text-[10px]">
              {post.category}
            </span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-bone leading-snug tracking-tight">
            {post.title}
          </h1>
        </header>

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
                  <pre key={idx} className="bg-coal-900 border border-coal-700 p-4 rounded-sm font-mono text-xs overflow-x-auto text-pine-300">
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
