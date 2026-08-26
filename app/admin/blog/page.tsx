"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  gradient: string;
  read_time: string;
  views: number;
  created_at: string;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (!error && data) setPosts(data as Post[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      showToast("error", error.message);
    } else {
      showToast("success", "Post dihapus!");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
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
          <h1 className="text-xl font-semibold text-bone">Blog</h1>
          <p className="text-sm text-mist mt-0.5">Kelola tulisan dan artikel blog portfolio Anda.</p>
        </div>
        <button
          onClick={() => router.push("/admin/blog/new")}
          className="inline-flex items-center gap-2 bg-pine-400 text-coal-950 text-sm font-bold px-4 py-2.5 rounded-xl shadow-soft hover:bg-pine-300 transition w-fit"
        >
          <Icon icon="solar:add-circle-bold" /> Write Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-mist gap-3">
          <Icon icon="solar:refresh-bold" className="text-2xl animate-spin" />
          <span className="text-sm">Loading posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-coal-700 rounded-2xl text-mist text-sm">
          <Icon icon="solar:notebook-bold-duotone" className="text-3xl mx-auto mb-2 text-coal-600" />
          Belum ada artikel.{" "}
          <button onClick={() => router.push("/admin/blog/new")} className="text-pine-400 hover:text-pine-300">
            Tulis sekarang →
          </button>
        </div>
      ) : (
        <div className="bg-coal-900 border border-coal-800 rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mist text-xs" style={{ borderBottom: "1px solid #101410", backgroundColor: "rgba(5,7,5,0.5)" }}>
                  <th className="font-medium px-5 py-3">Title</th>
                  <th className="font-medium px-5 py-3">Category</th>
                  <th className="font-medium px-5 py-3">Date</th>
                  <th className="font-medium px-5 py-3">Views</th>
                  <th className="font-medium px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-coal-800/40 transition" style={{ borderBottom: "1px solid #101410" }}>
                    <td className="px-5 py-3.5 font-medium text-bone max-w-xs truncate">{post.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-pine-900/30 text-pine-400 border border-pine-800">{post.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-mist">{post.date}</td>
                    <td className="px-5 py-3.5 text-mist">
                      <span className="flex items-center gap-1"><Icon icon="solar:eye-linear" /> {post.views}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button onClick={() => router.push(`/admin/blog/edit/${post.id}`)} className="text-mist hover:text-pine-400 transition">
                        <Icon icon="solar:pen-linear" className="text-lg inline" />
                      </button>
                      <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id} className="text-mist hover:text-red-400 transition">
                        {deleting === post.id ? <Icon icon="solar:refresh-bold" className="animate-spin text-lg inline" /> : <Icon icon="solar:trash-bin-trash-linear" className="text-lg inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
