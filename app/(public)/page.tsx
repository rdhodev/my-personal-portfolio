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

  const skillGroups = ["Mobile", "Web", "AI", "Tools", "Others"].map((cat) => ({
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
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-pine-700/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-[20rem] h-[20rem] rounded-full bg-pine-900/20 blur-[90px]" />

        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Text */}
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate="visible"
            variants={stagger}
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
              className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-bone mb-4 tracking-tight leading-snug"
            >
              Building products<br className="hidden sm:block" />
              {" "}that feel{" "}
              <span className="text-pine-400 underline decoration-pine-500 decoration-wavy decoration-2">obvious</span> to use.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={0.16}
              className="text-mist text-xs sm:text-sm max-w-md mb-7 leading-relaxed font-mono"
            >
              I'm {displayName.split(" ")[0]}, {displayRole.toLowerCase()} at Pekanbaru. {displayHeroHeadline}
            </motion.p>

            <motion.div variants={fadeUp} custom={0.24} className="flex flex-wrap items-center gap-4 mb-10">
              <a
                href="#work"
                className="brutal-btn inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-6 py-2.5 rounded-sm hover:bg-pine-300"
              >
                View my work <Icon icon="solar:arrow-right-linear" />
              </a>
              {profile?.resume_url ? (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-btn inline-flex items-center gap-2 bg-coal-900 text-bone text-sm font-bold px-6 py-2.5 rounded-sm hover:bg-coal-800 border-2 border-coal-600"
                >
                  <Icon icon="solar:download-minimalistic-linear" /> Download CV
                </a>
              ) : (
                <a
                  href="#contact"
                  className="brutal-btn inline-flex items-center gap-2 bg-coal-900 text-bone text-sm font-bold px-6 py-2.5 rounded-sm hover:bg-coal-800 border-2 border-coal-600"
                >
                  <Icon icon="solar:letter-linear" /> Contact Me
                </a>
              )}
            </motion.div>

            <motion.div variants={fadeUp} custom={0.32} className="flex items-center gap-6 text-xs text-mist font-mono">
              {[
                { label: "years exp", value: "4+" },
                { label: "projects", value: `${projects.length || "30"}+` },
                { label: "happy clients", value: "18" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <div className="w-0.5 h-7 bg-coal-700" />}
                  <div>
                    <span className="text-pine-400 font-bold text-base block">{stat.value}</span>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Brutalist Profile Photo Container with Geometric Backdrops */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeLeft}
            className="relative mx-auto w-full max-w-[260px] sm:max-w-[290px] lg:max-w-[310px] aspect-[4/5] flex items-center justify-center select-none"
          >
            {/* Brutalist offset background boxes */}
            <div className="absolute inset-0 bg-pine-500 translate-x-2.5 translate-y-2.5 rounded-sm border-2 border-coal-950" />
            <div className="absolute inset-0 bg-coal-900 rounded-sm border-2 border-pine-400/80 shadow-[5px_5px_0px_#000000] overflow-hidden">
              {/* Corner accent marks */}
              <div className="absolute top-2 left-2 z-30 font-mono text-[10px] text-pine-400 font-bold px-1.5 py-0.5 bg-coal-950/80 border border-pine-500/40">
                [DEV::PROFILE]
              </div>

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
                  <Icon icon="solar:user-id-bold" className="text-pine-400/30 text-8xl" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
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
                {(displayRole.split("&").map(s => s.trim())).concat(["Performance"]).map((tag) => (
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
      <section id="skills" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
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
        <section id="experience" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// experience</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
              Work experience
            </motion.h2>
            <div className="relative pl-8 max-w-3xl">
              <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: "#212922" }} />
              {experiences.map((exp) => (
                <motion.div key={exp.id} variants={staggerItem} className="relative mb-10 last:mb-0">
                  <div
                    className="absolute -left-8 top-1 w-3 h-3 rounded-sm"
                    style={{
                      background: exp.is_current ? "#3FBB7D" : "#212922",
                      boxShadow: exp.is_current ? "0 0 0 3px rgba(13,43,28,0.5)" : "0 0 0 3px #050705",
                    }}
                  />
                  <span className="font-mono text-xs text-mist">{exp.period}</span>
                  <h3 className="font-display font-semibold text-lg text-bone mt-1">{exp.role}</h3>
                  <p className="text-sm text-mist mb-2">{exp.company}</p>
                  <p className="text-sm text-mist leading-relaxed">{exp.description}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </section>
      )}

      {/* ── WORK / PROJECTS ──────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="work" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// recent work</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
              Selected projects
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((proj) => (
                <motion.a
                  key={proj.id}
                  href={proj.demo_url ?? proj.github_url ?? "#"}
                  target={proj.demo_url || proj.github_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  variants={staggerItem}
                  whileHover={{ y: -3, x: -3 }}
                  className="group rounded-sm overflow-hidden block border-2 border-coal-700 bg-coal-900 transition-all hover:border-pine-400 hover:shadow-[5px_5px_0px_#1F7A4C]"
                  style={{ boxShadow: "4px 4px 0px #000000" }}
                >
                  {/* Cover: show image if available, otherwise gradient */}
                  <div className={`h-44 relative overflow-hidden flex items-center justify-center border-b-2 border-coal-700`}>
                    {proj.image_url ? (
                      <img
                        src={proj.image_url}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${proj.gradient} flex items-center justify-center`}>
                        <Icon icon="solar:widget-4-bold-duotone" className="text-white/50 text-5xl" />
                      </div>
                    )}
                    {proj.is_featured && (
                      <span
                        className="absolute top-2 left-2 text-coal-950 bg-pine-400 text-[10px] font-mono font-bold px-2 py-0.5 border border-coal-950 shadow-[2px_2px_0px_#000000]"
                      >
                        FEATURED
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-bone mb-1 group-hover:text-pine-400 transition">{proj.title}</h3>
                    <p className="text-xs text-mist mb-3 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono text-pine-300 px-2 py-0.5 bg-coal-950 border border-pine-800">
                          {tag}
                        </span>
                      ))}
                    </div>
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
        <section id="certificates" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
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
        <section id="services" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// services</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-bold text-xl sm:text-2xl text-bone mb-8 tracking-tight">
              How I can help you
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <motion.div
                  key={srv.id}
                  variants={staggerItem}
                  whileHover={{ y: -3, x: -3 }}
                  className="rounded-sm p-6 bg-coal-900 border-2 border-coal-700 transition-all hover:border-pine-400 hover:shadow-[5px_5px_0px_#1F7A4C]"
                  style={{ boxShadow: "4px 4px 0px #000000" }}
                >
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-coal-950 border-2 border-pine-500 shadow-[2px_2px_0px_#1F7A4C]">
                    <Icon icon={srv.icon} className="text-pine-400 text-xl" />
                  </div>
                  <h3 className="font-bold text-bone mb-1.5 font-display">{srv.title}</h3>
                  <p className="text-xs text-mist leading-relaxed mb-4">{srv.description}</p>
                  <p className="font-mono text-xs text-pine-400 font-semibold">{srv.price}</p>
                </motion.div>
              ))}
            </motion.div>
          </RevealSection>
        </section>
      )}

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <RevealSection>
          <motion.div
            variants={staggerItem}
            className="rounded-sm p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: "#0A0D0B", border: "1px solid #212922" }}
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[30rem] h-[30rem] rounded-full bg-pine-900/20 blur-[100px]" />
            </div>
            <div className="relative z-10">
              <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// contact</motion.p>
              <motion.h2 variants={staggerItem} className="font-bold text-2xl sm:text-3xl text-bone mb-3 font-display tracking-tight">
                Let's work together
              </motion.h2>
              <motion.p variants={staggerItem} className="text-mist max-w-md mx-auto mb-6 leading-relaxed text-xs sm:text-sm">
                I'm open to freelance projects, full-time opportunities, or collaboration. Tell me about your project and let's discuss.
              </motion.p>
              <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-3">
                <a
                  href={profile?.email ? `mailto:${profile.email}` : "mailto:hello@example.com"}
                  className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-semibold px-6 py-2.5 rounded hover:bg-pine-300 transition"
                >
                  <Icon icon="solar:letter-linear" /> Send Email
                </a>
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-bone text-sm font-medium px-6 py-2.5 rounded transition hover:border-pine-500/60"
                    style={{ background: "#050705", border: "1px solid #212922" }}
                  >
                    <Icon icon="mdi:linkedin" /> LinkedIn
                  </a>
                )}
                {profile?.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-bone text-sm font-medium px-6 py-2.5 rounded transition hover:border-pine-500/60"
                    style={{ background: "#050705", border: "1px solid #212922" }}
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
