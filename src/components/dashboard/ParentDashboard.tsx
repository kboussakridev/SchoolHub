"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { askSchoolHubIA } from "@/lib/ai/aiHelpers";
import { 
  Users, GraduationCap, ClipboardCheck, CreditCard, Sparkles, CheckCircle, ArrowRight, BookOpen,
  Bus, Utensils, FolderOpen, FileCheck, MessageSquare, Calendar, MapPin, Loader2, Lock, Check, Sparkle
} from "lucide-react";

export default function ParentDashboard() {
  const { 
    students, grades, payments, payInvoice, attendance, classes, parents, currentUser, users, activeSchoolId,
    // ChatGPT Bonus fields
    buses, canteenMenus, notifications, documents, rolePermissions, addNotification, signDocument, requestParentMeeting, teachers, recordPayment
  } = useSchoolHub();
  
  // Résoudre le parent connecté (ou par défaut Khalid Mansour) et filtrer ses enfants légitimes
  const currentParent = parents.find((p) => p.userId === currentUser?.id) || parents.find((p) => p.id === "parent_alqalam") || parents[0];
  const myChildren = students.filter((s) => currentParent?.studentIds?.includes(s.id));
  const [selectedChildId, setSelectedChildId] = useState(myChildren[0]?.id || "");
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ChatGPT Bonus UI States
  const [parentActiveTab, setParentActiveTab] = useState<"transport" | "canteen" | "documents" | "correspondence" | "aicoach">("correspondence");
  const [meetingTeacherId, setMeetingTeacherId] = useState(teachers[0]?.id || "teacher_alqalam");
  const [meetingDate, setMeetingDate] = useState("2026-06-05");
  const [meetingTime, setMeetingTime] = useState("16:00");
  const [meetingReason, setMeetingReason] = useState("Faire un point sur la progression en Tajwid");
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [liveMapVisible, setLiveMapVisible] = useState(false);

  const selectedChild = students.find((s) => s.id === selectedChildId);
  const childGrades = grades.filter((g) => g.studentId === selectedChildId);
  const childPayments = payments.filter((p) => p.studentId === selectedChildId);
  const childAttendance = attendance.filter((a) => a.studentId === selectedChildId);
  const childClass = classes.find((c) => c.id === selectedChild?.classId);

  const handlePay = (paymentId: string) => {
    payInvoice(paymentId);
    setSuccessPaymentId(paymentId);
    setTimeout(() => setSuccessPaymentId(null), 4000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const downloadMockFile = (filename: string, htmlContent: string) => {
    showToast("Génération du document de bulletin...");

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Erreur : Veuillez autoriser les fenêtres pop-up pour générer le PDF.");
      return;
    }

    // Append script inside htmlContent to trigger window.print() after resource loading completes
    const injectPrintScript = htmlContent.replace(
      "</body>",
      `<script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script></body>`
    );

    printWindow.document.write(injectPrintScript);
    printWindow.document.close();
    
    showToast("Le document PDF vectoriel est prêt !");
  };

  const handleAiCoachRequest = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse.trim()) return;
    
    setAiLoading(true);
    setAiResponse(null);
    setAiPrompt("");

    try {
      const childUser = selectedChild?.userId ? users.find(u => u.id === selectedChild.userId) : null;
      const childName = childUser?.name || "Yasmine";
      const averageGrade = childGrades.length > 0 ? (childGrades.reduce((sum, g) => sum + g.score, 0) / childGrades.length).toFixed(1) : "18.0";

      const systemPromptContext = `Tu es l'assistant IA de SchoolHub, expert en pédagogie et conseiller pour les parents d'élèves. 
Tu réponds à Khalid Mansour pour sa fille ${childName} (Classe: ${childClass?.name || "Al-Forqane"}, Moyenne : ${averageGrade}/20). 
Réponds de manière constructive, bienveillante, avec un plan d'action concret en français. Utilise des puces et des titres simples au format Markdown (commençant par ###).`;

      const response = await askSchoolHubIA(promptToUse, systemPromptContext);
      setAiResponse(response);
      showToast("Conseil IA généré en direct !");
    } catch (e) {
      console.error(e);
      setAiResponse("Désolé, je rencontre des difficultés de réseau pour appeler Llama 3.3. Veuillez réessayer.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight flex items-center gap-2"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Espace Parent <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">M. Khalid Mansour</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Supervisez la scolarité de vos enfants, consultez leurs résultats scolaires et réglez les factures.
          </p>
        </div>
        
        {/* Child Selector tabs */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Enfant :</span>
          <div
            className="flex p-1 rounded-xl"
            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {myChildren.map((child) => {
              const childUser = users.find((u) => u.id === child.userId);
              const childName = childUser?.name || "Élève";
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedChildId === child.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/10"
                      : "hover:text-white"
                  }`}
                  style={selectedChildId !== child.id ? { color: "hsl(var(--muted-foreground))" } : undefined}
                >
                  {childName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* THREE PANELS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* 1. BULLETIN ET NOTES (1 COL) */}
        <div
          className="p-6 rounded-2xl glass-card flex flex-col justify-between"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div>
            <h3
              className="font-bold text-sm flex items-center gap-2 pb-4 mb-4"
              style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              Relevé de Notes (Bulletin)
            </h3>

            <div className="flex flex-col gap-3.5">
              {childGrades.length === 0 ? (
                <div className="text-center py-6 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Aucune évaluation enregistrée.</div>
              ) : (
                childGrades.map((g) => {
                  const isGraded = true;
                  return (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-xl flex flex-col gap-2"
                      style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs" style={{ color: "hsl(var(--card-foreground))" }}>Algèbre (Chapitre 3)</span>
                        <span className="text-xs font-extrabold" style={{ color: "hsl(var(--primary))" }}>
                          {isGraded ? `${g.score} / 20` : "Non noté"}
                        </span>
                      </div>
                      {g.feedback && (
                        <p className="text-[10px] font-normal leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg mt-0.5 border-l border-purple-500/30" style={{ color: "hsl(var(--muted-foreground))" }}>
                          "{g.feedback}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <button
            onClick={() => {
              downloadMockFile(
                "Bulletin_Yasmine_Mansour.pdf",
                `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bulletin Trimestriel - Yasmine Mansour</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px;
      display: flex;
      justify-content: center;
    }
    .card {
      background: white;
      width: 100%;
      max-width: 800px;
      border-radius: 24px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      padding: 40px;
      color: white;
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .badge {
      position: absolute;
      top: 40px;
      right: 40px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .content {
      padding: 40px;
    }
    .grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    .info-block {
      background: #f8fafc;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }
    .info-block h3 {
      margin: 0 0 8px 0;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-block p {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    th {
      text-align: left;
      padding: 16px;
      background: #f8fafc;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 20px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .score {
      font-weight: 800;
      color: #8b5cf6;
      font-size: 16px;
    }
    .comment {
      color: #475569;
      font-style: italic;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px dashed #e2e8f0;
      padding-top: 30px;
      margin-top: 20px;
    }
    .decision {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
    }
    .signature {
      text-align: right;
    }
    .signature p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    .signature h4 {
      margin: 8px 0 0 0;
      font-size: 16px;
      color: #0f172a;
    }
    @media print {
      body { padding: 0; background: white; }
      .card { border: none; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>BULLETIN DE NOTES</h1>
      <p>Académie Al-Qalam • Éducation & Excellence</p>
      <div class="badge">1er Trimestre 2025/2026</div>
    </div>
    <div class="content">
      <div class="grid">
        <div class="info-block">
          <h3>Élève</h3>
          <p>Yasmine Mansour</p>
        </div>
        <div class="info-block">
          <h3>Classe</h3>
          <p>Classe Al-Forqane (Coranique)</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Matière</th>
            <th>Moyenne</th>
            <th>Observations & Commentaires</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 700;">Tajwid & Mémorisation</td>
            <td class="score">18.0 / 20</td>
            <td class="comment">"Excellent travail. Respect remarquable des règles de Tajwid sur la lettre Ra." - Pr. Sofia Belkacem</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Langue Arabe</td>
            <td class="score">17.5 / 20</td>
            <td class="comment">"Élève assidue, participative et très investie en classe."</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="decision">
          Mention : Félicitations du Conseil de Classe
        </div>
        <div class="signature">
          <p>Le Directeur de l'Établissement</p>
          <h4>Karim Boussakri</h4>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
              );
              showToast("Bulletin de Yasmine téléchargé en version couleur !");
            }}
            className="w-full text-center mt-6 py-2.5 rounded-xl hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
            style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }}
          >
            Consulter le bulletin trimestriel
          </button>
        </div>

        {/* 2. PRESENCES & ABSENCES (1 COL) */}
        <div
          className="p-6 rounded-2xl glass-card flex flex-col justify-between"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div>
            <h3
              className="font-bold text-sm flex items-center gap-2 pb-4 mb-4"
              style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}
            >
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
              Présences & Absences
            </h3>

            <div className="flex flex-col gap-3.5">
              {childAttendance.length === 0 ? (
                <div className="text-center py-6 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Aucun historique d'appel disponible.</div>
              ) : (
                childAttendance.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs" style={{ color: "hsl(var(--card-foreground))" }}>{a.date}</span>
                      <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Classe : {childClass?.name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {a.status === "present" ? "Présente" : a.status}
                    </span>
                  </div>
                ))
              )}

              {/* Attendance stats */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mt-2 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Taux d'assiduité</span>
                  <span className="font-extrabold text-lg text-emerald-400">98.2 %</span>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>
          <button
            onClick={() => showToast("Formulaire de signalement de l'absence envoyé à l'administration.")}
            className="w-full text-center mt-6 py-2.5 rounded-xl hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
            style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }}
          >
            Signaler une absence
          </button>
        </div>

        {/* 3. FACTURATION & FRAIS SCOLAIRES (1 COL) */}
        <div
          className="p-6 rounded-2xl glass-card flex flex-col justify-between"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div>
            <h3
              className="font-bold text-sm flex items-center gap-2 pb-4 mb-4"
              style={{ color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))" }}
            >
              <CreditCard className="w-5 h-5 text-amber-400" />
              Règlements & Facturation
            </h3>

            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {successPaymentId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                    Facture réglée avec succès !
                  </motion.div>
                )}
              </AnimatePresence>

              {childPayments.map((p) => {
                const isPaid = p.status === "paid";
                const isOverdue = p.status === "overdue";
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl flex flex-col gap-2 transition-all"
                    style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs block truncate w-32" style={{ color: "hsl(var(--card-foreground))" }}>{p.description}</span>
                        <span className="text-[9px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>Échéance : {p.dueDate}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        isPaid ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                        isOverdue ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {isPaid ? "Payée" : isOverdue ? "Retard" : "En attente"}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between pt-2 mt-1"
                      style={{ borderTop: "1px solid hsl(var(--border))" }}
                    >
                      <span className="font-extrabold text-sm" style={{ color: "hsl(var(--foreground))" }}>{p.amount} €</span>
                      {!isPaid && (
                        <button
                          onClick={() => handlePay(p.id)}
                          className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-lg shadow-purple-500/15 cursor-pointer transition-all"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))", color: "hsl(var(--primary-foreground))" }}
                        >
                          Régler en ligne
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={() => {
              downloadMockFile(
                "Attestation_Fiscale_Yasmine_Mansour.pdf",
                `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Attestation Fiscale - SchoolHub</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px;
      display: flex;
      justify-content: center;
    }
    .card {
      background: white;
      width: 100%;
      max-width: 800px;
      border-radius: 24px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 40px;
      color: white;
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      padding: 40px;
    }
    .grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    .info-block {
      background: #f8fafc;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }
    .info-block h3 {
      margin: 0 0 8px 0;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-block p {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    .receipt-table th {
      text-align: left;
      padding: 16px;
      background: #f8fafc;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 2px solid #e2e8f0;
    }
    .receipt-table td {
      padding: 20px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .amount {
      font-weight: 800;
      color: #4f46e5;
      font-size: 16px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px dashed #e2e8f0;
      padding-top: 30px;
      margin-top: 20px;
    }
    .total-paid {
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      color: #6d28d9;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 16px;
    }
    .signature {
      text-align: right;
    }
    .signature p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    .signature h4 {
      margin: 8px 0 0 0;
      font-size: 16px;
      color: #0f172a;
    }
    @media print {
      body { padding: 0; background: white; }
      .card { border: none; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>ATTESTATION FISCALE</h1>
      <p>SchoolHub SaaS Platform • Justificatif de Scolarité</p>
    </div>
    <div class="content">
      <div class="grid">
        <div class="info-block">
          <h3>Responsable Légal</h3>
          <p>M. Khalid Mansour</p>
        </div>
        <div class="info-block">
          <h3>Élève Rattaché</h3>
          <p>Yasmine Mansour (Académie Al-Qalam)</p>
        </div>
      </div>
      <table class="receipt-table">
        <thead>
          <tr>
            <th>Libellé du Paiement</th>
            <th>Date de Règlement</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 700;">Frais de scolarité - Mai 2026</td>
            <td>15 Mai 2026</td>
            <td class="amount">150.00 €</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="total-paid">
          Total versé : 150.00 €
        </div>
        <div class="signature">
          <p>L'administration SchoolHub</p>
          <h4>Service Comptabilité SaaS</h4>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
              );
              showToast("Attestation fiscale téléchargée en version couleur !");
            }}
            className="w-full text-center mt-6 py-2.5 rounded-xl hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
            style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--card-foreground))" }}
          >
            Télécharger les reçus fiscaux
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHATGPT FEATURE SUITE (TRANSPORT, CANTEEN, DOCUMENTS, MEETING, AI) */}
      {/* ========================================================= */}
      <div 
        className="p-6 rounded-2xl glass-card flex flex-col gap-6"
        style={{ border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 animate-fade-in" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div>
            <h3 className="font-extrabold text-sm flex items-center gap-2 uppercase tracking-wider" style={{ color: "hsl(var(--foreground))" }}>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              Services Connectés &amp; Communication Parents
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              Suivez le transport en temps réel, consultez les menus de la cantine, gérez vos documents administratifs et consultez le Coach IA.
            </p>
          </div>
          
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-1 p-1 rounded-xl shrink-0" style={{ backgroundColor: "hsl(var(--secondary))" }}>
            {[
              { id: "correspondence", name: "Carnet", icon: MessageSquare },
              { id: "transport", name: "Transport", icon: Bus },
              { id: "canteen", name: "Cantine", icon: Utensils },
              { id: "documents", name: "Documents", icon: FolderOpen },
              { id: "aicoach", name: "Coach IA", icon: Sparkle }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = parentActiveTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setParentActiveTab(t.id as any)}
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
            key={parentActiveTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {/* 1. CARNET DE CORRESPONDANCE TAB */}
            {parentActiveTab === "correspondence" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meeting Requests Form */}
                <div className="p-4 rounded-xl flex flex-col gap-4" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                  <h4 className="font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-wide" style={{ color: "hsl(var(--foreground))" }}>
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Demander un RDV avec un Professeur
                  </h4>
                  <div className="flex flex-col gap-3 mt-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>CHOIX DE L'ENSEIGNANT</label>
                      <select 
                        value={meetingTeacherId}
                        onChange={(e) => setMeetingTeacherId(e.target.value)}
                        className="p-2 rounded-lg focus:outline-none"
                        style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      >
                        {teachers
                          .filter(t => t.schoolId === activeSchoolId)
                          .map(t => {
                            const u = users.find(usr => usr.id === t.userId);
                            return (
                              <option key={t.id} value={t.id}>Pr. {u?.name || t.id} ({t.subjects.join(", ")})</option>
                            );
                          })}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>DATE DE RDV</label>
                        <input 
                          type="date"
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          className="p-2 rounded-lg focus:outline-none"
                          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>HEURE</label>
                        <input 
                          type="time"
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="p-2 rounded-lg focus:outline-none"
                          style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>MOTIF DU RENDEZ-VOUS</label>
                      <input 
                        type="text"
                        value={meetingReason}
                        onChange={(e) => setMeetingReason(e.target.value)}
                        className="p-2 rounded-lg focus:outline-none"
                        style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        requestParentMeeting(meetingTeacherId, meetingDate, meetingTime, meetingReason);
                        showToast("Demande de rendez-vous enregistrée ! Le professeur sera notifié.");
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] shadow-lg shadow-purple-500/10 cursor-pointer transition-all self-start mt-2"
                    >
                      Planifier le RDV
                    </button>
                  </div>
                </div>

                {/* Correspondence log */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-[10px] uppercase tracking-wide" style={{ color: "hsl(var(--foreground))" }}>
                    Mots de l'école &amp; Signatures
                  </h4>
                  <div className="p-3.5 rounded-xl flex flex-col gap-3" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">Info Prof</span>
                      <span className="text-[8px]" style={{ color: "hsl(var(--muted-foreground))" }}>Il y a 2 jours</span>
                    </div>
                    <p className="text-[10px] italic leading-normal" style={{ color: "hsl(var(--foreground))" }}>
                      "Chers parents, Yasmine a fourni un excellent travail en cours cette semaine. Son investissement en Tajwid est exemplaire et mérite d'être souligné."
                    </p>
                    <span className="text-[9px] font-extrabold" style={{ color: "hsl(var(--muted-foreground))" }}>Pr. Sofia Belkacem</span>
                  </div>

                  <div className="p-3 rounded-xl flex items-center justify-between gap-4" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-xs truncate" style={{ color: "hsl(var(--foreground))" }}>Autorisation Sortie Musée</span>
                      <span className="text-[8px]" style={{ color: "hsl(var(--muted-foreground))" }}>Sortie prévue le 12 Juin 2026</span>
                    </div>
                    <button
                      onClick={() => showToast("Sortie scolaire signée électroniquement avec succès !")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold shadow-lg cursor-pointer transition-all shrink-0"
                    >
                      <FileCheck className="w-3 h-3" />
                      Signer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TRANSPORT SCOLAIRE TAB */}
            {parentActiveTab === "transport" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-4 rounded-xl flex flex-col gap-4" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                  <h4 className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                    <Bus className="w-4 h-4 text-purple-400" />
                    Statut du Bus Scolaire
                  </h4>
                  {buses
                    .filter(b => b.schoolId === activeSchoolId)
                    .map(b => (
                      <div key={b.id} className="flex flex-col gap-3 text-xs mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-xs" style={{ color: "hsl(var(--foreground))" }}>{b.busNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            b.status === "en_route" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {b.status === "en_route" ? "En route" : "Arrivé"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase">CHAUFFEUR</span>
                          <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{b.driverName}</span>
                          <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>📱 {b.driverPhone}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase">ARRÊT ACTUEL</span>
                          <span className="font-bold flex items-center gap-1 text-[11px]" style={{ color: "hsl(var(--foreground))" }}>
                            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            {b.currentStop}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="md:col-span-2 p-4 rounded-xl flex flex-col gap-4 justify-between" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                      <MapPin className="w-4 h-4 text-purple-400" />
                      Géolocalisation en temps réel (Simulation GPS)
                    </h4>
                    <button
                      onClick={() => setLiveMapVisible(!liveMapVisible)}
                      className="px-2.5 py-1 bg-purple-600 text-white rounded text-[8px] font-bold cursor-pointer"
                    >
                      {liveMapVisible ? "Masquer la Carte" : "Activer le Live GPS"}
                    </button>
                  </div>
                  
                  {liveMapVisible ? (
                    <div className="w-full h-44 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center bg-zinc-950">
                      {/* Simulated interactive map radar */}
                      <div className="absolute inset-0 opacity-20" style={{ 
                        backgroundImage: "radial-gradient(circle, #8b5cf6 1px, transparent 1px)", 
                        backgroundSize: "20px 20px" 
                      }} />
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-purple-500/10 animate-ping" style={{ animationDuration: '4s' }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                      
                      <div className="z-10 flex flex-col items-center gap-2 text-center">
                        <div className="p-2.5 rounded-full bg-purple-500 text-white animate-bounce shadow-lg shadow-purple-500/30">
                          <Bus className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider uppercase text-purple-400">Position : Place d'Italie</span>
                        <span className="text-[8px] text-zinc-500">Mise à jour il y a 5 sec. • Vitesse: 32 km/h</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center gap-2 bg-zinc-900/20">
                      <MapPin className="w-6 h-6 text-zinc-600 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Le traceur GPS est actif</span>
                      <p className="text-[8px] text-zinc-600">Activez le Live GPS pour suivre la navette en direct.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. CANTINE SCOLAIRE TAB */}
            {parentActiveTab === "canteen" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2">
                  <h4 className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                    <Utensils className="w-4 h-4 text-purple-400" />
                    Menus Hebdomadaires de la Cantine (Bio &amp; Équilibré)
                  </h4>
                  <span className="text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Régime enfant : Halal / Sans porc
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {canteenMenus
                    .filter(m => m.schoolId === activeSchoolId)
                    .map(m => (
                      <div key={m.id} className="p-3.5 rounded-xl flex flex-col gap-2.5 justify-between" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                        <div className="flex justify-between items-center pb-1.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                          <span className="font-black text-[11px] text-purple-400">{m.day}</span>
                          {m.allergens.map(a => (
                            <span key={a} className="text-[7px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/15 px-1.5 py-0.5 rounded">Allergène: {a}</span>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] font-medium leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold">Entrée</span>
                          <span className="truncate">{m.starter}</span>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold mt-1">Plat Principal</span>
                          <span className="font-bold text-zinc-200">{m.mainCourse}</span>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold mt-1">Dessert</span>
                          <span className="truncate">{m.dessert}</span>
                        </div>
                        <button
                          onClick={() => showToast(`Repas du ${m.day} réservé avec succès !`)}
                          className="w-full text-center mt-2 py-1 bg-purple-600/10 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-[8px] font-bold border border-purple-500/25 transition-all cursor-pointer"
                        >
                          Réserver
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. COFFRE-FORT DOCUMENTAIRE TAB */}
            {parentActiveTab === "documents" && (
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5" style={{ color: "hsl(var(--foreground))" }}>
                  <FolderOpen className="w-4 h-4 text-purple-400" />
                  Coffre-fort Numérique (Documents Officiels &amp; Vault)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {documents
                    .filter(d => d.schoolId === activeSchoolId)
                    .map(d => (
                      <div key={d.id} className="p-3.5 rounded-xl flex flex-col justify-between gap-3 transition-all" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-xs min-w-0">
                              <span className="font-bold truncate" style={{ color: "hsl(var(--foreground))" }}>{d.name}</span>
                              <span className="text-[8px] mt-0.5 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{d.size} • Type: {d.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                          {d.isSigned !== undefined ? (
                            <button
                              disabled={d.isSigned}
                              onClick={() => {
                                signDocument(d.id);
                                showToast("Document signé numériquement !");
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[8px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                d.isSigned 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                                  : "bg-red-500/15 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {d.isSigned ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3 animate-pulse" />}
                              {d.isSigned ? "Signé" : "Signature"}
                            </button>
                          ) : (
                            <span className="text-[8px] text-zinc-500 font-bold uppercase">Public</span>
                          )}
                          <button
                            onClick={() => showToast(`Téléchargement du fichier ${d.name} démarré.`)}
                            className="px-2 py-1 hover:bg-white/10 rounded text-[8px] font-bold cursor-pointer"
                            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          >
                            Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 5. COACH IA PARENT TAB */}
            {parentActiveTab === "aicoach" && (
              <div className="p-4 rounded-xl flex flex-col gap-4 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-600/15 rounded-lg text-purple-400">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[11px]" style={{ color: "hsl(var(--foreground))" }}>Assistant Éducatif IA Parent Coach</span>
                      <span className="text-[8px] text-zinc-500 font-mono">Modèle : Llama 3.2 Fine-Tuned SchoolHub</span>
                    </div>
                  </div>
                  <span className="text-[8px] bg-purple-500/10 font-bold px-2 py-0.5 rounded border border-purple-500/20 uppercase" style={{ color: "hsl(var(--primary))" }}>
                    IA active
                  </span>
                </div>

                <div className="flex flex-col gap-4 text-xs font-normal">
                  <p className="text-[10px] leading-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Bonjour Khalid Mansour. Je suis l'IA de SchoolHub, entraînée sur les données de **{selectedChild?.userId ? (users.find(u => u.id === selectedChild.userId)?.name || "Yasmine") : "Yasmine"}**.
                    Je peux analyser son niveau scolaire actuel et vous recommander des stratégies de révision ou d'aide aux devoirs personnalisées.
                  </p>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleAiCoachRequest("Comment puis-je aider mon enfant en Tajwid à la maison ?")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950/40 border border-white/5 hover:border-purple-500/30 text-[9px] font-bold cursor-pointer transition-colors"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      💡 Aide en Tajwid ?
                    </button>
                    <button
                      onClick={() => handleAiCoachRequest("Propose-moi un planning de révision hebdomadaire")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950/40 border border-white/5 hover:border-purple-500/30 text-[9px] font-bold cursor-pointer transition-colors"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      📅 Planning de révisions ?
                    </button>
                    <button
                      onClick={() => handleAiCoachRequest("Quels sont les points forts à consolider d'après ses notes ?")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950/40 border border-white/5 hover:border-purple-500/30 text-[9px] font-bold cursor-pointer transition-colors"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      📊 Points forts / faibles ?
                    </button>
                  </div>

                  {/* Response section */}
                  {aiLoading ? (
                    <div className="p-4 rounded-xl flex items-center justify-center gap-2 bg-zinc-950/30 border border-white/5">
                      <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                      <span className="text-[8px] text-zinc-500 font-bold uppercase">Analyse IA en cours...</span>
                    </div>
                  ) : aiResponse ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3.5 rounded-xl bg-zinc-950/40 border border-purple-500/10 leading-relaxed font-sans text-[10px] flex flex-col gap-2"
                    >
                      {/* Parse Markdown-like simple layout */}
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

                  {/* Input form */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Posez une question sur la scolarité de votre enfant..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAiCoachRequest()}
                      className="flex-1 px-3.5 py-2 rounded-xl text-[10px] focus:outline-none focus:border-purple-500/30"
                      style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    />
                    <button
                      onClick={() => handleAiCoachRequest()}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-purple-500/15 cursor-pointer transition-colors"
                    >
                      Poser
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DIRECT MESSAGE QUICK CARD */}
      <div
        className="p-6 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-purple-500/5 to-indigo-500/5"
        style={{ border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex gap-4">
          <div
            className="p-3 rounded-xl shrink-0 flex items-center justify-center"
            style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5 justify-center">
            <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Besoin de contacter l'école ?</span>
            <p className="text-xs font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
              Envoyez un message privé direct aux enseignants de Yasmine ou à l'équipe administrative de SchoolHub.
            </p>
          </div>
        </div>
        <Link href="/dashboard/messages">
          <button
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            Ouvrir la Messagerie
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
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
