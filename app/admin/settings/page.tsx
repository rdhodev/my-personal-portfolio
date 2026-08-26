"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type SettingsTab = "account" | "site" | "seo";

const tabs: { key: SettingsTab; label: string; icon: string }[] = [
  { key: "account", label: "Account", icon: "solar:user-bold-duotone" },
  { key: "site", label: "Site", icon: "solar:global-bold-duotone" },
  { key: "seo", label: "SEO", icon: "solar:chart-2-bold-duotone" },
];

interface ProfileSettings {
  full_name: string;
  email: string | null;
  site_title?: string;
  domain?: string;
  contact_email?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
}

const PROFILE_ID = "00000000-0000-0000-0000-000000000000";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [settings, setSettings] = useState<ProfileSettings>({
    full_name: "",
    email: "",
    site_title: "Ridho Hidayat — Portfolio",
    domain: "",
    contact_email: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("full_name, email, site_title, domain, contact_email, meta_title, meta_description, keywords")
        .eq("id", PROFILE_ID)
        .single();

      if (error) {
        // Try to fetch any first row if the fixed ID doesn't exist yet
        const { data: fallback } = await supabase.from("profile").select("full_name, email, site_title, domain, contact_email, meta_title, meta_description, keywords").limit(1).single();
        if (fallback) setSettings(fallback as ProfileSettings);
      } else if (data) {
        setSettings(data as ProfileSettings);
      }
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleChange = (field: keyof ProfileSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase
      .from("profile")
      .upsert({ ...settings, id: PROFILE_ID });
    setIsSaving(false);
    if (error) {
      showToast("error", "Gagal menyimpan: " + error.message);
    } else {
      showToast("success", "Pengaturan berhasil disimpan!");
    }
  };

  const initials = settings.full_name
    ? settings.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "R";

  return (
    <div className="space-y-6 text-bone">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border transition-all ${
            toast.type === "success"
              ? "bg-pine-950 border-pine-800 text-pine-400"
              : "bg-red-950 border-red-800 text-red-400"
          }`}
        >
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold text-bone">Settings</h1>
        <p className="text-sm text-mist mt-0.5">
          Kelola akun admin dan pengaturan website portfolio kamu.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Sidebar Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-2 flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-left shrink-0 transition w-full ${
                    activeTab === tab.key
                      ? "bg-coal-800 text-pine-400"
                      : "text-mist hover:bg-coal-800/50 hover:text-bone"
                  }`}
                >
                  <Icon icon={tab.icon} className="text-lg" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Panels */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === "account" && (
              <form
                onSubmit={handleSave}
                className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-bone">Account</h3>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-pine-400 text-coal-950 font-bold text-xs rounded-xl hover:bg-pine-300 transition disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Account"}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-pine-900/30 flex items-center justify-center text-pine-400 font-semibold text-xl border border-pine-800">
                    {initials}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email ?? ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Site Tab */}
            {activeTab === "site" && (
              <form
                onSubmit={handleSave}
                className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-bone">Site Settings</h3>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-pine-400 text-coal-950 font-bold text-xs rounded-xl hover:bg-pine-300 transition disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Site"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Site Title
                    </label>
                    <input
                      type="text"
                      value={settings.site_title ?? ""}
                      onChange={(e) => handleChange("site_title", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Domain
                    </label>
                    <input
                      type="text"
                      placeholder="https://ridho.dev"
                      value={settings.domain ?? ""}
                      onChange={(e) => handleChange("domain", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 placeholder:text-coal-750"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email ?? ""}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <form
                onSubmit={handleSave}
                className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-bone">SEO Settings</h3>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-pine-400 text-coal-950 font-bold text-xs rounded-xl hover:bg-pine-300 transition disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save SEO"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={settings.meta_title ?? ""}
                      onChange={(e) => handleChange("meta_title", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20"
                    />
                    <p className="text-[11px] text-coal-600 mt-1">
                      Rekomendasi: 50–60 karakter.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={settings.meta_description ?? ""}
                      onChange={(e) => handleChange("meta_description", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 resize-none"
                    />
                    <p className="text-[11px] text-coal-600 mt-1">
                      Rekomendasi: 120–160 karakter.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">
                      Keywords
                    </label>
                    <input
                      type="text"
                      placeholder="web developer, react developer, ui designer"
                      value={settings.keywords ?? ""}
                      onChange={(e) => handleChange("keywords", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 placeholder:text-coal-750"
                    />
                    <p className="text-[11px] text-coal-600 mt-1">
                      Pisahkan dengan koma.
                    </p>
                  </div>

                  {/* SEO Preview */}
                  <div className="mt-2 p-4 bg-coal-950 border border-coal-800 rounded-xl">
                    <p className="text-[11px] font-semibold text-coal-500 uppercase tracking-wider mb-2">
                      Google Preview
                    </p>
                    <p className="text-base font-medium text-blue-400 hover:underline cursor-pointer truncate">
                      {settings.meta_title || settings.full_name || "Ridho Hidayat"}
                    </p>
                    <p className="text-xs text-pine-500">{settings.domain || "https://ridho.dev"}</p>
                    <p className="text-xs text-mist mt-1 leading-relaxed line-clamp-2">
                      {settings.meta_description || "Portfolio Ridho Hidayat, front-end developer yang membangun website cepat dan rapi."}
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
