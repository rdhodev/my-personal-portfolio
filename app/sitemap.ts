import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://haloridho.my.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic blog post routes from Supabase
  let blogRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, date")
      .order("date", { ascending: false });

    if (!error && posts) {
      blogRoutes = posts.map((post) => {
        const parsedDate = post.date ? new Date(post.date) : null;
        const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
        return {
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: isValidDate ? parsedDate : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });
    }
  } catch (err) {
    console.error("Sitemap: Failed to fetch blog posts from Supabase:", err);
  }

  return [...staticRoutes, ...blogRoutes];
}
