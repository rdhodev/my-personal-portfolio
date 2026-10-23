import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
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
  authors: [{ name: "Ridho Hidayat", url: "https://haloridho.my.id" }],
  creator: "Ridho Hidayat",
  description: "Portfolio Ridho Hidayat, fullstack developer yang membangun website & aplikasi web fungsional, scalable, cepat, dan modern end-to-end.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { type: "image/png", sizes: "16x16", url: "/favicon/favicon-16x16.png" },
      { type: "image/png", sizes: "32x32", url: "/favicon/favicon-32x32.png" },
    ],
    apple: [
      { type: "image/png", sizes: "180x180", url: "/favicon/apple-touch-icon.png" },
    ],
  },
  keywords: ["Fullstack Developer", "Software Engineer", "Web Developer", "React", "Next.js", "Node.js", "Ridho Hidayat", "Portfolio"],
  metadataBase: new URL("https://haloridho.my.id"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://haloridho.my.id",
    title: "Ridho Hidayat — Fullstack Developer",
    description: "Portfolio Ridho Hidayat, fullstack developer yang membangun website & aplikasi web fungsional, scalable, cepat, dan modern end-to-end.",
    siteName: "Ridho Hidayat Portfolio",
    images: [
      {
        alt: "Ridho Hidayat Logo",
        height: 720,
        url: "/og-image.png",
        width: 1280,
      },
    ],
  },
  title: {
    default: "Ridho Hidayat — Fullstack Developer",
    template: "%s | Ridho Hidayat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ridho Hidayat — Fullstack Developer",
    description: "Portfolio Ridho Hidayat, fullstack developer yang membangun website & aplikasi web fungsional, scalable, cepat, dan modern end-to-end.",
    images: ["/og-image.png"],
    creator: "@rdhohdyat",
  },
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

