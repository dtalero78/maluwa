import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Lora,
  Bricolage_Grotesque,
  Space_Grotesk,
  JetBrains_Mono,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Serif editorial del diario (run #7). Pesos 380/520 caen en 400/500 estándar.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-editorial",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Maluwa — construye lo que se te ocurra, con IA",
  description:
    "Plataforma para adolescentes hispanohablantes que enseña a crear páginas web y apps con IA, paso a paso, en un diario.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdf6e8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${caveat.variable} ${lora.variable} ${bricolage.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
