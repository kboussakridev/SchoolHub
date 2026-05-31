"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Landmark, CreditCard, Users, ClipboardCheck, Play, Pause, 
  ArrowUpRight, ShieldCheck, Database, Calendar, TrendingUp, Sparkles, Plus, X, Trash2 
} from "lucide-react";

export default function SuperAdminDashboard() {
  const { 
    schools, 
    auditLogs, 
    toggleSchoolStatus, 
    changeSchoolPlan, 
    getSuperAdminStats,
    addSchool,
    archiveSchool 
  } = useSchoolHub();

  const stats = getSuperAdminStats();
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Split schools
  const activeSchools = schools.filter((s) => s.status !== "archived");
  const archivedSchools = schools.filter((s) => s.status === "archived");

  // New School Contract Form States
  const [showAddSchoolForm, setShowAddSchoolForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolSlug, setNewSchoolSlug] = useState("");
  const [newSchoolPlan, setNewSchoolPlan] = useState<"basic" | "pro" | "enterprise">("basic");
  const [newSchoolAddress, setNewSchoolAddress] = useState("");
  const [newSchoolSystem, setNewSchoolSystem] = useState("Système Français");

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolSlug.trim()) {
      showToast("Veuillez remplir le nom et le slug d'accès.");
      return;
    }

    const normalizedSlug = newSchoolSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    addSchool({
      name: newSchoolName,
      slug: normalizedSlug,
      plan: newSchoolPlan,
      address: newSchoolAddress || undefined,
      primarySystem: newSchoolSystem || undefined
    });

    setNewSchoolName("");
    setNewSchoolSlug("");
    setNewSchoolPlan("basic");
    setNewSchoolAddress("");
    setNewSchoolSystem("Système Français");
    setShowAddSchoolForm(false);
    
    showToast("Contrat d'établissement enregistré avec succès !");
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const cards = [
    {
      title: "Écoles Actives",
      value: stats.schoolsCount,
      change: "Croissance +12%",
      icon: Landmark,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Revenus SaaS (MRR)",
      value: `${stats.totalMRR} €`,
      change: "Frais récurrents mensuels",
      icon: CreditCard,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Utilisateurs Actifs",
      value: stats.activeUsersCount,
      change: "Enseignants + Élèves",
      icon: Users,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Moyenne Assiduité",
      value: `${stats.globalAttendanceRate}%`,
      change: "Toutes écoles confondues",
      icon: ClipboardCheck,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-8 font-sans w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: "hsl(var(--foreground))" }}>
            <Globe className="w-8 h-8 text-rose-500 animate-spin" style={{ animationDuration: '15s' }} />
            Console Global <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Super Administrateur EdTech</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Supervisez les tenants scolaires de SchoolHub, suivez le MRR récurrent, et gérez les statuts de paiement Stripe.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-3.5 py-1.5 rounded-full flex items-center gap-2 font-semibold" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            Licence Propriétaire SaaS
          </span>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, index) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="p-6 rounded-2xl glass-card border flex flex-col justify-between hover:border-white/12 transition-colors relative overflow-hidden group"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>{c.title}</span>
                <div className={`p-2.5 rounded-xl border ${c.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tight" style={{ color: "hsl(var(--foreground))" }}>{c.value}</span>
                <p className="text-[10px] font-bold mt-1.5 uppercase flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  {c.change}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DETAILED LEDGER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SCHOOLS SUBSCRIPTION MANAGER (2 COLS) */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card flex flex-col justify-between" style={{ border: "1px solid hsl(var(--border))" }}>
          <div>
            <div className="pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>Gestionnaire des Abonnements Écoles</h3>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Activez, suspendez ou mettez à niveau les licences d'écoles (Stripe Webhooks).</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAddSchoolForm(!showAddSchoolForm)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-[10px] font-black text-white flex items-center gap-1 cursor-pointer transition-all shadow-lg shadow-rose-600/15"
                >
                  {showAddSchoolForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showAddSchoolForm ? "Fermer" : "Nouveau Contrat"}
                </button>
                <span className="text-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-300 font-bold px-2.5 py-1.5 rounded-full">
                  {schools.length} Enregistrés
                </span>
              </div>
            </div>

            {/* Collapsible New School Contract Form */}
            <AnimatePresence>
              {showAddSchoolForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateSchool}
                  className="p-4 rounded-xl mb-6 flex flex-col gap-3.5 bg-rose-500/5 border border-rose-500/15 overflow-hidden"
                >
                  <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">Signer un nouveau contrat d'établissement</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Nom de l'établissement</label>
                      <input
                        type="text"
                        value={newSchoolName}
                        onChange={(e) => {
                          setNewSchoolName(e.target.value);
                          // Auto generate slug
                          setNewSchoolSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"));
                        }}
                        placeholder="ex: Académie Al-Forqane"
                        className="p-2.5 rounded-xl border text-xs focus:outline-none focus:border-rose-500/40"
                        style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Slug d'accès unique</label>
                      <input
                        type="text"
                        value={newSchoolSlug}
                        onChange={(e) => setNewSchoolSlug(e.target.value)}
                        placeholder="ex: al-forqane"
                        className="p-2.5 rounded-xl border text-xs focus:outline-none focus:border-rose-500/40 font-mono"
                        style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Forfait Initial (SaaS)</label>
                      <select
                        value={newSchoolPlan}
                        onChange={(e) => setNewSchoolPlan(e.target.value as any)}
                        className="p-2.5 rounded-xl border text-xs focus:outline-none focus:border-rose-500/40 cursor-pointer"
                        style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      >
                        <option value="basic">Basic (49€/mois - Quota 50)</option>
                        <option value="pro">Pro (129€/mois - Quota 300)</option>
                        <option value="enterprise">Enterprise (499€/mois - Quota Illimité)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Adresse Physique</label>
                      <input
                        type="text"
                        value={newSchoolAddress}
                        onChange={(e) => setNewSchoolAddress(e.target.value)}
                        placeholder="ex: 15 Avenue du Savoir, Paris"
                        className="p-2.5 rounded-xl border text-xs focus:outline-none focus:border-rose-500/40"
                        style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Système d'Enseignement</label>
                      <input
                        type="text"
                        value={newSchoolSystem}
                        onChange={(e) => setNewSchoolSystem(e.target.value)}
                        placeholder="ex: Académique Français"
                        className="p-2.5 rounded-xl border text-xs focus:outline-none focus:border-rose-500/40"
                        style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2" style={{ borderTop: "1px solid hsl(var(--border) / 0.4)" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddSchoolForm(false)}
                      className="px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                      style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 cursor-pointer transition-all"
                    >
                      Créer le Contrat
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4">
              {activeSchools.map((school) => {
                const isActive = school.status === "active";
                const isBasic = school.plan === "basic";
                const isPro = school.plan === "pro";

                return (
                  <div 
                    key={school.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive 
                        ? "hover:border-white/10" 
                        : "shadow-lg"
                    }`}
                    style={{
                      backgroundColor: isActive ? "hsl(var(--secondary))" : "hsl(0 72% 51% / 0.06)",
                      borderColor: isActive ? "hsl(var(--border))" : "hsl(0 72% 51% / 0.3)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-sm flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                          {school.name}
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isActive 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {school.status === "active" ? "Actif" : "Suspendu"}
                          </span>
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                          Slug: /{school.slug} • Créé le {mounted ? new Date(school.createdAt).toLocaleDateString("fr-FR") : "--/--/----"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Plan level selection */}
                        <select
                          value={school.plan}
                          onChange={(e) => changeSchoolPlan(school.id, e.target.value as any)}
                          className="border rounded-lg text-[10px] font-bold px-2.5 py-1.5 focus:outline-none cursor-pointer"
                          style={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            color: "hsl(var(--card-foreground))",
                          }}
                        >
                          <option value="basic">Forfait Basic (49€)</option>
                          <option value="pro">Forfait Pro (129€)</option>
                          <option value="enterprise">Forfait Enterprise (499€)</option>
                        </select>

                        {/* Suspension control */}
                        <button
                          onClick={() => toggleSchoolStatus(school.id)}
                          className={`p-1.5 border rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                          }`}
                          title={isActive ? "Suspendre l'établissement" : "Activer l'établissement"}
                        >
                          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        {/* Archive control */}
                        <button
                          onClick={() => {
                            archiveSchool(school.id);
                            showToast(`L'établissement ${school.name} a été archivé.`);
                          }}
                          className="p-1.5 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                          title="Archiver l'établissement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3.5 mt-3 text-[10px] font-bold tracking-wider" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <span className="uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Quota Élèves : {school.maxStudentsQuota} max
                      </span>
                      <span className="flex items-center gap-1 font-mono uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
                        Stripe ID: {school.stripeCustomerId?.substring(0, 12)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Archived schools list block */}
            {archivedSchools.length > 0 && (
              <div className="mt-8 pt-6" style={{ borderTop: "1px dashed hsl(var(--border))" }}>
                <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-wider block mb-3.5">Établissements Archivés ({archivedSchools.length})</span>
                <div className="flex flex-col gap-3">
                  {archivedSchools.map((sch) => (
                    <div 
                      key={sch.id} 
                      className="p-3.5 rounded-xl flex items-center justify-between transition-colors bg-zinc-950/30 border border-white/5 hover:border-white/10"
                    >
                      <div className="text-left">
                        <span className="font-extrabold text-xs text-zinc-400 flex items-center gap-2">
                          {sch.name}
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">Archivé</span>
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Slug: /{sch.slug} • Créé le {mounted ? new Date(sch.createdAt).toLocaleDateString("fr-FR") : "--/--/----"}</span>
                      </div>
                      <button
                        onClick={() => {
                          toggleSchoolStatus(sch.id);
                          showToast(`L'établissement ${sch.name} a été restauré et réactivé.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[9px] font-black text-emerald-400 cursor-pointer transition-colors"
                      >
                        Restaurer / Activer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SAAS AUDIT LOGS COLUMN */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between" style={{ border: "1px solid hsl(var(--border))" }}>
          <div>
            <div className="pb-4 mb-4 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                <Database className="w-5 h-5 text-rose-400" />
                Journal d'Audit SaaS
              </h3>
            </div>

            <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs leading-relaxed group">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[10px] uppercase" style={{ color: "hsl(var(--foreground))" }}>
                        {log.action}
                      </span>
                      {log.schoolId && (
                        <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-500 font-bold uppercase shrink-0">
                          {log.schoolId.substring(7)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-normal leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{log.details}</p>
                    <span className="text-[8px] font-bold mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {mounted ? new Date(log.timestamp).toLocaleTimeString("fr-FR") : "--:--:--"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

           <button
            onClick={() => showToast("Exportation de l'historique complet des logs système SaaS (CSV)...")}
            className="w-full text-center py-2.5 rounded-xl text-xs font-bold cursor-pointer mt-6 transition-colors"
            style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
           >
            Exporter les logs système
           </button>
        </div>
      </div>
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 toast-notification"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
