"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase, isConfigured } from "@/lib/supabase";
import { Language, TRANSLATIONS } from "@/locales";

export default function Header() {
  const pathname = usePathname();
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
  const [cartLength, setCartLength] = useState<number>(0);
  const [language, setLanguage] = useState<Language>("es");

  const t = TRANSLATIONS[language];

  const toggleLanguage = () => {
    const nextLang: Language = language === "es" ? "en" : "es";
    setLanguage(nextLang);
    localStorage.setItem("kb_lang", nextLang);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      // Sync store status
      const savedStatus = localStorage.getItem("kb_store_status") as "open" | "closed";
      if (savedStatus) {
        setStoreStatus(savedStatus);
      }

      // Sync cart length
      const savedCart = localStorage.getItem("kb_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart) as string[];
          setCartLength(parsed.length);
        } catch (e) {
          setCartLength(0);
        }
      } else {
        setCartLength(0);
      }

      // Sync language
      const savedLang = localStorage.getItem("kb_lang") as Language;
      if (savedLang) {
        setLanguage(savedLang);
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    // Fetch store status from Supabase
    const fetchStoreStatus = async () => {
      if (!isConfigured) return;
      try {
        const { data, error } = await supabase
          .from("config")
          .select("value")
          .eq("key", "store_status")
          .single();
        if (data && !error) {
          setStoreStatus(data.value as "open" | "closed");
          localStorage.setItem("kb_store_status", data.value);
        }
      } catch (e) {
        console.error("Error fetching store status from Supabase:", e);
      }
    };

    fetchStoreStatus();

    // Set up real-time subscription for store status
    let channel: any;
    if (isConfigured) {
      channel = supabase
        .channel("header_store_status")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "config",
            filter: "key=eq.store_status",
          },
          (payload) => {
            const newValue = (payload.new as { value: string }).value;
            setStoreStatus(newValue as "open" | "closed");
            localStorage.setItem("kb_store_status", newValue);
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const isMenu = pathname === "/";
  const isCart = pathname === "/cart";

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-16 h-20 max-w-7xl mx-auto">
        {/* Logo / Headline */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link href="/" className="flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all">
            <img src="/logo_sin_fondo.png" alt="KetoBoutique Logo" className="w-24 h-24 sm:w-[90px] sm:h-[90px] object-contain" />
            <h1 className="font-display font-bold tracking-tighter text-primary text-xl sm:text-2xl md:text-3xl">
              KetoBoutique
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8 items-center h-full self-stretch">
          <Link
            href="/"
            className={`h-full flex items-center transition-all ${
              isMenu
                ? "text-primary font-bold border-b-2 border-primary active:scale-95"
                : "text-on-surface-variant hover:opacity-80 active:scale-95"
            }`}
          >
            {t.menu}
          </Link>
          <Link
            href="/cart"
            className={`h-full flex items-center transition-all relative ${
              isCart
                ? "text-primary font-bold border-b-2 border-primary active:scale-95"
                : "text-on-surface-variant hover:opacity-80 active:scale-95"
            }`}
          >
            <span>{t.cart}</span>
            {cartLength > 0 && (
              <span className="ml-1.5 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cartLength}
              </span>
            )}
          </Link>
          <Link
            href="/admin"
            className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all"
          >
            {t.admin}
          </Link>
        </nav>

        {/* Indicators and Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            className="font-sans font-semibold text-xs sm:text-sm hover:bg-surface-container-high transition-all active:scale-95 px-3 py-1.5 sm:py-2 rounded-full border border-outline-variant/30 flex items-center gap-1 bg-surface-container-low text-on-surface-variant"
            aria-label="Switch language"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">language</span>
            <span className="flex items-center gap-0.5">
              <span className={language === "es" ? "text-primary font-bold" : "opacity-60"}>ES</span>
              <span className="opacity-30">|</span>
              <span className={language === "en" ? "text-primary font-bold" : "opacity-60"}>EN</span>
            </span>
          </button>

          {/* Store Status Indicator (Read-Only) */}
          <div
            className={`font-sans font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 cursor-default select-none ${
              storeStatus === "closed"
                ? "bg-error-container text-on-error-container"
                : "bg-secondary-container text-on-secondary-container"
            }`}
          >
            <span
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors ${
                storeStatus === "closed" ? "bg-error" : "bg-primary"
              }`}
            ></span>
            <span>{storeStatus === "closed" ? t.closed : t.open}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
