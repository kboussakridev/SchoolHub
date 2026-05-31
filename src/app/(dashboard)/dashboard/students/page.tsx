"use client";

import React, { useState } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, Plus, Trash2, SlidersHorizontal, Calendar, Mail, MapPin, X } from "lucide-react";

export default function StudentsManagement() {
  const { students, users, classes, addStudent, deleteStudent, activeSchoolId } = useSchoolHub();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentLevel, setNewStudentLevel] = useState("Classique");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [newStudentGender, setNewStudentGender] = useState("Féminin");
  const [newStudentBirth, setNewStudentBirth] = useState("");
  const [newStudentAddress, setNewStudentAddress] = useState("");

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;

    addStudent({
      name: newStudentName,
      email: newStudentEmail,
      level: newStudentLevel,
      classId: newStudentClass,
      gender: newStudentGender,
      dateOfBirth: newStudentBirth || "2015-01-01",
      address: newStudentAddress,
      documents: [],
    });

    // Reset Form
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentClass("");
    setNewStudentAddress("");
    setNewStudentBirth("");
    setShowAddModal(false);
  };

  // Scoped Multi-Tenant Datasets wrapped in React.useMemo for stable references
  const schoolClasses = React.useMemo(() => classes.filter((c) => c.schoolId === activeSchoolId), [classes, activeSchoolId]);
  const schoolStudents = React.useMemo(() => students.filter((s) => s.schoolId === activeSchoolId), [students, activeSchoolId]);

  // Filter logic
  const filteredStudents = schoolStudents.filter((student) => {
    const user = users.find((u) => u.id === student.userId);
    const matchesSearch = user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || student.level === selectedLevel;
    const matchesClass = selectedClass === "all" || student.classId === selectedClass;
    return matchesSearch && matchesLevel && matchesClass;
  });

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-400" />
            Gestion des Élèves
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Recherchez des élèves, gérez leurs dossiers, visualisez leurs classes, et inscrivez de nouveaux profils.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Inscrire un Élève
        </button>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/5 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/40"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            Filtres :
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-zinc-900 border border-white/5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous Niveaux</option>
            <option value="Classique">Classique</option>
            <option value="Coranique">Coranique/Arabe</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-zinc-900 border border-white/5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes Classes</option>
            {schoolClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="rounded-2xl glass-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="py-4 px-5">Élève</th>
                <th className="py-4 px-5">Filière / Niveau</th>
                <th className="py-4 px-5">Classe assignée</th>
                <th className="py-4 px-5">Date Naissance</th>
                <th className="py-4 px-5">Adresse</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500 font-medium">
                    Aucun élève trouvé avec les filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const user = users.find((u) => u.id === student.userId);
                  const assignedClass = classes.find((c) => c.id === student.classId);
                  
                  return (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium">
                      <td className="py-4 px-5 flex items-center gap-3">
                        <img
                          src={user?.imageUrl}
                          alt={user?.name}
                          className="w-8 h-8 rounded-full border border-purple-500/20 object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-200">{user?.name}</span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user?.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.level === "Classique" ? "bg-purple-500/10 text-purple-400 border border-purple-500/15" : 
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}>
                          {student.level === "Classique" ? "Classique" : "Coranique"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-zinc-300">
                        {assignedClass ? assignedClass.name : "Non assigné"}
                      </td>
                      <td className="py-4 px-5 text-zinc-400 font-mono">
                        {student.dateOfBirth}
                      </td>
                      <td className="py-4 px-5 text-zinc-400 truncate max-w-[150px]">
                        {student.address}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSCRIRE UN ELEVE OVERLAY MODAL */}
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
                <GraduationCap className="w-5.5 h-5.5 text-purple-400" />
                Nouveau Dossier Élève
              </h2>

              <form onSubmit={handleAddStudent} className="flex flex-col gap-4 mt-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">NOM DE L'ÉLÈVE</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Lucas Dubois"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">ADRESSE EMAIL</label>
                    <input
                      type="email"
                      required
                      placeholder="ex: lucas.dubois@mail.com"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">FILIÈRE / NIVEAU</label>
                    <select
                      value={newStudentLevel}
                      onChange={(e) => setNewStudentLevel(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Classique">Classique</option>
                      <option value="Coranique">Coranique / Arabe</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">CLASSE ASSIGNÉE</label>
                    <select
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">Sélectionner...</option>
                      {schoolClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">GENRE</label>
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Féminin">Féminin</option>
                      <option value="Masculin">Masculin</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">DATE DE NAISSANCE</label>
                    <input
                      type="date"
                      value={newStudentBirth}
                      onChange={(e) => setNewStudentBirth(e.target.value)}
                      className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">ADRESSE POSTALE</label>
                  <input
                    type="text"
                    placeholder="ex: 12 Rue de la République, Paris"
                    value={newStudentAddress}
                    onChange={(e) => setNewStudentAddress(e.target.value)}
                    className="bg-zinc-900 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer transition-colors"
                  >
                    Valider l'Inscription
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
