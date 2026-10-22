"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface BlogPost {
  id: string;
  category: string;
  date: string;
  excerpt: string;
  gradient: string;
  readTime: string;
  slug: string;
  title: string;
  views?: number;
}

interface TrendingPost {
  id: string;
  category: string;
  slug: string;
  title: string;
  views: number;
}

const CATEGORIES = ["All", "Development", "Design", "Productivity", "Trends"];

const ArticleSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-6 p-5 sm:p-6 rounded-sm border border-coal-800 bg-coal-950/40 animate-pulse">
    <div className="md:w-48 h-32 shrink-0 rounded-sm bg-coal-900" />
    <div className="flex flex-col justify-between grow space-y-4">
      <div>
        <div className="w-24 h-3 bg-coal-900 rounded-sm mb-3" />
        <div className="w-full h-5 bg-coal-900 rounded-sm mb-2" />
        <div className="w-2/3 h-5 bg-coal-900 rounded-sm mb-4" />
        <div className="w-full h-3 bg-coal-900 rounded-sm mb-1.5" />
        <div className="w-5/6 h-3 bg-coal-900 rounded-sm" />
      </div>
      <div className="w-20 h-3 bg-coal-900 rounded-sm" />
    </div>
  </div>
);

const TrendingSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="space-y-2 grow">
          <div className="w-full h-4 bg-coal-900 rounded-sm" />
          <div className="w-2/3 h-4 bg-coal-900 rounded-sm" />
          <div className="w-12 h-3 bg-coal-900 rounded-sm" />
        </div>
      </div>
    ))}
  </div>
);

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogData() {
      try {
        const supabase = createClient();

        const { data: allPosts, error: allPostsError } = await supabase
          .from("posts")
          .select("id, title, excerpt, date, category, gradient, readTime:read_time, slug")
          .order("created_at", { ascending: false });

        if (allPostsError) throw allPostsError;

        const { data: topPosts, error: topPostsError } = await supabase
          .from("posts")
          .select("id, title, category, views, slug")
          .order("views", { ascending: false })
          .limit(3);

        if (topPostsError) throw topPostsError;

        setPosts(allPosts || []);
        setTrendingPosts(topPosts || []);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlogData();
  }, []);

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-coal-950 font-sans text-bone pt-24 pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-pine-700/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-900/10 blur-[100px]" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-mist hover:text-pine-400 font-mono transition mb-6">
            <Icon icon="solar:arrow-left-linear" /> Back to Home
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-bone tracking-tight mb-3">
            Notes &amp; <span className="text-pine-400">Articles</span>
          </h1>
          <p className="text-mist max-w-lg leading-relaxed text-xs sm:text-sm font-mono">
            Sharing thoughts on web development, productivity tips, coding best practices, and UI/UX design exploration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-coal-700">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-all ${selectedCategory === cat
                    ? "bg-pine-400 text-coal-950 font-bold"
                    : "bg-coal-900 border border-coal-700 text-mist hover:text-bone hover:border-coal-600"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {isLoading ? (
                <>
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                </>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-coal-700 rounded-sm">
                  <Icon icon="solar:sad-ellipse-bold-duotone" className="text-mist text-4xl mx-auto mb-3" />
                  <p className="text-mist text-sm">No articles found in this category.</p>
                </div>
              ) : (
                filteredPosts.map((post, idx) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="group flex flex-col md:flex-row gap-5 p-4 sm:p-5 rounded-sm border-2 border-coal-700 bg-coal-900 transition-all hover:border-pine-400 hover:shadow-[5px_5px_0px_#1F7A4C]"
                    style={{ boxShadow: "4px 4px 0px #000000" }}
                  >
                    <div className={`md:w-44 h-28 shrink-0 rounded-sm bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden border border-coal-700`}>
                      <Icon icon="solar:document-text-bold-duotone" className="text-white/30 text-3xl" />
                    </div>

                    <div className="flex flex-col justify-between grow">
                      <div>
                        <div className="flex items-center gap-2.5 text-[10px] font-mono text-pine-400 mb-1.5">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="bg-coal-950 border border-pine-800/80 px-2 py-0.5 rounded-sm text-[10px] text-pine-300">
                            {post.category}
                          </span>
                        </div>
                        <h2 className="font-display font-bold text-base text-bone mb-1.5 group-hover:text-pine-400 transition leading-snug">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>
                        <p className="text-xs text-mist leading-relaxed line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-mist/70 font-mono">
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:clock-circle-linear" /> {post.readTime}
                        </span>
                        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 font-semibold text-pine-400 hover:text-pine-300 ml-auto transition">
                          Read Post <Icon icon="solar:arrow-right-linear" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div
              className="p-5 rounded-sm border-2 border-coal-700 bg-coal-900"
              style={{ boxShadow: "4px 4px 0px #000000" }}
            >
              <div className="flex items-center gap-2 mb-4 border-b border-coal-800 pb-2.5">
                <Icon icon="solar:fire-bold-duotone" className="text-pine-400 text-lg" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-bone">
                  Trending Articles
                </h3>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <TrendingSkeleton />
                ) : (
                  trendingPosts.map((tPost) => (
                    <div key={tPost.id} className="flex gap-3 group">
                      <div className="space-y-1">
                        <h4 className="font-display font-medium text-xs text-bone group-hover:text-pine-400 transition leading-snug">
                          <Link href={`/blog/${tPost.slug}`}>
                            {tPost.title}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-mist/50 font-mono">
                          <Icon icon="solar:eye-linear" />
                          <span>{tPost.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className="p-5 rounded-sm border-2 border-coal-700 bg-coal-900 relative overflow-hidden"
              style={{ boxShadow: "4px 4px 0px #000000" }}
            >
              <div className="relative z-10 text-center">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-bone mb-2">
                  Subscribe to Newsletter
                </h3>
                <p className="text-[11px] text-mist mb-4 leading-relaxed font-mono">
                  Get the latest articles sent directly to your inbox every month.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="bg-coal-950 border border-coal-700 text-bone text-xs px-3.5 py-2 rounded-sm w-full focus:outline-none focus:border-pine-500 transition font-mono"
                  />
                  <button className="brutal-btn bg-pine-400 text-coal-950 font-bold text-xs px-4 py-2 rounded-sm hover:bg-pine-300 w-full">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
