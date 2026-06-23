"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/products";
import { supabase, isConfigured } from "@/lib/supabase";

export default function Home() {
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
  const [cart, setCart] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [successItem, setSuccessItem] = useState<string | null>(null);
  const [dismissedClosedOverlay, setDismissedClosedOverlay] = useState<boolean>(false);

  // Reset dismiss state if store status is opened
  useEffect(() => {
    if (storeStatus === "open") {
      setDismissedClosedOverlay(false);
    }
  }, [storeStatus]);

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
    let channel: any;
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

  const toggleStoreStatus = async () => {
    const nextStatus = storeStatus === "open" ? "closed" : "open";
    setStoreStatus(nextStatus);
    localStorage.setItem("kb_store_status", nextStatus);

    if (isConfigured) {
      try {
        await supabase
          .from("config")
          .update({ value: nextStatus })
          .eq("key", "store_status");
      } catch (e) {
        console.error("Error updating store status in Supabase:", e);
      }
    }
  };

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
    <div className="flex flex-col min-h-screen bg-background text-on-background font-sans antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-16 h-20 max-w-7xl mx-auto">
          {/* Logo / Headline and Menu icon */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              aria-label="Menu"
              className="text-primary hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-1.5 sm:p-2 rounded-full hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[26px] sm:text-[30px]">restaurant_menu</span>
            </button>
            <h1 className="font-display font-bold tracking-tighter text-primary text-xl sm:text-2xl md:text-3xl">
              KetoBoutique
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center h-full self-stretch">
            <Link
              href="/"
              className="h-full flex items-center text-primary font-bold border-b-2 border-primary active:scale-95 transition-all"
            >
              Menu
            </Link>
            <Link
              href="/cart"
              className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all relative"
            >
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="ml-1.5 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
            <Link
              href="/admin"
              className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all"
            >
              Admin
            </Link>
          </nav>
          
          {/* Store Status Button */}
          <button
            onClick={toggleStoreStatus}
            className={`font-sans font-semibold text-xs sm:text-sm hover:opacity-80 transition-all active:scale-95 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-none flex items-center gap-1.5 sm:gap-2 ${
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
            <span>{storeStatus === "closed" ? "Closed" : "Open"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto pt-28 pb-32 px-6 md:px-16 flex-1 w-full">
        {/* Hero Section */}
        <section className="mb-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 flex flex-col gap-4">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-on-surface leading-tight tracking-tight">
              Premium Keto Experience
            </h2>
            <p className="font-sans text-lg text-on-surface-variant max-w-md mx-auto md:mx-0 leading-relaxed">
              Curated, macro-conscious culinary creations crafted with organic precision. Elevate your metabolic state without compromising on taste.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div
              className="w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-[0px_10px_40px_rgba(0,0,0,0.06)] relative bg-surface-container-high bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYpKpJ4awhfJ-3cCrh5KH1lOvl7oy9I-qWEMyzbviFnD6y90O6-MRcBkTCyZWwvS_OxEofMqxIftwxFET_6GOL9kd1FP-_KItAa9igbQGgpwRkNtV8zoIwRYfNo1pfKhtfVFfDUDm6oqCxHcG_1w2dHQkvBf5ap9ennqYF9_uGFR_fAO9P12NGpP5p80aHRnBoikcWkIrfhNdU3ibwd_NRKNPd0Kblgrfj6huRYExGVVRYpscAoHrEe3MwSdr_ddEA2-CkhbS05Te6')`,
              }}
            ></div>
          </div>
        </section>

        {/* Nutrition Filter Chips */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveCategory("Todos")}
            className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm whitespace-nowrap transition-all ${
              activeCategory === "Todos"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveCategory("Keto")}
            className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm whitespace-nowrap transition-all border border-transparent ${
              activeCategory === "Keto"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-[#ECFDF5] text-[#059669] hover:border-[#059669]"
            }`}
          >
            Keto
          </button>
          <button
            onClick={() => setActiveCategory("Alto Proteína")}
            className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm whitespace-nowrap transition-all border border-transparent ${
              activeCategory === "Alto Proteína"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-[#ECFDF5] text-[#059669] hover:border-[#059669]"
            }`}
          >
            Alto Proteína
          </button>
          <button
            onClick={() => setActiveCategory("Premium")}
            className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm whitespace-nowrap transition-all border border-transparent ${
              activeCategory === "Premium"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-[#ECFDF5] text-[#059669] hover:border-[#059669]"
            }`}
          >
            Premium
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-transform duration-300 flex flex-col border border-outline-variant/10"
            >
              {/* Product Image */}
              <div className="aspect-[4/5] rounded-lg overflow-hidden mb-6 bg-surface-container-high relative">
                <img
                  className="w-full h-full object-cover"
                  src={item.image}
                  alt={item.name}
                />
                <span className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur text-primary font-sans font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-sm">
                  {item.tags[0] || "Keto"}
                </span>
              </div>
              
              {/* Title & Description */}
              <h3 className="font-display font-semibold text-xl text-on-surface mb-2">
                {item.name}
              </h3>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed flex-grow mb-6 line-clamp-2">
                {item.description}
              </p>
              
              {/* Price and Add button */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/5">
                <span className="font-display font-bold text-lg text-primary">
                  {formatCOP(item.price)}
                </span>
                <button
                  aria-label="Add to cart"
                  onClick={() => addToCart(item.name)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm text-on-primary ${
                    successItem === item.name ? "bg-primary-container" : "bg-[#059669] hover:opacity-90"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {successItem === item.name ? "check" : "add"}
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 pb-safe bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] z-50 rounded-t-xl md:hidden border-t border-outline-variant/10">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-primary font-bold transition-all duration-300 px-4 py-2 gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">restaurant</span>
          <span className="font-sans font-semibold text-[11px]">Menu</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg relative gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-sans font-semibold text-[11px]">Cart</span>
          {cart.length > 0 && (
            <span className="absolute top-1.5 right-6 bg-error text-on-error text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </Link>
        <Link
          href="/admin"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span className="font-sans font-semibold text-[11px]">Admin</span>
        </Link>
      </nav>

      {/* Closed Store Overlay */}
      {storeStatus === "closed" && !dismissedClosedOverlay && (
        <div className="fixed inset-0 z-[100] bg-surface/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-500">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl p-6 sm:p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.06)] text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-[48px] sm:text-[64px] text-tertiary mb-4 sm:mb-6">bedtime</span>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-on-surface mb-2 sm:mb-3">Descansando</h2>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant mb-4 sm:mb-6 leading-relaxed">
              Nuestra cocina está descansando. Abrimos pronto para ofrecerte lo mejor.
            </p>
            <button
              className="bg-surface-container-low text-on-surface border border-outline-variant/20 font-sans font-semibold text-sm px-6 py-2.5 sm:py-3 rounded-full hover:bg-surface-container-highest transition-colors active:scale-95"
              onClick={() => setDismissedClosedOverlay(true)}
            >
              Ver Menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
