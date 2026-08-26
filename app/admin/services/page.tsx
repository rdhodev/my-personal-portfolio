"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
}

const ICON_OPTIONS = [
  "solar:code-2-bold-duotone",
  "solar:palette-bold-duotone",
  "solar:widget-4-bold-duotone",
  "solar:smartphone-bold-duotone",
  "solar:server-bold-duotone",
  "solar:cart-large-4-bold-duotone",
  "solar:graph-up-bold-duotone",
];

const BLANK: Omit<Service, "id"> = { title: "", description: "", price: "", icon: ICON_OPTIONS[0] };

export default function AdminServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit"; data: Omit<Service, "id"> & { id?: string } }>({
    open: false, mode: "add", data: { ...BLANK },
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });
    if (!error && data) setServices(data as Service[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => setModal({ open: true, mode: "add", data: { ...BLANK } });
  const openEdit = (srv: Service) => setModal({ open: true, mode: "edit", data: { ...srv } });
  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const setField = <K extends keyof typeof modal.data>(key: K, value: typeof modal.data[K]) =>
    setModal((p) => ({ ...p, data: { ...p.data, [key]: value } }));

  const handleSave = async () => {
    if (!modal.data.title.trim()) return;
    setSaving(true);
    const payload = { title: modal.data.title, description: modal.data.description, price: modal.data.price, icon: modal.data.icon };
    if (modal.mode === "add") {
      const { error } = await supabase.from("services").insert(payload);
      if (error) showToast("error", error.message);
      else { showToast("success", "Service ditambahkan!"); await fetchServices(); closeModal(); }
    } else {
      const { error } = await supabase.from("services").update(payload).eq("id", modal.data.id!);
      if (error) showToast("error", error.message);
      else { showToast("success", "Service diperbarui!"); await fetchServices(); closeModal(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) showToast("error", error.message);
    else { showToast("success", "Service dihapus!"); setServices((prev) => prev.filter((s) => s.id !== id)); }
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
          <h1 className="text-xl font-semibold text-bone">Services</h1>
          <p className="text-sm text-mist mt-0.5">Kelola penawaran layanan jasa yang Anda tawarkan.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit">
          <Icon icon="solar:add-circle-bold" /> Add Service
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading services...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-coal-700 rounded-2xl text-mist text-sm">
          <Icon icon="solar:box-bold-duotone" className="text-3xl mx-auto mb-2 text-coal-600" />
          Belum ada layanan. <button onClick={openAdd} className="text-pine-400 hover:text-pine-300">Tambah sekarang →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => (
            <div key={srv.id} className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-coal-800 flex items-center justify-center text-pine-400">
                  <Icon icon={srv.icon} className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-bone text-sm">{srv.title}</h3>
                  <p className="text-[11px] text-pine-400 mt-0.5">{srv.price}</p>
                </div>
              </div>
              <p className="text-xs text-mist leading-relaxed">{srv.description}</p>
              <div className="flex items-center justify-end gap-2 border-t border-coal-800 pt-3">
                <button onClick={() => openEdit(srv)} className="text-xs font-medium text-mist hover:text-pine-400 flex items-center gap-1 transition">
                  <Icon icon="solar:pen-linear" /> Edit
                </button>
                <button onClick={() => handleDelete(srv.id)} disabled={deleting === srv.id} className="text-xs font-medium text-mist hover:text-red-400 flex items-center gap-1 transition">
                  {deleting === srv.id ? <Icon icon="solar:refresh-bold" className="animate-spin" /> : <Icon icon="solar:trash-bin-trash-linear" />} Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-lg w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-bone">{modal.mode === "add" ? "Add Service" : "Edit Service"}</h2>
              <button onClick={closeModal} className="text-mist hover:text-bone"><Icon icon="solar:close-circle-linear" className="text-xl" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Service Title</label>
                <input type="text" placeholder="e.g. Web Development" value={modal.data.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Description</label>
                <textarea rows={2} placeholder="Brief description..." value={modal.data.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Starting Price</label>
                <input type="text" placeholder="e.g. from Rp 3.000.000" value={modal.data.price}
                  onChange={(e) => setField("price", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Icon</label>
                <div className="grid grid-cols-7 gap-2">
                  {ICON_OPTIONS.map((ico) => (
                    <button type="button" key={ico} onClick={() => setField("icon", ico)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${modal.data.icon === ico ? "bg-pine-900 border border-pine-700 text-pine-400" : "bg-coal-800 border border-coal-700 text-mist hover:text-pine-400"}`}>
                      <Icon icon={ico} className="text-lg" />
                    </button>
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
