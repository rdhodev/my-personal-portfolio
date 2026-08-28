"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/register";

  if (isAuthPage) {
    return <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans">{children}</div>;
  }

  const menuItems = [
    {
      icon: "solar:widget-5-bold-duotone",
      name: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: "solar:document-text-bold-duotone",
      name: "Content",
      path: "/admin/profile",
    },
    {
      icon: "solar:widget-2-bold-duotone",
      name: "Skills",
      path: "/admin/skills",
    },
    {
      icon: "solar:diploma-verified-bold-duotone",
      name: "Certificates",
      path: "/admin/certificates",
    },
    {
      icon: "solar:case-round-minimalistic-bold-duotone",
      name: "Experience",
      path: "/admin/experience",
    },
    {
      icon: "solar:gallery-wide-bold-duotone",
      name: "Projects",
      path: "/admin/projects",
    },
    {
      icon: "solar:box-bold-duotone",
      name: "Services",
      path: "/admin/services",
    },
    {
      icon: "solar:notebook-bold-duotone",
      name: "Blog",
      path: "/admin/blog",
    },
    {
      icon: "solar:settings-bold-duotone",
      name: "Settings",
      path: "/admin/settings",
    },
  ];

  const getPageTitle = () => {
    const activeItem = menuItems.find((item) => pathname.startsWith(item.path));
    return activeItem ? activeItem.name : "Admin Panel";
  };

  return (
    <div className="min-h-screen bg-coal-950 flex font-sans text-bone">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-coal-900 border-r border-coal-800 min-h-screen py-5 px-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-pine-600 flex items-center justify-center">
            <Icon icon="solar:user-id-bold" className="text-white text-lg" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm text-bone">Portfolio</p>
            <p className="text-[11px] text-mist -mt-0.5">Content Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-coal-500 uppercase tracking-wider mb-1.5">
            Main
          </p>
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${pathname === "/admin/dashboard"
              ? "bg-coal-800 text-pine-400"
              : "text-mist hover:bg-coal-800/50 hover:text-bone"
              }`}
          >
            <Icon icon="solar:widget-5-bold-duotone" className="text-lg" />
            Dashboard
          </Link>

          <p className="px-3 text-[10px] font-semibold text-coal-500 uppercase tracking-wider mb-1.5 mt-4">
            Manage
          </p>
          {menuItems.slice(1, 8).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${pathname.startsWith(item.path)
                ? "bg-coal-800 text-pine-400"
                : "text-mist hover:bg-coal-800/50 hover:text-bone"
                }`}
            >
              <Icon icon={item.icon} className="text-lg" />
              {item.name}
            </Link>
          ))}

          <p className="px-3 text-[10px] font-semibold text-coal-500 uppercase tracking-wider mb-1.5 mt-4">
            Account
          </p>
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${pathname.startsWith("/admin/settings")
              ? "bg-coal-800 text-pine-400"
              : "text-mist hover:bg-coal-800/50 hover:text-bone"
              }`}
          >
            <Icon icon="solar:settings-bold-duotone" className="text-lg" />
            Settings
          </Link>
        </nav>

        <div className="pt-4 border-t border-coal-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-pine-400 hover:bg-coal-800 transition"
          >
            <Icon icon="solar:global-linear" className="text-lg" />
            View Live Site
          </Link>
          <button
            onClick={() => {
              window.location.href = "/api/admin/logout";
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-mist hover:bg-coal-800 hover:text-red-400 transition text-left"
          >
            <Icon icon="solar:logout-3-bold-duotone" className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Sidebar for Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-60 z-50 bg-coal-900 border-r border-coal-800 py-5 px-4 transition-transform md:hidden ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pine-600 flex items-center justify-center">
              <Icon icon="solar:user-id-bold" className="text-white text-lg" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm text-bone">Portfolio</p>
              <p className="text-[11px] text-mist -mt-0.5">Content Admin</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-mist hover:text-bone"
          >
            <Icon icon="solar:close-square-linear" className="text-xl" />
          </button>
        </div>

        <nav className="flex-grow space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${pathname.startsWith(item.path)
                ? "bg-coal-800 text-pine-400"
                : "text-mist hover:bg-coal-800/50 hover:text-bone"
                }`}
            >
              <Icon icon={item.icon} className="text-lg" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-coal-950/90 backdrop-blur border-b border-coal-800 px-5 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-coal-900 border border-coal-800 flex items-center justify-center hover:bg-coal-800"
            >
              <Icon icon="solar:hamburger-menu-linear" className="text-lg text-mist" />
            </button>
            <h2 className="font-semibold text-bone text-base md:text-lg">
              {getPageTitle()}
            </h2>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Icon
                icon="solar:magnifer-linear"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mist"
              />
              <input
                type="text"
                placeholder="Search content..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-coal-900 border border-coal-800 text-sm text-bone focus:outline-none focus:ring-2 focus:ring-pine-500/20 placeholder:text-coal-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-coal-900 border border-coal-800 flex items-center justify-center hover:bg-coal-800">
              <Icon icon="solar:bell-bold-duotone" className="text-lg text-mist" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-coal-800 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-pine-900 flex items-center justify-center text-pine-300 text-xs font-semibold">
                R
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-sm font-medium text-bone">Ridho</p>
                <p className="text-[11px] text-mist -mt-0.5">Owner</p>
              </div>
              <Icon icon="solar:alt-arrow-down-linear" className="hidden md:block text-mist text-sm" />
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8 flex-1 bg-coal-950">{children}</main>
      </div>
    </div>
  );
}
