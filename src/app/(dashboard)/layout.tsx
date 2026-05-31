"use client";

import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import DemoControls from "@/components/shared/DemoControls";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen font-sans overflow-hidden relative"
      style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
    >
      {/* Subtle ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-violet rounded-full opacity-40 pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] glow-indigo rounded-full opacity-40 pointer-events-none -z-10" />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <main
        className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 transition-colors duration-300 relative"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {children}
      </main>

      {/* Floating Demo Control panel */}
      <DemoControls />
    </div>
  );
}
