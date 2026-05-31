"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, Users, CreditCard, ClipboardCheck, ArrowUpRight, Plus, 
  RefreshCw, Calendar, FileText, QrCode, AlertTriangle, CheckCircle, ShieldAlert, Sparkles 
} from "lucide-react";

export default function AdminDashboard() {
  const { 
    getSchoolStats, 
    activeSchool, 
    classes, 
    students, 
    addStudent, 
    auditLogs,
    toggleSchoolStatus
  } = useSchoolHub();

  const stats = getSchoolStats();

  // States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [scannedStudent, setScannedStudent] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const downloadMockFile = (filename: string, content: string) => {
    showToast("Génération du fichier PDF professionnel en cours...");
    
    const runConversion = () => {
      // Envelopper le contenu texte brut dans une balise pre stylisée pour le PDF
      const formattedContent = `<pre style="font-family: 'Courier New', Courier, monospace; white-space: pre-wrap; padding: 30px; font-size: 13px; color: #0f172a; line-height: 1.6; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; width: 700px; margin: 0 auto;">${content}</pre>`;

      const opt = {
        margin: [15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Utiliser directement le rendu de chaîne HTML virtuel natif de html2pdf (sans injection dans le DOM)
      // @ts-ignore
      window.html2pdf().from(formattedContent).set(opt).output('blob').then((pdfBlob: Blob) => {
        // Télécharger en tant que flux binaire générique (application/octet-stream) pour forcer le navigateur à demander l'autorisation sans ouvrir le PDF automatiquement
        const forceDownloadBlob = new Blob([pdfBlob], { type: "application/octet-stream" });
        const url = URL.createObjectURL(forceDownloadBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast("Fichier PDF téléchargé avec succès !");
      }).catch((err: any) => {
        console.error(err);
        showToast("Erreur lors de la génération du PDF.");
      });
    };

    // @ts-ignore
    if (window.html2pdf) {
      runConversion();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        runConversion();
      };
      document.head.appendChild(script);
    }
  };

  const isSuspended = activeSchool?.status === "suspended";
  const quotaPercentage = activeSchool 
    ? Math.min(Math.round((stats.studentsCount / activeSchool.maxStudentsQuota) * 100), 100)
    : 0;

  const handleScanQr = (studentName: string) => {
    setScannedStudent(studentName);
    setQrSuccess(true);
    setTimeout(() => {
      setQrSuccess(false);
      setShowQrModal(false);
    }, 2500);
  };

  const cards = [
    {
      title: "Élèves Inscrits",
      value: stats.studentsCount,
      change: `${activeSchool?.maxStudentsQuota} max quota`,
      icon: GraduationCap,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Professeurs Actifs",
      value: stats.teachersCount,
      change: "Onboarding complet",
      icon: Users,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Revenus de l'École",
      value: `${stats.totalRevenue} €`,
      change: "Scolarités encaissées",
      icon: CreditCard,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Taux de Présence",
      value: `${stats.attendanceRate}%`,
      change: "Moyenne école",
      icon: ClipboardCheck,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="relative font-sans w-full max-w-7xl mx-auto" style={{ color: "hsl(var(--foreground))" }}>
      
      {/* 1. LOCKDOWN OVERLAY IF SUSPENDED */}
      <AnimatePresence>
        {isSuspended && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-red-500/20 h-[calc(100vh-140px)] min-h-[500px]"
            style={{ backgroundColor: "hsl(var(--background) / 0.85)" }}
          >
            <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 mb-5 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black" style={{ color: "hsl(var(--foreground))" }}>Abonnement École Suspendu</h2>
            <p className="text-xs max-w-md mt-2 leading-relaxed font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
              Votre établissement **{activeSchool?.name}** a été suspendu par le gestionnaire SaaS global ou en raison d'un défaut de paiement Stripe. 
              Veuillez régulariser vos factures pour restaurer vos services scolaires.
            </p>
             <button
              onClick={() => {
                if (activeSchool) {
                  toggleSchoolStatus(activeSchool.id);
                  showToast("Abonnement réactivé avec succès via Stripe !");
                }
              }}
              className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/20 cursor-pointer transition-colors"
             >
              Mettre à jour la carte bancaire (Stripe)
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-8 w-full">
        {/* HEADER SECTION */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5" style={{ color: "hsl(var(--foreground))" }}>
              <span>{activeSchool?.name}</span>
              <span
                className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider"
                style={{ backgroundColor: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}
              >
                {activeSchool?.plan} Plan
              </span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              Tableau de bord administratif et indicateurs relationnels de votre établissement en temps réel.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            >
              <QrCode className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              Scanner Présence QR
            </button>
            <span
              className="text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold"
              style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
              23 Mai 2026
            </span>
          </div>
        </div>

        {/* PLAN QUOTAS JAUGE PROGRESS BAR */}
        <div
          className="p-4 rounded-2xl glass-card flex flex-col gap-2"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex justify-between items-center text-xs font-bold">
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Consommation du quota d'Élèves ({activeSchool?.plan.toUpperCase()}) :</span>
            <span className={quotaPercentage >= 90 ? "text-red-400" : ""} style={quotaPercentage >= 90 ? undefined : { color: "hsl(var(--primary))" }}>
              {stats.studentsCount} / {activeSchool?.maxStudentsQuota} élèves ({quotaPercentage}%)
            </span>
          </div>
          <div
            className="w-full h-2.5 rounded-full overflow-hidden p-0.5"
            style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${quotaPercentage}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${quotaPercentage >= 90 ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"}`}
            />
          </div>
        </div>

        {/* METRIC CARDS GRID */}
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
                  <span className="text-3xl font-extrabold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>{c.value}</span>
                  <p className="text-[10px] font-bold mt-1.5 uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>{c.change}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          
          {/* CUSTOM SVG GRAPH */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl glass-card flex flex-col justify-between"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            <div
              className="flex items-center justify-between pb-4 mb-6"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <div>
                <h3 className="font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>Analyse Financière &amp; Présences</h3>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Évolution des encaissements et taux de présence hebdomadaire.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  Revenus (€)
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  Présences (%)
                </span>
              </div>
            </div>

            {/* CUSTOM PREMIUM SVG AREA CHART */}
            <div className="relative h-60 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Area 1 */}
                <path
                  d="M 0 160 Q 100 130 200 90 T 400 40 L 500 60 L 500 200 L 0 200 Z"
                  fill="url(#purpleGrad)"
                />
                <path
                  d="M 0 160 Q 100 130 200 90 T 400 40 L 500 60"
                  fill="transparent"
                  stroke="#a78bfa"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Area 2 */}
                <path
                  d="M 0 80 Q 100 70 200 85 T 400 65 L 500 50 L 500 200 L 0 200 Z"
                  fill="url(#blueGrad)"
                />
                <path
                  d="M 0 80 Q 100 70 200 85 T 400 65 L 500 50"
                  fill="transparent"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Tooltip Overlay */}
              <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 p-3 backdrop-blur-md rounded-xl flex flex-col gap-1 shadow-xl"
                style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              >
                <span className="text-[9px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>MAI 2026</span>
                <span className="text-xs font-black" style={{ color: "hsl(var(--foreground))" }}>Revenus : {stats.totalRevenue} €</span>
                <span className="text-[9px] font-bold text-blue-400">Présences : {stats.attendanceRate}%</span>
              </div>
            </div>

            <div
              className="flex justify-between text-[9px] font-bold tracking-wider pt-4 mt-4 uppercase"
              style={{ color: "hsl(var(--muted-foreground))", borderTop: "1px solid hsl(var(--border))" }}
            >
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
            </div>
          </motion.div>

          {/* LOCAL ACTIVITY JOURNAL */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl glass-card flex flex-col justify-between"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            <div>
              <div
                className="flex items-center justify-between pb-4 mb-4"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <h3 className="font-bold text-base" style={{ color: "hsl(var(--foreground))" }}>Activité de l'École</h3>
                <button
                  className="p-1.5 rounded-lg transition-colors cursor-pointer"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                {stats.recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Aucun log récent.</div>
                ) : (
                  stats.recentActivity.map((act) => (
                    <div key={act.id} className="flex gap-2.5 text-[11px] leading-relaxed group">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shadow-[0_0_8px_rgba(167,139,250,0.5)] shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[10px] uppercase" style={{ color: "hsl(var(--card-foreground))" }}>
                          {act.action}
                        </span>
                        <p className="text-[10px] font-normal leading-normal" style={{ color: "hsl(var(--muted-foreground))" }}>{act.details}</p>
                        <span className="text-[8px] font-bold uppercase mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{act.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

             <button
               onClick={() => {
                 downloadMockFile(
                   "Journal_Audit_Securite_SchoolHub.pdf",
                   `===================================================================
                     SCHOOLHUB - JOURNAL D'AUDIT DE SÉCURITÉ
===================================================================
Établissement : Académie Al-Qalam
Date d'export : 24 Mai 2026

HISTORIQUE RÉCENT DES ACTIONS SYSTÈME :
-------------------------------------------------------------------
- CREATE_STUDENT  : Inscription de l'élève Yasmine Mansour dans la classe Al-Forqane (IP: 192.168.1.15)
- SUSPEND_SCHOOL  : Suspension de démonstration révoquée
- TAKE_ATTENDANCE : Feuille d'appel rapide enregistrée par Pr. Sofia Belkacem

===================================================================
Ce document est un journal d'audit généré automatiquement pour la simulation SchoolHub.
===================================================================`
                 );
                 showToast("Journal d'audit complet de l'établissement exporté avec succès !");
               }}
               className="w-full text-center mt-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
               style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }}
              >
               Logs d'audit complets
              </button>
          </motion.div>
        </div>

        {/* BOTTOM SECTIONS: CLASSES & QUICK DOCS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <div
              className="flex items-center justify-between pb-4 mb-4"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <h3 className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Effectifs par Classe</h3>
              <span
                className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
              >
                {classes.filter((c) => c.schoolId === activeSchool?.id).length} Classes
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {classes
                .filter((c) => c.schoolId === activeSchool?.id)
                .map((c) => {
                  const studentsInClass = students.filter((s) => s.classId === c.id).length;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl transition-colors"
                      style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs" style={{ color: "hsl(var(--card-foreground))" }}>{c.name}</span>
                        <span className="text-[10px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Niveau : {c.level}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold" style={{ color: "hsl(var(--foreground))" }}>{studentsInClass} élève{studentsInClass > 1 ? 's' : ''}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card flex flex-col justify-between" style={{ border: "1px solid hsl(var(--border))" }}>
            <div>
              <div
                className="flex items-center justify-between pb-4 mb-4"
                style={{ borderBottom: "1px solid hsl(var(--border))" }}
              >
                <h3 className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Rapports &amp; Documents</h3>
                <FileText className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
              </div>

              <div className="flex flex-col gap-3">
                <div
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-xs min-w-0">
                    <span className="font-bold truncate" style={{ color: "hsl(var(--card-foreground))" }}>Rapport financier scolarité.pdf</span>
                    <span className="text-[9px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Généré le 20/05/2026 • 240 KB</span>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-xs min-w-0">
                    <span className="font-bold truncate" style={{ color: "hsl(var(--card-foreground))" }}>Registre des présences.xlsx</span>
                    <span className="text-[9px] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Mis à jour hier • 1.2 MB</span>
                  </div>
                </div>
              </div>
            </div>

             <button
               onClick={() => {
                 downloadMockFile(
                   "Rapports_Administratifs_SchoolHub.pdf",
                   `===================================================================
                     SCHOOLHUB - RAPPORT SCOLAIRE ET FINANCIER GLOBAL
===================================================================
Établissement : Académie Al-Qalam
Directeur : Karim Boussakri
Date d'export : 24 Mai 2026

INDICATEURS CLÉS :
-------------------------------------------------------------------
- Total Élèves Inscrits : 124 élèves (Forfait Basic - Quota 50)
- Total Professeurs Actifs : 1 enseignant
- Taux de Présence Moyen de l'Établissement : 98%
- Recettes Scolarités Encaissées : 12,450 € (Mensuel récurrent)

SECTIONS DU RAPPORT :
1. Registre des effectifs et listes de classes par niveaux
2. Suivi de facturation des scolarités et retards de paiements
3. Historique d'assiduité et d'appels quotidiens des enseignants

===================================================================
Ce document est un rapport généré automatiquement pour la simulation SchoolHub.
===================================================================`
                 );
                 showToast("Rapport scolaire et financier généré et téléchargé !");
               }}
               className="w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer mt-4"
               style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }}
              >
               Exporter les rapports scolaires
              </button>
          </div>
        </div>
      </div>

      {/* WOW FEATURE: INTERACTIVE QR ATTENDANCE MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl glass-card shadow-2xl p-6 relative text-center flex flex-col items-center gap-5"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            >
              <h3
                className="font-extrabold text-sm pb-2.5 w-full"
                style={{ borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              >
                SCANNER DE CARTE DE PRÉSENCE QR
              </h3>
              
              {qrSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-1 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <span className="font-extrabold text-sm text-emerald-400">SCAN RÉUSSI !</span>
                  <p className="text-[10px] font-medium uppercase mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Présence enregistrée pour : **{scannedStudent}**
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg relative border border-white/10">
                    <QrCode className="w-36 h-36 text-zinc-950 animate-pulse" />
                    {/* Scanning laser line animation */}
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-purple-500 animate-bounce" />
                  </div>
                  <p className="text-[10px] leading-normal max-w-xs font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Présentez le badge QR de l'élève devant la caméra pour valider instantanément son arrivée en classe.
                  </p>
                  
                  {/* Quick-test buttons */}
                  <div className="flex flex-col gap-1.5 w-full pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <span className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Simuler le scan pour :</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleScanQr("Yasmine Mansour")}
                        className="px-3 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      >
                        Yasmine Mansour
                      </button>
                      <button
                        onClick={() => handleScanQr("Lucas Dubois")}
                        className="px-3 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                        style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      >
                        Lucas Dubois
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="toast-notification fixed bottom-6 left-6 z-50 p-4 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
