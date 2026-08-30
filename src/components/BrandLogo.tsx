"use client";

import Link from "next/link";

interface BrandLogoProps {
  showSlogan?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} group-hover:scale-105 group-hover:rotate-1 transition-all duration-300`}>
      {/* Ambient background glow on hover */}
      <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500/30 via-amber-400/25 to-teal-400/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(5,150,105,0.2)]"
      >
        <defs>
          <linearGradient id="kbEmeraldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="kbGoldGrad" x1="20" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <linearGradient id="kbLeafGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <filter id="kbDropShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#064e3b" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Soft Organic Shield Halo */}
        <path
          d="M50 10C32 10 18 26 18 51C18 75 32 90 50 90C68 90 82 75 82 51C82 26 68 10 50 10Z"
          fill="url(#kbEmeraldGrad)"
          fillOpacity="0.08"
        />

        {/* Calligraphic Emerald "K" */}
        {/* Main Stem with smooth top & bottom teardrop terminal */}
        <path
          d="M36 24C36 21 33 19 30 20C26 21.5 25 26 25 32C25 46 25 60 25 72C25 78 28 81 33 80C36 79.5 37 76 37 72C37 60 37 46 37 32C37 28 36.5 25 36 24Z"
          fill="url(#kbEmeraldGrad)"
          filter="url(#kbDropShadow)"
        />

        {/* K Upper Diagonal arm */}
        <path
          d="M33 48C38 43 45 35 52 26C55 22 53 19 49 19C45 19 40 23 34 30L33 48Z"
          fill="url(#kbEmeraldGrad)"
        />

        {/* Organic Leaf Accent flourishing from top of K */}
        <path
          d="M52 23C56 18 63 17 65 19C67 21 65 28 60 31C55 34 50 28 52 23Z"
          fill="url(#kbLeafGrad)"
          className="transition-transform duration-300 group-hover:scale-110 origin-center"
        />

        {/* Interlocking Golden Amber "B" */}
        {/* Top Loop */}
        <path
          d="M42 30C42 25 47 22 54 22C63 22 69 27 69 34C69 41 62 46 53 46C49 46 45 45 42 43V30Z"
          fill="url(#kbGoldGrad)"
          filter="url(#kbDropShadow)"
        />

        {/* Bottom Loop (Generous gourmet curve) */}
        <path
          d="M42 44C47 45 53 45 58 45C68 45 76 51 76 60C76 71 67 78 54 78C45 78 40 73 38 67C37 64 39 62 42 62C45 62 46 64 48 67C50 70 53 71 56 71C62 71 67 67 67 60C67 53 61 51 53 51C48 51 44 51.5 42 52V44Z"
          fill="url(#kbGoldGrad)"
          filter="url(#kbDropShadow)"
        />

        {/* Golden Diamond / Sparkle Spark Accent */}
        <circle cx="53" cy="48.5" r="3.5" fill="#FBBF24" />
        <path d="M53 43L54.5 47.5L59 48.5L54.5 49.5L53 54L51.5 49.5L47 48.5L51.5 47.5L53 43Z" fill="#FFFBEB" />
      </svg>
    </div>
  );
}

export default function BrandLogo({ showSlogan = false, className = "", size = "md" }: BrandLogoProps) {
  const iconSize = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12 sm:w-14 sm:h-14" : "w-10 h-10 sm:w-11 sm:h-11";
  const titleSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl sm:text-3xl md:text-4xl" : "text-xl sm:text-2xl md:text-[26px]";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group ${className}`}>
      <BrandIcon className={iconSize} />
      <div className="flex flex-col justify-center">
        <div className={`font-display font-extrabold tracking-tight leading-none ${titleSize}`}>
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
