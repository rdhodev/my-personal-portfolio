"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  status: string;
  is_featured: boolean;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  created_at: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const ALL_TAGS = "All";

// ── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "#0A0D0B", border: "1px solid #171D18" }}>
    <div className="h-48 bg-coal-900" />
    <div className="p-5 space-y-3">
      <div className="w-2/3 h-4 bg-coal-900 rounded-full" />
      <div className="w-full h-3 bg-coal-900 rounded-full" />
      <div className="w-5/6 h-3 bg-coal-900 rounded-full" />
      <div className="flex gap-1.5 pt-1">
        <div className="w-12 h-4 bg-coal-900 rounded-full" />
        <div className="w-16 h-4 bg-coal-900 rounded-full" />
        <div className="w-10 h-4 bg-coal-900 rounded-full" />
      </div>
    </div>
  </div>
);

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(ALL_TAGS);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "PUBLISHED")
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });

        if (!error && data) setProjects(data as Project[]);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Collect unique tags from all projects
  const allTags = [ALL_TAGS, ...Array.from(new Set(projects.flatMap((p) => p.tags)))];

  const filtered = activeTag === ALL_TAGS
    ? projects
    : projects.filter((p) => p.tags.includes(activeTag));

  const featured = projects.filter((p) => p.is_featured);
  const total = projects.length;

  return (
    <div className="min-h-screen bg-coal-950 font-sans text-bone pt-24 pb-24 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-pine-700/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-900/10 blur-[100px]" />

      <div className="max-w-6xl mx-auto px-5 md:px-8 relative z-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-14"
        >
          <motion.div variants={fadeUp}>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-mist hover:text-pine-400 font-mono transition mb-6">
              <Icon icon="solar:arrow-left-linear" /> Back to Home
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="font-mono text-xs font-medium text-pine-400 mb-3">
            // my work
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-display font-semibold text-3xl sm:text-5xl text-bone tracking-tight mb-4">
            Projects &amp; <span className="text-pine-400">Work</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-mist max-w-lg leading-relaxed text-sm sm:text-base mb-8">
            Kumpulan proyek yang pernah saya bangun — dari side project pribadi hingga produk untuk klien nyata.
          </motion.p>

          {/* Stats */}
          {!isLoading && total > 0 && (
            <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2 text-sm text-mist">
                <Icon icon="solar:widget-4-bold-duotone" className="text-pine-400 text-lg" />
                <span><strong className="text-bone">{total}</strong> total projects</span>
              </div>
              {featured.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-mist">
                  <Icon icon="solar:star-bold-duotone" className="text-yellow-400 text-lg" />
                  <span><strong className="text-bone">{featured.length}</strong> featured</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* ── Tag Filter ──────────────────────────────────────────────────── */}
        {!isLoading && allTags.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-coal-800"
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTag === tag
                    ? "bg-pine-400 text-coal-950"
                    : "bg-coal-900 border border-coal-700 text-mist hover:text-bone hover:border-coal-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Project Grid ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-coal-700 rounded-2xl">
            <Icon icon="solar:folder-open-bold-duotone" className="text-mist text-5xl mx-auto mb-4 opacity-40" />
            <p className="text-mist text-sm">Tidak ada project untuk tag ini.</p>
            <button
              onClick={() => setActiveTag(ALL_TAGS)}
              className="mt-3 text-pine-400 hover:text-pine-300 text-sm transition"
            >
              Lihat semua →
            </button>
          </div>
        ) : (
          <motion.div
            key={activeTag}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((proj) => (
              <motion.div
                key={proj.id}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group rounded-2xl overflow-hidden flex flex-col"
                style={{ background: "#0A0D0B", border: "1px solid #171D18" }}
              >
                {/* Cover Image / Gradient */}
                <div className="relative overflow-hidden h-48 shrink-0">
                  {proj.image_url ? (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${proj.gradient} flex items-center justify-center`}>
                      <Icon icon="solar:widget-4-bold-duotone" className="text-white/30 text-5xl" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-coal-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-pine-400 text-coal-950 text-xs font-bold rounded-xl hover:bg-pine-300 transition"
                      >
                        <Icon icon="solar:global-linear" /> Live Demo
                      </a>
                    )}
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-coal-800 border border-coal-700 text-bone text-xs font-bold rounded-xl hover:bg-coal-700 transition"
                      >
                        <Icon icon="mdi:github" /> GitHub
                      </a>
                    )}
                  </div>

                  {/* Featured badge */}
                  {proj.is_featured && (
                    <span
                      className="absolute top-3 left-3 text-yellow-300 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ background: "rgba(5,7,5,0.85)", border: "1px solid rgba(161,130,49,0.4)" }}
                    >
                      <Icon icon="solar:star-bold" className="text-yellow-400" /> FEATURED
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-display font-semibold text-bone mb-1.5 group-hover:text-pine-400 transition leading-snug">
                    {proj.title}
                  </h2>
                  <p className="text-sm text-mist leading-relaxed mb-4 flex-1 line-clamp-3">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-pine-300 px-2 py-0.5 rounded-full cursor-pointer hover:bg-pine-900/60 transition"
                        style={{ background: "rgba(13,43,28,0.5)" }}
                        onClick={() => setActiveTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-3 border-t border-coal-800">
                    {proj.demo_url ? (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-pine-400 hover:text-pine-300 transition"
                      >
                        <Icon icon="solar:global-linear" /> Live Demo
                      </a>
                    ) : (
                      <span className="text-xs text-coal-600 italic">No live demo</span>
                    )}
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-mist hover:text-bone transition ml-auto"
                      >
                        <Icon icon="mdi:github" className="text-base" /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Back to Home CTA ─────────────────────────────────────────────── */}
        {!isLoading && total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-10 border-t border-coal-800 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-sm text-mist">Tertarik untuk berkolaborasi?</p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-6 py-2.5 rounded-full hover:bg-pine-300 transition"
            >
              <Icon icon="solar:chat-round-dots-bold" /> Hubungi Saya
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}