"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface RecentProject {
  id: string;
  title: string;
  tags: string[];
  created_at: string;
  status: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stats, setStats] = useState([
    { title: "Projects", value: "—", detail: "", icon: "solar:gallery-wide-bold-duotone" },
    { title: "Skills", value: "—", detail: "", icon: "solar:widget-2-bold-duotone" },
    { title: "Certificates", value: "—", detail: "", icon: "solar:diploma-verified-bold-duotone" },
    { title: "Experience", value: "—", detail: "", icon: "solar:case-round-minimalistic-bold-duotone" },
    { title: "Services", value: "—", detail: "", icon: "solar:box-bold-duotone" },
    { title: "Blog Posts", value: "—", detail: "", icon: "solar:notebook-bold-duotone" },
  ]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      const [projects, skills, certs, experience, services, posts] = await Promise.all([
        supabase.from("projects").select("id, title, tags, created_at, status").order("created_at", { ascending: false }),
        supabase.from("skills").select("id", { count: "exact" }),
        supabase.from("certificates").select("id", { count: "exact" }),
        supabase.from("experience").select("id", { count: "exact" }),
        supabase.from("services").select("id", { count: "exact" }),
        supabase.from("posts").select("id", { count: "exact" }),
      ]);

      const projectCount = projects.data?.length ?? 0;
      const publishedCount = projects.data?.filter((p) => p.status === "PUBLISHED").length ?? 0;
      const draftCount = projectCount - publishedCount;

      setStats([
        { title: "Projects", value: String(projectCount), detail: `${publishedCount} published`, icon: "solar:gallery-wide-bold-duotone" },
        { title: "Skills", value: String(skills.count ?? skills.data?.length ?? 0), detail: "across categories", icon: "solar:widget-2-bold-duotone" },
        { title: "Certificates", value: String(certs.count ?? certs.data?.length ?? 0), detail: "total credentials", icon: "solar:diploma-verified-bold-duotone" },
        { title: "Experience", value: String(experience.count ?? experience.data?.length ?? 0), detail: "positions listed", icon: "solar:case-round-minimalistic-bold-duotone" },
        { title: "Services", value: String(services.count ?? services.data?.length ?? 0), detail: "services offered", icon: "solar:box-bold-duotone" },
        { title: "Blog Posts", value: String(posts.count ?? posts.data?.length ?? 0), detail: "articles written", icon: "solar:notebook-bold-duotone" },
      ]);

      setRecentProjects((projects.data ?? []).slice(0, 5) as RecentProject[]);
      setIsLoading(false);
    }
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6 text-bone">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-bone">Good day, Ridho 👋</h1>
          <p className="text-sm text-mist mt-0.5">Begini kondisi terkini website portfolio kamu.</p>
        </div>
        <button
          onClick={() => router.push("/admin/projects")}
          className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit"
        >
          <Icon icon="solar:add-circle-bold" /> Add Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-mist">{stat.title}</span>
              <div className="w-8 h-8 rounded-lg bg-coal-800 flex items-center justify-center">
                <Icon icon={stat.icon} className="text-pine-400" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-12 bg-coal-800 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-semibold text-bone">{stat.value}</p>
            )}
            <p className="text-[11px] mt-1 text-mist">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Grid widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Link */}
        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-5 lg:col-span-1">
          <h3 className="font-semibold text-bone text-sm mb-4">Quick Links</h3>
          <div className="space-y-2">
            {[
              { label: "Edit Profile & Hero", icon: "solar:document-text-bold-duotone", path: "/admin/profile" },
              { label: "Manage Skills", icon: "solar:widget-2-bold-duotone", path: "/admin/skills" },
              { label: "Write Blog Post", icon: "solar:notebook-bold-duotone", path: "/admin/blog" },
            ].map((item) => (
              <button key={item.path} onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-coal-800 hover:bg-coal-800 hover:border-coal-700 transition text-left">
                <Icon icon={item.icon} className="text-pine-400 text-base shrink-0" />
                <span className="text-sm text-mist">{item.label}</span>
                <Icon icon="solar:arrow-right-linear" className="text-coal-600 ml-auto text-sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-5 lg:col-span-2">
          <h3 className="font-semibold text-bone text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Add Project", path: "/admin/projects", icon: "solar:gallery-wide-bold-duotone" },
              { label: "Add Skill", path: "/admin/skills", icon: "solar:widget-2-bold-duotone" },
              { label: "Add Certificate", path: "/admin/certificates", icon: "solar:diploma-verified-bold-duotone" },
              { label: "Add Experience", path: "/admin/experience", icon: "solar:case-round-minimalistic-bold-duotone" },
              { label: "Write Post", path: "/admin/blog", icon: "solar:notebook-bold-duotone" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl transition text-center hover:bg-coal-800"
                style={{ border: "1px solid #171D18" }}
              >
                <Icon icon={action.icon} className="text-2xl text-pine-400" />
                <span className="text-xs font-medium text-mist">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-coal-800">
          <h3 className="font-semibold text-bone text-sm">Recent Projects</h3>
          <button onClick={() => router.push("/admin/projects")} className="text-xs font-medium text-pine-400 hover:text-pine-300">
            View all
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-mist">
            <Icon icon="solar:refresh-bold" className="animate-spin text-xl" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="text-center py-10 text-mist text-sm">
            No projects yet. <button onClick={() => router.push("/admin/projects")} className="text-pine-400 hover:text-pine-300">Add one →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mist text-xs" style={{ borderBottom: "1px solid #101410", backgroundColor: "rgba(5,7,5,0.5)" }}>
                  <th className="font-medium px-5 py-3">Project</th>
                  <th className="font-medium px-5 py-3">Tags</th>
                  <th className="font-medium px-5 py-3">Created</th>
                  <th className="font-medium px-5 py-3">Status</th>
                  <th className="font-medium px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-coal-800/40 transition" style={{ borderBottom: "1px solid #101410" }}>
                    <td className="px-5 py-3.5 font-medium text-bone">{proj.title}</td>
                    <td className="px-5 py-3.5 text-mist">
                      <div className="flex flex-wrap gap-1">
                        {(proj.tags ?? []).slice(0, 2).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-coal-800 border border-coal-700">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-mist">{formatDate(proj.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${proj.status === "PUBLISHED" ? "bg-pine-900/30 text-pine-400 border border-pine-800" : "bg-coal-800 text-mist border border-coal-700"}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => router.push("/admin/projects")} className="text-mist hover:text-pine-400 transition">
                        <Icon icon="solar:eye-linear" className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
