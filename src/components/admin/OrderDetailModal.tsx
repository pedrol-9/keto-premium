import { Order } from "@/types";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
  onDispatch: (orderId: string) => void;
  onReverse: (order: Order) => void;
  formatTime: (order: Order) => string;
}

export default function OrderDetailModal({
  order,
  onClose,
  onConfirm,
  onDispatch,
  onReverse,
  formatTime,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 pb-20 sm:pb-6 animate-fadeIn">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-[28px] p-5 sm:p-7 shadow-[0px_25px_70px_rgba(0,0,0,0.3)] border border-outline-variant/15 flex flex-col gap-5 animate-scaleUp max-h-[85vh] overflow-y-auto relative">
        {/* Close Button (Corner Aligned) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all active:scale-95 z-10 border border-outline-variant/15"
          title="Cerrar"
          aria-label="Cerrar modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-outline-variant/10 pb-3.5 pr-8">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans font-black text-lg sm:text-xl text-on-surface">
                Pedido #{order.id}
              </span>
              <span
                className={`font-sans font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  order.status === "dispatched"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : order.status === "confirmed"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-error-container text-on-error-container border-error/20"
                }`}
              >
                {order.status === "dispatched"
                  ? "Despachada"
                  : order.status === "confirmed"
                  ? "Confirmada"
                  : "Pendiente"}
              </span>
            </div>
            <span className="font-sans text-xs text-on-surface-variant">
              Registrado: {formatTime(order)}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Cliente */}
          <div className="bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-outline-variant/10 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">person</span>
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant">
                Cliente
              </span>
              <span className="font-sans font-bold text-sm text-on-surface truncate">{order.customerName}</span>
            </div>
          </div>

          {/* Total */}
          <div className="bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-outline-variant/10 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-700 text-[22px] mt-0.5">payments</span>
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant">
                Total Pedido
              </span>
              <span className="font-display font-extrabold text-base bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent truncate">
                {order.total}
              </span>
            </div>
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2 bg-surface-container-low p-3.5 sm:p-4 rounded-2xl border border-outline-variant/10 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[22px] mt-0.5">location_on</span>
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-semibold text-[11px] uppercase tracking-wider text-on-surface-variant">
                Dirección de Entrega
              </span>
              <span className="font-sans font-semibold text-sm text-on-surface">{order.address}</span>
            </div>
          </div>
        </div>

        {/* Productos Desglosados */}
        <div className="flex flex-col gap-2">
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant">
            Items Solicitados
          </span>
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2 shadow-xs">
            {order.details.split(",").map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 py-1 border-b border-outline-variant/5 last:border-b-0">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span className="font-sans font-medium text-sm text-on-surface">{item.trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/10 mt-auto">
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "pending" && (
              <button
                onClick={() => {
                  onConfirm(order.id);
                }}
                className="bg-[#059669] hover:bg-emerald-600 text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shadow-emerald-700/20"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                Confirmar Pedido
              </button>
            )}

            {order.status === "confirmed" && (
              <>
                <button
                  onClick={() => {
                    onDispatch(order.id);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-sans font-semibold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm shadow-amber-600/20"
                >
                  <span className="material-symbols-outlined text-sm">moped</span>
                  Marcar Despachada
                </button>

                <button
                  onClick={() => {
                    onReverse(order);
                    onClose();
                  }}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-sans font-semibold text-xs py-2.5 px-3.5 rounded-xl transition-all active:scale-95 flex items-center gap-1 border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-sm">undo</span>
                  Reversar
                </button>
              </>
            )}

            {order.status === "dispatched" && (
              <button
                onClick={() => {
                  onReverse(order);
                  onClose();
                }}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-sans font-semibold text-xs py-2.5 px-3.5 rounded-xl transition-all active:scale-95 flex items-center gap-1 border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-sm">undo</span>
                Reversar a Pendiente
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-sans font-semibold text-xs transition-colors ml-auto border border-outline-variant/15"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
