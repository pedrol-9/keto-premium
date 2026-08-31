"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isConfigured } from "@/lib/supabase";
import { Order, AccountingData, CustomerFrequency } from "@/types";

// Modular Admin Components
import AdminHeader from "@/components/admin/AdminHeader";
import DashboardMetrics from "@/components/admin/DashboardMetrics";
import AccountingCard from "@/components/admin/AccountingCard";
import OrdersManager from "@/components/admin/OrdersManager";
import FrequentCustomersCard from "@/components/admin/FrequentCustomersCard";
import ReverseOrderModal from "@/components/admin/ReverseOrderModal";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import AdminBottomNav from "@/components/admin/AdminBottomNav";

const DEFAULT_OFFLINE_ORDERS: Order[] = [
  {
    id: "ord-883719",
    customerName: "Elena Rodriguez",
    details: "1x Bowl Salmón del Bosque, 1x Bowl César Premium",
    time: "Hace 5 minutos",
    address: "Calle 127 # 19-45, Apto 502",
    total: "$53.000 COP",
    status: "pending",
  },
  {
    id: "ord-293817",
    customerName: "David Chen",
    details: "2x Keto Cobb Salad",
    time: "Hace 12 minutos",
    address: "Carrera 7 # 72-10, Torre B",
    total: "$44.000 COP",
    status: "confirmed",
  },
  {
    id: "ord-482019",
    customerName: "Maria Santos",
    details: "1x Bowl Salmón Teriyaki Keto, 1x Keto Bowl Pollo al Pesto",
    time: "Hace 28 minutos",
    address: "Calle 85 # 11-32",
    total: "$60.000 COP",
    status: "dispatched",
  },
];

const DEFAULT_OFFLINE_CUSTOMERS: CustomerFrequency[] = [
  { name: "Sofia Garcia", orders: 2, tag: "Strict Keto" },
  { name: "James Wilson", orders: 5, tag: "High Protein" },
  { name: "Ana Silva", orders: 1, tag: "Low Carb" },
  { name: "Lucas Peeters", orders: 8, tag: "Strict Keto" },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication
  const [isAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kb_admin_authenticated") === "true";
    }
    return false;
  });

  // UI Modals State
  const [orderToReverse, setOrderToReverse] = useState<Order | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Store & Metrics State
  const [storeStatus, setStoreStatus] = useState<"open" | "closed">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kb_store_status") as "open" | "closed";
      if (saved) return saved;
    }
    return "open";
  });

  const [whatsappRedirects, setWhatsappRedirects] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("whatsappRedirects");
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);

  // Orders & Accounting State
  const [orders, setOrders] = useState<Order[]>(() => {
    if (isConfigured) return [];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kb_orders");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return DEFAULT_OFFLINE_ORDERS;
  });

  const [accounting, setAccounting] = useState<AccountingData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kb_accounting");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return { initialCash: "", expenses: "", manualIncome: "" };
  });

  const [accountingStatus, setAccountingStatus] = useState<string | null>(null);
  const [frequentCustomers, setFrequentCustomers] = useState<CustomerFrequency[]>(() => {
    return !isConfigured ? DEFAULT_OFFLINE_CUSTOMERS : [];
  });

  // Time formatter
  const formatTime = (order: Order) => {
    if (!order.createdAt) return order.time || "Reciente";
    try {
      const d = new Date(order.createdAt);
      return (
        d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }) +
        " • " +
        d.toLocaleDateString("es-CO", { month: "short", day: "numeric" })
      );
    } catch {
      return order.time || "Reciente";
    }
  };

  // Authenticate and load Supabase data
  useEffect(() => {
    const auth = localStorage.getItem("kb_admin_authenticated");
    if (auth !== "true") {
      router.push("/admin");
      return;
    }

    const fetchSupabaseData = async () => {
      if (!isConfigured) return;
      try {
        // 1. Config metrics
        const { data: configData } = await supabase.from("config").select("key, value");
        if (configData) {
          const statusVal = configData.find((c) => c.key === "store_status")?.value;
          if (statusVal) setStoreStatus(statusVal as "open" | "closed");

          const redirectsVal = configData.find((c) => c.key === "whatsapp_redirects")?.value;
          if (redirectsVal) setWhatsappRedirects(parseInt(redirectsVal, 10));

          const visitsVal = configData.find((c) => c.key === "total_visits")?.value;
          if (visitsVal) setTotalVisits(parseInt(visitsVal, 10));
        }

        // 2. Orders list
        const { data: dbOrders } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbOrders) {
          const mappedOrders: Order[] = dbOrders.map((o) => ({
            id: o.id,
            customerName: o.customer_name,
            phone: o.phone || undefined,
            details: o.details,
            address: o.address,
            total: o.total,
            status: (o.status as "pending" | "confirmed" | "dispatched") || "pending",
            createdAt: o.created_at,
            time: o.created_at
              ? new Date(o.created_at).toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Desde DB",
          }));
          setOrders(mappedOrders);

          const cCount = mappedOrders.filter(
            (o) => o.status === "confirmed" || o.status === "dispatched"
          ).length;
          setConfirmedCount(cCount);

          localStorage.removeItem("kb_orders");
          localStorage.removeItem("kb_confirmed_orders_count");

          // Frequent customers
          const clientMap: Record<string, number> = {};
          mappedOrders.forEach((o) => {
            clientMap[o.customerName] = (clientMap[o.customerName] || 0) + 1;
          });
          const mappedCustomers = Object.entries(clientMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => {
              let tag = "Cliente Frecuente";
              if (count >= 5) tag = "VIP Keto";
              else if (count >= 3) tag = "Keto Lover";
              return { name, orders: count, tag };
            });
          setFrequentCustomers(mappedCustomers);
        }

        // 3. Accounting
        const { data: dbAccounting } = await supabase
          .from("accounting")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);
        if (dbAccounting && dbAccounting.length > 0) {
          setAccounting({
            initialCash: dbAccounting[0].initial_cash.toString(),
            expenses: dbAccounting[0].expenses.toString(),
            manualIncome: dbAccounting[0].manual_income.toString(),
          });
        }
      } catch (e) {
        console.error("Error loading Supabase data:", e);
      }
    };

    fetchSupabaseData();

    // Realtime subscriptions
    let channelConfig: ReturnType<typeof supabase.channel> | null = null;
    let channelOrders: ReturnType<typeof supabase.channel> | null = null;

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
            } else if (row.key === "total_visits") {
              setTotalVisits(parseInt(row.value, 10));
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
              .order("created_at", { ascending: false });
            if (dbOrders) {
              const mappedOrders: Order[] = dbOrders.map((o) => ({
                id: o.id,
                customerName: o.customer_name,
                phone: o.phone || undefined,
                details: o.details,
                address: o.address,
                total: o.total,
                status: (o.status as "pending" | "confirmed" | "dispatched") || "pending",
                createdAt: o.created_at,
                time: o.created_at
                  ? new Date(o.created_at).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Desde DB",
              }));
              setOrders(mappedOrders);

              const cCount = mappedOrders.filter(
                (o) => o.status === "confirmed" || o.status === "dispatched"
              ).length;
              setConfirmedCount(cCount);

              const clientMap: Record<string, number> = {};
              mappedOrders.forEach((o) => {
                clientMap[o.customerName] = (clientMap[o.customerName] || 0) + 1;
              });
              const mappedCustomers = Object.entries(clientMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => {
                  let tag = "Cliente Frecuente";
                  if (count >= 5) tag = "VIP Keto";
                  else if (count >= 3) tag = "Keto Lover";
                  return { name, orders: count, tag };
                });
              setFrequentCustomers(mappedCustomers);
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

  // Actions
  const handleToggleStoreStatus = async () => {
    const nextStatus = storeStatus === "open" ? "closed" : "open";
    setStoreStatus(nextStatus);
    localStorage.setItem("kb_store_status", nextStatus);

    if (isConfigured) {
      try {
        await supabase.from("config").update({ value: nextStatus }).eq("key", "store_status");
      } catch (e) {
        console.error("Error toggling store status in Supabase:", e);
      }
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: "confirmed" as const } : o
    );
    setOrders(updated);
    setConfirmedCount(
      updated.filter((o) => o.status === "confirmed" || o.status === "dispatched").length
    );

    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail({ ...selectedOrderDetail, status: "confirmed" });
    }

    if (isConfigured) {
      try {
        await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId);
      } catch (e) {
        console.error("Error confirming order in Supabase:", e);
      }
    }
  };

  const handleDispatchOrder = async (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: "dispatched" as const } : o
    );
    setOrders(updated);
    setConfirmedCount(
      updated.filter((o) => o.status === "confirmed" || o.status === "dispatched").length
    );

    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail({ ...selectedOrderDetail, status: "dispatched" });
    }

    if (isConfigured) {
      try {
        await supabase.from("orders").update({ status: "dispatched" }).eq("id", orderId);
      } catch (e) {
        console.error("Error dispatching order in Supabase:", e);
      }
    }
  };

  const executeReverseOrder = async (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: "pending" as const } : o
    );
    setOrders(updated);
    setConfirmedCount(
      updated.filter((o) => o.status === "confirmed" || o.status === "dispatched").length
    );
    setOrderToReverse(null);

    if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
      setSelectedOrderDetail({ ...selectedOrderDetail, status: "pending" });
    }

    if (isConfigured) {
      try {
        await supabase.from("orders").update({ status: "pending" }).eq("id", orderId);
      } catch (e) {
        console.error("Error reversing order in Supabase:", e);
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
          manual_income: parseFloat(accounting.manualIncome || "0"),
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

  const conversionRate =
    totalVisits > 0 ? ((whatsappRedirects / totalVisits) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-sans antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <AdminHeader
        storeStatus={storeStatus}
        onToggleStoreStatus={handleToggleStoreStatus}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-28 pb-32 px-6 md:px-16 flex-grow w-full flex flex-col gap-8">
        <section className="flex flex-col gap-1.5 border-b border-outline-variant/10 pb-4">
          <h2 className="font-display font-bold text-3xl text-on-surface">Admin Dashboard</h2>
          <p className="font-sans text-sm text-on-surface-variant">
            Administra tus pedidos de WhatsApp, métricas operativas y contabilidad de caja.
          </p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Metrics */}
          <DashboardMetrics
            totalVisits={totalVisits}
            whatsappRedirects={whatsappRedirects}
            confirmedCount={confirmedCount}
            conversionRate={conversionRate}
          />

          {/* Accounting */}
          <AccountingCard
            accounting={accounting}
            accountingStatus={accountingStatus}
            onChange={setAccounting}
            onSubmit={handleSaveAccounting}
          />

          {/* Orders Manager (Tabs: Pendientes / Confirmadas / Despachadas) */}
          <OrdersManager
            orders={orders}
            onConfirmOrder={handleConfirmOrder}
            onDispatchOrder={handleDispatchOrder}
            onRequestReverse={(order) => setOrderToReverse(order)}
            onSelectOrderDetail={(order) => setSelectedOrderDetail(order)}
            formatTime={formatTime}
          />

          {/* Frequent Customers */}
          <FrequentCustomersCard customers={frequentCustomers} />
        </div>
      </main>

      {/* Modals */}
      <ReverseOrderModal
        order={orderToReverse}
        onCancel={() => setOrderToReverse(null)}
        onConfirm={executeReverseOrder}
      />

      <OrderDetailModal
        order={selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        onConfirm={handleConfirmOrder}
        onDispatch={handleDispatchOrder}
        onReverse={(order) => setOrderToReverse(order)}
        formatTime={formatTime}
      />

      {/* Bottom Nav Mobile */}
      <AdminBottomNav />
    </div>
  );
}
