import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://haloridho.my.id"),
  title: {
    default: "Ridho Hidayat — Fullstack Developer",
    template: "%s | Ridho Hidayat",
  },
  description: "Portfolio Ridho Hidayat, fullstack developer yang membangun website & aplikasi web fungsional, scalable, cepat, dan modern end-to-end.",
  keywords: ["Fullstack Developer", "Software Engineer", "Web Developer", "React", "Next.js", "Node.js", "Ridho Hidayat", "Portfolio"],
  authors: [{ name: "Ridho Hidayat", url: "https://haloridho.my.id" }],
  creator: "Ridho Hidayat",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://haloridho.my.id",
    title: "Ridho Hidayat — Fullstack Developer",
    description: "Portfolio Ridho Hidayat, fullstack developer yang membangun website & aplikasi web fungsional, scalable, cepat, dan modern end-to-end.",
    siteName: "Ridho Hidayat Portfolio",
    images: [
      {
        url: "/ridho-logo2.png",
        width: 1280,
        height: 720,
        alt: "Ridho Hidayat Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ridho Hidayat — Fullstack Developer",
    description: "Portfolio Ridho Hidayat, fullstack developer yang membangun website & aplikasi web fungsional, scalable, cepat, dan modern end-to-end.",
    images: ["/ridho-logo2.png"],
    creator: "@rdhohdyat",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

