"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-coal-950 flex flex-col items-center justify-center text-center px-5">
      <Icon icon="solar:danger-circle-bold-duotone" className="text-pine-400 text-6xl mb-4" />
      <h1 className="text-2xl font-bold text-bone mb-2">Artikel Tidak Ditemukan</h1>
      <p className="text-mist text-sm mb-6">
        Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.
      </p>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 bg-pine-400 text-coal-950 text-xs font-bold px-5 py-2.5 rounded-sm hover:bg-pine-300 transition"
      >
        <Icon icon="solar:arrow-left-linear" /> Kembali ke Blog
      </Link>
    </div>
  );
}
