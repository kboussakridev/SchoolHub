"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, Shield, UserCheck, Users, GraduationCap, Sun, Moon, Database, Landmark, Globe } from "lucide-react";

export default function DemoControls() {
  const {
    role,
    setRole,
    theme,
    toggleTheme,
    schools,
    activeSchoolId,
    setActiveSchoolId
  } = useSchoolHub();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: "super_admin", name: "Super Admin (SaaS owner)", icon: Globe, color: "from-red-500 to-rose-600" },
    { id: "school_admin", name: "School Admin (Directeur)", icon: Shield, color: "from-blue-600 to-blue-800" },
    { id: "teacher", name: "Professeur", icon: UserCheck, color: "from-emerald-500 to-teal-600" },
    { id: "parent", name: "Parent d'élève", icon: Users, color: "from-amber-500 to-orange-600" },
    { id: "student", name: "Élève", icon: GraduationCap, color: "from-sky-500 to-cyan-600" },
  ] as const;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-76 rounded-2xl glass-card p-5 shadow-2xl flex flex-col gap-4 max-h-[580px] overflow-y-auto"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <h3
                className="font-semibold text-sm tracking-wide"
                style={{ color: "hsl(var(--foreground))" }}
              >
                OPTIONS DE SIMULATION
              </h3>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                style={{
                  backgroundColor: "hsl(var(--accent) / 0.1)",
                  border: "1px solid hsl(var(--accent) / 0.3)",
                  color: "hsl(var(--accent))",
                }}
              >
                DEMO ACTIVE
              </span>
            </div>

            {/* Role Selector */}
            <div className="flex flex-col gap-2">
              <label
                className="text-[10px] font-bold tracking-wider"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                RÔLE ACTIF (RBAC)
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isActive = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                        isActive
                          ? `bg-gradient-to-r ${r.color} text-white shadow-lg scale-[1.02]`
                          : ""
                      }`}
                      style={
                        !isActive
                          ? {
                              backgroundColor: "hsl(var(--secondary))",
                              color: "hsl(var(--muted-foreground))",
                            }
                          : {}
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {r.name}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* School Selector */}
            <div
              className="flex flex-col gap-2 pt-2"
              style={{ borderTop: "1px solid hsl(var(--border))" }}
            >
              <label
                className="text-[10px] font-bold tracking-wider"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                ÉCOLE ACTIVE (TENANT)
              </label>
              <div className="flex flex-col gap-1.5">
                {schools.map((school) => {
                  const isActive = activeSchoolId === school.id;
                  return (
                    <button
                      key={school.id}
                      onClick={() => setActiveSchoolId(school.id)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold tracking-wide text-left transition-all duration-300 cursor-pointer"
                      style={
                        isActive
                          ? {
                              backgroundColor: "hsl(var(--primary) / 0.12)",
                              border: "1px solid hsl(var(--primary) / 0.35)",
                              color: "hsl(var(--primary))",
                              transform: "scale(1.01)",
                            }
                          : {
                              backgroundColor: "hsl(var(--secondary))",
                              color: "hsl(var(--muted-foreground))",
                            }
                      }
                    >
                      <Landmark className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{school.name}</span>
                      {isActive && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: "hsl(var(--primary))" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div
              className="flex flex-col gap-2 pt-2"
              style={{ borderTop: "1px solid hsl(var(--border))" }}
            >
              <label
                className="text-[10px] font-bold tracking-wider"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                PARAMÈTRES
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-semibold cursor-pointer transition-colors"
                  style={{
                    backgroundColor: "hsl(var(--secondary))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  {theme === "dark"
                    ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                    : <Moon className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                  }
                  {theme === "dark" ? "Mode Clair" : "Mode Sombre"}
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-semibold cursor-pointer transition-colors"
                  style={{
                    backgroundColor: "hsl(0 72% 51% / 0.1)",
                    color: "hsl(0 72% 65%)",
                    border: "1px solid hsl(0 72% 51% / 0.2)",
                  }}
                >
                  <Database className="w-3.5 h-3.5" />
                  Reset Seed
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full glass-card flex items-center justify-center shadow-xl cursor-pointer transition-colors"
        style={{
          border: "1px solid hsl(var(--border))",
          color: isOpen ? "hsl(var(--accent))" : "hsl(var(--foreground))",
        }}
      >
        <Settings className={`w-5 h-5 transition-transform duration-700 ${isOpen ? "rotate-90" : ""}`} />
      </motion.button>
    </div>
  );
}
