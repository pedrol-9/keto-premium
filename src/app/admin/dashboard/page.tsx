"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isConfigured } from "@/lib/supabase";

interface Order {
  id: string;
  customerName: string;
  details: string;
  time: string;
  address: string;
  total: string;
}

interface AccountingData {
  initialCash: string;
  expenses: string;
  manualIncome: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">("open");
  const [whatsappRedirects, setWhatsappRedirects] = useState<number>(342); // Default starting visits/redirects
  const [orders, setOrders] = useState<Order[]>([]);
  const [accounting, setAccounting] = useState<AccountingData>({
    initialCash: "",
    expenses: "",
    manualIncome: "",
  });
  const [accountingStatus, setAccountingStatus] = useState<string | null>(null);

  // Authenticate and load dashboard data
  useEffect(() => {
    const auth = localStorage.getItem("kb_admin_authenticated");
    if (auth !== "true") {
      setIsAuthenticated(false);
      router.push("/admin");
      return;
    }
    setIsAuthenticated(true);

    // 1. Load store status
    const savedStatus = localStorage.getItem("kb_store_status") as "open" | "closed";
    if (savedStatus) {
      setStoreStatus(savedStatus);
    }

    // 2. Load whatsapp redirects
    const savedRedirects = localStorage.getItem("whatsappRedirects");
    if (savedRedirects) {
      setWhatsappRedirects(parseInt(savedRedirects, 10));
    } else {
      localStorage.setItem("whatsappRedirects", "342");
    }

    // 3. Load orders
    const savedOrders = localStorage.getItem("kb_orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed default mock orders if empty
      const defaultOrders: Order[] = [
        {
          id: "ord-883719",
          customerName: "Elena Rodriguez",
          details: "1x Bowl Salmón del Bosque, 1x Bowl César Premium",
          time: "Hace 5 minutos",
          address: "Calle 127 # 19-45, Apto 502",
          total: "$53.000 COP"
        },
        {
          id: "ord-293817",
          customerName: "David Chen",
          details: "2x Keto Cobb Salad",
          time: "Hace 12 minutos",
          address: "Carrera 7 # 72-10, Torre B",
          total: "$44.000 COP"
        },
        {
          id: "ord-482019",
          customerName: "Maria Santos",
          details: "1x Bowl Salmón Teriyaki Keto, 1x Keto Bowl Pollo al Pesto",
          time: "Hace 28 minutos",
          address: "Calle 85 # 11-32",
          total: "$60.000 COP"
        }
      ];
      localStorage.setItem("kb_orders", JSON.stringify(defaultOrders));
      setOrders(defaultOrders);
    }

    // 4. Load accounting box
    const savedAccounting = localStorage.getItem("kb_accounting");
    if (savedAccounting) {
      try {
        setAccounting(JSON.parse(savedAccounting));
      } catch (e) {
        console.error(e);
      }
    }

    // --- Supabase Fetches ---
    const fetchSupabaseData = async () => {
      if (!isConfigured) return;
      try {
        // Fetch config keys (store_status, whatsapp_redirects)
        const { data: configData } = await supabase
          .from("config")
          .select("key, value");
        if (configData) {
          const statusVal = configData.find((c) => c.key === "store_status")?.value;
          if (statusVal) setStoreStatus(statusVal as "open" | "closed");

          const redirectsVal = configData.find((c) => c.key === "whatsapp_redirects")?.value;
          if (redirectsVal) setWhatsappRedirects(parseInt(redirectsVal, 10));
        }

        // Fetch active orders (status = 'pending')
        const { data: dbOrders } = await supabase
          .from("orders")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (dbOrders) {
          const mappedOrders: Order[] = dbOrders.map((o) => ({
            id: o.id,
            customerName: o.customer_name,
            details: o.details,
            address: o.address,
            total: o.total,
            time: "Desde DB"
          }));
          setOrders(mappedOrders);
        }

        // Fetch latest accounting row
        const { data: dbAccounting } = await supabase
          .from("accounting")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        if (dbAccounting && dbAccounting.length > 0) {
          setAccounting({
            initialCash: dbAccounting[0].initial_cash.toString(),
            expenses: dbAccounting[0].expenses.toString(),
            manualIncome: dbAccounting[0].manual_income.toString()
          });
        }
      } catch (e) {
        console.error("Error loading Supabase data:", e);
      }
    };

    fetchSupabaseData();

    // Set up realtime channel subscription for orders & configs
    let channelConfig: any;
    let channelOrders: any;

    if (isConfigured) {
      channelConfig = supabase
        .channel("admin_config_changes")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "config" },
          (payload) => {
            const row = payload.new as { key: string; value: string };
            if (row.key === "store_status") {
              setStoreStatus(row.value as "open" | "closed");
            } else if (row.key === "whatsapp_redirects") {
              setWhatsappRedirects(parseInt(row.value, 10));
            }
          }
        )
        .subscribe();

      channelOrders = supabase
        .channel("admin_order_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          async () => {
            const { data: dbOrders } = await supabase
              .from("orders")
              .select("*")
              .eq("status", "pending")
              .order("created_at", { ascending: false });
            if (dbOrders) {
              const mappedOrders: Order[] = dbOrders.map((o) => ({
                id: o.id,
                customerName: o.customer_name,
                details: o.details,
                address: o.address,
                total: o.total,
                time: "Desde DB"
              }));
              setOrders(mappedOrders);
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channelConfig) supabase.removeChannel(channelConfig);
      if (channelOrders) supabase.removeChannel(channelOrders);
    };
  }, [router]);

  const handleToggleStoreStatus = async () => {
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
        console.error("Error toggling store status in Supabase:", e);
      }
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    const nextOrders = orders.filter((o) => o.id !== orderId);
    setOrders(nextOrders);
    localStorage.setItem("kb_orders", JSON.stringify(nextOrders));

    const confirmedCount = parseInt(localStorage.getItem("kb_confirmed_orders_count") || "0", 10);
    localStorage.setItem("kb_confirmed_orders_count", (confirmedCount + 1).toString());

    if (isConfigured) {
      try {
        await supabase
          .from("orders")
          .update({ status: "confirmed" })
          .eq("id", orderId);
      } catch (e) {
        console.error("Error confirming order in Supabase:", e);
      }
    }
  };

  const handleSaveAccounting = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kb_accounting", JSON.stringify(accounting));
    setAccountingStatus("Registro Guardado!");
    setTimeout(() => {
      setAccountingStatus(null);
    }, 2000);

    if (isConfigured) {
      try {
        await supabase.from("accounting").insert({
          initial_cash: parseFloat(accounting.initialCash || "0"),
          expenses: parseFloat(accounting.expenses || "0"),
          manual_income: parseFloat(accounting.manualIncome || "0")
        });
      } catch (e) {
        console.error("Error saving accounting in Supabase:", e);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kb_admin_authenticated");
    router.push("/admin");
  };

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <p className="font-sans text-sm animate-pulse">Autenticando...</p>
      </div>
    );
  }

  // Calculated metrics
  const totalVisits = 1248;
  const conversionRate = ((whatsappRedirects / totalVisits) * 100).toFixed(1);
  const confirmedCount = parseInt(localStorage.getItem("kb_confirmed_orders_count") || "0", 10);

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
            <Link href="/cart" className="h-full flex items-center text-on-surface-variant hover:opacity-80 active:scale-95 transition-all">
              Cart
            </Link>
            <Link href="/admin/dashboard" className="h-full flex items-center text-primary font-bold border-b-2 border-primary active:scale-95 transition-all">
              Admin
            </Link>
          </nav>

          {/* Toggle Switch & Logout */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Toggle Store Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-on-surface-variant font-sans font-semibold text-[10px] sm:text-xs uppercase tracking-wider hidden sm:inline">
                Estado Cocina
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeStatus === "open"}
                  onChange={handleToggleStoreStatus}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-surface-container-highest rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-1.5 sm:ml-2.5 font-sans font-semibold text-xs sm:text-sm text-primary capitalize min-w-[35px] sm:min-w-[45px]">
                  {storeStatus === "open" ? "Abierto" : "Cerrado"}
                </span>
              </label>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-on-surface-variant hover:text-error transition-colors flex items-center justify-center p-1.5 sm:p-2 rounded-full hover:bg-surface-container-low"
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined text-lg sm:text-2xl">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-28 pb-32 px-6 md:px-16 flex-grow w-full flex flex-col gap-8">
        
        {/* Header Section */}
        <section className="flex flex-col gap-1.5 border-b border-outline-variant/10 pb-4">
          <h2 className="font-display font-bold text-3xl text-on-surface">Admin Dashboard</h2>
          <p className="font-sans text-sm text-on-surface-variant">
            Administra tus métricas, contabilidad de caja y pedidos activos de WhatsApp.
          </p>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Metrics Module (8 cols desktop) */}
          <section className="md:col-span-8 grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Metric Card 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">visibility</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Visitas Totales</span>
                <span className="font-display font-bold text-3xl text-on-surface">{totalVisits}</span>
              </div>
              <div className="flex items-center text-primary gap-1 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12% este mes</span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">chat</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Redirecciones WA</span>
                <span className="font-display font-bold text-3xl text-on-surface">{whatsappRedirects}</span>
              </div>
              <div className="flex items-center text-primary gap-1 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+5% esta semana</span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">check_circle</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Pedidos Listos</span>
                <span className="font-display font-bold text-3xl text-on-surface">{confirmedCount}</span>
              </div>
              <div className="flex items-center text-on-surface-variant gap-1 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">horizontal_rule</span>
                <span>Estable</span>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden shadow-[0px_10px_30px_rgba(0,105,72,0.15)]">
              <div className="flex flex-col gap-1">
                <span className="font-sans font-semibold text-xs text-primary-container uppercase tracking-wider">Conversión</span>
                <span className="font-display font-bold text-3xl text-on-primary">{conversionRate}%</span>
              </div>
              <div className="flex items-center text-primary-container gap-1 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>Tasa Óptima</span>
              </div>
            </div>
          </section>

          {/* Accounting Module (4 cols desktop) */}
          <section className="md:col-span-4 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h3 className="font-display font-semibold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                Caja de Contabilidad
              </h3>
              {accountingStatus && (
                <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-semibold">
                  {accountingStatus}
                </span>
              )}
            </div>
            
            <form onSubmit={handleSaveAccounting} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Caja Inicial</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-sans">$</span>
                  <input
                    type="number"
                    className="w-full bg-surface-container-low rounded-xl py-2.5 pl-8 pr-4 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
                    placeholder="0.00"
                    value={accounting.initialCash}
                    onChange={(e) => setAccounting({ ...accounting, initialCash: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Egresos / Gastos</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-sans">$</span>
                  <input
                    type="number"
                    className="w-full bg-surface-container-low rounded-xl py-2.5 pl-8 pr-4 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
                    placeholder="0.00"
                    value={accounting.expenses}
                    onChange={(e) => setAccounting({ ...accounting, expenses: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Ingreso Manual</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-sans">$</span>
                  <input
                    type="number"
                    className="w-full bg-surface-container-low rounded-xl py-2.5 pl-8 pr-4 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
                    placeholder="0.00"
                    value={accounting.manualIncome}
                    onChange={(e) => setAccounting({ ...accounting, manualIncome: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:opacity-90 text-on-primary font-sans font-semibold text-sm py-3 rounded-xl transition-all active:scale-95"
              >
                Guardar Registros
              </button>
            </form>
          </section>

          {/* Orders list (8 cols desktop) */}
          <section className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h3 className="font-display font-semibold text-lg text-on-surface">
                Pedidos Pendientes de WhatsApp
              </h3>
              {orders.length > 0 && (
                <span className="bg-error-container text-on-error-container font-sans font-semibold text-xs px-3 py-1 rounded-full">
                  {orders.length} Por Confirmar
                </span>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[48px] text-outline/30">done_all</span>
                <p className="font-sans text-sm">No hay pedidos pendientes de WhatsApp.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl gap-4 hover:-translate-y-0.5 transition-transform duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant shrink-0 border border-outline-variant/10">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-semibold text-sm text-on-surface">{order.customerName}</span>
                          <span className="text-[10px] font-sans text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
                            {order.id}
                          </span>
                        </div>
                        <span className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-1">{order.details}</span>
                        <span className="font-sans text-[11px] text-primary mt-1 font-semibold">
                          Dir: {order.address} • {order.time}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="w-full sm:w-auto bg-[#059669] hover:bg-primary-container text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Confirmar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Client List (4 cols desktop) */}
          <section className="md:col-span-4 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h3 className="font-display font-semibold text-lg text-on-surface">Clientes Frecuentes</h3>
              <span className="material-symbols-outlined text-on-surface-variant">group</span>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
              {[
                { name: "Sofia Garcia", orders: 2, tag: "Strict Keto" },
                { name: "James Wilson", orders: 5, tag: "High Protein" },
                { name: "Ana Silva", orders: 1, tag: "Low Carb" },
                { name: "Lucas Peeters", orders: 8, tag: "Strict Keto" }
              ].map((customer) => (
                <div key={customer.name} className="flex justify-between items-center py-1.5 border-b border-outline-variant/5 last:border-b-0">
                  <div className="flex flex-col">
                    <span className="font-sans font-semibold text-sm text-on-surface">{customer.name}</span>
                    <span className="font-sans text-xs text-on-surface-variant">{customer.orders} Pedidos</span>
                  </div>
                  <span className="bg-[#ECFDF5] text-primary font-sans font-semibold text-[10px] px-2.5 py-0.5 rounded-full border border-primary-container/20">
                    {customer.tag}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full bg-surface-container-low text-on-surface border border-outline-variant/20 font-sans font-semibold text-xs py-2.5 rounded-xl hover:bg-surface-container-high transition-colors mt-auto">
              Ver Todos los Clientes
            </button>
          </section>

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
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors px-4 py-2 rounded-lg relative gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-sans font-semibold text-[11px]">Cart</span>
        </Link>
        <Link
          href="/admin/dashboard"
          className="flex flex-col items-center justify-center text-primary font-bold transition-all duration-300 px-4 py-2 gap-0.5 flex-1"
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span className="font-sans font-semibold text-[11px]">Admin</span>
        </Link>
      </nav>
    </div>
  );
}
