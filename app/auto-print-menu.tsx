"use client";

import { useEffect } from "react";

export default function AutoPrintMenu() {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("print-menu")) return;
    const timer = window.setTimeout(() => window.print(), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
