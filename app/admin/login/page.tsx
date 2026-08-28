"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal. Coba lagi.");
        return;
      }

      if (data.requireOtp) {
        // Redirect to OTP verification page
        router.push("/admin/verify-otp");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Periksa koneksi internet kamu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-coal-950 flex items-center justify-center px-4 py-10 text-bone">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pine-600 flex items-center justify-center shadow-soft mb-3">
            <Icon icon="solar:user-id-bold" className="text-white text-2xl" />
          </div>
          <h1 className="font-semibold text-lg text-bone font-sans">Portfolio Admin</h1>
        </div>

        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-card p-7">
          <h2 className="text-xl font-semibold text-bone mb-1">Welcome back</h2>
          <p className="text-sm text-mist mb-6">Masuk untuk mengelola konten portfolio kamu.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-mist mb-1.5">Email</label>
              <div className="relative">
                <Icon icon="solar:letter-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 placeholder:text-coal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-mist mb-1.5">Password</label>
              <div className="relative">
                <Icon icon="solar:lock-password-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 placeholder:text-coal-700"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <Icon icon="solar:danger-circle-bold" className="text-sm shrink-0" />
                {error}
              </div>
            )}

            {/* Info — OTP step */}
            {!error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-pine-500/10 border border-pine-500/20 text-pine-400 text-xs">
                <Icon icon="solar:info-circle-bold" className="text-sm shrink-0 mt-0.5" />
                Setelah login, kode OTP akan dikirim ke email kamu untuk verifikasi.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-pine-400 text-coal-950 font-bold text-sm shadow-soft hover:bg-pine-300 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon icon="solar:spinner-bold" className="animate-spin text-base" />
                  Mengirim OTP...
                </>
              ) : (
                <>
                  <Icon icon="solar:arrow-right-bold" className="text-base" />
                  Lanjutkan
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-coal-500 mt-6">
          Akses terbatas hanya untuk administrator utama.
        </p>
      </div>
    </section>
  );
}
