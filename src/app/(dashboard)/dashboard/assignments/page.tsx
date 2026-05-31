"use client";

import React, { useState } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Award, Plus, CheckCircle, FileText, Send, Sparkles } from "lucide-react";

export default function AssignmentsPage() {
  const { role, assignments, classes, grades, createAssignment, activeSchoolId, submissions } = useSchoolHub();
  
  // Scoped Multi-Tenant Datasets memoized for rendering stability
  const schoolClasses = React.useMemo(() => classes.filter((c) => c.schoolId === activeSchoolId), [classes, activeSchoolId]);
  const schoolAssignments = React.useMemo(() => assignments.filter((a) => a.schoolId === activeSchoolId), [assignments, activeSchoolId]);

  // State for posting homework
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [points, setPoints] = useState(20);
  const [selectedClass, setSelectedClass] = useState(schoolClasses[0]?.id || "");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset selectedClass when switching schools
  React.useEffect(() => {
    if (schoolClasses.length > 0 && !schoolClasses.some((c) => c.id === selectedClass)) {
      setSelectedClass(schoolClasses[0].id);
    }
  }, [activeSchoolId, schoolClasses]);

  // States for student submitting homework
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handlePostHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    createAssignment({
      classId: selectedClass,
      teacherId: "teacher_1",
      title,
      description: desc,
      dueDate,
      points: Number(points),
    });

    setTitle("");
    setDesc("");
    setDueDate("");
    setShowAddForm(false);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionSuccess(true);
    setSubmissionText("");
    setTimeout(() => {
      setSubmissionSuccess(false);
      setSubmittingAssignmentId(null);
    }, 3000);
  };

  const isTeacher = role === "teacher" || role === "school_admin" || role === "super_admin";

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            Espace Devoirs & Exercices
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isTeacher 
              ? "Créez de nouveaux devoirs, évaluez les rendus et suivez le niveau académique."
              : "Suivez vos devoirs à faire, déposez vos copies numériques et consultez vos notes."}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Créer un Devoir
          </button>
        )}
      </div>

      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 animate-bounce" />
            Le devoir a été créé avec succès et notifié aux élèves de la classe !
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="font-bold text-sm text-zinc-300 border-b border-white/5 pb-3">Devoirs en cours</h3>
          
          {schoolAssignments.length === 0 ? (
            <div className="text-center py-10 text-zinc-600 text-xs font-medium">Aucun devoir en cours.</div>
          ) : (
            schoolAssignments.map((assignment) => {
              const submission = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === "student_alqalam");
              const grade = submission ? grades.find((g) => g.submissionId === submission.id) : undefined;
              const isGraded = !!grade;
              const isPending = !!submission && !grade;
              const assignedClass = schoolClasses.find((c) => c.id === assignment.classId);

              return (
                <div
                  key={assignment.id}
                  className="p-5 rounded-2xl glass-card border border-white/5 bg-white/5 flex flex-col gap-3.5 hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wide">
                        Classe : {assignedClass?.name}
                      </span>
                      <h4 className="font-bold text-sm text-white">{assignment.title}</h4>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        Date d'échéance : {assignment.dueDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-purple-500/15 border border-purple-500/25 text-purple-300 font-bold px-2.5 py-0.5 rounded-lg">
                        Barème : {assignment.points} pts
                      </span>
                      {!isTeacher && (
                        isGraded ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase">
                            Noté : {grade?.score}/{assignment.points}
                          </span>
                        ) : isPending ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase">
                            Déposé (En attente)
                          </span>
                        ) : (
                          <button
                            onClick={() => setSubmittingAssignmentId(assignment.id)}
                            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold uppercase cursor-pointer"
                          >
                            Rendre mon travail
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">{assignment.description}</p>

                  {/* Submission Field for current student */}
                  <AnimatePresence>
                    {submittingAssignmentId === assignment.id && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleStudentSubmit}
                        className="flex flex-col gap-3.5 border-t border-white/5 pt-4 mt-2 overflow-hidden text-white"
                      >
                        <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">VOTRE DEVOIR (TEXTE OU LIEN CLOUD)</h5>
                        <textarea
                          rows={3}
                          required
                          placeholder="Saisissez vos réponses ou le lien vers vos documents de rendu..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          className="bg-zinc-950 border border-white/10 p-3 rounded-xl text-xs focus:outline-none focus:border-purple-500/40 resize-none text-zinc-100 placeholder-zinc-700"
                        />
                        
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-grow flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            {submissionSuccess ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Rendu transmis !
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                Soumettre ma Copie
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmittingAssignmentId(null)}
                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {isGraded && grade?.feedback && (
                    <div className="p-3.5 rounded-xl bg-zinc-950/40 border-l-2 border-emerald-500 text-[10px] text-zinc-300 leading-relaxed font-normal">
                      <span className="font-bold text-emerald-400 block mb-0.5 uppercase tracking-wide">Retour de correction :</span>
                      "{grade.feedback}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SIDEBAR CREATION FORM OR ADVICE */}
        <div className="flex flex-col gap-5">
          {showAddForm ? (
            <div className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col gap-4 text-white">
              <h3 className="font-bold text-sm text-white border-b border-white/5 pb-3">Nouveau devoir</h3>
              
              <form onSubmit={handlePostHomework} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">CLASSE CIBLE</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {schoolClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">TITRE DU DEVOIR</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Dissertation de Français"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">CONSIGNES</label>
                  <textarea
                    rows={4}
                    placeholder="Saisissez les exercices, consignes ou chapitres de révision..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">ECHEANCE</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">BARÈME</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={100}
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="submit"
                    className="flex-grow py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 cursor-pointer transition-colors"
                  >
                    Publier Devoir
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 rounded-2xl glass-card border border-white/5">
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Dépôt Numérique SchoolHub
              </h3>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-normal">
                Les élèves disposent d'un portail intuitif pour soumettre leurs devoirs par écrit ou en joignant des pièces jointes. L'ensemble des copies est ensuite centralisé pour correction.
              </p>
              
              <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 mt-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400" />
                <div className="flex flex-col text-[10px]">
                  <span className="font-bold text-white">Correction intuitive</span>
                  <span className="text-zinc-500">Intégration de feedbacks textuels immédiats.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
