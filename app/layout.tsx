import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Josefina | Lomitería y casa de comidas",
  description: "Lomitos, pizzas, empanadas y mucho sabor casero. Conocé la carta de La Josefina.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
