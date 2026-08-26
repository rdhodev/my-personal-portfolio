import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-coal-950 border-t border-coal-700 py-8 font-sans">
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-mist">
          &copy; {new Date().getFullYear()} Ridho Hidayat. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mist hover:text-pine-400 transition"
          >
            <Icon icon="mdi:github" className="text-xl" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mist hover:text-pine-400 transition"
          >
            <Icon icon="mdi:linkedin" className="text-xl" />
          </a>
          <a
            href="mailto:hello@example.com"
            className="text-mist hover:text-pine-400 transition"
          >
            <Icon icon="solar:letter-linear" className="text-xl" />
          </a>
        </div>
      </div>
    </footer>
  );
}
