"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ADMIN_PIN } from "@/products";

// ── WebAuthn helpers ──────────────────────────────────────────────────────────
const BIOMETRIC_CRED_KEY = "kb_biometric_cred";

function isBiometricSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

function getStoredCredId(): Uint8Array | null {
  try {
    const stored = localStorage.getItem(BIOMETRIC_CRED_KEY);
    if (!stored) return null;
    return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

async function registerBiometric(): Promise<boolean> {
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "KetoBoutique Admin", id: window.location.hostname },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: "admin@ketoboutique",
          displayName: "Admin",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
      },
    })) as PublicKeyCredential;

    const encoded = btoa(
      String.fromCharCode(...new Uint8Array(credential.rawId))
    );
    localStorage.setItem(BIOMETRIC_CRED_KEY, encoded);
    return true;
  } catch {
    return false;
  }
}

async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const credId = getStoredCredId();
    if (!credId) return false;

    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [
          { id: credId, type: "public-key", transports: ["internal"] },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return true;
  } catch {
    return false;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const router = useRouter();

  const CORRECT_PIN = ADMIN_PIN;
  const MAX_LENGTH = 4;

  // Check WebAuthn availability on mount
  useEffect(() => {
    if (isBiometricSupported()) {
      setBiometricAvailable(true);
      setBiometricRegistered(!!getStoredCredId());
    }
  }, []);

  const grantAccess = useCallback(() => {
    localStorage.setItem("kb_admin_authenticated", "true");
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 800);
  }, [router]);

  const handleInput = useCallback(
    (val: string) => {
      if (isError || isSuccess) return;

      if (pin.length < MAX_LENGTH) {
        const nextPin = pin + val;
        setPin(nextPin);

        if (nextPin.length === MAX_LENGTH) {
          if (nextPin === CORRECT_PIN) {
            setIsSuccess(true);
            // Offer biometric registration if not yet registered
            if (biometricAvailable && !biometricRegistered) {
              setShowBiometricPrompt(true);
            } else {
              grantAccess();
            }
          } else {
            setIsError(true);
            setTimeout(() => {
              setPin("");
              setIsError(false);
            }, 1500);
          }
        }
      }
    },
    [pin, isError, isSuccess, CORRECT_PIN, biometricAvailable, biometricRegistered, grantAccess]
  );

  const handleDelete = useCallback(() => {
    if (isError || isSuccess) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }, [pin, isError, isSuccess]);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    const ok = await authenticateWithBiometric();
    setBiometricLoading(false);
    if (ok) {
      setIsSuccess(true);
      grantAccess();
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 1500);
    }
  };

  const handleRegisterBiometric = async () => {
    const ok = await registerBiometric();
    setShowBiometricPrompt(false);
    if (ok) setBiometricRegistered(true);
    grantAccess();
  };

  const handleSkipBiometric = () => {
    setShowBiometricPrompt(false);
    grantAccess();
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleInput(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, handleDelete]);

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center font-sans text-on-surface antialiased overflow-hidden selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-surface-container-high blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-surface-container-low blur-3xl mix-blend-multiply"></div>
      </div>

      {/* ── Biometric registration prompt overlay ── */}
      {showBiometricPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[28px] p-8 shadow-[0px_20px_60px_rgba(0,0,0,0.18)] border border-outline-variant/10 flex flex-col items-center gap-5 animate-in slide-in-from-bottom-4 duration-300">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[44px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                fingerprint
              </span>
            </div>

            <div className="text-center">
              <h2 className="font-display font-bold text-xl text-on-surface">
                Acceso biométrico
              </h2>
              <p className="font-sans text-sm text-on-surface-variant mt-2 leading-relaxed max-w-[260px]">
                Activa la huella digital o Face ID para entrar al panel sin necesidad del PIN la próxima vez.
              </p>
            </div>

            <button
              onClick={handleRegisterBiometric}
              className="w-full bg-primary text-on-primary font-sans font-semibold text-sm py-4 rounded-2xl transition-all active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                fingerprint
              </span>
              Activar huella / Face ID
            </button>

            <button
              onClick={handleSkipBiometric}
              className="font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {/* ── Main Container ── */}
      <main className="relative z-10 w-full max-w-[400px] px-6 md:px-0 flex flex-col items-center">
        {/* Header / Logo */}
        <header className="text-center mb-8 flex flex-col items-center">
          <Link
            href="/"
            className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-center mb-4 border border-outline-variant/10 hover:opacity-90 active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[32px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_lock
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-primary tracking-tight">
            KetoBoutique
          </h1>
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
            {biometricLoading ? "Error biométrico" : "PIN Incorrecto"}
          </div>

          {/* ── Biometric login button (shown when credential is stored) ── */}
          {biometricRegistered && !isSuccess && (
            <>
              <button
                onClick={handleBiometricLogin}
                disabled={biometricLoading}
                className="w-full mb-5 flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all disabled:opacity-60 group"
              >
                <span
                  className={`material-symbols-outlined text-[48px] text-primary transition-transform ${
                    biometricLoading ? "animate-pulse scale-110" : "group-hover:scale-110"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  fingerprint
                </span>
                <span className="font-sans font-semibold text-sm text-primary">
                  {biometricLoading ? "Verificando…" : "Entrar con huella / Face ID"}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 w-full mb-5">
                <div className="flex-1 h-px bg-outline-variant/20" />
                <span className="font-sans text-xs text-on-surface-variant/50">
                  o usa tu PIN
                </span>
                <div className="flex-1 h-px bg-outline-variant/20" />
              </div>
            </>
          )}

          {/* PIN Display Dots */}
          <div
            className={`flex gap-4 sm:gap-5 mb-8 sm:mb-10 mt-2 h-4 items-center justify-center w-full transition-all ${
              isError ? "animate-shake" : ""
            }`}
          >
            {[...Array(MAX_LENGTH)].map((_, index) => {
              const isFilled = index < pin.length;
              let dotClass =
                "w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200 ";

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
            <div className="w-16 h-16 mx-auto" />
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

        {/* Footer */}
        <div className="mt-6 text-center">
          <button className="font-sans font-semibold text-sm text-tertiary hover:text-on-surface transition-colors bg-transparent border-none">
            ¿Necesita ayuda?
          </button>
        </div>
      </main>
    </div>
  );
}
