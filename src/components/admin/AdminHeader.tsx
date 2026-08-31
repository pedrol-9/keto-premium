"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

interface AdminHeaderProps {
  storeStatus: "open" | "closed";
  onToggleStoreStatus: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  storeStatus,
  onToggleStoreStatus,
  onLogout,
}: AdminHeaderProps) {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
      <div className="flex justify-between items-center px-2 xs:px-4 sm:px-6 md:px-16 h-20 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <BrandLogo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center h-full self-stretch">
          <Link
            href="/"
            className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all"
          >
            Menu
          </Link>
          <Link
            href="/cart"
            className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all"
          >
            Cart
          </Link>
          <Link
            href="/admin/dashboard"
            className="h-full flex items-center text-primary font-bold border-b-2 border-primary active:scale-95 transition-all"
          >
            Admin
          </Link>
        </nav>

        {/* Settings + Logout */}
        <div className="flex items-center gap-2">
          {/* Settings Menu Dropdown */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setShowSettingsMenu((v) => !v)}
              aria-label="Configuración"
              className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all duration-200 ${
                showSettingsMenu
                  ? "bg-primary text-on-primary border-primary shadow-md shadow-primary/30"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                  showSettingsMenu ? "rotate-90" : ""
                }`}
              >
                settings
              </span>
              <span
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-container-lowest transition-colors ${
                  storeStatus === "open" ? "bg-primary" : "bg-error"
                }`}
              />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-12 z-50 w-64 bg-surface-container-lowest rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] border border-outline-variant/10 overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">tune</span>
                  <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                    Configuración
                  </span>
                </div>

                <div className="px-4 py-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-sans font-semibold text-sm text-on-surface">Estado de la tienda</span>
                    <span
                      className={`font-sans text-xs mt-0.5 font-medium ${
                        storeStatus === "open" ? "text-primary" : "text-error"
                      }`}
                    >
                      {storeStatus === "open" ? "● Abierta ahora" : "● Cerrada ahora"}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={storeStatus === "open"}
                      onChange={onToggleStoreStatus}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-surface-container-low border border-transparent hover:border-outline-variant/20"
            title="Cerrar Sesión"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
