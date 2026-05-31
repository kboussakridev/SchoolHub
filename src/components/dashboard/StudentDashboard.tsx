"use client";

import React, { useState } from "react";
import { useSchoolHub } from "../providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calendar, Clock, CreditCard, Sparkles, CheckCircle, ArrowRight, Award } from "lucide-react";

export default function StudentDashboard() {
  const { classes, students, assignments, grades, payments, payInvoice, submissions } = useSchoolHub();
  const currentStudent = students.find((s) => s.userId === "user_student_alqalam");
  const classData = classes.find((c) => c.id === currentStudent?.classId);
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localSubmissions, setLocalSubmissions] = useState<string[]>([]); // To simulate live submissions

  const handlePay = (paymentId: string) => {
    payInvoice(paymentId);
    setSuccessPaymentId(paymentId);
    setTimeout(() => setSuccessPaymentId(null), 4000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col gap-8 font-sans w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
            Mon Espace Élève <span className="gradient-text">Yasmine Mansour</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Classe : <span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{classData?.name || "6ème Alpha"}</span> • Suivez vos notes, devoirs, et réglez vos frais scolaires.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Élève Assidu • 98% Présence
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        
        {/* ASSIGNMENTS & HOMEWORK LIST (2 COLS) */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
              <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              Mes Devoirs & Evaluations
            </h3>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              {assignments.length} Assignés
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {assignments.map((assignment) => {
              const hasSubmittedLocally = localSubmissions.includes(assignment.id);
              const submission = submissions.find((s) => s.assignmentId === assignment.id && s.studentId === currentStudent?.id);
              const grade = submission ? grades.find((g) => g.submissionId === submission.id) : undefined;
              const isGraded = !!grade;
              const isPending = !!submission || hasSubmittedLocally;

              return (
                <div
                  key={assignment.id}
                  className="p-4 rounded-xl flex flex-col gap-3.5 transition-all"
                  style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--secondary))" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs" style={{ color: "hsl(var(--foreground))" }}>{assignment.title}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>A rendre le {assignment.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isGraded ? (
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase">
                          <Award className="w-3.5 h-3.5" />
                          Note : {grade?.score} / {assignment.points}
                        </div>
                      ) : isPending ? (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">
                          Rendu (Attente Correction)
                        </span>
                      ) : (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase animate-pulse">
                          A faire
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] leading-relaxed font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {assignment.description}
                  </p>

                  {/* Teacher Feedback block */}
                  {isGraded && grade?.feedback && (
                    <div className="p-3 rounded-lg border-l-2 border-emerald-500 text-[10px] font-normal" style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--card-foreground))" }}>
                      <span className="font-bold text-emerald-400 block mb-0.5">COMMENTAIRE DE LA MAÎTRESSE :</span>
                      "{grade.feedback}"
                    </div>
                  )}

                  {!isGraded && !isPending && (
                    <button
                      onClick={() => {
                        setLocalSubmissions((prev) => [...prev, assignment.id]);
                        showToast(`Votre devoir "${assignment.title}" a bien été transmis et envoyé à votre enseignante !`);
                      }}
                      className="self-end flex items-center gap-1 text-[10px] font-extrabold hover:opacity-80 transition-opacity cursor-pointer group mt-1"
                      style={{ color: "hsl(var(--accent))" }}
                    >
                      Envoyer ma copie
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PAYMENTS & SCOLARITE WIDGET (1 COL) */}
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between" style={{ border: "1px solid hsl(var(--border))" }}>
          <div>
            <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h3 className="font-bold text-base flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
                <CreditCard className="w-5 h-5 text-amber-400" />
                Frais Scolaires
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {successPaymentId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 mb-2"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                    Règlement effectué avec succès !
                  </motion.div>
                )}
              </AnimatePresence>

              {payments.map((p) => {
                const isPaid = p.status === "paid";
                const isOverdue = p.status === "overdue";

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl flex flex-col gap-3 transition-colors"
                    style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--secondary))" }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs block truncate w-32" style={{ color: "hsl(var(--foreground))" }}>{p.description}</span>
                        <span className="text-[9px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>Échéance: {p.dueDate}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isOverdue
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {isPaid ? "Payé" : isOverdue ? "En retard" : "En attente"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-1.5" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <span className="font-extrabold text-base" style={{ color: "hsl(var(--foreground))" }}>{p.amount} €</span>
                      {!isPaid && (
                        <button
                          onClick={() => handlePay(p.id)}
                          className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold shadow-lg cursor-pointer transition-all"
                          style={{
                            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
                            color: "hsl(var(--primary-foreground))",
                            boxShadow: "0 4px 12px hsl(var(--primary) / 0.25)",
                          }}
                        >
                          Régler
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <span className="text-[9px] text-zinc-500 font-medium text-center block mt-6">
            Paiements cryptés 3D-Secure de démonstration
          </span>
        </div>
      </div>

      {/* SCHEDULE */}
      <div className="p-6 rounded-2xl glass-card" style={{ border: "1px solid hsl(var(--border))" }}>
        <h3 className="font-bold text-sm flex items-center gap-2 mb-5" style={{ color: "hsl(var(--foreground))" }}>
          <Clock className="w-4.5 h-4.5" style={{ color: "hsl(var(--primary))" }} />
          Emploi du Temps Hebdomadaire (6ème Alpha)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classData?.schedule.map((slot: any, index: number) => (
            <div key={index} className="flex gap-4 p-4 rounded-xl transition-colors" style={{ border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--secondary))" }}>
              <div className="p-3 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5 justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--accent))" }}>{slot.day}</span>
                <span className="font-extrabold text-xs" style={{ color: "hsl(var(--foreground))" }}>{slot.subject}</span>
                <span className="text-[10px] flex items-center gap-1 font-medium mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Clock className="w-3 h-3 text-zinc-500" />
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
            </div>
          ))}
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
