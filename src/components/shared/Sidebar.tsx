"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  MessageSquare,
  ClipboardCheck,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

export default function Sidebar() {
  const { role, theme, toggleTheme, currentUser } = useSchoolHub();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const activeUser = currentUser;

  const superAdminLinks = [
    { label: "SaaS Console", href: "/dashboard", icon: LayoutDashboard },
    { label: "Paramètres Globaux", href: "/dashboard/settings", icon: Settings },
  ];

  const adminLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Élèves", href: "/dashboard/students", icon: GraduationCap },
    { label: "Enseignants", href: "/dashboard/teachers", icon: Users },
    { label: "Présences", href: "/dashboard/attendance", icon: ClipboardCheck },
    { label: "Devoirs", href: "/dashboard/assignments", icon: BookOpen },
    { label: "Paiements", href: "/dashboard/payments", icon: CreditCard },
    { label: "Messagerie", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ];

  const teacherLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Présences (Appel)", href: "/dashboard/attendance", icon: ClipboardCheck },
    { label: "Devoirs (Homework)", href: "/dashboard/assignments", icon: BookOpen },
    { label: "Messagerie", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ];

  const studentLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Devoirs à faire", href: "/dashboard/assignments", icon: BookOpen },
    { label: "Paiements (Scolarité)", href: "/dashboard/payments", icon: CreditCard },
    { label: "Messagerie", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ];

  const parentLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Suivi Présences", href: "/dashboard/attendance", icon: ClipboardCheck },
    { label: "Règlements & Factures", href: "/dashboard/payments", icon: CreditCard },
    { label: "Messagerie", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
  ];

  const getLinks = () => {
    switch (role) {
      case "super_admin": return superAdminLinks;
      case "school_admin": return adminLinks;
      case "teacher": return teacherLinks;
      case "student": return studentLinks;
      case "parent": return parentLinks;
      default: return [];
    }
  };

  const links = getLinks();

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col glass-card z-40 shrink-0"
      style={{ borderRight: "1px solid hsl(var(--border))" }}
    >
      {/* BRAND HEADER */}
      <div
        className="flex items-center justify-between px-5 h-20"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="SchoolHub Logo"
            className="w-9 h-9 rounded-xl shadow-lg shrink-0 border border-white/10 group-hover:border-emerald-500/30 transition-all object-cover"
            style={{
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
            }}
          />
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-wider gradient-text">
              SchoolHub
            </span>
          )}
        </Link>

        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <button
              onClick={toggleTheme}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ color: "hsl(var(--muted-foreground))" }}
              title={theme === "dark" ? "Mode Clair" : "Mode Sombre"}
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              }
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {isCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.08))",
                      color: "hsl(var(--primary))",
                      borderLeft: "2px solid hsl(var(--primary))",
                    }
                  : {
                      color: "hsl(var(--muted-foreground))",
                    }
              }
            >
              <Icon
                className="w-5 h-5 shrink-0"
                style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
              />
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        {isCollapsed && (
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-3.5 rounded-xl cursor-pointer transition-all mt-auto"
            style={{ color: "hsl(var(--muted-foreground))" }}
            title={theme === "dark" ? "Mode Clair" : "Mode Sombre"}
          >
            {theme === "dark"
              ? <Sun className="w-5 h-5 text-amber-400" />
              : <Moon className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
            }
          </button>
        )}
      </div>

      {/* USER PROFILE CARD */}
      <div
        className="p-4 flex flex-col gap-4"
        style={{ borderTop: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={activeUser?.imageUrl}
            alt={activeUser?.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ border: "2px solid hsl(var(--primary) / 0.4)" }}
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span
                className="font-semibold text-xs tracking-wide truncate"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {activeUser?.name}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "hsl(var(--accent))" }}
              >
                {role}
              </span>
            </div>
          )}
        </div>

        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <SignOutButton redirectUrl="/">
            <button
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              style={{ color: "hsl(0 72% 51%)" }}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </SignOutButton>
        ) : (
          <button
            onClick={() => router.push("/")}
            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              isCollapsed ? "justify-center" : ""
            }`}
            style={{ color: "hsl(0 72% 51%)" }}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        )}
      </div>
    </motion.div>
  );
}
