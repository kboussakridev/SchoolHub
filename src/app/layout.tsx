import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SchoolHubProvider } from "@/components/providers/SchoolHubProvider";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SchoolHub - Plateforme Scolaire SaaS Tout-en-Un",
  description: "Gérez votre école classique, privée, ou coranique avec la suite d'outils scolaires la plus moderne et fluide en temps réel.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <SchoolHubProvider>
      {children}
    </SchoolHubProvider>
  );

  return (
    <html lang="fr" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">
        {clerkKey ? (
          <ClerkProvider publishableKey={clerkKey}>
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
