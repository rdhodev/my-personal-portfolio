"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
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

const GRADIENTS = [
  { label: "Pine", value: "from-pine-700 to-pine-900" },
  { label: "Dark", value: "from-coal-700 to-coal-900" },
  { label: "Mixed", value: "from-pine-600 to-coal-900" },
  { label: "Teal", value: "from-teal-700 to-teal-900" },
];

const BLANK: Omit<Project, "id" | "created_at"> = {
  title: "", description: "", tags: [], gradient: GRADIENTS[0].value,
  status: "DRAFT", is_featured: false, github_url: "", demo_url: "", image_url: null,
};

export default function AdminProjectsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data: Omit<Project, "id" | "created_at"> & { id?: string; tagsStr?: string };
  }>({
    open: false, mode: "add", data: { ...BLANK, tagsStr: "" },
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (!error && data) setProjects(data as Project[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const openAdd = () => {
    setImagePreview(null);
    setModal({ open: true, mode: "add", data: { ...BLANK, tagsStr: "" } });
  };

  const openEdit = (p: Project) => {
    setImagePreview(p.image_url || null);
    setModal({ open: true, mode: "edit", data: { ...p, tagsStr: p.tags.join(", ") } });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
    setImagePreview(null);
  };

  const setField = <K extends keyof typeof modal.data>(key: K, value: typeof modal.data[K]) =>
    setModal((p) => ({ ...p, data: { ...p.data, [key]: value } }));

  // ─── Image Upload ───────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Ukuran file melebihi 5MB.");
      return;
    }

    setUploading(true);
    showToast("success", "Mengunggah gambar...");

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    try {
      // Try portfolio-assets first
      let publicUrl = "";
      const { data, error } = await supabase.storage
        .from("portfolio-assets")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) {
        // Fallback to blog-assets
        const { data: fbData, error: fbError } = await supabase.storage
          .from("blog-assets")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (fbError) throw fbError;
        const { data: urlData } = supabase.storage.from("blog-assets").getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      } else if (data) {
        const { data: urlData } = supabase.storage.from("portfolio-assets").getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      setField("image_url", publicUrl);
      setImagePreview(publicUrl);
      showToast("success", "Gambar berhasil diunggah!");
    } catch (err: any) {
      showToast("error", "Gagal mengunggah: " + err.message);
      setImagePreview(modal.data.image_url || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setField("image_url", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Save ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!modal.data.title.trim()) return;
    setSaving(true);
    const tags = (modal.data.tagsStr ?? "").split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: modal.data.title,
      description: modal.data.description,
      tags,
      gradient: modal.data.gradient,
      status: modal.data.status,
      is_featured: modal.data.is_featured,
      github_url: modal.data.github_url,
      demo_url: modal.data.demo_url,
      image_url: modal.data.image_url,
    };
    if (modal.mode === "add") {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) showToast("error", error.message);
      else { showToast("success", "Project ditambahkan!"); await fetchProjects(); closeModal(); }
    } else {
      const { error } = await supabase.from("projects").update(payload).eq("id", modal.data.id!);
      if (error) showToast("error", error.message);
      else { showToast("success", "Project diperbarui!"); await fetchProjects(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) showToast("error", error.message);
    else { showToast("success", "Project dihapus!"); setProjects((prev) => prev.filter((p) => p.id !== id)); }
    setDeleting(null);
  };

  return (
    <div className="space-y-6 text-bone">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-pine-950 border-pine-800 text-pine-400" : "bg-red-950 border-red-800 text-red-400"}`}>
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-bone">Projects</h1>
          <p className="text-sm text-mist mt-0.5">Kelola karya dan proyek portfolio kamu di sini.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit">
          <Icon icon="solar:add-circle-bold" /> Add Project
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-coal-700 rounded-2xl text-mist text-sm">
          <Icon icon="solar:gallery-wide-bold-duotone" className="text-3xl mx-auto mb-2 text-coal-600" />
          Belum ada project. <button onClick={openAdd} className="text-pine-400 hover:text-pine-300">Tambah sekarang →</button>
        </div>
      ) : (
        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mist text-xs" style={{ borderBottom: "1px solid #101410", backgroundColor: "rgba(5,7,5,0.5)" }}>
                  <th className="font-medium px-5 py-3">Project</th>
                  <th className="font-medium px-5 py-3">Tags</th>
                  <th className="font-medium px-5 py-3">Featured</th>
                  <th className="font-medium px-5 py-3">Status</th>
                  <th className="font-medium px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-coal-800/40 transition" style={{ borderBottom: "1px solid #101410" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        {proj.image_url ? (
                          <img
                            src={proj.image_url}
                            alt={proj.title}
                            className="w-10 h-10 rounded-lg object-cover border border-coal-700 shrink-0"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${proj.gradient} shrink-0 flex items-center justify-center`}>
                            <Icon icon="solar:gallery-wide-bold-duotone" className="text-white/30 text-sm" />
                          </div>
                        )}
                        <span className="font-medium text-bone">{proj.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-mist">
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-coal-800 border border-coal-700">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {proj.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-900/30 text-yellow-400 border border-yellow-800">Featured</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${proj.status === "PUBLISHED" ? "bg-pine-900/30 text-pine-400 border border-pine-800" : "bg-coal-800 text-mist border border-coal-700"}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button onClick={() => openEdit(proj)} className="text-mist hover:text-pine-400 transition">
                        <Icon icon="solar:pen-linear" className="text-lg inline" />
                      </button>
                      <button onClick={() => handleDelete(proj.id)} disabled={deleting === proj.id} className="text-mist hover:text-red-400 transition">
                        {deleting === proj.id ? <Icon icon="solar:refresh-bold" className="animate-spin text-lg inline" /> : <Icon icon="solar:trash-bin-trash-linear" className="text-lg inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-lg w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-bone">{modal.mode === "add" ? "Add Project" : "Edit Project"}</h2>
              <button onClick={closeModal} className="text-mist hover:text-bone">
                <Icon icon="solar:close-circle-linear" className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* ── Image Upload ── */}
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">
                  Cover Image
                  <span className="text-coal-600 font-normal ml-1">(maks 5MB)</span>
                </label>

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-coal-700 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    {/* Uploading overlay */}
                    {uploading && (
                      <div className="absolute inset-0 bg-coal-950/70 flex items-center justify-center gap-2">
                        <Icon icon="solar:refresh-bold" className="animate-spin text-pine-400 text-xl" />
                        <span className="text-xs text-pine-400 font-medium">Mengunggah...</span>
                      </div>
                    )}
                    {/* Actions overlay */}
                    {!uploading && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-pine-400 text-coal-950 text-xs font-bold rounded-lg hover:bg-pine-300 transition">
                          <Icon icon="solar:camera-add-bold" />
                          Ganti
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/80 text-red-300 text-xs font-bold rounded-lg hover:bg-red-900 transition"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" />
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center w-full h-32 border border-dashed border-coal-700 hover:border-pine-400/50 hover:bg-coal-950/30 rounded-xl cursor-pointer transition group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <>
                        <Icon icon="solar:refresh-bold" className="text-2xl text-pine-400 animate-spin mb-1.5" />
                        <p className="text-xs text-pine-400 font-medium">Mengunggah...</p>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:camera-add-linear" className="text-2xl text-mist mb-1.5 group-hover:text-pine-400 transition" />
                        <p className="text-xs text-mist font-medium group-hover:text-bone transition">Klik atau seret gambar ke sini</p>
                        <p className="text-[10px] text-coal-600 mt-0.5">PNG, JPG, WebP • maks 5MB</p>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Project Title */}
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Project Title</label>
                <input type="text" placeholder="e.g. E-Commerce Dashboard" value={modal.data.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Description</label>
                <textarea rows={3} placeholder="Describe the project..." value={modal.data.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 resize-none" />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Tags (comma separated)</label>
                <input type="text" placeholder="React, Tailwind, Node.js" value={modal.data.tagsStr ?? ""}
                  onChange={(e) => setField("tagsStr", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>

              {/* GitHub & Demo URLs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">GitHub URL</label>
                  <input type="text" placeholder="https://github.com/..." value={modal.data.github_url ?? ""}
                    onChange={(e) => setField("github_url", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">Demo URL</label>
                  <input type="text" placeholder="https://..." value={modal.data.demo_url ?? ""}
                    onChange={(e) => setField("demo_url", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">
                  Color Theme <span className="text-coal-600 font-normal">(fallback jika tanpa gambar)</span>
                </label>
                <div className="flex gap-2">
                  {GRADIENTS.map((g) => (
                    <button type="button" key={g.value} onClick={() => setField("gradient", g.value)}
                      className={`flex-1 h-8 rounded-lg bg-gradient-to-r ${g.value} border-2 transition ${modal.data.gradient === g.value ? "border-pine-400" : "border-transparent"}`}
                      title={g.label} />
                  ))}
                </div>
              </div>

              {/* Status & Featured */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-mist mb-1.5">Status</label>
                  <select value={modal.data.status} onChange={(e) => setField("status", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-mist mb-1.5">Featured</label>
                  <button type="button" onClick={() => setField("is_featured", !modal.data.is_featured)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition ${modal.data.is_featured ? "border-yellow-700 bg-yellow-950/30 text-yellow-400" : "border-coal-700 bg-coal-950 text-mist"}`}>
                    {modal.data.is_featured ? "⭐ Featured" : "Not Featured"}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-coal-700 text-sm font-medium text-mist hover:bg-coal-800 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || uploading || !modal.data.title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-pine-400 text-coal-950 text-sm font-bold hover:bg-pine-300 transition disabled:opacity-60 flex items-center justify-center gap-1.5">
                {saving && <Icon icon="solar:refresh-bold" className="animate-spin" />}
                {saving ? "Menyimpan..." : modal.mode === "add" ? "Add Project" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
