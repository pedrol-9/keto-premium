interface DashboardMetricsProps {
  totalVisits: number;
  whatsappRedirects: number;
  confirmedCount: number;
  conversionRate: string;
}

export default function DashboardMetrics({
  totalVisits,
  whatsappRedirects,
  confirmedCount,
  conversionRate,
}: DashboardMetricsProps) {
  return (
    <section className="md:col-span-8 grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Metric Card 1: Visitas */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-[80px]">visibility</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
            Visitas Totales
          </span>
          <span className="font-display font-bold text-3xl text-on-surface">{totalVisits}</span>
        </div>
        <div className="flex items-center text-primary gap-1 text-xs font-semibold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>+12% este mes</span>
        </div>
      </div>

      {/* Metric Card 2: Redirecciones WA */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-[80px]">chat</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
            Redirecciones WA
          </span>
          <span className="font-display font-bold text-3xl text-on-surface">{whatsappRedirects}</span>
        </div>
        <div className="flex items-center text-primary gap-1 text-xs font-semibold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>+5% esta semana</span>
        </div>
      </div>

      {/* Metric Card 3: Pedidos Listos */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-[80px]">check_circle</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
            Pedidos Listos
          </span>
          <span className="font-display font-bold text-3xl text-on-surface">{confirmedCount}</span>
        </div>
        <div className="flex items-center text-on-surface-variant gap-1 text-xs font-semibold">
          <span className="material-symbols-outlined text-sm">horizontal_rule</span>
          <span>En despacho</span>
        </div>
      </div>

      {/* Metric Card 4: Conversión */}
      <div className="bg-primary text-on-primary rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden shadow-[0px_10px_30px_rgba(0,105,72,0.15)]">
        <div className="flex flex-col gap-1">
          <span className="font-sans font-semibold text-xs text-primary-container uppercase tracking-wider">
            Conversión
          </span>
          <span className="font-display font-bold text-3xl text-on-primary">{conversionRate}%</span>
        </div>
        <div className="flex items-center text-primary-container gap-1 text-xs font-semibold">
          <span className="material-symbols-outlined text-sm">bolt</span>
          <span>Tasa Óptima</span>
        </div>
      </div>
    </section>
  );
}
