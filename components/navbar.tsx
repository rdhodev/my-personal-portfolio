"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-coal-950/85 backdrop-blur-md border-b border-coal-700 font-sans">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-semibold text-lg text-bone tracking-tight font-display">
                Ridho<span className="text-pine-400">.dev</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav (Centered absolutely or positioned in middle) */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="text-sm font-medium text-mist hover:text-bone transition"
            >
              Home
            </Link>
            <Link
              href="/projects"
              className="text-sm font-medium text-mist hover:text-bone transition"
            >
              Projects
            </Link>
            <Link
              href="/#skills"
              className="text-sm font-medium text-mist hover:text-bone transition"
            >
              Skills
            </Link>
            <Link
              href="/#experience"
              className="text-sm font-medium text-mist hover:text-bone transition"
            >
              Experience
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-mist hover:text-bone transition"
            >
              Blog
            </Link>
          </div>

          {/* CTA "Let's Talk" on the right */}
          <div className="hidden md:flex items-center">
            <Link
              href="#contact"
              className="inline-flex items-center gap-1.5 bg-pine-400 text-coal-950 text-xs font-bold px-4 py-2 rounded-full hover:bg-pine-300 transition"
            >
              <Icon icon="solar:letter-linear" />
              Let's Talk
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg border border-coal-600 text-mist hover:text-bone"
            >
              <Icon icon={isOpen ? "solar:close-square-linear" : "solar:hamburger-menu-linear"} className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-coal-700 bg-coal-950 px-5 py-3 space-y-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-mist hover:text-bone"
          >
            Home
          </Link>
          <Link
            href="/projects"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-mist hover:text-bone"
          >
            Projects
          </Link>
          <Link
            href="/#skills"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-mist hover:text-bone"
          >
            Skills
          </Link>
          <Link
            href="/#experience"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-mist hover:text-bone"
          >
            Experience
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-mist hover:text-bone"
          >
            Blog
          </Link>
        </div>
      )}
    </nav>
  );
}
