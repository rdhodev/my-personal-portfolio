"use client";

import { Icon } from "@iconify/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";

// Dynamically import the rich editor to avoid SSR issues
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-coal-700 rounded-xl bg-coal-950 min-h-[420px] flex items-center justify-center gap-3 text-mist text-sm">
      <Icon icon="solar:refresh-bold" className="animate-spin text-xl text-pine-400" />
      Memuat editor...
    </div>
  ),
});

const CATEGORIES = ["Development", "Design", "Productivity", "Trends"];
const GRADIENTS = [
  { label: "Pine", value: "from-pine-700 to-pine-900" },
  { label: "Dark", value: "from-coal-700 to-coal-900" },
  { label: "Mixed", value: "from-pine-600 to-coal-900" },
  { label: "Teal", value: "from-teal-700 to-teal-900" },
];

export default function WriteBlogPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [readTime, setReadTime] = useState("5 min read");
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [date, setDate] = useState(
    new Date().toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugCustom) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content || content === "<p></p>") {
      showToast("error", "Judul, ringkasan, dan konten harus diisi.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("posts").insert({
      title,
      slug,
      excerpt,
      content,
      category,
      read_time: readTime,
      gradient,
      date,
      views: 0,
    });

    setSaving(false);
    if (error) {
      showToast("error", "Gagal menerbitkan: " + error.message);
    } else {
      showToast("success", "Artikel berhasil diterbitkan!");
      setTimeout(() => {
        router.push("/admin/blog");
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 text-bone pb-10">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
            toast.type === "success"
              ? "bg-pine-950 border-pine-800 text-pine-400"
              : "bg-red-950 border-red-800 text-red-400"
          }`}
        >
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/blog")}
            className="w-10 h-10 rounded-xl bg-coal-900 border border-coal-800 flex items-center justify-center text-mist hover:text-bone hover:border-coal-700 transition"
          >
            <Icon icon="solar:arrow-left-linear" className="text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-bone">Tulis Artikel Baru</h1>
            <p className="text-sm text-mist mt-0.5">
              Editor kaya dengan dukungan gambar, heading, blockquote, dan kode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/blog")}
            className="px-4 py-2 rounded-xl border border-coal-700 text-xs font-semibold text-mist hover:bg-coal-800 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-5 py-2 bg-pine-400 text-coal-950 font-bold text-xs rounded-xl hover:bg-pine-300 transition disabled:opacity-60 flex items-center gap-1.5"
          >
            {saving && <Icon icon="solar:refresh-bold" className="animate-spin" />}
            {saving ? "Menerbitkan..." : "Terbitkan Artikel"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Editor Column ──────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Title */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl px-6 pt-6 pb-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-mist mb-1.5 font-mono">// TITLE</label>
              <input
                type="text"
                placeholder="Judul Artikel..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-0 bg-transparent text-bone text-2xl font-bold focus:outline-none placeholder:text-coal-700 border-b border-coal-800 pb-3 focus:border-pine-500/30 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mist mb-1.5 font-mono">// SLUG (SEO)</label>
              <input
                type="text"
                placeholder="slug-artikel-seo"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugCustom(true);
                }}
                className="w-full px-0 bg-transparent text-mist text-sm font-mono focus:outline-none placeholder:text-coal-750 border-b border-coal-800 pb-2 focus:border-pine-500/30 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mist mb-1.5 font-mono">// EXCERPT / SUMMARY</label>
              <textarea
                rows={2}
                placeholder="Ringkasan pendek artikel yang memikat pembaca..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-0 bg-transparent text-mist text-sm focus:outline-none placeholder:text-coal-700 resize-none border-b border-coal-800 pb-3 focus:border-pine-500/30 transition"
                required
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-medium text-mist font-mono">// KONTEN ARTIKEL</label>
              <div className="flex items-center gap-1.5 text-[10px] text-coal-600 font-mono">
                <Icon icon="solar:magic-stick-3-linear" className="text-pine-500 text-sm" />
                Rich editor · Seret gambar, pilih teks untuk format
              </div>
            </div>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Mulai menulis cerita Anda... Pilih teks untuk format, atau seret gambar ke sini."
            />
          </div>
        </div>

        {/* ── Sidebar Settings Column ──────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-bone font-mono">// ARTICLE CONFIG</h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-coal-750 bg-coal-950 text-bone text-xs focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Waktu Baca</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-coal-750 bg-coal-950 text-bone text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Tanggal Terbit</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-coal-750 bg-coal-950 text-bone text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-mist mb-1.5">Gradasi Cover</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {GRADIENTS.map((g) => (
                    <button
                      type="button"
                      key={g.value}
                      onClick={() => setGradient(g.value)}
                      className={`h-7 rounded-lg bg-gradient-to-r ${g.value} border-2 transition ${
                        gradient === g.value ? "border-pine-400" : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Panel */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-bone font-mono">// TIPS EDITOR</h3>
            <ul className="space-y-2">
              {[
                { icon: "solar:cursor-linear", text: "Pilih teks → toolbar format muncul" },
                { icon: "solar:add-circle-linear", text: "Baris kosong → menu insert muncul" },
                { icon: "solar:gallery-add-linear", text: "Seret gambar ke editor untuk sisipkan" },
                { icon: "solar:keyboard-linear", text: "Ctrl+B Bold · Ctrl+I Italic" },
                { icon: "solar:quote-linear", text: "Gunakan blockquote untuk kutipan" },
                { icon: "solar:code-square-linear", text: "Code block untuk snippet kode" },
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-mist">
                  <Icon icon={tip.icon} className="text-pine-500 mt-0.5 shrink-0 text-sm" />
                  {tip.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
