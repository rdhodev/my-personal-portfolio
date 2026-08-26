"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  color: string;
}

const COLORS = [
  { label: "Green", value: "from-pine-600 to-pine-900" },
  { label: "Dark", value: "from-coal-700 to-coal-900" },
  { label: "Teal", value: "from-pine-500 to-coal-900" },
  { label: "Emerald", value: "from-emerald-600 to-emerald-900" },
];

const BLANK: Omit<Certificate, "id"> = { title: "", issuer: "", date: "", color: COLORS[0].value };

export default function AdminCertificatesPage() {
  const supabase = createClient();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Omit<Certificate, "id"> & { id?: string } }>({
    open: false, mode: "add", data: { ...BLANK },
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCerts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("certificates").select("*").order("created_at", { ascending: false });
    if (!error && data) setCerts(data as Certificate[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchCerts(); }, []);

  const openAdd = () => setModal({ open: true, mode: "add", data: { ...BLANK } });
  const openEdit = (cert: Certificate) => setModal({ open: true, mode: "edit", data: { ...cert } });
  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const handleSave = async () => {
    if (!modal.data.title.trim() || !modal.data.issuer.trim()) return;
    setSaving(true);
    if (modal.mode === "add") {
      const { error } = await supabase.from("certificates").insert({ ...modal.data });
      if (error) showToast("error", error.message);
      else { showToast("success", "Sertifikat ditambahkan!"); await fetchCerts(); closeModal(); }
    } else {
      const { error } = await supabase.from("certificates").update({ title: modal.data.title, issuer: modal.data.issuer, date: modal.data.date, color: modal.data.color }).eq("id", modal.data.id!);
      if (error) showToast("error", error.message);
      else { showToast("success", "Sertifikat diperbarui!"); await fetchCerts(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) showToast("error", error.message);
    else { showToast("success", "Sertifikat dihapus!"); setCerts((prev) => prev.filter((c) => c.id !== id)); }
    setDeleting(null);
  };

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
          <h1 className="text-xl font-semibold text-bone">Certificates</h1>
          <p className="text-sm text-mist mt-0.5">Kelola sertifikat dan kredensial yang kamu miliki.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit">
          <Icon icon="solar:add-circle-bold" /> Add Certificate
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading certificates...</span>
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-coal-700 rounded-2xl text-mist text-sm">
          <Icon icon="solar:diploma-verified-bold-duotone" className="text-3xl mx-auto mb-2 text-coal-600" />
          Belum ada sertifikat. <button onClick={openAdd} className="text-pine-400 hover:text-pine-300">Tambah sekarang →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert) => (
            <div key={cert.id} className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft overflow-hidden flex flex-col justify-between">
              <div className={`h-32 bg-gradient-to-tr ${cert.color} flex items-center justify-center`}>
                <Icon icon="solar:diploma-verified-bold-duotone" className="text-white text-4xl" />
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-bone text-sm">{cert.title}</h3>
                  <p className="text-xs text-mist mt-0.5">{cert.issuer} &middot; {cert.date}</p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-coal-800 pt-3">
                  <button onClick={() => openEdit(cert)} className="text-xs font-medium text-mist hover:text-pine-400 flex items-center gap-1 transition">
                    <Icon icon="solar:pen-linear" /> Edit
                  </button>
                  <button onClick={() => handleDelete(cert.id)} disabled={deleting === cert.id} className="text-xs font-medium text-mist hover:text-red-400 flex items-center gap-1 transition">
                    {deleting === cert.id ? <Icon icon="solar:refresh-bold" className="animate-spin" /> : <Icon icon="solar:trash-bin-trash-linear" />} Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-bone">{modal.mode === "add" ? "Add Certificate" : "Edit Certificate"}</h2>
              <button onClick={closeModal} className="text-mist hover:text-bone transition"><Icon icon="solar:close-circle-linear" className="text-xl" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Title</label>
                <input type="text" placeholder="e.g. Full-Stack Web Developer" value={modal.data.title}
                  onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, title: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Issuer</label>
                <input type="text" placeholder="e.g. Udemy" value={modal.data.issuer}
                  onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, issuer: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Date</label>
                <input type="text" placeholder="e.g. Jul 2026" value={modal.data.date}
                  onChange={(e) => setModal((p) => ({ ...p, data: { ...p.data, date: e.target.value } }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Color Theme</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button type="button" key={c.value} onClick={() => setModal((p) => ({ ...p, data: { ...p.data, color: c.value } }))}
                      className={`flex-1 h-8 rounded-lg bg-gradient-to-r ${c.value} border-2 transition ${modal.data.color === c.value ? "border-pine-400" : "border-transparent"}`} title={c.label} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-coal-700 text-sm font-medium text-mist hover:bg-coal-800 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving || !modal.data.title.trim()}
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
