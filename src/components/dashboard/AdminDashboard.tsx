"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, Users, CreditCard, ClipboardCheck, ArrowUpRight, Plus, 
  RefreshCw, Calendar, FileText, QrCode, AlertTriangle, CheckCircle, ShieldAlert, Sparkles,
  Shield, Key, Sparkle, Search, Loader2, DollarSign, Activity
} from "lucide-react";
import { generateExercisesIA, askSchoolHubIA } from "@/lib/ai/aiHelpers";

export default function AdminDashboard() {
  const { 
    getSchoolStats, 
    activeSchool, 
    classes, 
    students, 
    addStudent, 
    auditLogs,
    toggleSchoolStatus,
    activeSchoolId,
    // ChatGPT Bonus fields
    buses,
    canteenMenus,
    notifications,
    documents,
    rolePermissions,
    addNotification,
    signDocument,
    addPaymentInvoice,
    recordPayment,
    payments,
    users
  } = useSchoolHub();

  const stats = getSchoolStats();

  // States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSuccess, setQrSuccess] = useState(false);
  const [scannedStudent, setScannedStudent] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ChatGPT Admin Bonus UI States
  const [adminActiveTab, setAdminActiveTab] = useState<"financials" | "permissions" | "audit" | "ai_assistant">("financials");
  const [billingStudentId, setBillingStudentId] = useState("");
  const [billingAmount, setBillingAmount] = useState(80);
  const [billingDesc, setBillingDesc] = useState("Frais de cantine - Juin 2026");
  const [billingType, setBillingType] = useState<"tuition" | "transport" | "canteen" | "activity">("canteen");
  
  const [cashPaymentId, setCashPaymentId] = useState("");
  const [cashAmount, setCashAmount] = useState(150);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const downloadMockFile = (filename: string, content: string) => {
    showToast("Génération du document de rapport...");

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Erreur : Veuillez autoriser les fenêtres pop-up.");
      return;
    }

    const formattedContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    body { 
      background: #ffffff; 
      color: #0f172a; 
      margin: 0; 
      padding: 40px; 
      font-family: monospace; 
    }
    pre { 
      white-space: pre-wrap; 
      font-size: 13px; 
      line-height: 1.6; 
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 30px;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 0; }
      pre { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <pre>${content}</pre>
  <script>
    // Trigger browser print dialog on page load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(formattedContent);
    printWindow.document.close();
    showToast("Le document PDF vectoriel est prêt !");
  };

  const handleAdminAiRequest = async (type: "exercise" | "struggle") => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      if (type === "exercise") {
        const exercises = await generateExercisesIA({
          classLevel: "CE2",
          subject: "Mathématiques",
          topic: "Fractions équivalentes",
          difficulty: "medium",
          count: 3
        });
        
        const formatted = [
          "### 📚 Devoir Généré par l'IA : Fractions Équivalentes (Niveau CE2)",
          "**Consignes d'exercices générées en direct par Llama 3.3 :**",
          ...exercises.map((ex, idx) => {
            const qcm = ex.options && ex.options.length > 0 
              ? `\n*Choix multiples : ${ex.options.join(" | ")}*`
              : "";
            return `${idx + 1}. **${ex.question}**${qcm}\n*   **Réponse attendue** : ${ex.correctAnswer}\n*   **Explication** : ${ex.explanation}`;
          }),
          "*Le devoir a été automatiquement formaté et pré-rempli dans le module Cahier de Texte.*"
        ].join("\n\n");
        
        setAiResponse(formatted);
      } else {
        const systemPrompt = `Tu es l'assistant IA de SchoolHub, expert en analyse prédictive et conseiller d'éducation scolaire.
Tu rédiges un rapport d'analyse sur le décrochage scolaire et les élèves en difficulté en français.
Utilise des puces et des titres commençant par ###.
Donne des recommandations concrètes et bienveillantes pour redresser la situation (par ex. pour Lucas Dubois ou Yasmine Mansour, ou d'autres élèves).`;

        const userPrompt = `Analyse l'assiduité globale et les notes récentes pour identifier les élèves en difficulté ou en situation de décrochage. Rédige un rapport avec des alertes précises et des plans d'action.`;
        
        const response = await askSchoolHubIA(userPrompt, systemPrompt);
        setAiResponse(response);
      }
      showToast("Analyse de l'IA complétée avec succès !");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la communication avec le serveur d'IA.");
      setAiResponse("Désolé, je rencontre des difficultés pour joindre le serveur d'IA Llama 3.3. Veuillez vérifier vos clés API dans le fichier `.env` ou sur Convex.");
    } finally {
      setAiLoading(false);
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

        {/* ========================================================= */}
        {/* CHATGPT ADVANCED SCHOOL ADMIN PANEL */}
        {/* ========================================================= */}
        <div 
          className="p-6 rounded-2xl glass-card flex flex-col gap-6"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2 uppercase tracking-wider" style={{ color: "hsl(var(--foreground))" }}>
                <Shield className="w-4.5 h-4.5 text-purple-400" />
                Console d'Administration Avancée &amp; Pilotage SaaS
              </h3>
              <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                Facturez les transports/cantine, contrôlez les permissions fines, consultez les logs d'audit et utilisez l'IA.
              </p>
            </div>
            
            {/* Tab buttons */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl shrink-0" style={{ backgroundColor: "hsl(var(--secondary))" }}>
              {[
                { id: "financials", name: "Facturation Scolaire", icon: DollarSign },
                { id: "permissions", name: "Permissions (RBAC)", icon: Key },
                { id: "audit", name: "Logs d'Audit", icon: Activity },
                { id: "ai_assistant", name: "Assistant Professeur IA", icon: Sparkles }
              ].map((t) => {
                const Icon = t.icon;
                const isActive = adminActiveTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setAdminActiveTab(t.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/10" 
                        : "hover:text-white"
                    }`}
                    style={!isActive ? { color: "hsl(var(--muted-foreground))" } : undefined}
                  >
                    <Icon className="w-3 h-3" />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab contents */}
          <AnimatePresence mode="wait">
            <motion.div
              key={adminActiveTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {/* 1. COMPTABILITE / FACTURATION ADVANCED TAB */}
              {adminActiveTab === "financials" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Issue Invoice Form */}
                  <div className="p-4 rounded-xl flex flex-col gap-4" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                    <h4 className="font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-wide" style={{ color: "hsl(var(--foreground))" }}>
                      <Plus className="w-3.5 h-3.5 text-purple-400" />
                      Émettre une Facture Scolaire (Frais Extra)
                    </h4>
                    <div className="flex flex-col gap-3 mt-2 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>ÉLÈVE CONCERNÉ</label>
                        <select 
                          value={billingStudentId}
                          onChange={(e) => setBillingStudentId(e.target.value)}
                          className="p-2 rounded-lg focus:outline-none cursor-pointer"
                          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        >
                          <option value="">-- Sélectionner l'élève --</option>
                          {students
                            .filter(s => s.schoolId === activeSchoolId)
                            .map(s => {
                              const u = users.find(usr => usr.id === s.userId);
                              return (
                                <option key={s.id} value={s.id}>{u?.name || s.id} ({s.level})</option>
                              );
                            })}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>MONTANT (EUR)</label>
                          <input 
                            type="number"
                            value={billingAmount}
                            onChange={(e) => setBillingAmount(Number(e.target.value))}
                            className="p-2 rounded-lg focus:outline-none"
                            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>TYPE DE FRAIS</label>
                          <select 
                            value={billingType}
                            onChange={(e) => setBillingType(e.target.value as any)}
                            className="p-2 rounded-lg focus:outline-none cursor-pointer"
                            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          >
                            <option value="canteen">Repas Cantine</option>
                            <option value="transport">Transport Navette</option>
                            <option value="activity">Activité / Sortie</option>
                            <option value="tuition">Frais d'inscription</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>LIBELLÉ / DESCRIPTION</label>
                        <input 
                          type="text"
                          value={billingDesc}
                          onChange={(e) => setBillingDesc(e.target.value)}
                          className="p-2 rounded-lg focus:outline-none"
                          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!billingStudentId) {
                            showToast("Veuillez sélectionner un élève !");
                            return;
                          }
                          addPaymentInvoice(billingStudentId, billingAmount, billingDesc, billingType);
                          showToast("Facture émise avec succès dans le carnet comptable !");
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] shadow-lg shadow-purple-500/10 cursor-pointer transition-all self-start mt-2"
                      >
                        Créer la Facture
                      </button>
                    </div>
                  </div>

                  {/* Cash/Partial Payment Form */}
                  <div className="p-4 rounded-xl flex flex-col gap-4" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                    <h4 className="font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-wide" style={{ color: "hsl(var(--foreground))" }}>
                      <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                      Enregistrer un Paiement (Espèces, Partiel)
                    </h4>
                    <div className="flex flex-col gap-3 mt-2 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>FACTURE EN ATTENTE</label>
                        <select 
                          value={cashPaymentId}
                          onChange={(e) => {
                            setCashPaymentId(e.target.value);
                            const p = payments.find(pay => pay.id === e.target.value);
                            if (p) setCashAmount(p.amount);
                          }}
                          className="p-2 rounded-lg focus:outline-none cursor-pointer"
                          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        >
                          <option value="">-- Sélectionner la facture --</option>
                          {payments
                            .filter(p => p.schoolId === activeSchoolId && p.status !== "paid")
                            .map(p => {
                              const s = students.find(stud => stud.id === p.studentId);
                              const u = users.find(usr => usr.id === s?.userId);
                              return (
                                <option key={p.id} value={p.id}>[{u?.name || "Elève"}] {p.description} - {p.amount} EUR</option>
                              );
                            })}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>SOMME REÇUE (EUR)</label>
                          <input 
                            type="number"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(Number(e.target.value))}
                            className="p-2 rounded-lg focus:outline-none"
                            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>MODE DE PAIEMENT</label>
                          <span className="p-2 rounded-lg font-bold text-center" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                            💵 Espèces (Cash)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            if (!cashPaymentId) {
                              showToast("Veuillez sélectionner une facture !");
                              return;
                            }
                            recordPayment(cashPaymentId, "cash");
                            showToast("Paiement complet en espèces enregistré !");
                            setCashPaymentId("");
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-lg cursor-pointer transition-all"
                        >
                          Régler Totalité
                        </button>
                        <button
                          onClick={() => {
                            if (!cashPaymentId) {
                              showToast("Veuillez sélectionner une facture !");
                              return;
                            }
                            recordPayment(cashPaymentId, "cash", cashAmount);
                            showToast("Paiement partiel enregistré dans Convex !");
                            setCashPaymentId("");
                          }}
                          className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/30 rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Paiement Partiel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. FINE-GRAINED PERMISSIONS (RBAC) TAB */}
              {adminActiveTab === "permissions" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex justify-between items-center pb-2">
                    <h4 className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                      <Key className="w-4 h-4 text-purple-400" />
                      Permissions Fines du Système Multi-Rôles
                    </h4>
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
                      STATUT : SÉCURISÉ RBAC STRICT
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                    {rolePermissions.map((rp) => (
                      <div key={rp.role} className="p-4 rounded-xl flex flex-col gap-3 justify-between" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                        <div className="pb-2 border-b border-white/5">
                          <span className="font-black text-xs uppercase text-purple-400">RÔLE : {rp.role}</span>
                        </div>
                        <div className="flex flex-col gap-2 flex-grow">
                          {rp.permissions.map((p) => (
                            <div key={p.action} className="flex justify-between items-center text-[10px] gap-2">
                              <div className="flex flex-col text-left">
                                <span className="font-mono text-zinc-300">{p.action}</span>
                                <span className="text-[8px] text-zinc-500">{p.description}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${
                                p.allowed 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/15"
                              }`}>
                                {p.allowed ? "OK" : "REFUS"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => showToast(`Modifications des permissions pour le rôle '${rp.role}' verrouillées en démo.`)}
                          className="w-full text-center mt-3 py-1 bg-zinc-950/40 hover:bg-purple-600/10 rounded-lg text-[8px] font-bold border border-white/5 transition-all cursor-pointer text-zinc-500 hover:text-purple-400"
                        >
                          Éditer Permissions
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. AUDIT LOGS TRAÇABILITÉ TAB */}
              {adminActiveTab === "audit" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <h4 className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                    <Activity className="w-4 h-4 text-purple-400" />
                    Journal d'Audit Système &amp; Traçabilité Sécurité (RGPD)
                  </h4>
                  <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto pr-1 text-xs">
                    {auditLogs.map((log) => {
                      const u = users.find(usr => usr.id === log.userId);
                      return (
                        <div key={log.id} className="p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              log.action.includes("DELETE") ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                              log.action.includes("CREATE") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {log.action}
                            </span>
                            <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{log.details}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] uppercase font-bold text-zinc-500 self-end sm:self-center shrink-0">
                            <span>Auteur: {u?.name || log.userId}</span>
                            <span>IP: {log.ipAddress || "system"}</span>
                            <span>Date: {new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. ASSISTANT PROFESSEUR IA TAB */}
              {adminActiveTab === "ai_assistant" && (
                <div className="p-4 rounded-xl flex flex-col gap-4 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" style={{ border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-600/15 rounded-lg text-purple-400">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-[11px]" style={{ color: "hsl(var(--foreground))" }}>Générateur de Cours &amp; Aide au Décrochage IA</span>
                        <span className="text-[8px] text-zinc-500 font-mono">Modèle : Llama 3.2 Fine-Tuned (Teacher Mode)</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-purple-500/10 font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase" style={{ color: "hsl(var(--primary))" }}>
                      IA active
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 text-xs font-normal">
                    <p className="text-[10px] leading-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Bonjour Karim Boussakri. Je suis l'assistant pédagogique IA de SchoolHub.
                      Je peux générer des devoirs ou examiner les notes et absences pour repérer les élèves en difficulté de façon automatisée.
                    </p>

                    {/* Actions buttons */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        onClick={() => handleAdminAiRequest("exercise")}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950/40 border border-white/5 hover:border-purple-500/30 text-[9px] font-bold cursor-pointer transition-colors"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        📝 Générer un devoir (CE2 Fractions)
                      </button>
                      <button
                        onClick={() => handleAdminAiRequest("struggle")}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950/40 border border-white/5 hover:border-purple-500/30 text-[9px] font-bold cursor-pointer transition-colors"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        📊 Analyser le décrochage / élèves en difficulté
                      </button>
                    </div>

                    {/* Response display */}
                    {aiLoading ? (
                      <div className="p-4 rounded-xl flex items-center justify-center gap-2 bg-zinc-950/30 border border-white/5">
                        <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Génération IA en cours...</span>
                      </div>
                    ) : aiResponse ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3.5 rounded-xl bg-zinc-950/40 border border-purple-500/10 leading-relaxed font-sans text-[10px] flex flex-col gap-2 max-h-72 overflow-y-auto text-left"
                      >
                        {aiResponse.split("\n\n").map((para, pIdx) => {
                          if (para.startsWith("###")) {
                            return <h4 key={pIdx} className="font-extrabold text-[10px] text-purple-400 mt-1">{para.replace("###", "").trim()}</h4>;
                          }
                          if (para.startsWith("**")) {
                            return <p key={pIdx} className="text-zinc-300 font-medium">{para}</p>;
                          }
                          return <p key={pIdx} className="text-zinc-400 leading-normal font-normal">{para}</p>;
                        })}
                      </motion.div>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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
