import { CustomerFrequency } from "@/types";

interface FrequentCustomersCardProps {
  customers: CustomerFrequency[];
}

export default function FrequentCustomersCard({ customers }: FrequentCustomersCardProps) {
  return (
    <section className="md:col-span-4 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
        <h3 className="font-display font-semibold text-lg text-on-surface">Clientes Frecuentes</h3>
        <span className="material-symbols-outlined text-on-surface-variant">group</span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
        {customers.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-1.5 opacity-75">
            <span className="material-symbols-outlined text-[36px] text-outline/30">people</span>
            <p className="font-sans text-xs">Aún no hay clientes registrados.</p>
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.name}
              className="flex justify-between items-center py-1.5 border-b border-outline-variant/5 last:border-b-0"
            >
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-sm text-on-surface">{customer.name}</span>
                <span className="font-sans text-xs text-on-surface-variant">
                  {customer.orders} {customer.orders === 1 ? "Pedido" : "Pedidos"}
                </span>
              </div>
              <span className="bg-[#ECFDF5] text-primary font-sans font-semibold text-[10px] px-2.5 py-0.5 rounded-full border border-primary-container/20">
                {customer.tag}
              </span>
            </div>
          ))
        )}
      </div>

      <button className="w-full bg-surface-container-low text-on-surface border border-outline-variant/20 font-sans font-semibold text-xs py-2.5 rounded-xl hover:bg-surface-container-high transition-colors mt-auto">
        Ver Todos los Clientes
      </button>
    </section>
  );
}
