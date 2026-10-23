"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const updateHash = () => {
      setActiveHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    // Optional: observe section scroll when on homepage
    if (pathname === "/") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHash(`#${entry.target.id}`);
            }
          });
        },
        { rootMargin: "-40% 0px -50% 0px" }
      );

      const sections = document.querySelectorAll("section[id]");
      sections.forEach((sec) => observer.observe(sec));

      return () => {
        window.removeEventListener("hashchange", updateHash);
        sections.forEach((sec) => observer.unobserve(sec));
      };
    }

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  const navItems = [
    { href: "/", icon: "solar:home-2-linear", label: "Home" },
    { href: "/projects", icon: "solar:widget-4-linear", label: "Projects" },
    { href: "/#skills", icon: "solar:code-circle-linear", label: "Skills" },
    { href: "/#experience", icon: "solar:case-round-minimalistic-linear", label: "Experience" },
    { href: "/blog", icon: "solar:document-text-linear", label: "Blog" },
  ];

  const isItemActive = (href: string) => {
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      return pathname === "/" && activeHash === hash;
    }
    if (href === "/") {
      return pathname === "/" && (!activeHash || activeHash === "#hero");
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-coal-950/85 backdrop-blur-md border-b border-coal-700 font-sans">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 relative">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group">
              <Image
                src="/ridho-logo.png"
                alt="Ridho Logo"
                width={120}
                height={36}
                priority
                className="h-8 w-auto object-contain transition-opacity group-hover:opacity-85"
              />
            </Link>
          </div>

          {/* Desktop Nav (Centered absolutely or positioned in middle) */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-sans font-medium transition-colors ${active
                    ? "text-pine-400 font-semibold"
                    : "text-mist hover:text-bone"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* CTA "Let's Talk" on the right */}
          <div className="hidden md:flex items-center">
            <Link
              href="#contact"
              className="inline-flex items-center gap-1.5 bg-pine-400 text-coal-950 text-xs font-bold px-4 py-2 rounded-sm hover:bg-pine-300 transition"
            >
              <Icon icon="solar:letter-bold" />
              Let's Talk
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="brutal-btn p-1.5 rounded-sm bg-coal-900 border-2 border-coal-600 text-bone hover:border-pine-400 hover:text-pine-400 flex items-center justify-center transition-colors"
            >
              <Icon
                icon={isOpen ? "solar:close-bold" : "solar:hamburger-menu-linear"}
                className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-90 text-pine-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu Drawer with Animation */}
      {isOpen && (
        <div className="md:hidden border-b border-coal-800 bg-coal-950/98 backdrop-blur-xl px-5 pt-3 pb-6">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-sm text-xs font-mono transition-colors ${active
                    ? "text-pine-400 font-bold"
                    : "text-mist hover:text-bone hover:bg-coal-900/40"
                    }`}
                >
                  <Icon
                    icon={item.icon}
                    className={`text-base ${active ? "text-pine-400" : "text-mist"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-coal-800">
            <Link
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="brutal-btn flex items-center justify-center gap-2 bg-pine-400 text-coal-950 text-xs font-bold py-2.5 px-4 rounded-sm hover:bg-pine-300 w-full"
            >
              <Icon icon="solar:letter-bold" className="text-sm" />
              Let's Talk
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
