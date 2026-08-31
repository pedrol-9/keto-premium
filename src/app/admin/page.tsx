"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_PIN } from "@/products";

const MAX_LENGTH = 4;

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(true);
  const [biometricLoading, setBiometricLoading] = useState<boolean>(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState<boolean>(false);

  // Check if WebAuthn is supported
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
        "function"
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setBiometricAvailable(available);
        })
        .catch(() => {
          setBiometricAvailable(true); // default true for modern mobile PWAs
        });
    }
  }, []);

  const handleSuccessfulAuth = useCallback(() => {
    setIsSuccess(true);
    localStorage.setItem("kb_admin_authenticated", "true");

    const hasCred = !!localStorage.getItem("kb_biometric_credential_id");
    if (biometricAvailable && !hasCred) {
      setShowBiometricPrompt(true);
    } else {
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 350);
    }
  }, [biometricAvailable, router]);

  // Handle PIN input
  const handleInput = useCallback(
    (digit: string) => {
      if (pin.length < MAX_LENGTH && !isSuccess) {
        const nextPin = pin + digit;
        setPin(nextPin);
        setIsError(false);

        if (nextPin.length === MAX_LENGTH) {
          if (nextPin === ADMIN_PIN) {
            handleSuccessfulAuth();
          } else {
            setIsError(true);
            setTimeout(() => {
              setPin("");
              setIsError(false);
            }, 600);
          }
        }
      }
    },
    [pin, isSuccess, handleSuccessfulAuth]
  );

  const handleDelete = useCallback(() => {
    if (pin.length > 0 && !isSuccess) {
      setPin(pin.slice(0, -1));
      setIsError(false);
    }
  }, [pin, isSuccess]);

  // Biometric registration (WebAuthn create credential)
  const handleRegisterBiometric = async () => {
    try {
      setBiometricLoading(true);
      const rawChallenge = crypto.getRandomValues(new Uint8Array(32));
      const challengeBuffer = new ArrayBuffer(rawChallenge.byteLength);
      new Uint8Array(challengeBuffer).set(rawChallenge);

      const rawUserId = crypto.getRandomValues(new Uint8Array(16));
      const userIdBuffer = new ArrayBuffer(rawUserId.byteLength);
      new Uint8Array(userIdBuffer).set(rawUserId);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challengeBuffer,
        rp: {
          name: "KetoBoutique Admin",
          id: window.location.hostname,
        },
        user: {
          id: userIdBuffer,
          name: "admin@ketoboutique.com",
          displayName: "KetoBoutique Admin",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential | null;

      if (credential) {
        const credId = btoa(
          String.fromCharCode(...new Uint8Array(credential.rawId))
        );
        localStorage.setItem("kb_biometric_credential_id", credId);
      }
    } catch (e) {
      console.warn("Biometric registration cancelled or failed:", e);
    } finally {
      setBiometricLoading(false);
      setShowBiometricPrompt(false);
      router.push("/admin/dashboard");
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricPrompt(false);
    router.push("/admin/dashboard");
  };

  // Biometric action trigger (Login or First-time setup)
  const handleBiometricAction = async () => {
    const savedCredId = typeof window !== "undefined" ? localStorage.getItem("kb_biometric_credential_id") : null;

    // If not registered yet, prompt directly to register
    if (!savedCredId) {
      setShowBiometricPrompt(true);
      return;
    }

    // Otherwise authenticate via stored assertion
    try {
      setBiometricLoading(true);
      setIsError(false);

      const rawChallenge = crypto.getRandomValues(new Uint8Array(32));
      const challengeBuffer = new ArrayBuffer(rawChallenge.byteLength);
      new Uint8Array(challengeBuffer).set(rawChallenge);

      const rawCredBytes = Uint8Array.from(atob(savedCredId), (c) =>
        c.charCodeAt(0)
      );
      const credIdBuffer = new ArrayBuffer(rawCredBytes.byteLength);
      new Uint8Array(credIdBuffer).set(rawCredBytes);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challengeBuffer,
        allowCredentials: [
          {
            id: credIdBuffer,
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (assertion) {
        setIsSuccess(true);
        localStorage.setItem("kb_admin_authenticated", "true");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 300);
      }
    } catch (e) {
      console.warn("Biometric authentication cancelled or failed:", e);
      setIsError(true);
      setTimeout(() => setIsError(false), 800);
    } finally {
      setBiometricLoading(false);
    }
  };

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showBiometricPrompt) return;
      if (e.key >= "0" && e.key <= "9") {
        handleInput(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput, handleDelete, showBiometricPrompt]);

  return (
    <div className="fixed inset-0 w-full h-full bg-background overflow-hidden flex flex-col items-center justify-center font-sans text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container p-4 overscroll-none touch-none">
      {/* ── Top-Left Back Button ── */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-1 px-2.5 xs:px-3 py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/15 text-on-surface-variant hover:text-primary font-sans text-xs font-semibold shadow-xs transition-all active:scale-95"
        title="Volver a la tienda"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span className="hidden xs:inline">Volver</span>
      </Link>

      {/* Decorative ambient background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-surface-container-high blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-surface-container-low blur-3xl mix-blend-multiply"></div>
      </div>

      {/* ── Biometric registration prompt overlay ── */}
      {showBiometricPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[24px] p-6 sm:p-7 shadow-[0px_20px_60px_rgba(0,0,0,0.3)] border border-outline-variant/10 flex flex-col items-center gap-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[36px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                fingerprint
              </span>
            </div>

            <div className="text-center">
              <h2 className="font-display font-bold text-lg text-on-surface">
                Acceso biométrico
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed max-w-[260px]">
                Activa tu huella digital o Face ID para entrar al panel con un toque.
              </p>
            </div>

            <button
              onClick={handleRegisterBiometric}
              className="w-full bg-primary text-on-primary font-sans font-semibold text-xs py-3.5 rounded-xl transition-all active:scale-95 hover:opacity-90 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                fingerprint
              </span>
              Activar huella / Face ID
            </button>

            <button
              onClick={handleSkipBiometric}
              className="font-sans text-xs text-on-surface-variant hover:text-on-surface transition-colors py-1"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {/* ── Main Zero-Scroll Compact Container ── */}
      <main className="relative z-10 w-full max-w-[350px] flex flex-col items-center">
        {/* Header / Logo */}
        <header className="text-center mb-3 flex flex-col items-center">
          <Link
            href="/"
            className="w-14 h-14 rounded-2xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-center mb-2 border border-outline-variant/10 hover:opacity-90 active:scale-95 transition-all"
            title="Volver a la tienda"
          >
            <span
              className="material-symbols-outlined text-[32px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_lock
            </span>
          </Link>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-primary tracking-tight">
            KetoBoutique
          </h1>
          <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 text-center">
            Área administrativa protegida
          </p>
        </header>

        {/* Login Card */}
        <section className="bg-surface-container-lowest w-full rounded-[22px] p-4 sm:p-5 shadow-[0px_10px_40px_rgba(0,0,0,0.05)] flex flex-col items-center relative overflow-hidden border border-outline-variant/10">
          {/* Error Message Overlay */}
          <div
            className={`absolute top-0 left-0 w-full bg-error-container text-on-error-container font-sans font-semibold text-xs py-2 text-center transition-all duration-300 z-20 flex items-center justify-center gap-1.5 ${
              isError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">error</span>
            {biometricLoading ? "Error biométrico" : "PIN Incorrecto"}
          </div>

          {/* Bottom Back Link */}
        <div className="mt-2.5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-sans font-semibold text-[11px] text-on-surface-variant hover:text-primary transition-colors py-1 px-3 rounded-full hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Volver al menú</span>
          </Link>
        </div>

          {/* ── Symmetrical Biometric Bar (Always Visible & Accessible) ── */}
          {!isSuccess && (
            <div className="w-full mb-3">
              <button
                onClick={handleBiometricAction}
                disabled={biometricLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all disabled:opacity-60 group shadow-xs"
              >
                <span
                  className={`material-symbols-outlined text-[22px] text-primary transition-transform ${
                    biometricLoading ? "animate-pulse scale-110" : "group-hover:scale-110"
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  fingerprint
                </span>
                <span className="font-sans font-semibold text-xs text-primary">
                  {biometricLoading ? "Verificando…" : "Entrar con Huella / Face ID"}
                </span>
              </button>

              {/* Minimal Symmetrical Divider */}
              <div className="flex items-center gap-2.5 w-full mt-2.5">
                <div className="flex-1 h-px bg-outline-variant/15" />
                <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/50">
                  o usa tu PIN
                </span>
                <div className="flex-1 h-px bg-outline-variant/15" />
              </div>
            </div>
          )}

          {/* PIN Display Dots */}
          <div
            className={`flex gap-3 mb-4 mt-0.5 h-3 items-center justify-center w-full transition-all ${
              isError ? "animate-shake" : ""
            }`}
          >
            {[...Array(MAX_LENGTH)].map((_, index) => {
              const isFilled = index < pin.length;
              let dotClass = "w-2.5 h-2.5 rounded-full transition-all duration-200 ";

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

          {/* Numpad Grid (Compact & Ergonomic for Samsung A16 PWA) */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-2 w-full px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleInput(num.toString())}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full mx-auto flex items-center justify-center font-display font-semibold text-lg text-on-surface bg-surface-container-lowest border border-outline-variant/15 hover:bg-surface-container-low active:scale-95 focus:outline-none transition-all duration-100 shadow-xs"
              >
                {num}
              </button>
            ))}

            {/* Row 4 */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 mx-auto" />
            <button
              onClick={() => handleInput("0")}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full mx-auto flex items-center justify-center font-display font-semibold text-lg text-on-surface bg-surface-container-lowest border border-outline-variant/15 hover:bg-surface-container-low active:scale-95 focus:outline-none transition-all duration-100 shadow-xs"
            >
              0
            </button>
            <button
              aria-label="Delete"
              onClick={handleDelete}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full mx-auto flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low active:scale-95 focus:outline-none transition-all duration-100"
            >
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
