"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function LoginPage() {
  const { open } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    open("signin");
    router.replace("/");
  }, [open, router]);

  return null;
}
