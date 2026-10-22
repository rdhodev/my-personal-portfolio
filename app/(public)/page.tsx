"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// ─── Animation Variants ───────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: EASE, delay },
    y: 0,
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// ─── Scroll Section Wrapper ───────────────────────────────────────────────────
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px", once: true });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  about_me: string;
  avatar_url: string | null;
  email: string | null;
  full_name: string;
  github_url: string | null;
  hero_headline: string;
  instagram_url: string | null;
  is_available: boolean;
  linkedin_url: string | null;
  resume_url: string | null;
  role_tagline: string;
}

interface Skill { id: string; category: string; level: number; name: string; }
interface Experience { id: string; company: string; description: string; is_current: boolean; period: string; role: string; }
interface Certificate { id: string; color: string; date: string; issuer: string; title: string; }
interface Service { id: string; description: string; icon: string; price: string; title: string; }
interface Project { id: string; demo_url: string | null; description: string; github_url: string | null; gradient: string; image_url?: string | null; is_featured: boolean; status: string; tags: string[]; title: string; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef(null);
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const [profileRes, skillsRes, expRes, certsRes, servicesRes, projectsRes] = await Promise.all([
        supabase.from("profile").select("*").limit(1).single(),
        supabase.from("skills").select("*").order("created_at", { ascending: true }),
        supabase.from("experience").select("*").order("created_at", { ascending: false }),
        supabase.from("certificates").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: true }),
        supabase.from("projects").select("*").eq("status", "PUBLISHED").order("is_featured", { ascending: false }).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (skillsRes.data) setSkills(skillsRes.data as Skill[]);
      if (expRes.data) setExperiences(expRes.data as Experience[]);
      if (certsRes.data) setCertificates(certsRes.data as Certificate[]);
      if (servicesRes.data) setServices(servicesRes.data as Service[]);
      if (projectsRes.data) setProjects(projectsRes.data as Project[]);
    }
    fetchAll();
  }, []);

  const skillGroups = ["Programming", "Mobile", "Web", "AI", "Tools", "Others"].map((cat) => ({
    label: cat,
    skills: skills.filter((s) => s.category === cat),
  })).filter((g) => g.skills.length > 0);

  const displayName = profile?.full_name ?? "Ridho";
  const displayHeroHeadline = profile?.hero_headline ?? "Building products that feel obvious to use.";
  const displayRole = profile?.role_tagline ?? "Front-End Developer & UI Designer";
  const displayAbout = profile?.about_me ?? "Freelance developer with 4+ years of experience building websites and web applications for local and international clients.";

  return (
    <div className="font-sans text-bone bg-coal-950 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] sm:min-h-screen flex items-center">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-40 -right-32 w-[24rem] sm:w-[28rem] h-[24rem] sm:h-[28rem] rounded-full bg-pine-700/20 blur-[80px] sm:blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-[16rem] sm:w-[20rem] h-[16rem] sm:h-[20rem] rounded-full bg-pine-900/20 blur-[70px] sm:blur-[90px]" />

        <div className="max-w-5xl mx-auto px-4 pt-10 sm:pt-14 pb-14 sm:pb-24 w-full flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
          {/* Text */}
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="w-full text-center lg:text-left"
          >
            {/* Brutalist Hello Tag with corner handles */}
            <motion.div variants={fadeUp} className="inline-block mb-4">
              <div className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-coal-900 border-2 border-pine-500 font-mono text-xs text-pine-400 font-semibold shadow-[3px_3px_0px_#1F7A4C]">
                {/* 4 Corner handles (brutalist design selector) */}
                <span className="absolute -top-1 -left-1 w-2 h-2 bg-pine-400 border border-coal-950" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pine-400 border border-coal-950" />
                <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-pine-400 border border-coal-950" />
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-pine-400 border border-coal-950" />
                <span>Hi everyone 👋, I'm {displayName}</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={0.08}
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-bone mb-3.5 tracking-tight leading-snug"
            >
              Building products<br className="hidden sm:block" />
              {" "}that feel{" "}
              <span className="text-pine-400 underline decoration-pine-500 decoration-2">obvious</span> to use.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={0.16}
              className="text-mist text-xs sm:text-sm max-w-md mx-auto lg:mx-0 mb-6 sm:mb-7 leading-relaxed font-mono"
            >
              I'm {displayName.split(" ")[0]}, {displayRole.toLowerCase()} at Pekanbaru. {displayHeroHeadline}
            </motion.p>

            <motion.div variants={fadeUp} custom={0.24} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10">
              <a
                href="#work"
                className="brutal-btn inline-flex items-center justify-center gap-2 bg-pine-400 text-coal-950 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-sm hover:bg-pine-300"
              >
                View my work <Icon icon="solar:arrow-right-linear" />
              </a>
              <a
                href="/api/download-cv"
                download="CV_Ridho_Hidayat.pdf"
                className="brutal-btn inline-flex items-center justify-center gap-2 bg-coal-900 text-bone text-xs sm:text-sm font-bold px-5 py-2.5 rounded-sm hover:bg-coal-800 border-2 border-coal-600 cursor-pointer"
              >
                <Icon icon="solar:download-minimalistic-bold" /> Download CV
              </a>
            </motion.div>

            <motion.div variants={fadeUp} custom={0.32} className="flex items-center justify-center lg:justify-start gap-3 text-xs font-mono">
              {[
                {
                  href: profile?.github_url || "https://github.com",
                  icon: "mdi:github",
                  label: "GitHub",
                },
                {
                  href: profile?.linkedin_url || "https://linkedin.com",
                  icon: "mdi:linkedin",
                  label: "LinkedIn",
                },
                {
                  href: profile?.instagram_url || "https://instagram.com",
                  icon: "mdi:instagram",
                  label: "Instagram",
                },
              ]
                .filter((social) => Boolean(social.href))
                .map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-coal-900 border border-coal-700 rounded-sm text-mist hover:text-pine-300 hover:border-pine-500/60 hover:bg-coal-800 transition-all text-xs"
                    title={social.label}
                  >
                    <Icon icon={social.icon} className="text-base text-pine-400 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline font-sans">{social.label}</span>
                  </a>
                ))}
            </motion.div>
          </motion.div>

          {/* Brutalist Profile Photo Container with Geometric Backdrops */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeLeft}
            className="relative mx-auto w-[220px] sm:w-[260px] lg:w-[310px] aspect-[4/5] flex items-center justify-center select-none"
          >
            {/* Brutalist offset background boxes */}
            <div className="absolute inset-0 bg-pine-500 translate-x-2 sm:translate-x-2.5 translate-y-2 sm:translate-y-2.5 rounded-sm border-2 border-coal-950" />
            <div className="absolute inset-0 bg-coal-900 rounded-sm border-2 border-pine-400/80 shadow-[4px_4px_0px_#000000] sm:shadow-[5px_5px_0px_#000000] overflow-hidden">
              {/* Corner accent marks */}


              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover object-top filter grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-coal-900"
                >
                  <Icon icon="solar:user-id-bold" className="text-pine-400/30 text-7xl sm:text-8xl" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="max-w-5xl mx-auto px-4  py-14 sm:py-20 md:py-28">
        <RevealSection>
          <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">
            // about
          </motion.p>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-3 tracking-tight">
                A little about me
              </motion.h2>
              <motion.p variants={staggerItem} className="text-mist leading-relaxed mb-4 text-xs sm:text-sm">
                {displayAbout}
              </motion.p>
              <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
                {[
                  ...displayRole.split("&").map(s => s.trim()),
                  ...skills.slice(0, 5).map(s => s.name),
                ]
                  .filter((tag, idx, arr) => tag && arr.indexOf(tag) === idx)
                  .slice(0, 8)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-mist px-3 py-1.5 rounded-sm"
                      style={{ background: "#0A0D0B", border: "1px solid #212922" }}
                    >
                      {tag}
                    </span>
                  ))}
              </motion.div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { highlight: false, icon: "solar:gallery-wide-bold-duotone", label: "Projects", value: String(projects.length || "—") },
                { highlight: false, icon: "solar:diploma-verified-bold-duotone", label: "Certificates", value: String(certificates.length || "—") },
                { highlight: false, icon: "solar:case-round-minimalistic-bold-duotone", label: "Experience", value: String(experiences.length || "—") },
                { highlight: true, icon: "solar:map-point-bold-duotone", label: "Location", value: "Pekanbaru" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="rounded-sm p-4 border-2 transition-transform hover:-translate-y-1"
                  style={{
                    background: stat.highlight ? "#0D2B1C" : "#0A0D0B",
                    borderColor: stat.highlight ? "#3FBB7D" : "#212922",
                    boxShadow: stat.highlight ? "4px 4px 0px #1F7A4C" : "4px 4px 0px #000000",
                  }}
                >
                  <Icon icon={stat.icon} className={`text-2xl mb-1 ${stat.highlight ? "text-pine-300" : "text-pine-400"}`} />
                  <p className="font-bold font-mono text-xl text-bone">{stat.value}</p>
                  <p className="text-[11px] font-mono text-mist">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────────────────── */}
      <section id="skills" className="max-w-5xl mx-auto px-4 py-20 md:py-28">
        <RevealSection>
          <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// skills</motion.p>
          <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
            Tools I use on a daily basis
          </motion.h2>
          {skillGroups.length === 0 ? (
            <p className="text-mist text-sm">No skills added yet.</p>
          ) : (
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {skillGroups.map((group) => (
                <motion.div key={group.label} variants={staggerItem}>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-mist mb-5">{group.label}</p>
                  <div className="space-y-5">
                    {group.skills.map((skill) => (
                      <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </RevealSection>
      </section>

      {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
      {experiences.length > 0 && (
        <section id="experience" className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// experience</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
              Work experience
            </motion.h2>
            <div className="relative pl-8 max-w-3xl">
              {/* Timeline vertical line: centered exactly at left-3 (12px), dot center at 12px */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-coal-700" />
              {experiences.map((exp) => (
                <motion.div key={exp.id} variants={staggerItem} className="relative mb-10 last:mb-0">
                  {/* Timeline dot: 10x10px, centered on the line (left: 7px = 12px - 5px) */}
                  <div
                    className="absolute left-[-25px] top-2.5 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: exp.is_current ? "#3FBB7D" : "#333F35",
                      boxShadow: exp.is_current
                        ? "0 0 0 4px #050705, 0 0 0 5px #1F7A4C"
                        : "0 0 0 4px #050705, 0 0 0 5px #212922",
                    }}
                  />
                  <span className="font-mono text-xs text-mist">{exp.period}</span>
                  <h3 className="font-display font-semibold text-lg text-bone mt-1">{exp.role}</h3>
                  <p className="text-sm text-pine-400/90 font-medium mb-2">{exp.company}</p>
                  <p className="text-sm text-mist leading-relaxed">{exp.description}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </section>
      )}

      {/* ── WORK / PROJECTS ──────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="work" className="max-w-5xl mx-auto px-4  py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// recent work</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
              Selected projects
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, 6).map((proj) => (
                <motion.a
                  key={proj.id}
                  href={proj.demo_url ?? proj.github_url ?? "#"}
                  target={proj.demo_url || proj.github_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  variants={staggerItem}
                  whileHover={{ y: -3 }}
                  className="group block transition-all duration-300"
                >
                  {/* Image: bordered and rounded, no card border */}
                  <div className="relative overflow-hidden aspect-[4/3] w-full border border-coal-700 mb-4">
                    {proj.image_url ? (
                      <img
                        src={proj.image_url}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  <h3 className="font-display font-bold text-base text-bone leading-snug mb-1.5 group-hover:text-pine-400 transition-colors duration-200">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-mist leading-relaxed mb-3 line-clamp-2">
                    {proj.description}
                  </p>
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
                      <button
                        onClick={(e) => { e.preventDefault(); window.open(proj.demo_url!, "_blank"); }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pine-400 bg-pine-900/30 hover:bg-pine-900/60 border border-pine-800/60 hover:border-pine-600 px-2.5 py-1 transition cursor-pointer rounded-sm"
                      >
                        <Icon icon="solar:global-linear" /> Live Demo
                      </button>
                    ) : (
                      <span className="text-[11px] text-coal-600 italic">No live demo</span>
                    )}
                    {proj.github_url && (
                      <button
                        onClick={(e) => { e.preventDefault(); window.open(proj.github_url!, "_blank"); }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-mist hover:text-bone bg-coal-800/50 hover:bg-coal-700/60 border border-coal-700 hover:border-coal-500 px-2.5 py-1 transition cursor-pointer rounded-sm ml-auto"
                      >
                        <Icon icon="mdi:github" className="text-sm" /> GitHub
                      </button>
                    )}
                  </div>
                </motion.a>
              ))}
            </motion.div>

            {projects.length > 6 && (
              <motion.div variants={staggerItem} className="flex justify-center mt-12">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 border border-coal-700 hover:border-pine-500/60 bg-coal-900 text-bone hover:text-pine-400 text-sm font-semibold px-6 py-2.5 rounded-sm transition duration-300"
                >
                  View All Projects <Icon icon="solar:arrow-right-linear" />
                </Link>
              </motion.div>
            )}
          </RevealSection>
        </section>
      )}

      {/* ── CERTIFICATES ─────────────────────────────────────────────────── */}
      {certificates.length > 0 && (
        <section id="certificates" className="max-w-5xl mx-auto px-4 py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// certificates</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
              Certificates &amp; credentials
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={staggerItem}
                  whileHover={{ y: -3 }}
                  className="rounded-sm p-5 flex items-start gap-3.5"
                  style={{ background: "#0A0D0B", border: "1px solid #212922" }}
                >
                  <div className={`w-10 h-10 rounded-sm bg-gradient-to-br ${cert.color} flex items-center justify-center shrink-0`}>
                    <Icon icon="solar:diploma-verified-bold-duotone" className="text-white/90 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-bone text-sm">{cert.title}</h3>
                    <p className="text-xs text-mist mt-0.5">{cert.issuer} · {cert.date}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>
        </section>
      )}

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      {services.length > 0 && (
        <section id="services" className="max-w-5xl mx-auto px-4 py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// services</motion.p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone tracking-tight">
                How I can help you
              </motion.h2>
              <motion.p variants={staggerItem} className="text-xs text-mist font-mono">
                Available for freelance &amp; contracts
              </motion.p>
            </div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv, idx) => (
                <motion.div
                  key={srv.id}
                  variants={staggerItem}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="group relative rounded-sm p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 border border-coal-700/80 hover:border-pine-500/70"
                  style={{
                    background: "linear-gradient(180deg, #0e120f 0%, #080a09 100%)",
                    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {/* Subtle top gradient glow on hover */}
                  <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-24 bg-pine-500/10 blur-2xl group-hover:bg-pine-500/20 transition-all duration-500" />

                  {/* Corner indicator */}
                  <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-pine-500/40 group-hover:border-pine-400 transition-colors" />
                  </div>

                  <div>
                    {/* Header: Icon & Index number */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-sm flex items-center justify-center bg-coal-900/90 border border-coal-700/80 text-pine-400 group-hover:border-pine-500/60 group-hover:bg-pine-950/40 group-hover:text-pine-300 group-hover:shadow-[0_0_15px_rgba(63,187,125,0.15)] transition-all duration-300">
                        <Icon icon={srv.icon || "solar:widget-bold-duotone"} className="text-2xl transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-coal-500 group-hover:text-pine-500/60 transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-display font-bold text-base sm:text-lg text-bone mb-2 group-hover:text-pine-400 transition-colors duration-200">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-mist leading-relaxed mb-6 font-sans">
                      {srv.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>
        </section>
      )}

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="max-w-5xl mx-auto px-4 py-14 sm:py-20 md:py-28">
        <RevealSection>
          <motion.div
            variants={staggerItem}
            className="rounded-sm p-6 sm:p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: "#0A0D0B", border: "1px solid #212922" }}
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[20rem] sm:w-[30rem] h-[20rem] sm:h-[30rem] rounded-full bg-pine-900/20 blur-[80px] sm:blur-[100px]" />
            </div>
            <div className="relative z-10">
              <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-2 sm:mb-3">// contact</motion.p>
              <motion.h2 variants={staggerItem} className="font-bold text-xl sm:text-2xl md:text-3xl text-bone mb-3 font-display tracking-tight">
                Let's work together
              </motion.h2>
              <motion.p variants={staggerItem} className="text-mist max-w-md mx-auto mb-6 leading-relaxed text-xs sm:text-sm">
                I'm open to freelance projects, full-time opportunities, or collaboration. Tell me about your project and let's discuss.
              </motion.p>
              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
                <a
                  href={profile?.email ? `mailto:${profile.email}` : "mailto:hello@example.com"}
                  className="brutal-btn inline-flex items-center justify-center gap-2 bg-pine-400 text-coal-950 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-sm hover:bg-pine-300"
                >
                  <Icon icon="solar:letter-linear" /> Send Email
                </a>
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-btn inline-flex items-center justify-center gap-2 text-bone text-xs sm:text-sm font-bold px-6 py-2.5 rounded-sm hover:border-pine-500/60 bg-coal-900 border-2 border-coal-700"
                  >
                    <Icon icon="mdi:linkedin" /> LinkedIn
                  </a>
                )}
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-btn inline-flex items-center justify-center gap-2 text-bone text-xs sm:text-sm font-bold px-6 py-2.5 rounded-sm hover:border-pine-500/60 bg-coal-900 border-2 border-coal-700"
                  >
                    <Icon icon="mdi:github" /> GitHub
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        </RevealSection>
      </section>

    </div>
  );
}

// ─── Skill Bar with animated fill ─────────────────────────────────────────────
function SkillBar({ name, level }: { level: number; name: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref}>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-bone font-medium">{name}</span>
        <span className="text-mist font-mono text-xs">{level}%</span>
      </div>
      <div className="h-1.5 overflow-hidden" style={{ background: "#171D18" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? `${level}%` : 0 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
          style={{ background: "linear-gradient(90deg, #1F7A4C, #3FBB7D)" }}
        />
      </div>
    </div>
  );
}
