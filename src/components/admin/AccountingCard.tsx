"use client";

import { AccountingData } from "@/types";

interface AccountingCardProps {
  accounting: AccountingData;
  accountingStatus: string | null;
  onChange: (updated: AccountingData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AccountingCard({
  accounting,
  accountingStatus,
  onChange,
  onSubmit,
}: AccountingCardProps) {
  return (
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

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
            Caja Inicial
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-sans">$</span>
            <input
              type="number"
              className="w-full bg-surface-container-low rounded-xl py-2.5 pl-8 pr-4 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
              placeholder="0.00"
              value={accounting.initialCash}
              onChange={(e) => onChange({ ...accounting, initialCash: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
            Egresos / Gastos
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-sans">$</span>
            <input
              type="number"
              className="w-full bg-surface-container-low rounded-xl py-2.5 pl-8 pr-4 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
              placeholder="0.00"
              value={accounting.expenses}
              onChange={(e) => onChange({ ...accounting, expenses: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans font-semibold text-xs text-on-surface-variant uppercase tracking-wider">
            Ingreso Manual
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-sans">$</span>
            <input
              type="number"
              className="w-full bg-surface-container-low rounded-xl py-2.5 pl-8 pr-4 font-sans text-sm text-on-surface border border-transparent focus:bg-white focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all outline-none"
              placeholder="0.00"
              value={accounting.manualIncome}
              onChange={(e) => onChange({ ...accounting, manualIncome: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:opacity-90 text-on-primary font-sans font-semibold text-sm py-3 rounded-xl transition-all active:scale-95 shadow-sm"
        >
          Guardar Registros
        </button>
      </form>
    </section>
  );
}
