"use client";

import { useState, useMemo } from "react";
import { Order } from "@/types";

interface OrdersManagerProps {
  orders: Order[];
  onConfirmOrder: (orderId: string) => void;
  onDispatchOrder: (orderId: string) => void;
  onRequestReverse: (order: Order) => void;
  onSelectOrderDetail: (order: Order) => void;
  formatTime: (order: Order) => string;
}

export default function OrdersManager({
  orders,
  onConfirmOrder,
  onDispatchOrder,
  onRequestReverse,
  onSelectOrderDetail,
  formatTime,
}: OrdersManagerProps) {
  const [ordersTab, setOrdersTab] = useState<"pending" | "confirmed">("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Filter logic
  const cleanQuery = searchQuery.trim().toLowerCase();

  const filterOrder = (order: Order) => {
    if (!cleanQuery) return true;

    // Match by ID (#ord-883719, 883719, ord-883719)
    const idMatch =
      order.id.toLowerCase().includes(cleanQuery) ||
      order.id.replace("ord-", "").toLowerCase().includes(cleanQuery) ||
      order.id.replace("#", "").toLowerCase().includes(cleanQuery);

    // Match by Customer Name
    const nameMatch = order.customerName.toLowerCase().includes(cleanQuery);

    // Match by Phone (if present in phone field or in address/details)
    const phoneMatch = order.phone ? order.phone.toLowerCase().includes(cleanQuery) : false;

    // Match by Address
    const addressMatch = order.address.toLowerCase().includes(cleanQuery);

    // Match by Details (products)
    const detailsMatch = order.details.toLowerCase().includes(cleanQuery);

    return idMatch || nameMatch || phoneMatch || addressMatch || detailsMatch;
  };

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === "pending"), [orders]);
  const confirmedUnDispatchedOrders = useMemo(() => orders.filter((o) => o.status === "confirmed"), [orders]);
  const dispatchedOrders = useMemo(() => orders.filter((o) => o.status === "dispatched"), [orders]);
  const totalConfirmedTabCount = confirmedUnDispatchedOrders.length + dispatchedOrders.length;

  const filteredPending = useMemo(() => pendingOrders.filter(filterOrder), [pendingOrders, cleanQuery]);
  const filteredConfirmedUnDispatched = useMemo(
    () => confirmedUnDispatchedOrders.filter(filterOrder),
    [confirmedUnDispatchedOrders, cleanQuery]
  );
  const filteredDispatched = useMemo(
    () => dispatchedOrders.filter(filterOrder),
    [dispatchedOrders, cleanQuery]
  );
  const totalFilteredConfirmed = filteredConfirmedUnDispatched.length + filteredDispatched.length;

  return (
    <section className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 sm:p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
      {/* Header with Tabs and Search Bar */}
      <div className="flex flex-col gap-3.5 border-b border-outline-variant/10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-xl text-on-surface">Gestión de Pedidos</h3>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Haz click en el código del pedido (#) para ver los detalles completos.
            </p>
          </div>

          {/* Tabs Buttons */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/15 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setOrdersTab("pending")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${
                ordersTab === "pending"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>Pendientes</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  ordersTab === "pending"
                    ? "bg-primary text-white"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {cleanQuery ? filteredPending.length : pendingOrders.length}
              </span>
            </button>

            <button
              onClick={() => setOrdersTab("confirmed")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${
                ordersTab === "confirmed"
                  ? "bg-surface-container-lowest text-emerald-800 shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span>Confirmadas</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  ordersTab === "confirmed"
                    ? "bg-emerald-700 text-white"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {cleanQuery ? totalFilteredConfirmed : totalConfirmedTabCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Multifunctional Search Bar ── */}
        <div className="relative w-full">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container-low border transition-all duration-200 ${
              isSearchFocused
                ? "border-primary ring-2 ring-primary/15 bg-white"
                : "border-outline-variant/20 hover:border-outline-variant/40"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Buscar por cliente, teléfono, dirección o #ord..."
              className="w-full bg-transparent border-none outline-none font-sans text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="w-6 h-6 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Active Search Result Tag */}
          {cleanQuery && (
            <div className="flex items-center justify-between text-[11px] font-sans text-on-surface-variant pt-1.5 px-1">
              <span>
                Filtrando por: <strong className="text-primary">&ldquo;{searchQuery}&rdquo;</strong> (
                {ordersTab === "pending" ? filteredPending.length : totalFilteredConfirmed} encontrados)
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary font-semibold hover:underline"
              >
                Mostrar todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB: PENDIENTES */}
      {ordersTab === "pending" && (
        <>
          {filteredPending.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[48px] text-emerald-600/30">
                {cleanQuery ? "search_off" : "done_all"}
              </span>
              <p className="font-sans text-sm font-medium">
                {cleanQuery
                  ? `No se encontraron pedidos pendientes para "${searchQuery}"`
                  : "No hay pedidos pendientes por confirmar."}
              </p>
              <p className="font-sans text-xs text-on-surface-variant/70">
                {cleanQuery
                  ? "Verifica el nombre, teléfono o número de orden."
                  : "Los nuevos pedidos desde WhatsApp aparecerán aquí en tiempo real."}
              </p>
              {cleanQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-primary font-sans font-semibold text-xs rounded-xl transition-all"
                >
                  Borrar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredPending.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 sm:p-4 bg-surface-container-low border-l-4 border-l-primary border border-outline-variant/10 rounded-xl gap-3 hover:border-primary/40 transition-all duration-200 group shadow-xs"
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans font-bold text-sm text-on-surface">{order.customerName}</span>
                      {/* Clickable Tail */}
                      <button
                        onClick={() => onSelectOrderDetail(order)}
                        title="Ver información completa del pedido"
                        className="text-[10px] font-sans font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/60 px-2.5 py-0.5 rounded-full transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                      >
                        <span>{order.id}</span>
                        <span className="material-symbols-outlined text-[11px]">visibility</span>
                      </button>
                    </div>
                    <span className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                      {order.details}
                    </span>
                    <span className="font-sans text-[11px] text-primary mt-1 font-semibold">
                      Dir: {order.address} • {formatTime(order)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onConfirmOrder(order.id)}
                      className="w-full sm:w-auto bg-[#059669] hover:bg-emerald-600 text-white font-sans font-semibold text-xs py-2 px-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Confirmar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB: CONFIRMADAS */}
      {ordersTab === "confirmed" && (
        <>
          {totalFilteredConfirmed === 0 ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[48px] text-amber-500/30">
                {cleanQuery ? "search_off" : "inventory_2"}
              </span>
              <p className="font-sans text-sm font-medium">
                {cleanQuery
                  ? `No se encontraron pedidos confirmados para "${searchQuery}"`
                  : "No hay pedidos confirmados en este momento."}
              </p>
              {cleanQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-primary font-sans font-semibold text-xs rounded-xl transition-all"
                >
                  Borrar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-h-[520px] overflow-y-auto pr-1">
              {/* Sub-sección 1: Confirmadas sin despachar */}
              {filteredConfirmedUnDispatched.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-emerald-800">
                      Confirmadas en Cocina ({filteredConfirmedUnDispatched.length})
                    </span>
                  </div>

                  {filteredConfirmedUnDispatched.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 sm:p-4 bg-emerald-50/40 border-l-4 border-l-emerald-600 border border-emerald-500/20 rounded-xl gap-3 hover:border-emerald-500/40 transition-all duration-200 shadow-xs"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans font-bold text-sm text-on-surface">{order.customerName}</span>
                          <button
                            onClick={() => onSelectOrderDetail(order)}
                            title="Ver información completa del pedido"
                            className="text-[10px] font-sans font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/60 px-2.5 py-0.5 rounded-full transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                          >
                            <span>{order.id}</span>
                            <span className="material-symbols-outlined text-[11px]">visibility</span>
                          </button>
                        </div>
                        <span className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                          {order.details}
                        </span>
                        <span className="font-sans text-[11px] text-emerald-800 mt-1 font-semibold">
                          Dir: {order.address} • {formatTime(order)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center shrink-0">
                        <button
                          onClick={() => onRequestReverse(order)}
                          title="Reversar a pendientes"
                          className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-sans font-semibold text-xs py-2 px-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 border border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined text-sm">undo</span>
                          <span className="hidden sm:inline">Reversar</span>
                        </button>

                        <button
                          onClick={() => onDispatchOrder(order.id)}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-sans font-semibold text-xs py-2 px-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-amber-600/20"
                        >
                          <span className="material-symbols-outlined text-sm">moped</span>
                          <span>Despachar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-sección 2: Despachadas en Ruta */}
              {filteredDispatched.length > 0 && (
                <div className="flex flex-col gap-2.5 pt-1">
                  <div className="flex items-center gap-2 px-1 border-t border-outline-variant/10 pt-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-amber-900">
                      Despachadas ({filteredDispatched.length})
                    </span>
                  </div>

                  {filteredDispatched.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 sm:p-4 bg-amber-50/50 border-l-4 border-l-amber-500 border border-amber-400/30 rounded-xl gap-3 hover:border-amber-500/50 transition-all duration-200 shadow-xs"
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans font-bold text-sm text-on-surface">{order.customerName}</span>
                          {/* Amber Tail */}
                          <button
                            onClick={() => onSelectOrderDetail(order)}
                            title="Ver información completa del pedido"
                            className="text-[10px] font-sans font-extrabold text-amber-950 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 hover:from-amber-300 hover:to-amber-200 border border-amber-400/80 px-2.5 py-0.5 rounded-full transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                          >
                            <span>{order.id}</span>
                            <span className="material-symbols-outlined text-[11px] text-amber-800">visibility</span>
                          </button>
                        </div>
                        <span className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                          {order.details}
                        </span>
                        <span className="font-sans text-[11px] text-amber-900 mt-1 font-semibold">
                          Dir: {order.address} • {formatTime(order)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center shrink-0">
                        <button
                          onClick={() => onRequestReverse(order)}
                          title="Reversar a pendientes"
                          className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-sans font-semibold text-xs py-2 px-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 border border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined text-sm">undo</span>
                          <span>Reversar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
