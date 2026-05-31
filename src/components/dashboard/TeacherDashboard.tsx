"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion } from "framer-motion";
import { BookOpen, ClipboardCheck, Calendar, Clock, Plus, CheckCircle, HelpCircle, AlertCircle, Send } from "lucide-react";

export default function TeacherDashboard() {
  const { classes, students, assignments, createAssignment, takeAttendance, attendance, users } = useSchoolHub();
  
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [attendanceDate, setAttendanceDate] = useState("2026-05-23");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "present" | "absent" | "late">>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

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
              <form onSubmit={handleCreateHomework} className="flex flex-col gap-3 py-2" style={{ color: "hsl(var(--foreground))" }}>
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
                      className="px-3 py-2 rounded-xl text-xs focus:outline-none"
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
                        className="flex items-center gap-1.5 text-[9px] font-bold mt-1 uppercase pt-2"
                        style={{
                          color: "hsl(var(--muted-foreground))",
                          borderTop: "1px solid hsl(var(--border))",
                        }}
                      >
                        <Calendar className="w-3 h-3" style={{ color: "hsl(var(--primary))" }} />
                        A rendre le : {a.dueDate}
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
    </div>
  );
}
