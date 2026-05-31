"use client";

import React from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Sparkles, User, Shield, CreditCard, BrainCircuit, Bell, Sun, Moon } from "lucide-react";

export default function SettingsPage() {
  const { role, theme, toggleTheme, activeSchool, changeSchoolPlan, updateSchoolDetails, activeSchoolId } = useSchoolHub();
  const [downloadingInvoice, setDownloadingInvoice] = React.useState<string | null>(null);
  const [planUpgraded, setPlanUpgraded] = React.useState(false);

  // Form states
  const [schoolName, setSchoolName] = React.useState(activeSchool?.name || "SchoolHub International");
  const [schoolSystem, setSchoolSystem] = React.useState(activeSchool?.settings?.primarySystem || "mixte");
  const [schoolAddress, setSchoolAddress] = React.useState(activeSchool?.settings?.address || "45 Avenue des Champs-Élysées, 75008 Paris");
  const [isSaved, setIsSaved] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync state if activeSchool switches
  React.useEffect(() => {
    if (activeSchool) {
      setSchoolName(activeSchool.name);
      setSchoolSystem(activeSchool.settings?.primarySystem || "mixte");
      setSchoolAddress(activeSchool.settings?.address || "45 Avenue des Champs-Élysées, 75008 Paris");
    }
  }, [activeSchool]);

  const handleSaveSchoolDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName) return;

    updateSchoolDetails(activeSchoolId, schoolName, schoolAddress, schoolSystem);
    setIsSaved(true);
    setToastMessage("Modifications enregistrées avec succès !");
    setTimeout(() => {
      setIsSaved(false);
      setToastMessage(null);
    }, 3000);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    setDownloadingInvoice(invoiceId);
    setTimeout(() => {
      setDownloadingInvoice(null);
      // Simulate file download
      const link = document.createElement("a");
      link.href = "#";
      link.setAttribute("download", `Facture-${invoiceId}.pdf`);
      document.body.appendChild(link);
      alert(`Téléchargement de la facture ${invoiceId}.pdf démarré avec succès !`);
    }, 1200);
  };

  const handleUpgradePlan = (plan: "basic" | "pro" | "enterprise") => {
    if (activeSchool) {
      changeSchoolPlan(activeSchool.id, plan);
      setPlanUpgraded(true);
      setTimeout(() => setPlanUpgraded(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto" style={{ color: "hsl(var(--foreground))" }}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ color: "hsl(var(--foreground))" }}>
            <Settings className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
            Paramètres Généraux
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Configurez votre profil d'établissement, gérez l'abonnement SaaS et configurez les services IA.
          </p>
        </div>
      </div>

      {planUpgraded && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          Abonnement Stripe mis à jour ! Votre quota d'élèves a été automatiquement ajusté.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT/MIDDLE MAIN SETTINGS (2 COLS) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* PROFILE SETTINGS */}
          <form onSubmit={handleSaveSchoolDetails} className="p-6 rounded-2xl glass-card flex flex-col gap-4" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-3" style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}>
              <User className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              Profil Établissement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>NOM DE L'ÉCOLE</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500/30"
                  style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))" }}
                />
              </div>

              <div className="flex flex-col gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>SYSTÈME SCOLAIRE PRINCIPAL</label>
                <select
                  value={schoolSystem}
                  onChange={(e) => setSchoolSystem(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl text-xs focus:outline-none cursor-pointer"
                  style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))" }}
                >
                  <option value="mixte">Hybride (Classique + Coranique / Arabe)</option>
                  <option value="classique">Classique uniquement</option>
                  <option value="coranique">Coranique / Médersa uniquement</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
              <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>ADRESSE DU SIÈGE SOCIAL</label>
              <input
                type="text"
                required
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500/30"
                style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--card-foreground))", border: "1px solid hsl(var(--border))" }}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSaved}
              className={`self-start px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all mt-2 cursor-pointer ${
                isSaved
                  ? "bg-emerald-500 text-white shadow-emerald-500/15"
                  : ""
              }`}
              style={!isSaved ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))", color: "hsl(var(--primary-foreground))" } : undefined}
            >
              {isSaved ? "Modifications enregistrées !" : "Sauvegarder les modifications"}
            </button>
          </form>

          {/* ABONNEMENT STRIPE & FACTURATION */}
          <div className="p-6 rounded-2xl glass-card flex flex-col gap-4" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-3" style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}>
              <CreditCard className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              Abonnement Stripe &amp; Facturation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl flex flex-col justify-between gap-3" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>PLAN SAAS ACTIF</span>
                  <h4 className="text-lg font-black capitalize mt-1 flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                    {activeSchool?.plan || "Basic"}
                    <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 font-bold px-2 py-0.5 rounded uppercase" style={{ color: "hsl(var(--primary))" }}>
                      {activeSchool?.status || "Active"}
                    </span>
                  </h4>
                  <p className="text-[10px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Limite : {activeSchool?.maxStudentsQuota || 50} élèves.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleUpgradePlan("pro")}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-purple-500/15 cursor-pointer transition-all"
                  >
                    Passer au plan Pro (129€)
                  </button>
                  <button 
                    onClick={() => handleUpgradePlan("enterprise")}
                    className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                  >
                    Forfait Entreprise
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl flex flex-col justify-between gap-3" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>MÉTHODE DE PAIEMENT</span>
                    <span className="text-xs font-bold mt-1 flex items-center gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                      💳 Visa se terminant par 4242
                    </span>
                    <span className="text-[9px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Expire le 12/2028</span>
                  </div>
                </div>
                <button className="self-start text-[10px] font-bold cursor-pointer" style={{ color: "hsl(var(--primary))" }}>
                  Mettre à jour la carte sur Stripe
                </button>
              </div>
            </div>

            {/* FACTURES TELECHARGEABLES */}
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>HISTORIQUE DES FACTURES STRIPE</span>
              <div className="flex flex-col gap-2.5">
                <div className="p-3.5 rounded-xl flex justify-between items-center text-xs" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex flex-col">
                    <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>Facture #SH-2026-05</span>
                    <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>Période du 01/05/2026 au 31/05/2026</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold font-mono" style={{ color: "hsl(var(--foreground))" }}>
                      {activeSchool?.plan === "basic" ? "49,00 €" : activeSchool?.plan === "pro" ? "129,00 €" : "499,00 €"}
                    </span>
                    <button 
                      onClick={() => handleDownloadInvoice("SH-2026-05")}
                      disabled={downloadingInvoice !== null}
                      className="px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-55"
                      style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                    >
                      {downloadingInvoice === "SH-2026-05" ? "Génération..." : "Télécharger PDF"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BONUS INTEGRATIONS IA */}
          <div className="p-6 rounded-2xl glass-card flex flex-col gap-4" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                <BrainCircuit className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                Intégrations IA (Architecture Préparée)
              </h3>
              <span className="text-[9px] bg-purple-500/10 font-extrabold px-2.5 py-0.5 rounded-full border border-purple-500/15" style={{ color: "hsl(var(--primary))" }}>
                BONUS ACTIVÉ
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl flex items-start gap-4" style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--secondary))" }}>
                <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                  <BrainCircuit className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-xs" style={{ color: "hsl(var(--foreground))" }}>Générateur d'Exercices IA</span>
                  <p className="text-[10px] leading-normal font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Générez instantanément des exercices d'entraînement adaptés au niveau de chaque classe (classique ou questions de mémorisation de sourates) à partir de vos consignes de cours.
                  </p>
                  <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1">Structure: src/lib/ai/exerciseGen.ts</span>
                </div>
              </div>

              <div className="p-4 rounded-xl flex items-start gap-4" style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--secondary))" }}>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-xs" style={{ color: "hsl(var(--foreground))" }}>Aide à la Correction IA</span>
                  <p className="text-[10px] leading-normal font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Analysez les copies numériques remises par les élèves pour fournir des suggestions de correction orthographique, grammaticale et sémantique au professeur.
                  </p>
                  <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1">Structure: src/lib/ai/gradingHelper.ts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 COL) */}
        <div className="flex flex-col gap-5">
          {/* INTERACTIVE THEME & DISPLAY */}
          <div className="p-6 rounded-2xl glass-card flex flex-col gap-4" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-bold text-sm pb-3" style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}>Thème &amp; Affichage</h3>
            
            <div className="flex justify-between items-center py-2" style={{ color: "hsl(var(--foreground))" }}>
              <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>Thème Actif :</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                {theme === "dark" ? "Thème Clair" : "Thème Sombre"}
              </button>
            </div>
          </div>

          {/* SECURITY & BILLING */}
          <div className="p-6 rounded-2xl glass-card flex flex-col gap-4" style={{ border: "1px solid hsl(var(--border))" }}>
            <h3 className="font-bold text-sm flex items-center gap-2 pb-3" style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}>
              <Shield className="w-4 h-4 text-emerald-400" />
              Sécurité &amp; Rôles (RBAC)
            </h3>
            
            <div className="flex flex-col gap-3.5 text-xs font-normal">
              <div className="flex justify-between items-center" style={{ color: "hsl(var(--foreground))" }}>
                <span>Rôle Actif Utilisateur :</span>
                <span className="text-[10px] font-bold uppercase bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/15" style={{ color: "hsl(var(--primary))" }}>
                  {role}
                </span>
              </div>
              <p className="text-[10px] leading-normal font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                Les autorisations sont verrouillées via les règles Convex et Clerk middleware. Vous disposez de permissions complètes de démonstration.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-xl toast-notification text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
