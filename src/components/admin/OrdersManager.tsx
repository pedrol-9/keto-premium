"use client";

import { useState } from "react";
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

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedUnDispatchedOrders = orders.filter((o) => o.status === "confirmed");
  const dispatchedOrders = orders.filter((o) => o.status === "dispatched");
  const totalConfirmedTabCount = confirmedUnDispatchedOrders.length + dispatchedOrders.length;

  return (
    <section className="md:col-span-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/10 pb-4">
        <div>
          <h3 className="font-display font-bold text-xl text-on-surface">Gestión de Pedidos</h3>
          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
            Haz click en el código del pedido (#) para ver los detalles completos.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/15 self-start sm:self-auto">
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
              {pendingOrders.length}
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
              {totalConfirmedTabCount}
            </span>
          </button>
        </div>
      </div>

      {/* TAB: PENDIENTES */}
      {ordersTab === "pending" && (
        <>
          {pendingOrders.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[48px] text-emerald-600/30">done_all</span>
              <p className="font-sans text-sm font-medium">No hay pedidos pendientes por confirmar.</p>
              <p className="font-sans text-xs text-on-surface-variant/70">
                Los nuevos pedidos desde WhatsApp aparecerán aquí en tiempo real.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl gap-4 hover:border-emerald-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant shrink-0 border border-outline-variant/10">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
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
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
                    <button
                      onClick={() => onConfirmOrder(order.id)}
                      className="w-full sm:w-auto bg-[#059669] hover:bg-emerald-600 text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20"
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
          {totalConfirmedTabCount === 0 ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[48px] text-amber-500/30">inventory_2</span>
              <p className="font-sans text-sm font-medium">No hay pedidos confirmados en este momento.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-h-[460px] overflow-y-auto pr-1">
              {/* Sub-sección 1: Confirmadas sin despachar */}
              {confirmedUnDispatchedOrders.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-emerald-800">
                      Confirmadas en Cocina ({confirmedUnDispatchedOrders.length})
                    </span>
                  </div>

                  {confirmedUnDispatchedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-emerald-50/40 border border-emerald-500/20 rounded-xl gap-4 hover:border-emerald-500/40 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100/80 rounded-full flex items-center justify-center text-emerald-800 shrink-0 border border-emerald-300/40">
                          <span className="material-symbols-outlined text-[20px]">restaurant</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
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
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
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
              {dispatchedOrders.length > 0 && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-2 px-1 border-t border-outline-variant/10 pt-4">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-amber-900">
                      Despachadas en Ruta ({dispatchedOrders.length})
                    </span>
                  </div>

                  {dispatchedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-amber-50/50 border border-amber-400/30 rounded-xl gap-4 hover:border-amber-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 shrink-0 border border-amber-300/50">
                          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-sm text-on-surface">{order.customerName}</span>
                            <button
                              onClick={() => onSelectOrderDetail(order)}
                              title="Ver información completa del pedido"
                              className="text-[10px] font-sans font-extrabold text-amber-950 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 hover:from-amber-300 hover:to-amber-200 border border-amber-400/80 px-2.5 py-0.5 rounded-full transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                            >
                              <span>{order.id}</span>
                              <span className="material-symbols-outlined text-[11px] text-amber-800">visibility</span>
                            </button>
                            <span className="text-[9px] font-sans font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.2 rounded-full">
                              En ruta
                            </span>
                          </div>
                          <span className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                            {order.details}
                          </span>
                          <span className="font-sans text-[11px] text-amber-900 mt-1 font-semibold">
                            Dir: {order.address} • {formatTime(order)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
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
