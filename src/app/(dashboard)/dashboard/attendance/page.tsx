"use client";

import React, { useState } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, Sparkles, AlertTriangle, Calendar, Clock, RefreshCw, Send, CheckCircle,
  Paperclip, UploadCloud, X, Check, FileText, AlertCircle
} from "lucide-react";

export default function AttendancePage() {
  const { role, classes, students, attendance, takeAttendance, justifyAbsence, activeSchoolId, users, currentUser, parents } = useSchoolHub();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };
  
  // Scoped Multi-Tenant Datasets wrapped in useMemo to ensure stable references
  const schoolClasses = React.useMemo(() => classes.filter((c) => c.schoolId === activeSchoolId), [classes, activeSchoolId]);
  const schoolStudents = React.useMemo(() => students.filter((s) => s.schoolId === activeSchoolId), [students, activeSchoolId]);
  const schoolAttendance = React.useMemo(() => attendance.filter((a) => a.schoolId === activeSchoolId), [attendance, activeSchoolId]);

  // Justification modal state
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [justificationReason, setJustificationReason] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Compute student context for parent/student views
  const currentStudent = React.useMemo(() => {
    if (role === "parent") {
      const currentParent = parents?.find((p) => p.userId === currentUser?.id);
      return students.find((s) => currentParent?.studentIds?.includes(s.id)) || students.find((s) => s.id === "student_alqalam") || students[0];
    }
    return students.find((s) => s.userId === currentUser?.id) || students.find((s) => s.id === "student_alqalam") || students[0];
  }, [role, parents, currentUser, students]);

  const myAttendance = React.useMemo(() => {
    return schoolAttendance.filter((a) => a.studentId === currentStudent?.id);
  }, [schoolAttendance, currentStudent]);

  const unjustifiedAbsences = React.useMemo(() => {
    return myAttendance.filter((a) => a.status === "absent" && (!a.remarks || !a.remarks.includes("Justifié")));
  }, [myAttendance]);

  // States for admins/teachers
  const [selectedClassId, setSelectedClassId] = useState(schoolClasses[0]?.id || "");
  const [attendanceDate, setAttendanceDate] = useState("2026-05-23");
  const [records, setRecords] = useState<Record<string, "present" | "absent" | "late">>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Set local date on mount to avoid hydration mismatch
  React.useEffect(() => {
    setAttendanceDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Handle switching active schools
  React.useEffect(() => {
    if (schoolClasses.length > 0 && !schoolClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(schoolClasses[0].id);
    }
  }, [activeSchoolId, schoolClasses]);

  const selectedClass = React.useMemo(() => schoolClasses.find((c) => c.id === selectedClassId), [schoolClasses, selectedClassId]);
  const classStudents = React.useMemo(() => schoolStudents.filter((s) => s.classId === selectedClassId), [schoolStudents, selectedClassId]);

  React.useEffect(() => {
    const initial: Record<string, "present" | "absent" | "late"> = {};
    classStudents.forEach((s) => {
      // Regarder si on a déjà un enregistrement dans l'état global
      const existing = schoolAttendance.find((a) => a.studentId === s.id && a.date === attendanceDate);
      initial[s.id] = existing ? existing.status : "present";
    });
    setRecords(initial);
  }, [selectedClassId, attendanceDate, classStudents, schoolAttendance]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: string, text: string) => {
    setRemarks((prev) => ({ ...prev, [studentId]: text }));
  };

  const handleSave = () => {
    const output = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      status,
      remarks: remarks[studentId] || undefined,
    }));
    
    takeAttendance(selectedClassId, attendanceDate, output);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadedFileName("justificatif_absence_" + new Date().toISOString().split("T")[0] + ".pdf");
      showToast("Fichier justificatif chargé avec succès !");
    }, 1200);
  };

  const handleJustificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificationReason) return;

    if (selectedAbsenceId === "new") {
      const targetDate = customDate || new Date().toISOString().split("T")[0];
      const fullReason = justificationReason + (uploadedFileName ? ` [Fichier: ${uploadedFileName}]` : "");
      justifyAbsence("new", "Justifié : " + fullReason, {
        studentId: currentStudent?.id || "student_alqalam",
        classId: currentStudent?.classId || "class_1",
        date: targetDate,
      });
    } else {
      const fullReason = justificationReason + (uploadedFileName ? ` [Fichier: ${uploadedFileName}]` : "");
      justifyAbsence(selectedAbsenceId, "Justifié : " + fullReason);
    }

    showToast("Formulaire de justification d'absence transmis avec succès !");
    
    // Reset states
    setShowJustifyModal(false);
    setSelectedAbsenceId("");
    setCustomDate("");
    setJustificationReason("");
    setUploadedFileName(null);
  };

  const isAcademic = role === "school_admin" || role === "super_admin" || role === "teacher";

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-purple-400" />
            Suivi des Présences
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isAcademic 
              ? "Prise d'appel quotidienne pour vos classes et historique complet des absences."
              : "Consultez votre assiduité scolaire et le registre de vos absences ou retards."}
          </p>
        </div>
      </div>

      {isAcademic ? (
        /* VUE ENSEIGNANT / ADMIN : INTERACTIVE PRIS D'APPEL */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* REGISTER SHEET */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-sm text-white">Registre des Appelants</h3>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">FILTRÉ SUR : {selectedClass?.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="bg-zinc-900 border border-white/5 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 focus:outline-none cursor-pointer"
                  >
                    {schoolClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-zinc-900 border border-white/5 px-3 py-2 rounded-xl text-xs font-medium text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Student records list */}
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {classStudents.length === 0 ? (
                  <div className="text-center py-10 text-zinc-600 text-xs font-medium">Aucun élève trouvé.</div>
                ) : (
                  classStudents.map((s) => {
                    const currentStatus = records[s.id] || "present";
                    const studentUser = users.find((u) => u.id === s.userId);
                    return (
                      <div key={s.id} className="p-3.5 rounded-xl border border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{s.gender === "Masculin" ? "👦" : "👧"}</span>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-zinc-200">
                              {studentUser?.name || "Élève"}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase font-mono">CODE: {s.id.substring(0, 8)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(s.id, "present")}
                            className={`px-3 py-1 rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors ${
                              currentStatus === "present" ? "bg-emerald-500 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                            }`}
                          >
                            Présent
                          </button>
                          <button
                            onClick={() => handleStatusChange(s.id, "absent")}
                            className={`px-3 py-1 rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors ${
                              currentStatus === "absent" ? "bg-red-500 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleStatusChange(s.id, "late")}
                            className={`px-3 py-1 rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors ${
                              currentStatus === "late" ? "bg-amber-500 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                            }`}
                          >
                            Retard
                          </button>

                          <input
                            type="text"
                            placeholder="Motif..."
                            value={remarks[s.id] || ""}
                            onChange={(e) => handleRemarkChange(s.id, e.target.value)}
                            className="bg-zinc-950 border border-white/5 px-2.5 py-1 rounded-lg text-[10px] text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-white/15 w-24 sm:w-28"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">
                {classStudents.length} élèves inscrits
              </span>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isSaved ? "bg-emerald-500 text-white animate-pulse" : "bg-white text-zinc-950 hover:bg-zinc-200"
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Enregistrement réussi !
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Valider le Registre
                  </>
                )}
              </button>
            </div>
          </div>

          {/* STATS PANEL */}
          <div className="flex flex-col gap-5">
            <div className="p-6 rounded-2xl glass-card border border-white/5">
              <h3 className="font-bold text-sm text-white mb-4 border-b border-white/5 pb-2">Assiduité de la classe</h3>
              <div className="flex justify-between items-center py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Taux de présence</span>
                  <span className="font-extrabold text-2xl text-emerald-400">96.5%</span>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
                Le taux d'assiduité global est supérieur à l'objectif de 95% fixé par le conseil scolaire.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card border border-white/5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-white border-b border-white/5 pb-3 mb-3">Absences critiques</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div className="flex flex-col text-[10px]">
                      <span className="font-bold text-white">Yasmine Mansour</span>
                      <span className="text-zinc-400">Absence non justifiée le 22/05</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => showToast("Génération du rapport d'assiduité en cours...")}
                className="w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 border border-white/5 cursor-pointer mt-4"
              >
                Générer un rapport d'absences
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VUE ELEVE / PARENT : RAPPORT INDIVIDUEL */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-2xl glass-card border border-white/5">
            <h3 className="font-bold text-sm text-white border-b border-white/5 pb-4 mb-4">
              Mon Historique d'Assiduité
            </h3>
            
            <div className="flex flex-col gap-3">
              {myAttendance.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 text-xs">Aucun historique de présence disponible.</div>
              ) : (
                myAttendance.map((record) => (
                  <div key={record.id} className="p-3.5 rounded-xl border border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3.5">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-xs text-zinc-200">{record.date}</span>
                        {record.remarks && <p className="text-[10px] text-zinc-400">Motif : {record.remarks}</p>}
                      </div>
                    </div>

                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      record.status === "present" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      record.status === "absent" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {record.status === "present" ? "Présente" : record.status === "absent" ? "Absente" : "En retard"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-white mb-4">Statistiques Personnelles</h3>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center mb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Présence globale</span>
                  <span className="font-extrabold text-2xl text-emerald-400">98 %</span>
                </div>
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">
                Félicitations pour votre ponctualité exemplaire ! Conservez ce cap jusqu'à la fin de l'année.
              </p>
            </div>
            
            <button
              onClick={() => {
                if (unjustifiedAbsences.length > 0) {
                  setSelectedAbsenceId(unjustifiedAbsences[0].id);
                } else {
                  setSelectedAbsenceId("new");
                }
                setShowJustifyModal(true);
              }}
              className="w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 border border-white/5 cursor-pointer mt-6"
            >
              Justifier une absence
            </button>
          </div>
        </div>
      )}
      {/* Toast Alert Feedback & Modals */}
      <AnimatePresence>
        {showJustifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl glass-card border border-white/10 shadow-2xl p-6 relative text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowJustifyModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <h2 className="text-xl font-extrabold flex items-center gap-2 border-b border-white/5 pb-3">
                <FileText className="w-5.5 h-5.5 text-purple-400" />
                Justifier une Absence
              </h2>

              <form onSubmit={handleJustificationSubmit} className="flex flex-col gap-4 mt-5">
                
                {/* Absence Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sélectionner l'absence</label>
                  <select
                    value={selectedAbsenceId}
                    onChange={(e) => setSelectedAbsenceId(e.target.value)}
                    className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {unjustifiedAbsences.map((abs) => (
                      <option key={abs.id} value={abs.id}>
                        Absence du {abs.date} {abs.remarks ? `(${abs.remarks})` : ""}
                      </option>
                    ))}
                    <option value="new">Déclarer/Justifier une autre date...</option>
                  </select>
                </div>

                {/* Custom Date Picker (conditional) */}
                {selectedAbsenceId === "new" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date de l'absence</label>
                    <input
                      type="date"
                      required
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Motif/Reason Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Motif de la justification</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Veuillez décrire la raison de l'absence (ex: Rendez-vous médical, indisposition...)"
                    value={justificationReason}
                    onChange={(e) => setJustificationReason(e.target.value)}
                    className="bg-zinc-900 border border-white/10 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
                  />
                </div>

                {/* Supporting Document Upload simulation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pièce justificative (Optionnel)</label>
                  
                  {uploadedFileName ? (
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between gap-3 text-xs text-emerald-400">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 shrink-0" />
                        <span className="font-semibold truncate max-w-[200px]">{uploadedFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFileName(null)}
                        className="text-zinc-500 hover:text-zinc-300 font-bold hover:bg-white/5 p-1 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={handleSimulatedUpload}
                      className="p-5 rounded-xl border border-dashed border-white/10 hover:border-white/20 bg-zinc-950/40 hover:bg-zinc-950 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                          <span className="text-[10px] font-semibold text-zinc-500">Chargement du fichier en cours...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-zinc-300">Importer un document (PDF, PNG...)</span>
                            <span className="text-[9px] text-zinc-600 mt-0.5">Certificat médical, justificatif écrit</span>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmettre la justification
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJustifyModal(false)}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Annuler
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-xl bg-purple-600 border border-purple-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
