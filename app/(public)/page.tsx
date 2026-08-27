"use client";

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
  const displayRole = profile?.role_tagline ?? "Front-End Developer & UI Designer";
  const displayAbout = profile?.about_me ?? "Freelance developer dengan pengalaman 4+ tahun membangun website dan aplikasi untuk klien lokal maupun internasional.";

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
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 font-mono text-xs text-pine-400 mb-5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(13,43,28,0.4)", border: "1px solid rgba(23,92,58,0.4)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pine-400 animate-pulse" />
              {profile?.is_available !== false ? "Available for work" : "Currently unavailable"}
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={0.08}
              className="font-display font-semibold text-[2.5rem] leading-[1.08] sm:text-5xl lg:text-[3.4rem] text-bone mb-5"
            >
              Building products<br className="hidden sm:block" />
              {" "}that feel{" "}
              <span className="text-pine-400">obvious</span> to use.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={0.16}
              className="text-mist text-base sm:text-lg max-w-md mb-8 leading-relaxed"
            >
              Saya {displayName.split(" ")[0]}, {displayRole.toLowerCase()} di Pekanbaru. {displayAbout.slice(0, 100)}...
            </motion.p>

            <motion.div variants={fadeUp} custom={0.24} className="flex flex-wrap items-center gap-3 mb-10">
              <a
                href="#work"
                className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-semibold px-5 py-3 rounded-full hover:bg-pine-300 transition"
              >
                View my work <Icon icon="solar:arrow-right-linear" />
              </a>
              {profile?.resume_url ? (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-bone text-sm font-medium px-5 py-3 rounded-full transition hover:border-pine-500/60"
                  style={{ background: "#0A0D0B", border: "1px solid #212922" }}
                >
                  <Icon icon="solar:download-minimalistic-linear" /> Download CV
                </a>
              ) : (
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-bone text-sm font-medium px-5 py-3 rounded-full transition hover:border-pine-500/60"
                  style={{ background: "#0A0D0B", border: "1px solid #212922" }}
                >
                  <Icon icon="solar:letter-linear" /> Hubungi Saya
                </a>
              )}
            </motion.div>

            <motion.div variants={fadeUp} custom={0.32} className="flex items-center gap-6 text-xs text-mist">
              {[
                { label: "years experience", value: "4+" },
                { label: "projects shipped", value: `${projects.length || "30"}+` },
                { label: "happy clients", value: "18" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-8 bg-coal-600" />}
                  <div>
                    <span className="text-bone font-semibold text-sm block">{stat.value}</span>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Photo card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeLeft}
            className="relative mx-auto w-full max-w-sm"
          >
            <div
              className="aspect-[4/5] rounded-2xl flex items-center justify-center relative overflow-hidden bg-coal-900"
              style={{
                boxShadow: "0 4px 12px -4px rgba(0,0,0,0.5), 0 20px 40px -12px rgba(0,0,0,0.6)",
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #279E60, #0D2B1C)" }}
                >
                  <Icon icon="solar:user-id-bold" className="text-white/10 text-[10rem]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-coal-950/50 via-transparent to-transparent" />
            </div>

            {/* Code card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-8 -left-6 sm:-left-12 rounded-xl p-4 w-64 font-mono text-[11px] leading-relaxed"
              style={{
                background: "#0A0D0B",
                border: "1px solid rgba(39,158,96,0.4)",
                boxShadow: "0 0 0 1px rgba(63,187,125,0.18), 0 18px 40px -16px rgba(39,158,96,0.35)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-pine-400/80" />
              </div>
              <p><span className="text-pine-300">const</span> <span className="text-pine-400">developer</span> = {"{"}</p>
              <p className="pl-3">name: <span className="text-mist">&quot;{displayName}&quot;</span>,</p>
              <p className="pl-3">role: <span className="text-mist">&quot;Frontend Dev&quot;</span>,</p>
              <p className="pl-3">base: <span className="text-mist">&quot;Pekanbaru, ID&quot;</span>,</p>
              <p className="pl-3">status: <span className="text-pine-300">&quot;{profile?.is_available !== false ? "available" : "unavailable"}&quot;</span></p>
              <p>{"}"}</p>
            </motion.div>
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
              <motion.h2 variants={staggerItem} className="font-display font-semibold text-2xl sm:text-3xl text-bone mb-5">
                Sedikit tentang saya
              </motion.h2>
              <motion.p variants={staggerItem} className="text-mist leading-relaxed mb-4">
                {displayAbout}
              </motion.p>
              <motion.div variants={staggerItem} className="flex flex-wrap gap-2.5">
                {(displayRole.split("&").map(s => s.trim())).concat(["Performance"]).map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs text-mist px-3 py-1.5 rounded-full"
                    style={{ background: "#0A0D0B", border: "1px solid #212922" }}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { highlight: false, icon: "solar:gallery-wide-bold-duotone", label: "Projects in portfolio", value: String(projects.length || "—") },
                { highlight: false, icon: "solar:diploma-verified-bold-duotone", label: "Certificates earned", value: String(certificates.length || "—") },
                { highlight: false, icon: "solar:case-round-minimalistic-bold-duotone", label: "Roles held", value: String(experiences.length || "—") },
                { highlight: true, icon: "solar:map-point-bold-duotone", label: "Riau, Indonesia", value: "Pekanbaru" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="rounded-2xl shadow-soft p-5"
                  style={{
                    background: stat.highlight ? "rgba(13,43,28,0.4)" : "#0A0D0B",
                    border: stat.highlight ? "1px solid rgba(23,92,58,0.5)" : "1px solid #171D18",
                  }}
                >
                  <Icon icon={stat.icon} className={`text-2xl mb-2 ${stat.highlight ? "text-pine-300" : "text-pine-400"}`} />
                  <p className="font-display font-semibold text-xl text-bone">{stat.value}</p>
                  <p className="text-xs text-mist">{stat.label}</p>
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
          <motion.h2 variants={staggerItem} className="font-display font-semibold text-2xl sm:text-3xl text-bone mb-12">
            Tools yang saya pakai sehari-hari
          </motion.h2>
          {skillGroups.length === 0 ? (
            <p className="text-mist text-sm">Skills belum ditambahkan.</p>
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
            <motion.h2 variants={staggerItem} className="font-display font-semibold text-2xl sm:text-3xl text-bone mb-12">
              Perjalanan karier singkat
            </motion.h2>
            <div className="relative pl-8 max-w-3xl">
              <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: "#212922" }} />
              {experiences.map((exp) => (
                <motion.div key={exp.id} variants={staggerItem} className="relative mb-10 last:mb-0">
                  <div
                    className="absolute -left-8 top-1 w-3.5 h-3.5 rounded-full"
                    style={{
                      background: exp.is_current ? "#3FBB7D" : "#212922",
                      boxShadow: exp.is_current ? "0 0 0 4px rgba(13,43,28,0.4)" : "0 0 0 4px #050705",
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
            <motion.h2 variants={staggerItem} className="font-display font-semibold text-2xl sm:text-3xl text-bone mb-12">
              Beberapa proyek pilihan
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <motion.a
                  key={proj.id}
                  href={proj.demo_url ?? proj.github_url ?? "#"}
                  target={proj.demo_url || proj.github_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group rounded-2xl overflow-hidden block"
                  style={{ background: "#0A0D0B", border: "1px solid #171D18" }}
                >
                  {/* Cover: show image if available, otherwise gradient */}
                  <div className={`h-44 relative overflow-hidden flex items-center justify-center`}>
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
                        className="absolute top-3 left-3 text-pine-300 text-[10px] font-mono px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(5,7,5,0.8)", border: "1px solid rgba(23,92,58,0.5)" }}
                      >
                        FEATURED
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-bone mb-1 group-hover:text-pine-400 transition">{proj.title}</h3>
                    <p className="text-sm text-mist mb-3 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono text-pine-300 px-2 py-0.5 rounded-full" style={{ background: "rgba(13,43,28,0.5)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </RevealSection>
        </section>
      )}

      {/* ── CERTIFICATES ─────────────────────────────────────────────────── */}
      {certificates.length > 0 && (
        <section id="certificates" className="max-w-6xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <RevealSection>
            <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// certificates</motion.p>
            <motion.h2 variants={staggerItem} className="font-display font-semibold text-2xl sm:text-3xl text-bone mb-12">
              Sertifikat &amp; kredensial
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={staggerItem}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl shadow-soft p-5 flex items-start gap-3.5"
                  style={{ background: "#0A0D0B", border: "1px solid #171D18" }}
                >
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${cert.color} flex items-center justify-center shrink-0`}>
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
            <motion.h2 variants={staggerItem} className="font-display font-semibold text-2xl sm:text-3xl text-bone mb-12">
              Yang bisa saya bantu
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <motion.div
                  key={srv.id}
                  variants={staggerItem}
                  whileHover={{ borderColor: "rgba(31,122,76,0.6)", y: -3 }}
                  className="rounded-2xl p-6 transition-colors"
                  style={{ background: "#0A0D0B", border: "1px solid #171D18" }}
                >
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(13,43,28,0.5)" }}>
                    <Icon icon={srv.icon} className="text-pine-400 text-xl" />
                  </div>
                  <h3 className="font-display font-semibold text-bone mb-1.5">{srv.title}</h3>
                  <p className="text-sm text-mist leading-relaxed mb-4">{srv.description}</p>
                  <p className="font-mono text-xs text-mist">{srv.price}</p>
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
            className="rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: "#0A0D0B", border: "1px solid #171D18" }}
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[30rem] h-[30rem] rounded-full bg-pine-900/20 blur-[100px]" />
            </div>
            <div className="relative z-10">
              <motion.p variants={staggerItem} className="font-mono text-xs font-medium text-pine-400 mb-3">// contact</motion.p>
              <motion.h2 variants={staggerItem} className="font-display font-semibold text-3xl sm:text-4xl text-bone mb-4">
                Mari bekerja sama
              </motion.h2>
              <motion.p variants={staggerItem} className="text-mist max-w-md mx-auto mb-8 leading-relaxed">
                Saya terbuka untuk proyek freelance, full-time, maupun kolaborasi. Ceritakan proyekmu dan kita diskusikan.
              </motion.p>
              <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-3">
                <a
                  href={profile?.email ? `mailto:${profile.email}` : "mailto:hello@example.com"}
                  className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-semibold px-6 py-3 rounded-full hover:bg-pine-300 transition"
                >
                  <Icon icon="solar:letter-linear" /> Kirim Email
                </a>
                {profile?.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-bone text-sm font-medium px-6 py-3 rounded-full transition"
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
                    className="inline-flex items-center gap-2 text-bone text-sm font-medium px-6 py-3 rounded-full transition"
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
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#171D18" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? `${level}%` : 0 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #1F7A4C, #3FBB7D)" }}
        />
      </div>
    </div>
  );
}
