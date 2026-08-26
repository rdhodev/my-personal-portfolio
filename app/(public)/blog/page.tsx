"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  gradient: string;
  views?: number;
  slug: string;
}

interface TrendingPost {
  id: string;
  title: string;
  category: string;
  views: number;
  slug: string;
}

const CATEGORIES = ["All", "Development", "Design", "Productivity", "Trends"];

const ArticleSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-6 p-5 sm:p-6 rounded-2xl border border-coal-800 bg-coal-950/40 animate-pulse">
    <div className="md:w-48 h-32 shrink-0 rounded-xl bg-coal-900" />
    <div className="flex flex-col justify-between grow space-y-4">
      <div>
        <div className="w-24 h-3 bg-coal-900 rounded-full mb-3" />
        <div className="w-full h-5 bg-coal-900 rounded-full mb-2" />
        <div className="w-2/3 h-5 bg-coal-900 rounded-full mb-4" />
        <div className="w-full h-3 bg-coal-900 rounded-full mb-1.5" />
        <div className="w-5/6 h-3 bg-coal-900 rounded-full" />
      </div>
      <div className="w-20 h-3 bg-coal-900 rounded-full" />
    </div>
  </div>
);

const TrendingSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4">
        <div className="space-y-2 grow">
          <div className="w-full h-4 bg-coal-900 rounded-full" />
          <div className="w-2/3 h-4 bg-coal-900 rounded-full" />
          <div className="w-12 h-3 bg-coal-900 rounded-full" />
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

      <div className="max-w-6xl mx-auto px-5 md:px-8 relative z-10">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-mist hover:text-pine-400 font-mono transition mb-6">
            <Icon icon="solar:arrow-left-linear" /> Back to Home
          </Link>
          <h1 className="font-display font-semibold text-3xl sm:text-5xl text-bone tracking-tight mb-4">
            Catatan & <span className="text-pine-400">Artikel</span>
          </h1>
          <p className="text-mist max-w-lg leading-relaxed text-sm sm:text-base">
            Berbagi tentang web development, tips produktivitas, best practices coding, dan eksplorasi desain UI/UX.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-coal-700">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                    ? "bg-pine-400 text-coal-950"
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
                <div className="text-center py-16 border border-dashed border-coal-700 rounded-2xl">
                  <Icon icon="solar:sad-ellipse-bold-duotone" className="text-mist text-4xl mx-auto mb-3" />
                  <p className="text-mist text-sm">Tidak ada artikel di kategori ini.</p>
                </div>
              ) : (
                filteredPosts.map((post, idx) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                    className="group flex flex-col md:flex-row gap-6 p-5 sm:p-6 rounded-2xl transition hover:border-pine-500/30"
                    style={{
                      background: "#0A0D0B",
                      border: "1px solid #171D18",
                    }}
                  >
                    <div className={`md:w-48 h-32 shrink-0 rounded-xl bg-gradient-to-br ${post.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <Icon icon="solar:document-text-bold-duotone" className="text-white/30 text-4xl" />
                    </div>

                    <div className="flex flex-col justify-between grow">
                      <div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-pine-400 mb-2">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="bg-pine-950/60 border border-pine-800/40 px-2 py-0.5 rounded-full text-[10px]">
                            {post.category}
                          </span>
                        </div>
                        <h2 className="font-display font-semibold text-lg sm:text-xl text-bone mb-2 group-hover:text-pine-400 transition leading-snug">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>
                        <p className="text-sm text-mist leading-relaxed line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-mist/70">
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

          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "#0A0D0B",
                border: "1px solid #171D18",
              }}
            >
              <div className="flex items-center gap-2 mb-6 border-b border-coal-800 pb-3">
                <Icon icon="solar:fire-bold-duotone" className="text-pine-400 text-xl" />
                <h3 className="font-display font-semibold text-sm text-bone">
                  Trending Artikel
                </h3>
              </div>

              <div className="space-y-5">
                {isLoading ? (
                  <TrendingSkeleton />
                ) : (
                  trendingPosts.map((tPost) => (
                    <div key={tPost.id} className="flex gap-4 group">
                      <div className="space-y-1">
                        <h4 className="font-display font-medium text-xs sm:text-sm text-bone group-hover:text-pine-400 transition leading-snug mt-1">
                          <Link href={`/blog/${tPost.slug}`}>
                            {tPost.title}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-mist/50">
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
              className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: "#0A0D0B",
                border: "1px solid #171D18",
              }}
            >
              <div className="relative z-10 text-center">
                <h3 className="font-display font-semibold text-sm text-bone mb-2">
                  Langganan Newsletter
                </h3>
                <p className="text-[11px] text-mist mb-5 leading-relaxed">
                  Dapatkan update artikel terbaru tentang Web Development langsung ke inbox email Anda setiap bulannya.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Alamat email Anda"
                    className="bg-coal-950 border border-coal-700 text-bone text-xs px-4 py-2.5 rounded-full w-full focus:outline-none focus:border-pine-500 transition"
                  />
                  <button className="bg-pine-400 text-coal-950 font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-pine-300 transition w-full">
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
