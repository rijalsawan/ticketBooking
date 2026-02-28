"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthModal } from "./AuthModalContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal() {
  const { isOpen, activeTab, close, switchTab } = useAuthModal();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Animate in / out
  useEffect(() => {
    if (isOpen) {
      // Mount first, then animate in on next frame
      setAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      document.body.style.overflow = "hidden";
    } else if (visible) {
      // Animate out, then unmount
      setVisible(false);
      const t = setTimeout(() => setAnimating(false), 200);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) close();
  };

  if (!isOpen && !animating) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(6px)" : "blur(0px)",
        transition: "background-color 200ms ease, backdrop-filter 200ms ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-100 max-h-[90vh] overflow-y-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <div className="bg-[#111111] border border-white/8 rounded-xl shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h2 className="text-[15px] font-semibold text-white">
              {activeTab === "signin" ? "Sign in" : "Create account"}
            </h2>
            <button
              onClick={close}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/6 transition-colors duration-150"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
              </svg>
            </button>
          </div>

          {/* Tab switcher */}
          <div className="px-6 pt-4">
            <div className="flex bg-white/4 rounded-lg p-0.5">
              <button
                onClick={() => switchTab("signin")}
                className={`relative flex-1 py-2 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  activeTab === "signin"
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {activeTab === "signin" && (
                  <span className="absolute inset-0 bg-white/[0.07] rounded-md" />
                )}
                <span className="relative">Sign In</span>
              </button>
              <button
                onClick={() => switchTab("register")}
                className={`relative flex-1 py-2 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  activeTab === "register"
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {activeTab === "register" && (
                  <span className="absolute inset-0 bg-white/[0.07] rounded-md" />
                )}
                <span className="relative">Create Account</span>
              </button>
            </div>
          </div>

          {/* Form area — fixed min-height so container doesn't jump */}
          <div className="px-6 pt-5 pb-6 min-h-95">
            <div
              key={activeTab}
              className="animate-[fadeSlideIn_150ms_ease-out]"
            >
              {activeTab === "signin" ? (
                <LoginForm onSuccess={close} compact />
              ) : (
                <RegisterForm onSuccess={() => switchTab("signin")} compact />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
