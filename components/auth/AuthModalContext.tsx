"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type AuthTab = "signin" | "register";

interface AuthModalContextType {
  isOpen: boolean;
  activeTab: AuthTab;
  open: (tab?: AuthTab) => void;
  close: () => void;
  switchTab: (tab: AuthTab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Auto-open from ?auth=signin or ?auth=register query param
  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "signin" || authParam === "register") {
      setActiveTab(authParam);
      setIsOpen(true);
      // Clean the URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("callbackUrl");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  const open = useCallback((tab: AuthTab = "signin") => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchTab = useCallback((tab: AuthTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, activeTab, open, close, switchTab }}>
      {children}
    </AuthModalContext.Provider>
  );
}
