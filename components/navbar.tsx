"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    // Sync hash on mount and hashchange
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
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-14 relative">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-semibold text-base text-bone tracking-tight font-display">
                Ridho<span className="text-pine-400">.dev</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav (Centered absolutely or positioned in middle) */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-xs font-mono font-medium px-3 py-1.5 rounded-sm transition-all ${active
                    ? "text-pine-400 bg-coal-900 border border-pine-800/80 shadow-[2px_2px_0px_#1F7A4C]"
                    : "text-mist hover:text-bone hover:bg-coal-900/50"
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
              <Icon icon="solar:letter-linear" />
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
        <div className="md:hidden border-b-2 border-coal-700 bg-coal-950/98 backdrop-blur-xl px-5 pt-3 pb-6 shadow-[0_8px_0px_#000000]">
          {/* Header indicator */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-coal-800">
            <span className="font-mono text-[10px] text-mist/60 uppercase tracking-widest">// Navigation</span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between py-2.5 px-3 rounded-sm text-xs font-mono font-medium border transition-all ${active
                    ? "text-pine-300 bg-coal-900 border-pine-500 shadow-[3px_3px_0px_#1F7A4C]"
                    : "text-mist hover:text-bone hover:bg-coal-900 border-transparent hover:border-coal-700 hover:shadow-[2px_2px_0px_#000000]"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      icon={item.icon}
                      className={`text-sm transition-colors ${active ? "text-pine-400" : "text-mist group-hover:text-pine-400"
                        }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {active ? (
                    <span className="font-mono text-[10px] text-pine-400 font-bold bg-coal-950 px-1.5 py-0.5 rounded-sm border border-pine-800">
                      ACTIVE
                    </span>
                  ) : (
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="text-xs opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-pine-400 transition-all"
                    />
                  )}
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
