"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Project {
  id: string;
  created_at: string;
  demo_url: string | null;
  description: string;
  github_url: string | null;
  gradient: string;
  image_url: string | null;
  is_featured: boolean;
  status: string;
  tags: string[];
  title: string;
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



// ── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-sm overflow-hidden animate-pulse" style={{ background: "#0A0D0B", border: "1px solid #212922" }}>
    <div className="h-48 bg-coal-900" />
    <div className="p-5 space-y-3">
      <div className="w-2/3 h-4 bg-coal-900 rounded-sm" />
      <div className="w-full h-3 bg-coal-900 rounded-sm" />
      <div className="w-5/6 h-3 bg-coal-900 rounded-sm" />
      <div className="flex gap-1.5 pt-1">
        <div className="w-12 h-4 bg-coal-900 rounded-sm" />
        <div className="w-16 h-4 bg-coal-900 rounded-sm" />
        <div className="w-10 h-4 bg-coal-900 rounded-sm" />
      </div>
    </div>
  </div>
);

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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



  const featured = projects.filter((p) => p.is_featured);
  const total = projects.length;

  return (
    <div className="min-h-screen bg-coal-950 font-sans text-bone pt-24 pb-24 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute -top-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-pine-700/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-900/10 blur-[100px]" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">

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
          <motion.h1 variants={fadeUp} className="font-display font-bold text-2xl sm:text-3xl text-bone tracking-tight mb-3">
            Projects &amp; <span className="text-pine-400">Work</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-mist max-w-lg leading-relaxed text-xs sm:text-sm mb-6 font-mono">
            A collection of projects I've built — from personal side projects to products for real clients.
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
        {/* ── Project Grid ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-coal-700 rounded-sm">
            <Icon icon="solar:folder-open-bold-duotone" className="text-mist text-5xl mx-auto mb-4 opacity-40" />
            <p className="text-mist text-sm">No projects have been published yet.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.map((proj) => (
              <motion.div
                key={proj.id}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                className="group flex flex-col transition-all duration-300"
              >
                {/* Image: bordered, no card border */}
                <div className="relative overflow-hidden aspect-[4/3] w-full border border-coal-700 mb-4 shrink-0">
                  {proj.image_url ? (
                    <Image
                      src={proj.image_url}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${proj.gradient} flex items-center justify-center`}>
                      <Icon icon="solar:widget-4-bold-duotone" className="text-white/40 text-6xl" />
                    </div>
                  )}
                  {proj.is_featured && (
                    <span className="absolute top-3 left-3 text-coal-950 bg-pine-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Text content — no border, no card bg */}
                <h2 className="font-display font-bold text-base text-bone leading-snug mb-1.5 group-hover:text-pine-400 transition-colors duration-200">
                  {proj.title}
                </h2>
                <p className="text-xs text-mist leading-relaxed mb-3 line-clamp-2 flex-1">
                  {proj.description}
                </p>

                {/* Tags */}
                {proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {proj.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-mist px-2.5 py-0.5 rounded-full border border-coal-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-2 pt-3 border-t border-coal-800">
                  {proj.demo_url ? (
                    <a
                      href={proj.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View live demo of ${proj.title}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pine-400 bg-pine-900/30 hover:bg-pine-900/60 border border-pine-800/60 hover:border-pine-600 px-2.5 py-1 transition rounded-sm"
                    >
                      <Icon icon="solar:global-linear" /> Live Demo
                    </a>
                  ) : (
                    <span className="text-[11px] text-coal-600 italic">No live demo</span>
                  )}
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View source code of ${proj.title} on GitHub`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-mist hover:text-bone bg-coal-800/50 hover:bg-coal-700/60 border border-coal-700 hover:border-coal-500 px-2.5 py-1 transition rounded-sm ml-auto"
                    >
                      <Icon icon="mdi:github" className="text-sm" /> GitHub
                    </a>
                  )}
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
            <p className="text-sm text-mist">Interested in working together?</p>
            <Link
              href="/#contact"
              className="brutal-btn inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-xs font-bold px-5 py-2 rounded-sm hover:bg-pine-300"
            >
              <Icon icon="solar:chat-round-dots-bold" /> Contact Me
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}