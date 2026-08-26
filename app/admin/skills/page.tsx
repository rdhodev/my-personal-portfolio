"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

const CATEGORIES = ["Frontend", "Backend", "Tools"];

const BLANK_SKILL: Omit<Skill, "id"> = { name: "", level: 80, category: "Frontend" };

export default function AdminSkillsPage() {
  const supabase = createClient();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Omit<Skill, "id"> & { id?: string } }>({
    open: false, mode: "add", data: { ...BLANK_SKILL },
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSkills = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("skills").select("*").order("created_at", { ascending: true });
    if (!error && data) setSkills(data as Skill[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const openAdd = () => setModal({ open: true, mode: "add", data: { ...BLANK_SKILL } });
  const openEdit = (skill: Skill) => setModal({ open: true, mode: "edit", data: { ...skill } });
  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const handleSave = async () => {
    if (!modal.data.name.trim()) return;
    setSaving(true);
    if (modal.mode === "add") {
      const { error } = await supabase.from("skills").insert({
        name: modal.data.name, level: modal.data.level, category: modal.data.category,
      });
      if (error) showToast("error", error.message);
      else { showToast("success", "Skill ditambahkan!"); await fetchSkills(); closeModal(); }
    } else {
      const { error } = await supabase.from("skills").update({
        name: modal.data.name, level: modal.data.level, category: modal.data.category,
      }).eq("id", modal.data.id!);
      if (error) showToast("error", error.message);
      else { showToast("success", "Skill diperbarui!"); await fetchSkills(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) showToast("error", error.message);
    else { showToast("success", "Skill dihapus!"); setSkills((prev) => prev.filter((s) => s.id !== id)); }
    setDeleting(null);
  };

  const grouped = CATEGORIES.map((cat) => ({
    title: cat,
    skills: skills.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-6 text-bone">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-pine-950 border-pine-800 text-pine-400" : "bg-red-950 border-red-800 text-red-400"}`}>
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-bone">Skills</h1>
          <p className="text-sm text-mist mt-0.5">Kelola daftar keahlian yang tampil di website kamu.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit">
          <Icon icon="solar:add-circle-bold" /> Add Skill
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading skills...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((cat) => (
            <div key={cat.title} className="space-y-3">
              <p className="px-1 text-[11px] font-semibold text-coal-500 uppercase tracking-wider">{cat.title}</p>
              {cat.skills.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-coal-700 rounded-2xl text-mist text-sm">
                  No skills yet in {cat.title}. <button onClick={openAdd} className="text-pine-400 hover:text-pine-300">Add one →</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.skills.map((skill) => (
                    <div key={skill.id} className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-coal-800 flex items-center justify-center">
                            <Icon icon="solar:widget-2-bold-duotone" className="text-pine-400 text-lg" />
                          </div>
                          <span className="font-medium text-bone text-sm">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(skill)} className="text-mist hover:text-pine-400 p-1 transition">
                            <Icon icon="solar:pen-linear" />
                          </button>
                          <button onClick={() => handleDelete(skill.id)} disabled={deleting === skill.id} className="text-mist hover:text-red-400 p-1 transition">
                            {deleting === skill.id ? <Icon icon="solar:refresh-bold" className="animate-spin" /> : <Icon icon="solar:trash-bin-trash-linear" />}
                          </button>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-coal-950 overflow-hidden">
                        <div className="h-2 rounded-full bg-pine-500 transition-all" style={{ width: `${skill.level}%` }} />
                      </div>
                      <p className="text-[11px] text-mist mt-1.5">
                        {skill.level >= 80 ? "Advanced" : skill.level >= 60 ? "Intermediate" : "Beginner"} &middot; {skill.level}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-bone">{modal.mode === "add" ? "Add Skill" : "Edit Skill"}</h2>
              <button onClick={closeModal} className="text-mist hover:text-bone transition"><Icon icon="solar:close-circle-linear" className="text-xl" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Skill Name</label>
                <input type="text" placeholder="e.g. React JS" value={modal.data.name} onChange={(e) => setModal((prev) => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Category</label>
                <select value={modal.data.category} onChange={(e) => setModal((prev) => ({ ...prev, data: { ...prev.data, category: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Level: {modal.data.level}%</label>
                <input type="range" min={10} max={100} step={5} value={modal.data.level}
                  onChange={(e) => setModal((prev) => ({ ...prev, data: { ...prev.data, level: Number(e.target.value) } }))}
                  className="w-full accent-pine-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-coal-700 text-sm font-medium text-mist hover:bg-coal-800 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving || !modal.data.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-pine-400 text-coal-950 text-sm font-bold hover:bg-pine-300 transition disabled:opacity-60">
                {saving ? "Saving..." : modal.mode === "add" ? "Add Skill" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
