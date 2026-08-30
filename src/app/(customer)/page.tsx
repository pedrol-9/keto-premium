"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/products";
import { Product } from "@/types";
import { supabase, isConfigured } from "@/lib/supabase";
import { Language, TRANSLATIONS } from "@/locales";

export default function Home() {
    const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
    const [cart, setCart] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("Todos");
    const [successItem, setSuccessItem] = useState<string | null>(null);
    const [dismissedClosedOverlay, setDismissedClosedOverlay] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeImage, setActiveImage] = useState<string>("");
    const [language, setLanguage] = useState<Language>("es");

    const t = TRANSLATIONS[language];

    const openProductModal = (product: Product) => {
      setSelectedProduct(product);
      setActiveImage(product.image);
    };

  // Listen to Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Load state from localStorage on mount and sync on storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const savedStatus = localStorage.getItem("kb_store_status") as "open" | "closed";
      if (savedStatus) {
        setStoreStatus(savedStatus);
      }
      const savedCart = localStorage.getItem("kb_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCart([]);
      }
      const savedLang = localStorage.getItem("kb_lang") as Language;
      if (savedLang) {
        setLanguage(savedLang);
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    // Supabase store status fetch
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
        }
      } catch (e) {
        console.error("Error fetching store status from Supabase:", e);
      }
    };

    const incrementVisits = async () => {
      if (!isConfigured) return;
      if (sessionStorage.getItem("kb_visit_counted")) return;
      try {
        const { data } = await supabase
          .from("config")
          .select("value")
          .eq("key", "total_visits")
          .single();
        const currentVisits = data ? parseInt(data.value, 10) : 0;
        await supabase
          .from("config")
          .update({ value: (currentVisits + 1).toString() })
          .eq("key", "total_visits");
        sessionStorage.setItem("kb_visit_counted", "true");
      } catch (e) {
        console.error("Error incrementing visits in Supabase:", e);
      }
    };

    fetchStoreStatus();
    incrementVisits();

    // Set up real-time subscription for store status
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (isConfigured) {
      channel = supabase
        .channel("store_status_changes")
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

  const addToCart = (itemName: string) => {
    const nextCart = [...cart, itemName];
    setCart(nextCart);
    localStorage.setItem("kb_cart", JSON.stringify(nextCart));

    // Show checkmark animation for the item
    setSuccessItem(itemName);
    setTimeout(() => {
      setSuccessItem(null);
    }, 1000);
  };

  // Filter items based on selected category
  const filteredItems = PRODUCTS.filter((item) => {
    if (activeCategory === "Todos") return true;
    return item.tags.includes(activeCategory);
  });

  const formatCOP = (num: number) => {
    return `$${num.toLocaleString("es-CO")} COP`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-sans antialiased selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">

      {/* Ambient Joyful & Vital Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-amber-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-teal-400/8 rounded-full blur-[100px]" />
      </div>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto pt-28 pb-32 px-6 md:px-16 flex-1 w-full relative z-10">
        {/* Hero Section */}
        <section className="mb-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 flex flex-col gap-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold w-fit mx-auto md:mx-0 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Boutique Keto Cuisine
            </div>
            <p className="font-serif italic text-xl md:text-2xl font-semibold tracking-wide bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
              &ldquo;{t.slogan}&rdquo;
            </p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-on-surface leading-tight tracking-tight">
              {t.heroTitle}
            </h2>
            <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-md mx-auto md:mx-0 leading-relaxed">
              {t.heroDesc}
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div
              className="w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-[0px_16px_40px_rgba(5,150,105,0.08)] relative bg-surface-container-high bg-cover bg-center ring-1 ring-emerald-500/10"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYpKpJ4awhfJ-3cCrh5KH1lOvl7oy9I-qWEMyzbviFnD6y90O6-MRcBkTCyZWwvS_OxEofMqxIftwxFET_6GOL9kd1FP-_KItAa9igbQGgpwRkNtV8zoIwRYfNo1pfKhtfVFfDUDm6oqCxHcG_1w2dHQkvBf5ap9ennqYF9_uGFR_fAO9P12NGpP5p80aHRnBoikcWkIrfhNdU3ibwd_NRKNPd0Kblgrfj6huRYExGVVRYpscAoHrEe3MwSdr_ddEA2-CkhbS05Te6')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Nutrition Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveCategory("Todos")}
            className={`px-5 py-2.5 rounded-full font-sans font-bold text-sm whitespace-nowrap transition-all ${
              activeCategory === "Todos"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/15"
            }`}
          >
            {t.categoryAll}
          </button>
          <button
            onClick={() => setActiveCategory("Keto")}
            className={`px-5 py-2.5 rounded-full font-sans font-bold text-sm whitespace-nowrap transition-all border ${
              activeCategory === "Keto"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 border-transparent"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400"
            }`}
          >
            🥑 Keto
          </button>
          <button
            onClick={() => setActiveCategory("Alto Proteína")}
            className={`px-5 py-2.5 rounded-full font-sans font-bold text-sm whitespace-nowrap transition-all border ${
              activeCategory === "Alto Proteína"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 border-transparent"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400"
            }`}
          >
            ⚡ {t.categoryHighProtein}
          </button>
          <button
            onClick={() => setActiveCategory("Premium")}
            className={`px-5 py-2.5 rounded-full font-sans font-bold text-sm whitespace-nowrap transition-all border ${
              activeCategory === "Premium"
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20 border-transparent"
                : "bg-teal-50 text-teal-800 border-teal-200 hover:border-teal-400"
            }`}
          >
            ✨ {t.categoryPremium}
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              onClick={() => openProductModal(item)}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_6px_24px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0px_12px_32px_rgba(5,150,105,0.08)] transition-all duration-300 flex flex-col border border-emerald-500/10 cursor-pointer group"
            >
              {/* Product Image */}
              <div className="aspect-[4/5] rounded-xl overflow-hidden mb-6 bg-surface-container-high relative">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.image}
                  alt={language === "en" ? item.nameEn : item.name}
                />
                <span className="absolute top-3.5 left-3.5 bg-surface-container-lowest/95 backdrop-blur-md text-emerald-700 border border-emerald-500/15 font-sans font-bold text-xs px-3.5 py-1 rounded-full shadow-xs">
                  {language === "en" ? item.tagsEn[0] : item.tags[0] || "Keto"}
                </span>
              </div>
              
              {/* Title & Description */}
              <h3 className="font-display font-bold text-xl text-on-surface mb-2 group-hover:text-primary transition-colors">
                {language === "en" ? item.nameEn : item.name}
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed flex-grow mb-6 line-clamp-2">
                {language === "en" ? item.descriptionEn : item.description}
              </p>
              
              {/* Price and Add button */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-emerald-500/10">
                <span className="font-display font-extrabold text-xl bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  {formatCOP(item.price)}
                </span>
                <button
                  aria-label="Add to cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item.name);
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm text-white ${
                    successItem === item.name
                      ? "bg-emerald-500 scale-105"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-600/20"
                  }`}
                >
                  <span className="material-symbols-outlined font-bold">
                    {successItem === item.name ? "check" : "add"}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Brand Philosophy Banner */}
        <section className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/5 via-amber-500/5 to-teal-500/5 border border-emerald-500/15 text-center relative overflow-hidden shadow-xs">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-1">
              <span className="material-symbols-outlined text-2xl">
                spa
              </span>
            </div>
            <p className="font-serif italic text-2xl sm:text-3xl text-on-surface font-bold tracking-wide">
              &ldquo;{t.slogan}&rdquo;
            </p>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-lg leading-relaxed">
              {t.heroDesc}
            </p>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 pb-safe bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] z-50 rounded-t-xl md:hidden border-t border-outline-variant/10">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-primary font-bold transition-all duration-300 px-4 py-2 gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">restaurant</span>
          <span className="font-sans font-semibold text-[11px]">{t.menu}</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg relative gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-sans font-semibold text-[11px]">{t.cart}</span>
          {cart.length > 0 && (
            <span className="absolute top-1.5 right-6 bg-error text-on-error text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </Link>

      </nav>

      {/* Closed Store Overlay */}
      {storeStatus === "closed" && !dismissedClosedOverlay && (
        <div className="fixed inset-0 z-[100] bg-surface/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-500">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-6 sm:p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.06)] text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-[48px] sm:text-[64px] text-tertiary mb-4 sm:mb-6">bedtime</span>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-on-surface mb-2 sm:mb-3">{t.closedOverlayTitle}</h2>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant mb-4 sm:mb-6 leading-relaxed">
              {t.closedOverlayDesc}
            </p>
            <button
              className="bg-surface-container-low text-on-surface border border-outline-variant/20 font-sans font-semibold text-sm px-6 py-2.5 sm:py-3 rounded-full hover:bg-surface-container-highest transition-colors active:scale-95"
              onClick={() => setDismissedClosedOverlay(true)}
            >
              {t.closedOverlayBtn}
            </button>
          </div>
        </div>
      )}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[110] bg-surface/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300 animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-surface-container-lowest w-full max-w-4xl rounded-2xl overflow-hidden shadow-[0px_10px_50px_rgba(0,0,0,0.08)] border border-outline-variant/10 flex flex-col md:flex-row relative animate-scaleUp max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center active:scale-95 text-on-surface-variant"
              onClick={() => setSelectedProduct(null)}
              aria-label={t.modalCloseAria}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Left Column: Image & Gallery */}
            <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 bg-surface-container-low/50">
              <div className="aspect-[4/3] sm:aspect-[4/3] md:aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-high relative border border-outline-variant/10 shadow-inner flex items-center justify-center">
                {activeImage.startsWith("placeholder-packaging") ? (
                  <div className="flex flex-col items-center justify-center text-on-surface-variant p-6 text-center gap-3">
                    <span className="material-symbols-outlined text-[48px] opacity-40">photo_camera</span>
                    <span className="font-sans font-semibold text-sm">{t.modalPlaceholderTitle}</span>
                    <span className="font-sans text-xs text-on-surface-variant/75 max-w-[240px]">
                      {t.modalPlaceholderDesc}
                    </span>
                  </div>
                ) : (
                  <img 
                    src={activeImage} 
                    alt={language === "en" ? selectedProduct.nameEn : selectedProduct.name} 
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                )}
              </div>

              {/* Thumbnails list */}
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {/* Main presentation thumbnail */}
                <button
                  onClick={() => setActiveImage(selectedProduct.image)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all relative ${
                    activeImage === selectedProduct.image 
                      ? "border-primary scale-95 shadow-sm" 
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={selectedProduct.image} alt={t.modalThumbnailMain} className="w-full h-full object-cover" />
                </button>

                {/* Packaging thumbnails or placeholder */}
                {selectedProduct.packagingImages && selectedProduct.packagingImages.length > 0 ? (
                  selectedProduct.packagingImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all relative ${
                        activeImage === img 
                          ? "border-primary scale-95 shadow-sm" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${t.modalThumbnailPack} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))
                ) : (
                  // Placeholder packaging thumbnail
                  <button
                    onClick={() => setActiveImage("placeholder-packaging")}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-surface-container-high border-2 shrink-0 transition-all flex flex-col items-center justify-center gap-0.5 relative text-on-surface-variant ${
                      activeImage === "placeholder-packaging" 
                        ? "border-primary scale-95 shadow-sm" 
                        : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] opacity-75">photo_camera</span>
                    <span className="font-sans text-[9px] font-semibold tracking-tight text-center leading-none">{t.modalThumbnailPackBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(language === "en" ? selectedProduct.tagsEn : selectedProduct.tags).map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-[#ECFDF5] text-[#059669] px-2.5 py-0.5 rounded-full font-sans font-semibold text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-on-surface mb-3 tracking-tight">
                  {language === "en" ? selectedProduct.nameEn : selectedProduct.name}
                </h3>

                {/* Description */}
                <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
                  {language === "en" ? selectedProduct.descriptionEn : selectedProduct.description}
                </p>

                {/* Nutrition Specs Table */}
                <div className="bg-surface-container-low rounded-xl p-4 mb-6 border border-outline-variant/10">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-primary mb-3">
                    {t.modalNutritionalTitle}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col border-r border-outline-variant/15 pr-2">
                      <span className="font-sans text-[11px] text-on-surface-variant uppercase tracking-wide">{t.modalCalories}</span>
                      <span className="font-display font-bold text-xl text-on-surface">{selectedProduct.calories} kcal</span>
                    </div>
                    <div className="flex flex-col pl-2">
                      <span className="font-sans text-[11px] text-on-surface-variant uppercase tracking-wide">{t.modalProtein}</span>
                      <span className="font-display font-bold text-xl text-on-surface">{selectedProduct.protein}</span>
                    </div>
                  </div>
                  <p className="font-sans text-[10px] text-on-surface-variant/75 mt-3 leading-tight">
                    {t.modalKetoDisclaimer}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-outline-variant/10 pt-4 mb-4 mt-auto">
                <div className="flex justify-between font-sans text-xs sm:text-sm text-on-surface-variant mb-1.5">
                  <span>{t.modalPlato} ({language === "en" ? selectedProduct.nameEn : selectedProduct.name})</span>
                  <span>{formatCOP(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between font-sans text-xs sm:text-sm text-on-surface-variant mb-1.5">
                  <span>{t.modalDomicilio}</span>
                  <span>{formatCOP(5000)}</span>
                </div>
                <div className="h-px bg-outline-variant/10 w-full my-2"></div>
                <div className="flex justify-between font-display font-bold text-base sm:text-lg text-primary">
                  <span>{t.modalTotal}</span>
                  <span>{formatCOP(selectedProduct.price + 5000)}</span>
                </div>
              </div>

              {/* Cart Actions */}
              <div className="pt-2 border-t border-outline-variant/10">
                <button
                  onClick={() => {
                    addToCart(selectedProduct.name);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-sans font-semibold text-sm transition-all active:scale-95 shadow-sm text-on-primary ${
                    successItem === selectedProduct.name 
                      ? "bg-primary-container" 
                      : "bg-[#059669] hover:opacity-90"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {successItem === selectedProduct.name ? "check" : "add_shopping_cart"}
                  </span>
                  <span>
                    {successItem === selectedProduct.name ? t.added : t.addToCart}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
