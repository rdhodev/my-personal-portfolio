"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setError("");

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (cleaned && index === 5) {
      const fullOtp = [...newDigits.slice(0, 5), cleaned].join("");
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otp: string) => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verifikasi gagal.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    handleVerify(otp);
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");

    try {
      // Redirect back to login to re-trigger OTP flow
      router.push("/admin/login?resend=true");
    } finally {
      setIsResending(false);
      setCountdown(60);
    }
  };

  return (
    <section className="min-h-screen bg-coal-950 flex items-center justify-center px-4 py-10 text-bone">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-pine-600 flex items-center justify-center shadow-soft mb-3 relative">
            <Icon icon="solar:letter-bold" className="text-white text-2xl" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pine-400 rounded-full flex items-center justify-center">
              <Icon icon="solar:lock-bold" className="text-coal-950 text-[10px]" />
            </span>
          </div>
          <h1 className="font-semibold text-lg text-bone font-sans">Verifikasi Email</h1>
        </div>

        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-card p-7">
          <h2 className="text-xl font-semibold text-bone mb-1">Cek email kamu</h2>
          <p className="text-sm text-mist mb-6">
            Kode OTP 6 digit telah dikirim ke{" "}
            <span className="text-pine-400 font-medium">
              {process.env.NEXT_PUBLIC_ADMIN_EMAIL_MASKED || "email kamu"}
            </span>
            . Berlaku <span className="text-bone font-medium">5 menit</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Input Boxes */}
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className={`w-full aspect-square text-center text-xl font-bold rounded-xl border bg-coal-950 text-bone focus:outline-none focus:ring-2 transition
                    ${digit ? "border-pine-500 ring-pine-500/20" : "border-coal-700"}
                    ${isLoading ? "opacity-50 cursor-not-allowed" : "focus:ring-pine-500/20 focus:border-pine-500"}
                  `}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <Icon icon="solar:danger-circle-bold" className="text-sm shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || digits.join("").length < 6}
              className="w-full py-2.5 rounded-xl bg-pine-400 text-coal-950 font-bold text-sm shadow-soft hover:bg-pine-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon icon="solar:spinner-bold" className="animate-spin text-base" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <Icon icon="solar:shield-check-bold" className="text-base" />
                  Verifikasi
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 pt-4 border-t border-coal-800 text-center">
            <p className="text-xs text-mist mb-2">Tidak menerima kode?</p>
            {countdown > 0 ? (
              <p className="text-xs text-coal-500">
                Kirim ulang dalam <span className="text-bone font-medium">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-xs font-medium text-pine-400 hover:text-pine-300 transition disabled:opacity-50"
              >
                {isResending ? "Mengirim..." : "Kirim ulang OTP"}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-1.5 text-xs text-coal-500 hover:text-mist transition mx-auto mt-5"
        >
          <Icon icon="solar:arrow-left-linear" />
          Kembali ke halaman login
        </button>
      </div>
    </section>
  );
}
