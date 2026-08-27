"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

interface Profile {
  id: string;
  full_name: string;
  role_tagline: string;
  hero_headline: string;
  about_me: string;
  resume_url: string | null;
  is_available: boolean;
  github_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  email: string | null;
  avatar_url: string | null;
}

const PROFILE_ID = "00000000-0000-0000-0000-000000000000";

export default function AdminProfilePage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({
    id: PROFILE_ID,
    full_name: "",
    role_tagline: "",
    hero_headline: "",
    about_me: "",
    resume_url: null,
    is_available: true,
    github_url: "",
    linkedin_url: "",
    instagram_url: "",
    email: "",
    avatar_url: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States untuk Cropping
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", PROFILE_ID)
        .single();

      if (error) {
        // Try to fetch any first row if the fixed ID doesn't exist yet
        const { data: fallback } = await supabase.from("profile").select("*").limit(1).single();
        if (fallback) setProfile(fallback as Profile);
      } else if (data) {
        setProfile(data as Profile);
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  const handleChange = (field: keyof Profile, value: string | boolean | null) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // 1. Dipanggil saat user memilih file di input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Ukuran foto asli maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  // 2. Dipanggil ketika react-easy-crop selesai melacak koordinat
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // 3. Memotong gambar dan mengunggahnya ke Supabase
  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    showToast("success", "Memotong dan mengunggah foto profil...");

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Gagal memotong gambar.");

      const fileName = `avatar-${Date.now()}.jpg`;
      const filePath = `profile/${fileName}`;

      const { data, error } = await supabase.storage
        .from("portfolio-assets")
        .upload(filePath, croppedBlob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("portfolio-assets").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      handleChange("avatar_url", publicUrl);
      setImageSrc(null); // Tutup modal crop
      showToast("success", "Foto profil berhasil diunggah! Klik Save Changes untuk menyimpan.");
    } catch (err: any) {
      showToast("error", "Gagal crop / unggah foto: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase
      .from("profile")
      .upsert({ ...profile, id: PROFILE_ID });
    setIsSaving(false);
    if (error) {
      showToast("error", "Gagal menyimpan: " + error.message);
    } else {
      showToast("success", "Perubahan berhasil disimpan!");
    }
  };

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "R";

  return (
    <form onSubmit={handleSave} className="space-y-6 text-bone">
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

      {/* ── Modal Crop Overlay ────────────────────────────────────── */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-coal-950/90 backdrop-blur-md p-4">
          <div className="bg-coal-900 border border-coal-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-card">
            {/* Header */}
            <div className="p-4 border-b border-coal-800 flex items-center justify-between">
              <h3 className="font-semibold text-bone text-sm">Sesuaikan Foto Profil</h3>
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="w-8 h-8 rounded-lg bg-coal-950 border border-coal-800 flex items-center justify-center text-mist hover:text-bone transition"
              >
                <Icon icon="solar:close-circle-linear" className="text-lg" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative w-full aspect-square bg-coal-950">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Rasio aspek 1:1 (Square)
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className="p-5 border-t border-coal-800 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-mist font-medium font-mono">ZOOM</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-pine-400 bg-coal-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 rounded-xl border border-coal-700 text-xs font-semibold text-mist hover:bg-coal-800 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCropAndUpload}
                  disabled={isUploading}
                  className="px-5 py-2 bg-pine-400 text-coal-950 font-bold text-xs rounded-xl hover:bg-pine-300 transition flex items-center gap-1.5"
                >
                  {isUploading && <Icon icon="solar:refresh-bold" className="animate-spin" />}
                  Crop &amp; Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-bone">Content</h1>
          <p className="text-sm text-mist mt-0.5">Kelola bagian Hero &amp; About di halaman utama website kamu.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving || isLoading || isUploading}
            className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Icon icon="solar:refresh-bold" className="animate-spin" />
            ) : (
              <Icon icon="solar:diskette-bold" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading profile...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile photo */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-6 lg:col-span-1 h-fit">
            <h3 className="font-semibold text-bone text-sm mb-4">Profile Photo</h3>
            <div className="relative w-28 h-28 mx-auto mb-4 group">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile Preview"
                  className="w-full h-full rounded-2xl object-cover border border-coal-800"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-pine-500 to-pine-800 flex items-center justify-center text-white text-3xl font-semibold">
                  {initials}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-coal-950/80 rounded-2xl flex items-center justify-center text-pine-400">
                  <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border border-dashed border-coal-700 rounded-xl p-5 flex flex-col items-center justify-center text-mist hover:border-pine-400 hover:bg-coal-800/40 transition cursor-pointer disabled:opacity-50"
            >
              <Icon icon="solar:cloud-upload-linear" className="text-2xl mb-1.5" />
              <p className="text-xs text-center">
                Click to upload photo
                <br />
                <span className="text-coal-600">PNG, JPG up to 5MB</span>
              </p>
            </button>
            <div className="mt-5">
              <label className="block text-xs font-medium text-mist mb-1.5">Availability Status</label>
              <button
                type="button"
                onClick={() => handleChange("is_available", !profile.is_available)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-coal-700 bg-coal-950 hover:border-coal-600 transition"
              >
                <span className="text-sm text-bone flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${profile.is_available ? "bg-emerald-500 animate-pulse" : "bg-coal-600"}`}
                  />
                  {profile.is_available ? "Available for work" : "Not available"}
                </span>
                <span className={`text-xs font-medium ${profile.is_available ? "text-pine-400" : "text-mist"}`}>
                  {profile.is_available ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Hero & About form */}
          <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft p-6 lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-bone text-sm mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mist mb-1.5">Role / Tagline</label>
                    <input
                      type="text"
                      value={profile.role_tagline}
                      onChange={(e) => handleChange("role_tagline", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">Hero Headline</label>
                  <textarea
                    rows={2}
                    value={profile.hero_headline}
                    onChange={(e) => handleChange("hero_headline", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">About Me</label>
                  <textarea
                    rows={5}
                    value={profile.about_me}
                    onChange={(e) => handleChange("about_me", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">Resume URL / CV</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={profile.resume_url ?? ""}
                    onChange={(e) => handleChange("resume_url", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 placeholder:text-coal-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-coal-800 pt-6">
              <h3 className="font-semibold text-bone text-sm mb-4">Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: "github_url" as keyof Profile, label: "GitHub", placeholder: "https://github.com/username", icon: "mdi:github" },
                  { field: "linkedin_url" as keyof Profile, label: "LinkedIn", placeholder: "https://linkedin.com/in/username", icon: "mdi:linkedin" },
                  { field: "instagram_url" as keyof Profile, label: "Instagram", placeholder: "https://instagram.com/username", icon: "mdi:instagram" },
                  { field: "email" as keyof Profile, label: "Email", placeholder: "you@email.com", icon: "solar:letter-linear" },
                ].map(({ field, label, placeholder, icon }) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-mist mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon icon={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist text-base" />
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={(profile[field] as string) ?? ""}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 placeholder:text-coal-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
