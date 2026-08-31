import Link from "next/link";

export default function AdminBottomNav() {
  return (
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
  );
}
