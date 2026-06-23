"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PRODUCTS, WHATSAPP_NUMBER } from "@/products";
import { supabase, isConfigured } from "@/lib/supabase";

interface CartItem {
  title: string;
  count: number;
}

const ITEM_DETAILS = PRODUCTS.reduce((acc, product) => {
  acc[product.name] = {
    price: product.price,
    priceStr: `$${product.price.toLocaleString("es-CO")} COP`,
    category: product.tags[0] || "Keto",
    imageUrl: product.image,
    tags: product.tags,
  };
  return acc;
}, {} as Record<string, { price: number; priceStr: string; category: string; imageUrl: string; tags: string[] }>);

const DEFAULT_IMAGE = "/bowl-cesar.png";

export default function CartPage() {
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
  const [cartRaw, setCartRaw] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [clientName, setClientName] = useState("");

  // Sync with localStorage & Supabase
  useEffect(() => {
    const handleStorageChange = () => {
      const savedStatus = localStorage.getItem("kb_store_status") as "open" | "closed";
      if (savedStatus) {
        setStoreStatus(savedStatus);
      }
      const savedCart = localStorage.getItem("kb_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart) as string[];
          setCartRaw(parsed);
          // Group items
          const counts: Record<string, number> = {};
          parsed.forEach((title) => {
            counts[title] = (counts[title] || 0) + 1;
          });
          const itemsList = Object.entries(counts).map(([title, count]) => ({
            title,
            count,
          }));
          setCartItems(itemsList);
        } catch (e) {
          console.error(e);
        }
      } else {
        setCartRaw([]);
        setCartItems([]);
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

  const updateCartRaw = (newCart: string[]) => {
    setCartRaw(newCart);
    localStorage.setItem("kb_cart", JSON.stringify(newCart));

    // Group items
    const counts: Record<string, number> = {};
    newCart.forEach((title) => {
      counts[title] = (counts[title] || 0) + 1;
    });
    const itemsList = Object.entries(counts).map(([title, count]) => ({
      title,
      count,
    }));
    setCartItems(itemsList);
  };

  const addItemCount = (title: string) => {
    const nextCart = [...cartRaw, title];
    updateCartRaw(nextCart);
  };

  const removeItemCount = (title: string) => {
    const index = cartRaw.indexOf(title);
    if (index > -1) {
      const nextCart = [...cartRaw];
      nextCart.splice(index, 1);
      updateCartRaw(nextCart);
    }
  };

  const deleteItem = (title: string) => {
    const nextCart = cartRaw.filter((t) => t !== title);
    updateCartRaw(nextCart);
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const details = ITEM_DETAILS[item.title] || { price: 0 };
    return acc + details.price * item.count;
  }, 0);

  const formatCOP = (num: number) => {
    return `$${num.toLocaleString("es-CO")} COP`;
  };

  const handleWhatsAppCheckout = async () => {
    if (storeStatus === "closed") {
      alert("La tienda está cerrada en este momento.");
      return;
    }
    if (!clientName.trim()) {
      alert("Por favor ingresa tu nombre.");
      return;
    }
    if (!address.trim()) {
      alert("Por favor ingresa tu dirección de entrega.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const orderId = "ord-" + Math.floor(100000 + Math.random() * 900000);
    const detailsStr = cartItems.map((item) => `${item.count}x ${item.title}`).join(", ");
    const formattedTotal = formatCOP(subtotal);

    // Increment whatsapp redirects count
    const redirects = parseInt(localStorage.getItem("whatsappRedirects") || "0", 10);
    localStorage.setItem("whatsappRedirects", (redirects + 1).toString());

    if (isConfigured) {
      try {
        const { data: configData } = await supabase
          .from("config")
          .select("value")
          .eq("key", "whatsapp_redirects")
          .single();
        const currentRedirects = configData ? parseInt(configData.value, 10) : redirects;
        await supabase
          .from("config")
          .update({ value: (currentRedirects + 1).toString() })
          .eq("key", "whatsapp_redirects");
      } catch (e) {
        console.error("Error updating redirects in Supabase:", e);
      }
    }

    // Add order to admin list (kb_orders)
    try {
      const savedOrders = localStorage.getItem("kb_orders");
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      const newOrder = {
        id: orderId,
        customerName: clientName.trim(),
        details: detailsStr,
        time: "Hace un momento",
        address: address.trim(),
        total: formattedTotal
      };
      localStorage.setItem("kb_orders", JSON.stringify([newOrder, ...currentOrders]));

      if (isConfigured) {
        await supabase.from("orders").insert({
          id: orderId,
          customer_name: clientName.trim(),
          details: detailsStr,
          address: address.trim(),
          total: formattedTotal,
          status: "pending"
        });
      }
    } catch (e) {
      console.error("Error creating order in Supabase/Local:", e);
    }

    const message = `Hola, mi pedido es [${detailsStr}]. Total: [${formattedTotal}]. Nombre: [${clientName.trim()}]. Dirección: [${address.trim()}]. Deseo pagar a través de Nequi. Quedo atento al código/número para transferir.`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = WHATSAPP_NUMBER;

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-sans antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-16 h-20 max-w-7xl mx-auto">
          {/* Logo / Headline and Menu icon */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-primary hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-1.5 sm:p-2 rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[26px] sm:text-[30px]">restaurant_menu</span>
            </Link>
            <h1 className="font-display font-bold tracking-tighter text-primary text-xl sm:text-2xl md:text-3xl">
              KetoBoutique
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center h-full self-stretch">
            <Link href="/" className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all">
              Menu
            </Link>
            <Link href="/cart" className="h-full flex items-center text-primary font-bold border-b-2 border-primary active:scale-95 transition-all relative">
              <span>Cart</span>
              {cartRaw.length > 0 && (
                <span className="ml-1.5 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartRaw.length}
                </span>
              )}
            </Link>
            <Link href="/admin" className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all">
              Admin
            </Link>
          </nav>

          {/* Status Label */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${storeStatus === "closed" ? "bg-error" : "bg-primary"}`}></span>
            <span className="font-sans font-semibold text-xs sm:text-sm capitalize text-on-surface-variant">
              {storeStatus === "closed" ? "Closed" : "Open"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-7xl mx-auto pt-28 pb-32 px-6 md:px-16 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Cart Items Section */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-3xl text-on-surface">Tu Canasta</h2>
              <span className="font-sans font-semibold text-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                {cartRaw.length} {cartRaw.length === 1 ? "Ítem" : "Ítems"}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-[64px] text-outline/40">shopping_cart</span>
                <p className="font-sans text-on-surface-variant text-base">Tu carrito está vacío.</p>
                <Link href="/" className="bg-[#059669] hover:opacity-90 text-white font-semibold text-sm px-6 py-3 rounded-full active:scale-95 transition-all">
                  Explorar Menú
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => {
                  const details = ITEM_DETAILS[item.title] || {
                    price: 0,
                    priceStr: "$0 COP",
                    category: "Keto",
                    tags: ["Keto"],
                    imageUrl: DEFAULT_IMAGE
                  };

                  return (
                    <div
                      key={item.title}
                      className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-transform duration-300 border border-outline-variant/10"
                    >
                      <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-low">
                        <img className="w-full h-full object-cover" src={details.imageUrl} alt={item.title} />
                      </div>
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-display font-semibold text-lg text-on-surface">{item.title}</h3>
                            <button
                              onClick={() => deleteItem(item.title)}
                              className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-low"
                              aria-label="Remove item"
                            >
                              <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {details.tags.map((tag) => (
                              <span key={tag} className="bg-[#ECFDF5] text-[#059669] px-2.5 py-0.5 rounded-full font-sans font-semibold text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <p className="font-display font-bold text-primary">{formatCOP(details.price * item.count)}</p>
                          <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/10">
                            <button
                              onClick={() => removeItemCount(item.title)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="w-8 text-center font-sans font-semibold text-sm">{item.count}</span>
                            <button
                              onClick={() => addItemCount(item.title)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors"
                              aria-label="Increase quantity"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Panel */}
          <div className="md:col-span-5 lg:col-span-4 mt-4 md:mt-0">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_10px_40px_rgba(0,0,0,0.06)] border border-outline-variant/10 sticky top-28 flex flex-col gap-6">
              <h2 className="font-display font-semibold text-xl text-on-surface border-b border-outline-variant/10 pb-3">
                Resumen del Pedido
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                  <span>Envío (Zona urbana)</span>
                  <span className="text-[#059669] font-semibold">Gratis</span>
                </div>
                <div className="h-px bg-outline-variant/10 w-full my-2"></div>
                <div className="flex justify-between font-display font-bold text-lg text-on-surface">
                  <span>Total</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
              </div>

              {cartItems.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="clientNameInput" className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                      Tu Nombre
                    </label>
                    <input
                      id="clientNameInput"
                      type="text"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
                      placeholder="Ej. Elena Rodríguez"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  {/* Address Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="addressInput" className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
                      Dirección de Entrega
                    </label>
                    <input
                      id="addressInput"
                      type="text"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-3 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
                      placeholder="Ej. Calle 10 # 5-20"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-[#059669] hover:bg-primary-container text-white font-sans font-semibold text-sm py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm mt-2"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                    </svg>
                    Confirmar Pedido vía WhatsApp
                  </button>

                  <p className="text-center font-sans text-xs text-on-surface-variant opacity-75 mt-1">
                    Pago a través de transferencia Nequi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 pb-safe bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] z-50 rounded-t-xl md:hidden border-t border-outline-variant/10">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">restaurant</span>
          <span className="font-sans font-semibold text-[11px]">Menu</span>
        </Link>
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center text-primary font-bold transition-all duration-300 px-4 py-2 gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-sans font-semibold text-[11px]">Cart</span>
          {cartRaw.length > 0 && (
            <span className="absolute top-1.5 right-6 bg-error text-on-error text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartRaw.length}
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


    </div>
  );
}
