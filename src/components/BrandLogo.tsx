"use client";

import Link from "next/link";

interface BrandLogoProps {
  showSlogan?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandIcon({ className = "" }: { className?: string }) {
  return (
    /* Contenedor circular — 74px ≈ 92% de los 80px del header */
    <div
      className={`
        kb-icon-wrap
        relative flex items-center justify-center
        w-[74px] h-[74px] shrink-0
        rounded-full overflow-hidden
        group-hover:scale-105 transition-all duration-300
        ${className}
      `}
    >
      <img
        src="/logo_si_fondo.png"
        alt="KetoBoutique"
        className="
          kb-logo-img
          relative z-10
          w-[92%] h-[92%]
          object-contain
          pointer-events-none
          drop-shadow-[0_3px_10px_rgba(5,150,105,0.2)]
        "
      />

      {/* Keyframe inline para el float — se inyecta en el mismo componente */}
      <style>{`
        @keyframes kb-float {
          0%   { transform: translateY(0px) rotate(0deg); }
          25%  { transform: translateY(-4px) rotate(0.6deg); }
          55%  { transform: translateY(1.5px) rotate(-0.4deg); }
          80%  { transform: translateY(-2px) rotate(0.2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .kb-icon-wrap:hover .kb-logo-img,
        .kb-icon-wrap:active .kb-logo-img {
          animation: kb-float 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function BrandLogo({ showSlogan = false, className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 select-none group ${className}`}
    >
      <BrandIcon />

      <div className="flex flex-col justify-center">
        <div className="font-display font-extrabold tracking-tight leading-none text-xl sm:text-2xl md:text-[26px]">
          <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent group-hover:from-emerald-500 group-hover:to-teal-400 transition-all">
            Keto
          </span>
          <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-400 group-hover:to-orange-400 transition-all">
            Boutique
          </span>
        </div>
        {showSlogan && (
          <span className="font-serif italic font-semibold text-[10px] sm:text-[11px] text-emerald-800/80 tracking-wider mt-0.5 uppercase">
            Haute Cuisine
          </span>
        )}
      </div>
    </Link>
  );
}
