import type { Metadata } from "next";
import AdminPanel from "./panel";

export const metadata: Metadata = {
  title: "Administrar la carta | La Josefina",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
