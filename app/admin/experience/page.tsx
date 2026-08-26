"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  is_current: boolean;
  description: string;
}

const BLANK: Omit<Experience, "id"> = { role: "", company: "", period: "", is_current: false, description: "" };

export default function AdminExperiencePage() {
  const supabase = createClient();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Omit<Experience, "id"> & { id?: string } }>({
    open: false, mode: "add", data: { ...BLANK },
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExperiences = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("experience").select("*").order("created_at", { ascending: false });
    if (!error && data) setExperiences(data as Experience[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchExperiences(); }, []);

  const openAdd = () => setModal({ open: true, mode: "add", data: { ...BLANK } });
  const openEdit = (exp: Experience) => setModal({ open: true, mode: "edit", data: { ...exp } });
  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const handleSave = async () => {
    if (!modal.data.role.trim() || !modal.data.company.trim()) return;
    setSaving(true);
    if (modal.mode === "add") {
      const { error } = await supabase.from("experience").insert({ ...modal.data });
      if (error) showToast("error", error.message);
      else { showToast("success", "Experience ditambahkan!"); await fetchExperiences(); closeModal(); }
    } else {
      const { error } = await supabase.from("experience").update({ role: modal.data.role, company: modal.data.company, period: modal.data.period, is_current: modal.data.is_current, description: modal.data.description }).eq("id", modal.data.id!);
      if (error) showToast("error", error.message);
      else { showToast("success", "Experience diperbarui!"); await fetchExperiences(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("experience").delete().eq("id", id);
    if (error) showToast("error", error.message);
    else { showToast("success", "Experience dihapus!"); setExperiences((prev) => prev.filter((e) => e.id !== id)); }
    setDeleting(null);
  };

  const setField = <K extends keyof typeof modal.data>(key: K, value: typeof modal.data[K]) =>
    setModal((p) => ({ ...p, data: { ...p.data, [key]: value } }));

  return (
    <div className="space-y-6 text-bone">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-pine-950 border-pine-800 text-pine-400" : "bg-red-950 border-red-800 text-red-400"}`}>
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-bone">Experience</h1>
          <p className="text-sm text-mist mt-0.5">Kelola riwayat pekerjaan dan pengalaman profesional kamu.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit">
          <Icon icon="solar:add-circle-bold" /> Add Experience
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading experiences...</span>
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-coal-700 rounded-2xl text-mist text-sm">
          <Icon icon="solar:case-round-minimalistic-bold-duotone" className="text-3xl mx-auto mb-2 text-coal-600" />
          Belum ada pengalaman kerja. <button onClick={openAdd} className="text-pine-400 hover:text-pine-300">Tambah sekarang →</button>
        </div>
      ) : (
        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mist text-xs" style={{ borderBottom: "1px solid #101410", backgroundColor: "rgba(5,7,5,0.5)" }}>
                  <th className="font-medium px-5 py-3">Role</th>
                  <th className="font-medium px-5 py-3">Company</th>
                  <th className="font-medium px-5 py-3">Period</th>
                  <th className="font-medium px-5 py-3">Status</th>
                  <th className="font-medium px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-coal-800/40 transition" style={{ borderBottom: "1px solid #101410" }}>
                    <td className="px-5 py-3.5 font-medium text-bone">{exp.role}</td>
                    <td className="px-5 py-3.5 text-mist">{exp.company}</td>
                    <td className="px-5 py-3.5 text-mist">{exp.period}</td>
                    <td className="px-5 py-3.5">
                      {exp.is_current && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pine-900/30 text-pine-400 border border-pine-800">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button onClick={() => openEdit(exp)} className="text-mist hover:text-pine-400 transition">
                        <Icon icon="solar:pen-linear" className="text-lg inline" />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} disabled={deleting === exp.id} className="text-mist hover:text-red-400 transition">
                        {deleting === exp.id ? <Icon icon="solar:refresh-bold" className="animate-spin text-lg inline" /> : <Icon icon="solar:trash-bin-trash-linear" className="text-lg inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-lg w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-bone">{modal.mode === "add" ? "Add Experience" : "Edit Experience"}</h2>
              <button onClick={closeModal} className="text-mist hover:text-bone"><Icon icon="solar:close-circle-linear" className="text-xl" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Role / Position</label>
                <input type="text" placeholder="e.g. Front-End Developer" value={modal.data.role}
                  onChange={(e) => setField("role", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Company</label>
                <input type="text" placeholder="e.g. PT Digital Kreasi" value={modal.data.company}
                  onChange={(e) => setField("company", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Period</label>
                <input type="text" placeholder="e.g. Sep 2023 — Present" value={modal.data.period}
                  onChange={(e) => setField("period", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe your responsibilities..." value={modal.data.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 resize-none" />
              </div>
              <button type="button" onClick={() => setField("is_current", !modal.data.is_current)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition ${modal.data.is_current ? "border-pine-700 bg-pine-950/30" : "border-coal-700 bg-coal-950"}`}>
                <span className="text-sm text-bone flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${modal.data.is_current ? "bg-emerald-500 animate-pulse" : "bg-coal-600"}`} />
                  Current Position
                </span>
                <span className={`text-xs font-medium ${modal.data.is_current ? "text-pine-400" : "text-mist"}`}>
                  {modal.data.is_current ? "YES" : "NO"}
                </span>
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-coal-700 text-sm font-medium text-mist hover:bg-coal-800 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving || !modal.data.role.trim()}
                className="flex-1 py-2.5 rounded-xl bg-pine-400 text-coal-950 text-sm font-bold hover:bg-pine-300 transition disabled:opacity-60">
                {saving ? "Saving..." : modal.mode === "add" ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
