"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Users, GraduationCap, ClipboardCheck, CreditCard, Sparkles, CheckCircle, ArrowRight, BookOpen } from "lucide-react";

export default function ParentDashboard() {
  const { students, grades, payments, payInvoice, attendance, classes, parents, currentUser, users } = useSchoolHub();
  
  // Résoudre le parent connecté (ou par défaut Khalid Mansour) et filtrer ses enfants légitimes
  const currentParent = parents.find((p) => p.userId === currentUser?.id) || parents.find((p) => p.id === "parent_alqalam") || parents[0];
  const myChildren = students.filter((s) => currentParent?.studentIds?.includes(s.id));
  const [selectedChildId, setSelectedChildId] = useState(myChildren[0]?.id || "");
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    showToast("Génération du fichier PDF professionnel en cours...");
    
    const runConversion = () => {
      const opt = {
        margin: [15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Utiliser directement le rendu de chaîne HTML virtuel natif de html2pdf (sans injection dans le DOM)
      // @ts-ignore
      window.html2pdf().from(htmlContent).set(opt).output('blob').then((pdfBlob: Blob) => {
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
