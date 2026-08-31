"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase, isConfigured } from "@/lib/supabase";
import { Language, TRANSLATIONS } from "@/locales";
import BrandLogo from "@/components/BrandLogo";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
  const [cartLength, setCartLength] = useState<number>(0);
  const [language, setLanguage] = useState<Language>("es");

  // ── Secret admin easter egg ──────────────────────────────────────────────
  const SECRET_TAPS = 12;
  const TAP_RESET_MS = 3000; // reset tap count if idle for 3 s
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBadgeTap = useCallback(() => {
    tapCountRef.current += 1;

    // Reset the idle timer on every tap
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, TAP_RESET_MS);

    if (tapCountRef.current >= SECRET_TAPS) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      router.push("/admin");
    }
  }, [router]);
  // ────────────────────────────────────────────────────────────────────────

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
        } catch {
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
    let channel: ReturnType<typeof supabase.channel> | null = null;
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
    <>
      <header className="fixed top-0 w-full max-w-full z-50 bg-gradient-to-r from-emerald-100/90 via-white/80 to-amber-100/80 backdrop-blur-md shadow-sm border-b border-emerald-200/30 overflow-hidden">
        <div className="flex justify-between items-center px-2 xs:px-4 sm:px-6 md:px-16 h-20 max-w-7xl mx-auto w-full">
          {/* Logo / Headline */}
          <div className="flex items-center min-w-0">
            <BrandLogo />
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
          </nav>

          {/* Indicators and Language Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Store Status Indicator — secret 12-tap easter egg para acceso admin */}
            <div
              role="status"
              aria-label={storeStatus === "closed" ? t.closed : t.open}
              onClick={handleBadgeTap}
              className={`font-sans font-semibold text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 cursor-default select-none transition-transform active:scale-95 ${
                storeStatus === "closed"
                  ? "bg-error-container text-on-error-container"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              <span
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors shrink-0 ${
                  storeStatus === "closed" ? "bg-error" : "bg-primary"
                }`}
              ></span>
              <span className="whitespace-nowrap">{storeStatus === "closed" ? t.closed : t.open}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Language Switcher */}
      <button
        onClick={toggleLanguage}
        className="fixed bottom-24 md:bottom-8 right-3 md:right-8 z-[100] font-sans font-semibold text-xs sm:text-sm hover:opacity-90 transition-all active:scale-95 px-3.5 py-2 sm:py-2.5 rounded-full border border-outline-variant/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-1.5 bg-surface/85 backdrop-blur-xl text-on-surface-variant max-w-[calc(100vw-1.5rem)]"
        aria-label="Switch language"
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">language</span>
        <span className="flex items-center gap-1">
          <span className={language === "es" ? "text-primary font-bold" : "opacity-70"}>ES</span>
          <span className="opacity-30">|</span>
          <span className={language === "en" ? "text-primary font-bold" : "opacity-70"}>EN</span>
        </span>
      </button>
    </>
  );
}
