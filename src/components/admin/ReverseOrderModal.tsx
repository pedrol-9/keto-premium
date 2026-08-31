import { Order } from "@/types";

interface ReverseOrderModalProps {
  order: Order | null;
  onCancel: () => void;
  onConfirm: (orderId: string) => void;
}

export default function ReverseOrderModal({
  order,
  onCancel,
  onConfirm,
}: ReverseOrderModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[24px] p-6 sm:p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.2)] border border-outline-variant/15 flex flex-col gap-5 animate-scaleUp">
        {/* Header Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shrink-0">
            <span className="material-symbols-outlined text-[26px]">undo</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              ¿Reversar a Pendientes?
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">
              El pedido volverá al estado de &quot;Por Confirmar&quot;.
            </p>
          </div>
        </div>

        {/* Order Info Preview */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-sans font-bold text-xs text-on-surface">{order.customerName}</span>
            <span className="font-sans font-bold text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              {order.id}
            </span>
          </div>
          <p className="font-sans text-xs text-on-surface-variant line-clamp-2">{order.details}</p>
          <div className="flex justify-between items-center text-[11px] font-semibold text-primary pt-1 border-t border-outline-variant/10">
            <span>Total: {order.total}</span>
            <span>Estado actual: {order.status === "dispatched" ? "Despachada" : "Confirmada"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant font-sans font-semibold text-xs hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(order.id)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-sans font-bold text-xs shadow-md shadow-amber-600/25 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Sí, Reversar
          </button>
        </div>
      </div>
    </div>
  );
}
