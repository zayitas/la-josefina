"use client";

export default function PrintMenuButton() {
  return (
    <button className="admin-print-button" type="button" onClick={() => window.open("/?print-menu=1", "_blank", "noopener,noreferrer")}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6zM18 12h.01"/></svg>
      Imprimir carta
    </button>
  );
}
