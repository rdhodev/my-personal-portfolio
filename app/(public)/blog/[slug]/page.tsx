import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Ekstrak URL gambar pertama dari konten HTML Tiptap */
function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

/** Hapus semua tag HTML dari string */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, content, category, date, gradient")
    .eq("slug", slug)
    .single();

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan",
      description: "Artikel yang Anda cari tidak tersedia.",
    };
  }

  const coverImage = extractFirstImage(post.content);
  const plainExcerpt = post.excerpt || stripHtml(post.content).slice(0, 160);
  const pageUrl = `https://haloridho.my.id/blog/${slug}`;

  return {
    title: post.title,
    description: plainExcerpt,
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: pageUrl,
      title: post.title,
      description: plainExcerpt,
      siteName: "Ridho Hidayat Portfolio",
      ...(coverImage
        ? {
            images: [
              {
                url: coverImage,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
          }
        : {
            images: [
              {
                url: "/og-image.png",
                width: 1280,
                height: 720,
                alt: post.title,
              },
            ],
          }),
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: plainExcerpt,
      images: coverImage ? [coverImage] : ["/og-image.png"],
      creator: "@rdhohdyat",
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: post, error } = await supabase
    .from("posts")
    .select("title, excerpt, content, date, category, gradient, readTime:read_time, views, slug")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
