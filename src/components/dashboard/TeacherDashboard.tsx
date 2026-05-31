"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  ClipboardCheck, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  HelpCircle, 
  AlertCircle, 
  Send, 
  FileText, 
  X,
  Sparkles,
  Loader2,
  Wand2
} from "lucide-react";
import { generateExercisesIA } from "@/lib/ai/aiHelpers";

export default function TeacherDashboard() {
  const { classes, students, assignments, createAssignment, takeAttendance, attendance, users } = useSchoolHub();
  
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [attendanceDate, setAttendanceDate] = useState("2026-05-23");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "present" | "absent" | "late">>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // PDF states & utilities
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewHomework, setPreviewHomework] = useState<{
    title: string;
    description: string;
    points: number;
    dueDate: string;
    className: string;
    exercises?: {
      id: string;
      question: string;
      options?: string[];
      correctAnswer: string;
      explanation: string;
    }[];
    isDraft?: boolean;
  } | null>(null);

  // AI Homework generator states
  const [homeworkMode, setHomeworkMode] = useState<"manual" | "ai">("manual");
  const [aiSubject, setAiSubject] = useState("Mathématiques");
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [aiPoints, setAiPoints] = useState(20);
  const [aiDueDate, setAiDueDate] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const downloadHomeworkPdf = (
    title: string, 
    description: string, 
    points: number, 
    dueDate: string, 
    className: string, 
    exercises?: any[]
  ) => {
    showToast("Génération du document de devoir...");

    // Compile exercises list if present
    let exercisesHtml = "";
    if (exercises && exercises.length > 0) {
      exercisesHtml = `
      <div class="section-title">Exercices Pratiques</div>
      <div class="exercises-container">
      `;
      exercises.forEach((ex, idx) => {
        let optionsHtml = "";
        if (ex.options && ex.options.length > 0) {
          optionsHtml = `<div class="option-list">`;
          ex.options.forEach((opt: string, oIdx: number) => {
            optionsHtml += `
              <div class="option-item">
                <span style="font-weight: 800; color: #10b981; margin-right: 6px;">[${String.fromCharCode(65 + oIdx)}]</span>
                ${opt}
              </div>`;
          });
          optionsHtml += `</div>`;
        }
        exercisesHtml += `
          <div class="exercise-card">
            <div class="exercise-title">Exercice ${idx + 1}</div>
            <div class="exercise-q">${ex.question}</div>
            ${optionsHtml}
          </div>
        `;
      });
      exercisesHtml += `</div>`;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Devoir - ${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 40px;
    }
    .card {
      background: white;
      width: 100%;
      max-width: 800px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin: 0 auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px;
      color: white;
      position: relative;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: white;
    }
    .header p {
      margin: 6px 0 0 0;
      opacity: 0.9;
      font-size: 13px;
      color: white;
    }
    .badge {
      position: absolute;
      top: 30px;
      right: 30px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 800;
      color: white;
    }
    .content {
      padding: 30px;
    }
    .grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-block {
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .info-block h3 {
      margin: 0 0 6px 0;
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-block p {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 25px;
      margin-bottom: 12px;
    }
    .desc-text {
      font-size: 12px;
      line-height: 1.6;
      color: #334155;
      white-space: pre-wrap;
    }
    .exercises-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .exercise-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      margin-bottom: 12px;
    }
    .exercise-title {
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .exercise-q {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.5;
    }
    .option-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 10px;
    }
    .option-item {
      font-size: 11px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 6px;
      color: #334155;
    }
    .answer-box {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 11px;
      font-style: italic;
      margin-top: 8px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 30px;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { padding: 0; background: white; }
      .card { border: none; box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${title}</h1>
      <p>SchoolHub ERP • Académie Al-Qalam</p>
      <div class="badge">${points} Points</div>
    </div>
    <div class="content">
      <div class="grid">
        <div class="info-block">
          <h3>Classe</h3>
          <p>${className}</p>
        </div>
        <div class="info-block">
          <h3>Date Limite de Rendu</h3>
          <p>${dueDate}</p>
        </div>
      </div>
      
      <div class="section-title">Consignes &amp; Instructions</div>
      <div class="desc-text">${description}</div>
      
      ${exercisesHtml}
      
      <div class="section-title">Espace Réponse Élève</div>
      <div class="answer-box">Cadre réservé à la rédaction de votre devoir écrit</div>
      
      <div class="footer">
        <span>Enseignant : Pr. Sofia Belkacem</span>
        <span>Généré via SchoolHub AI</span>
      </div>
    </div>
  </div>
  <script>
    // Trigger browser print manager once page resources loaded
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    // Open top-level browser tab
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Erreur : Veuillez autoriser les fenêtres pop-up pour générer le PDF.");
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    showToast("Le document PDF vectoriel est prêt !");
    setPreviewHomework(null);
  };

  // Set local date on mount to avoid hydration mismatch
  React.useEffect(() => {
    setAttendanceDate(new Date().toISOString().split("T")[0]);
  }, []);

  // States de création de devoirs
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDesc, setHomeworkDesc] = useState("");
  const [homeworkDue, setHomeworkDue] = useState("");
  const [homeworkPoints, setHomeworkPoints] = useState(20);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Initialiser les enregistrements si vide ou changement de classe
  React.useEffect(() => {
    const initial: Record<string, "present" | "absent" | "late"> = {};
    classStudents.forEach((s) => {
      initial[s.id] = "present";
    });
    setAttendanceRecords(initial);
    setIsSaved(false);
  }, [selectedClassId]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: string, text: string) => {
    setRemarks((prev) => ({ ...prev, [studentId]: text }));
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      status,
      remarks: remarks[studentId] || undefined,
    }));
    
    takeAttendance(selectedClassId, attendanceDate, records);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkTitle || !homeworkDue) return;

    createAssignment({
      classId: selectedClassId,
      teacherId: "teacher_alqalam",
      title: homeworkTitle,
      description: homeworkDesc,
      dueDate: homeworkDue,
      points: Number(homeworkPoints),
    });

    setHomeworkTitle("");
    setHomeworkDesc("");
    setHomeworkDue("");
    setShowAddHomework(false);
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
            Espace Enseignant <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Pr. Sofia Belkacem</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Gérez vos présences quotidiennes, suivez les devoirs et planifiez vos cours de la semaine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* INTERACTIVE ATTENDANCE FEUILLE D'APPEL (2 COLS) */}
        <div
          className="lg:col-span-2 p-6 rounded-2xl glass-card flex flex-col justify-between"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div>
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <div>
                <h3
                  className="font-bold text-base flex items-center gap-2"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                  Feuille d'Appel Numérique
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Appel rapide pour la classe : {selectedClass?.name}</p>
              </div>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium max-w-[150px] focus:outline-none"
                style={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
              />
            </div>

            {/* Students List */}
            <div className="flex flex-col gap-3.5 max-h-[360px] overflow-y-auto pr-1 mt-4">
              {classStudents.length === 0 ? (
                <div className="text-center py-10 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Aucun élève inscrit dans cette classe.</div>
              ) : (
                classStudents.map((student) => {
                  const status = attendanceRecords[student.id] || "present";
                  return (
                    <div
                      key={student.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: "hsl(var(--secondary))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-600/30 flex items-center justify-center font-bold text-xs border border-purple-500/10"
                          style={{ color: "hsl(var(--primary))" }}
                        >
                          {student.gender === "Masculin" ? "👦" : "👧"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs" style={{ color: "hsl(var(--foreground))" }}>
                            {users.find((u) => u.id === student.userId)?.name || "Élève"}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                            ID: {student.id.substring(0, 8)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badges Selector */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(student.id, "present")}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            status === "present"
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                              : "bg-white/5 text-zinc-400 hover:bg-white/10"
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "absent")}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            status === "absent"
                              ? "bg-red-500 text-white shadow-md shadow-red-500/10"
                              : "bg-white/5 text-zinc-400 hover:bg-white/10"
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "late")}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            status === "late"
                              ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                              : "bg-white/5 text-zinc-400 hover:bg-white/10"
                          }`}
                        >
                          Retard
                        </button>
                        
                        <input
                          type="text"
                          placeholder="Remarque..."
                          value={remarks[student.id] || ""}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg text-[10px] placeholder-zinc-600 focus:outline-none w-24 sm:w-32"
                          style={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--card-foreground))",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            className="flex items-center justify-between pt-4 mt-6"
            style={{ borderTop: "1px solid hsl(var(--border))" }}
          >
            <span className="text-[10px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
              {classStudents.length} élèves appelés
            </span>
            <button
              onClick={handleSaveAttendance}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                isSaved
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-zinc-950 hover:bg-zinc-200"
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 animate-bounce" />
                  Appel Enregistré !
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Enregistrer l'appel
                </>
              )}
            </button>
          </div>
        </div>

        {/* HOMEWORK & ASSIGNMENTS PANEL (1 COL) */}
        <div
          className="p-6 rounded-2xl glass-card flex flex-col justify-between"
          style={{ border: "1px solid hsl(var(--border))" }}
        >
          <div>
            <div
              className="flex items-center justify-between pb-4 mb-4"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <h3
                className="font-bold text-base flex items-center gap-2"
                style={{ color: "hsl(var(--foreground))" }}
              >
                <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                Devoirs Assignés
              </h3>
              <button
                onClick={() => setShowAddHomework(!showAddHomework)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
                style={{
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Formulaire d'ajout de Devoir */}
            {showAddHomework ? (
              <div className="flex flex-col gap-4 py-2">
                {/* Tabs to select Manual or AI Mode */}
                <div className="flex p-1 rounded-xl bg-zinc-950/40 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setHomeworkMode("manual")}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      homeworkMode === "manual"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Manuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkMode("ai")}
                    className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      homeworkMode === "ai"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10 font-extrabold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    Assistant IA
                  </button>
                </div>

                {homeworkMode === "manual" ? (
                  <form onSubmit={handleCreateHomework} className="flex flex-col gap-3" style={{ color: "hsl(var(--foreground))" }}>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>TITRE DU DEVOIR</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Récitation Sourate Al-Fatiha"
                        value={homeworkTitle}
                        onChange={(e) => setHomeworkTitle(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs placeholder-zinc-600 focus:outline-none"
                        style={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>CONSIGNES / INSTRUCTIONS</label>
                      <textarea
                        rows={3}
                        placeholder="Décrivez les exercices ou les versets à réviser..."
                        value={homeworkDesc}
                        onChange={(e) => setHomeworkDesc(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs placeholder-zinc-600 focus:outline-none resize-none"
                        style={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>DATE DE RENDU</label>
                        <input
                          type="date"
                          required
                          value={homeworkDue}
                          onChange={(e) => setHomeworkDue(e.target.value)}
                          className="px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
                          style={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>BARÈME (POINTS)</label>
                        <input
                          type="number"
                          required
                          min={5}
                          max={100}
                          value={homeworkPoints}
                          onChange={(e) => setHomeworkPoints(Number(e.target.value))}
                          className="px-3 py-2 rounded-xl text-xs focus:outline-none"
                          style={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="flex-1 text-center py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
                          color: "hsl(var(--primary-foreground))",
                        }}
                      >
                        Publier le devoir
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddHomework(false)}
                        className="px-3 rounded-xl text-xs font-bold cursor-pointer"
                        style={{
                          backgroundColor: "hsl(var(--secondary))",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  /* AI HW GENERATOR FORM */
                  <div className="flex flex-col gap-3" style={{ color: "hsl(var(--foreground))" }}>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>DISCIPLINE / MATIÈRE</label>
                      <select
                        value={aiSubject}
                        onChange={(e) => setAiSubject(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
                        style={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      >
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Langue Arabe">Langue Arabe</option>
                        <option value="Français">Français</option>
                        <option value="Tafsir & Coran">Tafsir & Coran</option>
                        <option value="Histoire & Géo">Histoire & Géo</option>
                        <option value="Sciences">Sciences</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>NOTION / THÈME DU DEVOIR</label>
                      <input
                        type="text"
                        placeholder="ex: Les fractions, Conjugaison, Sourate Al-Mulk..."
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs placeholder-zinc-600 focus:outline-none"
                        style={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>DIFFICULTÉ</label>
                        <select
                          value={aiDifficulty}
                          onChange={(e) => setAiDifficulty(e.target.value as any)}
                          className="px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
                          style={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        >
                          <option value="easy">Facile</option>
                          <option value="medium">Moyen</option>
                          <option value="hard">Difficile</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>BARÈME (POINTS)</label>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={aiPoints}
                          onChange={(e) => setAiPoints(Number(e.target.value))}
                          className="px-3 py-2 rounded-xl text-xs focus:outline-none"
                          style={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>DATE DE RENDU</label>
                      <input
                        type="date"
                        value={aiDueDate}
                        onChange={(e) => setAiDueDate(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
                        style={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        disabled={aiLoading || !aiTopic.trim()}
                        onClick={async () => {
                          if (!aiTopic.trim()) return;
                          setAiLoading(true);
                          try {
                            const exercises = await generateExercisesIA({
                              classLevel: selectedClass?.level || "Primaire",
                              subject: aiSubject,
                              topic: aiTopic,
                              difficulty: aiDifficulty,
                              count: 3
                            });
                            
                            const title = `Devoir de ${aiSubject} : ${aiTopic}`;
                            const desc = `Ce devoir a été préparé automatiquement par l'IA SchoolHub pour valider vos acquis sur la notion suivante : "${aiTopic}".\nVeuillez lire attentivement les consignes et rédiger vos réponses dans les cadres prévus. Bon travail !`;
                            
                            setPreviewHomework({
                              title: title,
                              description: desc,
                              points: aiPoints,
                              dueDate: aiDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                              className: selectedClass?.name || "Classe",
                              exercises: exercises,
                              isDraft: true
                            });
                            
                            showToast("Devoir IA généré ! Prévisualisation ouverte.");
                          } catch (err) {
                            showToast("Erreur lors de la génération IA.");
                          } finally {
                            setAiLoading(false);
                          }
                        }}
                        className="flex-1 text-center py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
                        style={{
                          background: "linear-gradient(135deg, #10b981, #059669)",
                        }}
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5 animate-pulse" />
                            Générer &amp; Prévisualiser A4
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddHomework(false)}
                        className="px-3 rounded-xl text-xs font-bold cursor-pointer"
                        style={{
                          backgroundColor: "hsl(var(--secondary))",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Liste des devoirs existants */
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto">
                {assignments
                  .filter((a) => a.classId === selectedClassId)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl flex flex-col gap-2"
                      style={{
                        backgroundColor: "hsl(var(--secondary))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-xs line-clamp-1" style={{ color: "hsl(var(--foreground))" }}>{a.title}</span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: "hsl(var(--primary) / 0.1)",
                            color: "hsl(var(--primary))",
                          }}
                        >
                          {a.points} pts
                        </span>
                      </div>
                      <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {a.description}
                      </p>
                      <div
                        className="flex items-center justify-between gap-1.5 text-[9px] font-bold mt-1 uppercase pt-2"
                        style={{
                          color: "hsl(var(--muted-foreground))",
                          borderTop: "1px solid hsl(var(--border))",
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" style={{ color: "hsl(var(--primary))" }} />
                          A rendre le : {a.dueDate}
                        </div>
                        <button
                          onClick={() => {
                            setPreviewHomework({
                              title: a.title,
                              description: a.description,
                              points: a.points,
                              dueDate: a.dueDate,
                              className: selectedClass?.name || "Classe"
                            });
                          }}
                          className="px-2.5 py-0.5 rounded bg-zinc-950/40 hover:bg-zinc-950 border border-white/5 hover:border-emerald-500/30 text-[8px] font-black text-emerald-400 cursor-pointer transition-colors"
                        >
                          Générer PDF
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {!showAddHomework && (
            <button
              onClick={() => setShowAddHomework(true)}
              className="w-full text-center mt-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--card-foreground))",
              }}
            >
              Nouveau Devoir
            </button>
          )}
        </div>
      </div>

      {/* TIMELINE COURS DE LA SEMAINE */}
      <div
        className="p-6 rounded-2xl glass-card"
        style={{ border: "1px solid hsl(var(--border))" }}
      >
        <h3
          className="font-bold text-sm flex items-center gap-2 mb-5"
          style={{ color: "hsl(var(--foreground))" }}
        >
          <Clock className="w-4.5 h-4.5" style={{ color: "hsl(var(--accent))" }} />
          Mon Emploi du Temps Hebdomadaire
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedClass?.schedule.map((slot, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-xl hover:opacity-90 transition-colors"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <div
                className="p-3 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5 justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--accent))" }}>{slot.day}</span>
                <span className="font-extrabold text-xs" style={{ color: "hsl(var(--foreground))" }}>{slot.subject}</span>
                <span className="text-[10px] flex items-center gap-1 font-medium mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Clock className="w-3 h-3" style={{ color: "hsl(var(--muted-foreground))" }} />
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* A4 WYSIWYG Homework Preview Modal */}
      <AnimatePresence>
        {previewHomework && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh]"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  {previewHomework.isDraft ? "Aperçu de votre Création IA (Draft)" : "Fiche de Devoir A4"}
                </span>
                <button
                  onClick={() => setPreviewHomework(null)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
 
              {/* PDF Sheet Simulator */}
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/40 rounded-xl border border-zinc-800/50 flex justify-center">
                {/* The Paper Sheet Container */}
                <div 
                  id="pdf-homework-template"
                  className="w-full max-w-[500px] bg-white text-zinc-950 p-6 rounded-lg shadow-lg flex flex-col gap-5 text-left leading-normal font-sans"
                  style={{ minHeight: "650px" }}
                >
                  {/* Header */}
                  <div className="relative p-5 rounded-xl text-white flex flex-col gap-1.5" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    <span className="text-[10px] font-black tracking-widest uppercase opacity-90">Fiche de Devoir</span>
                    <h2 className="text-xl font-extrabold tracking-tight m-0 text-white">{previewHomework.title}</h2>
                    <p className="text-[9px] font-bold opacity-80 m-0 text-white">SchoolHub ERP • Académie Al-Qalam</p>
                    <span className="absolute top-4 right-4 bg-white/20 border border-white/30 px-3 py-1 rounded-full text-[10px] font-black text-white">{previewHomework.points} Points</span>
                  </div>
 
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col gap-0.5">
                      <span className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider">Classe</span>
                      <span className="font-extrabold text-xs text-zinc-800">{previewHomework.className}</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col gap-0.5">
                      <span className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider">Date limite de rendu</span>
                      <span className="font-extrabold text-xs text-zinc-800">{previewHomework.dueDate}</span>
                    </div>
                  </div>
 
                  {/* Consignes */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest border-b-2 border-zinc-200 pb-1">Consignes &amp; Instructions</span>
                    <p className="text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap mt-1">
                      {previewHomework.description || "Aucune consigne supplémentaire fournie pour ce devoir. Veuillez contacter le professeur."}
                    </p>
                  </div>

                  {/* Exercises Pratiques */}
                  {previewHomework.exercises && previewHomework.exercises.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest border-b-2 border-zinc-200 pb-1">Exercices Pratiques</span>
                      <div className="flex flex-col gap-3">
                        {previewHomework.exercises.map((ex, idx) => (
                          <div key={ex.id || idx} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col gap-2 text-left">
                            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Exercice {idx + 1}</span>
                            <p className="text-xs font-bold text-zinc-800 leading-normal m-0">{ex.question}</p>
                            {ex.options && ex.options.length > 0 && (
                              <div className="flex flex-col gap-1.5 pl-1.5 mt-1">
                                {ex.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-2 text-[10px] text-zinc-600 font-semibold">
                                    <span className="w-4 h-4 rounded border border-zinc-300 flex items-center justify-center shrink-0 text-[8px] font-extrabold bg-white text-zinc-500">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
 
                  {/* Answer Frame */}
                  <div className="flex flex-col gap-2 mt-4">
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest border-b-2 border-zinc-200 pb-1">Espace Réponse de l'élève</span>
                    <div className="border-2 border-dashed border-zinc-300 rounded-xl h-24 flex items-center justify-center text-zinc-400 text-[10px] font-bold italic mt-1">
                      Rédigez votre réponse ou collez votre exercice écrit dans ce cadre
                    </div>
                  </div>
 
                  {/* Footer */}
                  <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400 pt-3 border-t border-zinc-100 mt-4 uppercase">
                    <span>Enseignant : Pr. Sofia Belkacem</span>
                    <span>SchoolHub Smart AI Sheet</span>
                  </div>
                </div>
              </div>
 
              {/* Modal Footer Controls */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => setPreviewHomework(null)}
                  className="px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                  style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                >
                  {previewHomework.isDraft ? "Annuler" : "Fermer"}
                </button>
                <button
                  onClick={() => downloadHomeworkPdf(
                    previewHomework.title,
                    previewHomework.description,
                    previewHomework.points,
                    previewHomework.dueDate,
                    previewHomework.className,
                    previewHomework.exercises
                  )}
                  className="px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all shadow-lg"
                >
                  Télécharger le Devoir PDF
                </button>
                {previewHomework.isDraft && (
                  <button
                    onClick={() => {
                      // Compile exercises list if present to include in the assignment description
                      let formattedDescription = previewHomework.description;
                      if (previewHomework.exercises && previewHomework.exercises.length > 0) {
                        formattedDescription += `\n\n### 📝 EXERCICES DU DEVOIR :\n` + 
                          previewHomework.exercises.map((ex, idx) => {
                            let text = `**Exercice ${idx + 1} :** ${ex.question}\n`;
                            if (ex.options && ex.options.length > 0) {
                              text += ex.options.map((opt, oIdx) => `   * [ ] **${String.fromCharCode(65 + oIdx)}.** ${opt}`).join("\n") + "\n";
                            }
                            return text;
                          }).join("\n");
                      }

                      createAssignment({
                        classId: selectedClassId,
                        teacherId: "teacher_alqalam",
                        title: previewHomework.title,
                        description: formattedDescription,
                        dueDate: previewHomework.dueDate,
                        points: Number(previewHomework.points),
                      });
                      
                      showToast("Devoir IA publié avec succès dans la classe !");
                      setPreviewHomework(null);
                      setShowAddHomework(false);
                      setAiTopic(""); // reset topic input
                    }}
                    className="px-4 py-2 rounded-xl text-[10px] font-black text-white bg-purple-600 hover:bg-purple-700 cursor-pointer transition-all shadow-lg shadow-purple-600/15"
                  >
                    💾 Publier &amp; Enregistrer
                  </button>
                )}
              </div>
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
            className="fixed bottom-6 left-6 z-50 p-4 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 toast-notification"
          >
            <BookOpen className="w-4 h-4 shrink-0 animate-pulse text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
