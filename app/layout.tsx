import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attention & Fonctionnement Cognitif — Screener",
  description:
    "Outil d'auto-évaluation du fonctionnement attentionnel basé sur l'ASRS v1.1. Non médical.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:py-10">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-brand-900">
                  Attention Screener
                </div>
                <div className="text-xs text-slate-500">
                  basé sur l'ASRS v1.1 — non médical
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-12 border-t border-slate-200 pt-4 text-xs text-slate-500">
            Cet outil est un auto-questionnaire de screening basé sur l'Adult
            ASRS v1.1 (OMS). Il ne constitue ni un diagnostic, ni un avis
            médical, et ne remplace pas l'évaluation d'un professionnel de
            santé.
          </footer>
        </div>
      </body>
    </html>
  );
}
