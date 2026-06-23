"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ADMIN_PIN } from "@/products";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const CORRECT_PIN = ADMIN_PIN;
  const MAX_LENGTH = 6;

  useEffect(() => {
    console.log("AdminLoginPage mounted/updated. pin:", pin, "CORRECT_PIN:", CORRECT_PIN, "isError:", isError, "isSuccess:", isSuccess);
  }, [pin, CORRECT_PIN, isError, isSuccess]);

  const handleInput = (val: string) => {
    console.log("handleInput triggered with val:", val, "current pin:", pin);
    if (isError || isSuccess) return;

    if (pin.length < MAX_LENGTH) {
      const nextPin = pin + val;
      console.log("Setting next pin state to:", nextPin);
      setPin(nextPin);

      if (nextPin.length === MAX_LENGTH) {
        if (nextPin === CORRECT_PIN) {
          setIsSuccess(true);
          // Set admin session/auth cookie/localstorage so the dashboard knows we are logged in
          localStorage.setItem("kb_admin_authenticated", "true");
          setTimeout(() => {
            router.push("/admin/dashboard");
          }, 800);
        } else {
          setIsError(true);
          setTimeout(() => {
            setPin("");
            setIsError(false);
          }, 1500);
        }
      }
    }
  };

  const handleDelete = () => {
    console.log("handleDelete triggered");
    if (isError || isSuccess) {
      console.log("Delete ignored because isError or isSuccess is true");
      return;
    }
    if (pin.length > 0) {
      const nextPin = pin.slice(0, -1);
      console.log("Deleting last character, new pin state:", nextPin);
      setPin(nextPin);
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("Keyboard event: KeyDown:", e.key);
      if (e.key >= "0" && e.key <= "9") {
        handleInput(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pin, isError, isSuccess]);

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center font-sans text-on-surface antialiased overflow-hidden selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Decorative ambient background elements for "Quiet Luxury" feel */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-surface-container-high blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-surface-container-low blur-3xl mix-blend-multiply"></div>
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[400px] px-6 md:px-0 flex flex-col items-center">
        {/* Header / Logo */}
        <header className="text-center mb-8 flex flex-col items-center">
          <Link
            href="/"
            className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-center mb-4 border border-outline-variant/10 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_lock
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-tight">KetoBoutique</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-2 text-center max-w-[280px]">
            Área administrativa protegida
          </p>
        </header>

        {/* Login Card */}
        <section className="bg-surface-container-lowest w-full rounded-[24px] p-6 sm:p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.06)] flex flex-col items-center relative overflow-hidden border border-outline-variant/10">
          
          {/* Error Message Overlay */}
          <div
            className={`absolute top-0 left-0 w-full bg-error-container text-on-error-container font-sans font-semibold text-sm py-3 text-center transition-all duration-300 z-20 flex items-center justify-center gap-2 ${
              isError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">error</span>
            PIN Incorrecto
          </div>

          {/* PIN Display Dots */}
          <div
            className={`flex gap-3 sm:gap-4 mb-8 sm:mb-10 mt-4 h-4 items-center justify-center w-full transition-all ${
              isError ? "animate-shake" : ""
            }`}
          >
            {[...Array(MAX_LENGTH)].map((_, index) => {
              const isFilled = index < pin.length;
              let dotClass = "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ";

              if (isSuccess) {
                dotClass += "bg-primary-container scale-110";
              } else if (isError) {
                dotClass += "bg-error";
              } else if (isFilled) {
                dotClass += "bg-primary scale-110";
              } else {
                dotClass += "bg-surface-container-high";
              }

              return <div key={index} className={dotClass} />;
            })}
          </div>

          {/* Numpad Grid */}
          <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4 w-full px-2 sm:px-4 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleInput(num.toString())}
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-display font-semibold text-xl text-on-surface bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low active:scale-95 focus:outline-none transition-all duration-100 shadow-sm"
              >
                {num}
              </button>
            ))}
            
            {/* Row 4 */}
            <div className="w-16 h-16 mx-auto"></div>
            <button
              onClick={() => handleInput("0")}
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-display font-semibold text-xl text-on-surface bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low active:scale-95 focus:outline-none transition-all duration-100 shadow-sm"
            >
              0
            </button>
            <button
              aria-label="Delete"
              onClick={handleDelete}
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low active:scale-95 focus:outline-none transition-all duration-100"
            >
              <span className="material-symbols-outlined text-[24px]">backspace</span>
            </button>
          </div>
        </section>

        {/* Footer Help Link */}
        <div className="mt-6 text-center">
          <button className="font-sans font-semibold text-sm text-tertiary hover:text-on-surface transition-colors bg-transparent border-none">
            ¿Necesita ayuda?
          </button>
        </div>
      </main>


    </div>
  );
}
