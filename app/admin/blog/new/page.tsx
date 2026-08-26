"use client";

import { Icon } from "@iconify/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const CATEGORIES = ["Development", "Design", "Productivity", "Trends"];
const GRADIENTS = [
  { label: "Pine", value: "from-pine-700 to-pine-900" },
  { label: "Dark", value: "from-coal-700 to-coal-900" },
  { label: "Mixed", value: "from-pine-600 to-coal-900" },
  { label: "Teal", value: "from-teal-700 to-teal-900" },
];

interface UploadedImage {
  name: string;
  url: string;
}

export default function WriteBlogPage() {
  const router = useRouter();
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [readTime, setReadTime] = useState("5 min read");
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [date, setDate] = useState(new Date().toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    showToast("success", `Mengunggah ${files.length} gambar...`);

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", `File "${file.name}" melebihi batas 5MB.`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from("portfolio-assets")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        let finalUrl = "";

        if (error) {
          // Fallback to blog-assets
          const { data: fbData, error: fbError } = await supabase.storage
            .from("blog-assets")
            .upload(filePath, file, { cacheControl: "3600", upsert: true });

          if (fbError) throw fbError;

          const { data: urlData } = supabase.storage.from("blog-assets").getPublicUrl(filePath);
          finalUrl = urlData.publicUrl;
        } else if (data) {
          const { data: urlData } = supabase.storage.from("portfolio-assets").getPublicUrl(filePath);
          finalUrl = urlData.publicUrl;
        }

        if (finalUrl) {
          newImages.push({ name: file.name.split(".")[0], url: finalUrl });
        }
      } catch (err: any) {
        showToast("error", `Gagal mengunggah "${file.name}": ` + err.message);
      }
    }

    setUploadedImages((prev) => [...prev, ...newImages]);
    setUploading(false);
    showToast("success", "Semua gambar berhasil diunggah!");
  };

  const insertImageAtCursor = (imgUrl: string, imgName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}\n\n![${imgName}](${imgUrl})\n`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const markdown = `\n![${imgName}](${imgUrl})\n`;
    
    const newContent = text.substring(0, start) + markdown + text.substring(end);
    setContent(newContent);
    
    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) return;

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
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${toast.type === "success" ? "bg-pine-950 border-pine-800 text-pine-400" : "bg-red-950 border-red-800 text-red-400"}`}>
          <Icon icon={toast.type === "success" ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
          {toast.message}
        </div>
      )}

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
            <p className="text-sm text-mist mt-0.5">Buat tulisan inspiratif baru dengan media gambar kaya.</p>
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
        {/* Editor Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl p-6 space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-mist font-mono">// CONTENT (MARKDOWN)</label>
                <span className="text-[10px] text-coal-600 font-mono">Mendukung penyisipan gambar</span>
              </div>
              <textarea
                ref={textareaRef}
                rows={16}
                placeholder="# Judul Utama&#10;&#10;Tuliskan isi artikel Anda di sini. Gunakan Media Gallery di sebelah kanan untuk mengunggah dan menyisipkan beberapa gambar sekaligus..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 resize-y font-mono leading-relaxed"
                required
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings & Media Gallery Column */}
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
                    <option key={c} value={c}>{c}</option>
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
                      className={`h-7 rounded-lg bg-gradient-to-r ${g.value} border-2 transition ${gradient === g.value ? "border-pine-400" : "border-transparent"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-bone font-mono">// MEDIA GALLERY</h3>
              {uploading && <Icon icon="solar:refresh-bold" className="animate-spin text-pine-400 text-sm" />}
            </div>

            {/* Drag & Drop Area */}
            <div className="relative border border-dashed border-coal-700 hover:border-pine-400/50 hover:bg-coal-950/20 rounded-xl p-4 transition text-center cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Icon icon="solar:camera-add-linear" className="text-xl text-mist mx-auto mb-1.5" />
              <p className="text-[10px] text-mist font-medium">Klik / Seret beberapa gambar ke sini</p>
              <p className="text-[9px] text-coal-600 mt-0.5">Maks 5MB per gambar</p>
            </div>

            {/* Uploaded Images List */}
            {uploadedImages.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-coal-950 border border-coal-850">
                    <img src={img.url} alt={img.name} className="w-10 h-10 rounded-lg object-cover bg-coal-900 border border-coal-800 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-bone truncate">{img.name}</p>
                      <button
                        type="button"
                        onClick={() => insertImageAtCursor(img.url, img.name)}
                        className="text-[9px] font-semibold text-pine-400 hover:text-pine-300 flex items-center gap-0.5 mt-0.5 transition"
                      >
                        <Icon icon="solar:add-square-bold" /> Sisipkan ke Teks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-coal-600 text-center py-4">Belum ada gambar diunggah.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
