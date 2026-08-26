"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/dashboard");
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
                  defaultValue="ridho@email.com"
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
                  defaultValue="123456"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-coal-700 bg-coal-950 text-bone text-sm focus:outline-none focus:ring-2 focus:ring-pine-500/20 focus:border-pine-500 placeholder:text-coal-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 text-mist text-xs">
                <input type="checkbox" className="rounded border-coal-700 bg-coal-950 text-pine-600 focus:ring-pine-500/20" />
                Remember me
              </label>
              <a href="#" className="text-xs font-medium text-pine-400 hover:text-pine-300">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-pine-400 text-coal-950 font-bold text-sm shadow-soft hover:bg-pine-300 transition"
            >
              Login
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
