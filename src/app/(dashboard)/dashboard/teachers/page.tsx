"use client";

import React, { useState } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Plus, Trash2, Mail, Calendar, BookOpen, Clock, X } from "lucide-react";

export default function TeachersManagement() {
  const { teachers, users, addTeacher, deleteTeacher, activeSchoolId } = useSchoolHub();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSubjects, setNewSubjects] = useState<string[]>([]);
  const [newAvail, setNewAvail] = useState<string[]>(["Lundi", "Mardi"]);

  const allSubjects = ["Mathématiques", "Physique", "Sciences", "Langue Arabe", "Français", "Histoire-Géographie", "Anglais"];
  const allDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || newSubjects.length === 0) return;

    addTeacher({
      name: newName,
      email: newEmail,
      subjects: newSubjects,
      availability: newAvail,
    });

    // Reset Form
    setNewName("");
    setNewEmail("");
    setNewSubjects([]);
    setNewAvail(["Lundi", "Mardi"]);
    setShowAddModal(false);
  };

  const toggleSubject = (subj: string) => {
    setNewSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const toggleDay = (day: string) => {
    setNewAvail((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const schoolTeachers = React.useMemo(() => teachers.filter((t) => t.schoolId === activeSchoolId), [teachers, activeSchoolId]);

  const filteredTeachers = schoolTeachers.filter((teacher) => {
    const user = users.find((u) => u.id === teacher.userId);
    return (
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Gestion des Professeurs
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gérez vos équipes pédagogiques, affectez des matières spécifiques, et gérez leurs disponibilités de cours.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Professeur
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 rounded-2xl glass-card border border-white/5">
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un enseignant par nom, email ou matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/5 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40"
          />
        </div>
      </div>

      {/* TEACHERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full text-center py-10 text-zinc-500 font-medium">
            Aucun professeur correspondant à vos critères de recherche.
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const user = users.find((u) => u.id === teacher.userId);
            return (
              <motion.div
                key={teacher.id}
                layout
                className="p-5 rounded-2xl glass-card border border-white/5 hover:border-white/12 transition-all flex flex-col justify-between gap-5 group"
              >
                {/* Header profile info */}
                <div className="flex gap-4">
                  <img
                    src={user?.imageUrl}
                    alt={user?.name}
                    className="w-12 h-12 rounded-full border border-emerald-500/20 object-cover shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-sm text-zinc-100 group-hover:text-white truncate">{user?.name}</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email}
                    </span>
                  </div>
                </div>

                {/* Subjects block */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">MATIÈRES ENSEIGNÉES :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.subjects.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-md text-[9px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availabilities block */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">JOURS DISPONIBLES :</span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.availability.map((day) => (
                      <span key={day} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-medium text-zinc-300">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">Professeur ID: {teacher.id.substring(0, 8)}</span>
                  <button
                    onClick={() => deleteTeacher(teacher.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* OVERLAY AJOUT PROFESSEUR */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl glass-card border border-white/10 shadow-2xl p-6 relative text-white"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold flex items-center gap-2 border-b border-white/5 pb-3">
                <Users className="w-5.5 h-5.5 text-emerald-400" />
                Nouveau Dossier Enseignant
              </h2>

              <form onSubmit={handleAddTeacher} className="flex flex-col gap-4 mt-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">NOM DE L'ENSEIGNANT</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Sofia Belkacem"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">ADRESSE EMAIL</label>
                    <input
                      type="email"
                      required
                      placeholder="ex: sofia.b@mail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Matières Checklist (Tags) */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-400">MATIÈRES ENSEIGNÉES (MINIMUM 1)</label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-950/40 border border-white/5 max-h-[100px] overflow-y-auto">
                    {allSubjects.map((s) => {
                      const active = newSubjects.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSubject(s)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-colors ${
                            active
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/10"
                              : "bg-white/5 text-zinc-400 hover:bg-white/10"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Jours Disponibles Checklist */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-400">JOURS DE DISPONIBILITÉ</label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-950/40 border border-white/5">
                    {allDays.map((day) => {
                      const active = newAvail.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-colors ${
                            active
                              ? "bg-indigo-500 text-white"
                              : "bg-white/5 text-zinc-400 hover:bg-white/10"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-colors"
                  >
                    Valider le Recrutement
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
