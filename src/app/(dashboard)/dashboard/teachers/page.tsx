"use client";

import React, { useState } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Plus, Trash2, Mail, Calendar, BookOpen, Clock, X, Camera } from "lucide-react";

export default function TeachersManagement() {
  const { teachers, users, addTeacher, deleteTeacher, updateTeacher, activeSchoolId, classes } = useSchoolHub();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSubjects, setNewSubjects] = useState<string[]>([]);
  const [newAvail, setNewAvail] = useState<string[]>(["Lundi", "Mardi"]);

  // Custom Subject dynamic states
  const [customSubject, setCustomSubject] = useState("");
  const [customSubjectsList, setCustomSubjectsList] = useState<string[]>([]);

  // Advanced collapsible states
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newContractType, setNewContractType] = useState<"titulaire" | "vacataire" | "contractuel">("titulaire");
  const [newHourlyRate, setNewHourlyRate] = useState<number | "">("");
  const [newAssignedClassIds, setNewAssignedClassIds] = useState<string[]>([]);
  
  // Custom Photo States
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const allSubjects = ["Mathématiques", "Physique", "Sciences", "Langue Arabe", "Français", "Histoire-Géographie", "Anglais"];
  const allDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  // Gorgeous preselected illustrated avatars (Self-contained SVG data strings for offline speed & absolute reliability)
  const headshots = [
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238b5cf6'/><circle cx='50' cy='42' r='18' fill='%23fbcfe8'/><path d='M30,75 Q50,55 70,75 Z' fill='%23f1f5f9'/><circle cx='44' cy='40' r='2' fill='%231e293b'/><circle cx='56' cy='40' r='2' fill='%231e293b'/><path d='M47,48 Q50,52 53,48' stroke='%23ec4899' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M32,32 C38,15 62,15 68,32 Z' fill='%234c1d95'/></svg>",
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%233b82f6'/><circle cx='50' cy='42' r='18' fill='%23ffedd5'/><path d='M30,75 Q50,55 70,75 Z' fill='%23cbd5e1'/><circle cx='44' cy='40' r='2' fill='%231e293b'/><circle cx='56' cy='40' r='2' fill='%231e293b'/><path d='M47,48 Q50,51 53,48' stroke='%231e293b' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M35,32 C35,22 65,22 65,32 Z' fill='%231e3a8a'/></svg>",
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23ec4899'/><circle cx='50' cy='42' r='18' fill='%23ffe4e6'/><path d='M30,75 Q50,55 70,75 Z' fill='%23f8fafc'/><circle cx='44' cy='40' r='2' fill='%231e293b'/><circle cx='56' cy='40' r='2' fill='%231e293b'/><path d='M46,48 Q50,53 54,48' stroke='%23be185d' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M30,36 C35,10 65,10 70,36 Z' fill='%23db2777'/></svg>",
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23f97316'/><circle cx='50' cy='42' r='18' fill='%23fed7aa'/><path d='M30,75 Q50,55 70,75 Z' fill='%23e2e8f0'/><circle cx='44' cy='40' r='2' fill='%231e293b'/><circle cx='56' cy='40' r='2' fill='%231e293b'/><path d='M47,48 Q50,51 53,48' stroke='%23ea580c' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M38,25 L62,25 L50,15 Z' fill='%237c2d12'/></svg>",
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%2310b981'/><circle cx='50' cy='42' r='18' fill='%23d1fae5'/><path d='M30,75 Q50,55 70,75 Z' fill='%23f8fafc'/><circle cx='44' cy='40' r='2' fill='%231e293b'/><circle cx='56' cy='40' r='2' fill='%231e293b'/><path d='M46,48 Q50,53 54,48' stroke='%23047857' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M32,32 Q50,8 68,32 Z' fill='%23064e3b'/></svg>",
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%2314b8a6'/><circle cx='50' cy='42' r='18' fill='%23ccfbf1'/><path d='M30,75 Q50,55 70,75 Z' fill='%23f1f5f9'/><circle cx='44' cy='40' r='2' fill='%231e293b'/><circle cx='56' cy='40' r='2' fill='%231e293b'/><path d='M47,48 Q50,51 53,48' stroke='%230f766e' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M36,25 L64,25 L64,30 L36,30 Z' fill='%23115e59'/></svg>",
  ];


  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 2.5MB maximum file size limit
    if (file.size > 2.5 * 1024 * 1024) {
      alert("L'image est trop volumineuse. Veuillez choisir un fichier de moins de 2.5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setNewImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = (teacher: any) => {
    const user = users.find((u) => u.id === teacher.userId);
    setEditingTeacherId(teacher.id);
    setNewName(user?.name || "");
    setNewEmail(user?.email || "");
    setNewSubjects(teacher.subjects);
    setNewAvail(teacher.availability);
    setNewPhone(teacher.phone || "");
    setNewBio(teacher.bio || "");
    setNewContractType(teacher.contractType || "titulaire");
    setNewHourlyRate(teacher.hourlyRate !== undefined ? teacher.hourlyRate : "");
    setNewAssignedClassIds(teacher.assignedClassIds || []);
    setNewImageUrl(user?.imageUrl || "");

    const customList = teacher.subjects.filter((subj: string) => !allSubjects.includes(subj));
    setCustomSubjectsList(customList);

    setShowMoreOptions(true);
    setShowAddModal(true);
  };

  const handleAddCustomSubject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!customSubject.trim()) return;
    const cleanSubj = customSubject.trim();
    
    // Add to list of dynamic subjects if not present
    if (!customSubjectsList.includes(cleanSubj) && !allSubjects.includes(cleanSubj)) {
      setCustomSubjectsList((prev) => [...prev, cleanSubj]);
    }
    
    // Auto-select this subject
    if (!newSubjects.includes(cleanSubj)) {
      setNewSubjects((prev) => [...prev, cleanSubj]);
    }
    
    setCustomSubject("");
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    // Enforce minimum 1 subject
    if (newSubjects.length === 0) {
      alert("Erreur: Vous devez sélectionner ou saisir au moins une matière enseignée (Minimum 1).");
      return;
    }

    if (editingTeacherId) {
      updateTeacher(editingTeacherId, {
        name: newName,
        email: newEmail,
        subjects: newSubjects,
        availability: newAvail,
        phone: newPhone || undefined,
        bio: newBio || undefined,
        contractType: newContractType,
        hourlyRate: newHourlyRate !== "" ? Number(newHourlyRate) : undefined,
        assignedClassIds: newAssignedClassIds.length > 0 ? newAssignedClassIds : undefined,
        imageUrl: newImageUrl || undefined,
      });
    } else {
      addTeacher({
        name: newName,
        email: newEmail,
        subjects: newSubjects,
        availability: newAvail,
        phone: newPhone || undefined,
        bio: newBio || undefined,
        contractType: newContractType,
        hourlyRate: newHourlyRate !== "" ? Number(newHourlyRate) : undefined,
        assignedClassIds: newAssignedClassIds.length > 0 ? newAssignedClassIds : undefined,
        imageUrl: newImageUrl || undefined,
      });
    }

    // Reset Form
    setNewName("");
    setNewEmail("");
    setNewSubjects([]);
    setNewAvail(["Lundi", "Mardi"]);
    setNewPhone("");
    setNewBio("");
    setNewContractType("titulaire");
    setNewHourlyRate("");
    setNewAssignedClassIds([]);
    setCustomSubjectsList([]);
    setNewImageUrl("");
    setEditingTeacherId(null);
    setShowAddModal(false);
    setShowMoreOptions(false);
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
          onClick={() => {
            setEditingTeacherId(null);
            setNewName("");
            setNewEmail("");
            setNewSubjects([]);
            setNewAvail(["Lundi", "Mardi"]);
            setNewPhone("");
            setNewBio("");
            setNewContractType("titulaire");
            setNewHourlyRate("");
            setNewAssignedClassIds([]);
            setCustomSubjectsList([]);
            setNewImageUrl("");
            setShowMoreOptions(false);
            setShowAddModal(true);
          }}
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
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-4 min-w-0">
                    <img
                      src={user?.imageUrl}
                      alt={user?.name}
                      className="w-12 h-12 rounded-full border border-emerald-500/20 object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm text-zinc-100 group-hover:text-white truncate">{user?.name}</span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        {user?.email}
                      </span>
                      {teacher.phone && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                          <span className="text-zinc-500">📞</span> {teacher.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contract Badge and Rate */}
                  {(teacher.contractType || teacher.hourlyRate) && (
                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      {teacher.contractType && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[8px] font-black uppercase tracking-wider">
                          {teacher.contractType}
                        </span>
                      )}
                      {teacher.hourlyRate && (
                        <span className="text-[10px] font-bold text-zinc-400">
                          {teacher.hourlyRate} €/h
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio text if present */}
                {teacher.bio && (
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed bg-zinc-950/30 p-2.5 rounded-xl border-l-2 border-emerald-500/40">
                    "{teacher.bio}"
                  </p>
                )}

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

                {/* Class assignments if present */}
                {((teacher.assignedClassIds && teacher.assignedClassIds.length > 0) || classes.some(c => c.teacherId === teacher.id)) && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">AFFECTATION CLASSES :</span>
                    <div className="flex flex-wrap gap-1">
                      {/* Main Class teacher */}
                      {classes.filter(c => c.teacherId === teacher.id).map(c => (
                        <span key={c.id} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/15 rounded text-[8px] font-extrabold uppercase">
                          👑 Titulaire {c.name}
                        </span>
                      ))}
                      {/* Sub assigned classes */}
                      {teacher.assignedClassIds?.map(clsId => {
                        const cls = classes.find(c => c.id === clsId);
                        if (!cls || cls.teacherId === teacher.id) return null; // skip if already main teacher
                        return (
                          <span key={clsId} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[8px] font-medium text-zinc-300">
                            {cls.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(teacher)}
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                      title="Modifier la fiche"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTeacher(teacher.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer la fiche"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
              className="w-full max-w-lg rounded-2xl glass-card border border-white/10 shadow-2xl p-6 relative text-white max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-extrabold flex items-center gap-2 border-b border-white/5 pb-3 shrink-0">
                <Users className="w-5.5 h-5.5 text-emerald-400" />
                {editingTeacherId ? "Modifier la Fiche Enseignant" : "Nouveau Dossier Enseignant"}
              </h2>

              <form onSubmit={handleAddTeacher} className="flex flex-col gap-4 mt-5 flex-1 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10">
                {/* Visual Avatar Selection & Upload Mock */}
                <div className="flex flex-col gap-3 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 tracking-wider">
                      PHOTO DE PROFIL DE L'ENSEIGNANT
                    </label>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                      Fichier local ou Avatar
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4 w-full">
                    {/* Avatar Preview */}
                    <div className="relative group shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10 group-hover:border-emerald-400 transition-all bg-zinc-900 flex items-center justify-center">
                        <img
                          src={newImageUrl || headshots[0]}
                          alt="Aperçu Photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label 
                        htmlFor="teacher-photo-upload" 
                        className="absolute -bottom-1 -right-1 bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-full border border-zinc-950 cursor-pointer shadow transition-all hover:scale-110 flex items-center justify-center"
                        title="Télécharger une photo"
                      >
                        <Camera className="w-3 h-3" />
                      </label>
                      <input
                        type="file"
                        id="teacher-photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Selector inputs */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Real local upload button trigger */}
                      <div className="flex gap-2">
                        <label
                          htmlFor="teacher-photo-upload"
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 py-1.5 px-3 rounded-xl text-[10px] font-bold cursor-pointer transition-all"
                        >
                          📤 Importer ma propre photo
                        </label>
                        {newImageUrl && (
                          <button
                            type="button"
                            onClick={() => setNewImageUrl("")}
                            className="px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-[10px] font-bold transition-colors"
                            title="Supprimer la photo"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      {/* Illustrated quick select avatars */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">AVATARS ILLUSTRÉS RAPIDES :</span>
                        <div className="flex gap-1.5">
                          {headshots.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setNewImageUrl(url)}
                              className={`w-7 h-7 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 shrink-0 bg-zinc-900 ${
                                newImageUrl === url ? "border-emerald-400 scale-105 shadow-md shadow-emerald-400/25" : "border-white/10"
                              }`}
                            >
                              <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Manual Image URL field */}
                      <input
                        type="text"
                        placeholder="Ou coller un lien web (URL image)..."
                        value={newImageUrl.startsWith("data:") ? "" : newImageUrl} // don't show huge base64 in text field
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-xl text-[9px] text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>

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

                {/* Matières Checklist & Custom Input */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-zinc-400 tracking-wider flex items-center justify-between">
                    <span>MATIÈRES ENSEIGNÉES (MINIMUM 1)</span>
                    {newSubjects.length > 0 ? (
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/15">
                        {newSubjects.length} Sélectionnée(s)
                      </span>
                    ) : (
                      <span className="text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-extrabold border border-rose-500/15 animate-pulse">
                        ⚠️ 1 requis au minimum
                      </span>
                    )}
                  </label>
                  
                  {/* Dynamic Typeable Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Écrire une matière personnalisée (ex: Espagnol, IA...)"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          // Simulating mouse event structure for handleAddCustomSubject
                          handleAddCustomSubject(e as any);
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-white/10 px-3 py-2 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSubject}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                      + Ajouter
                    </button>
                  </div>

                  {/* Standard Quick Select List + Added Custom ones */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider">MATIÈRES DISPONIBLES :</span>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-950/40 border border-white/5 max-h-[100px] overflow-y-auto">
                      {/* Built-in Subjects */}
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
                      {/* Added Custom Subjects */}
                      {customSubjectsList.map((s) => {
                        const active = newSubjects.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSubject(s)}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-colors ${
                              active
                                ? "bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-400/10"
                                : "bg-white/5 text-emerald-400/70 border border-emerald-500/10 hover:bg-white/10"
                            }`}
                          >
                            ✨ {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Curated selection display with quick remove */}
                  {newSubjects.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">LISTE DES SÉLECTIONS :</span>
                      <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                        {newSubjects.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-extrabold"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => toggleSubject(s)}
                              className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Jours Disponibles Checklist */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-zinc-400 tracking-wider">JOURS DE DISPONIBILITÉ</label>
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

                {/* Collapsible Recruitment Segment (Plus d'options) */}
                <div className="border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="w-full flex items-center justify-between py-2 text-zinc-400 hover:text-white transition-all text-xs font-extrabold text-left cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-zinc-500 group-hover:text-emerald-400 transition-colors">⚙️</span>
                      <span>Plus d'options de recrutement</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 font-bold group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors uppercase">
                        Optionnel
                      </span>
                    </span>
                    <span className={`text-[10px] text-zinc-500 group-hover:text-white transition-transform duration-300 ${showMoreOptions ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {showMoreOptions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden flex flex-col gap-4 mt-3"
                      >
                        {/* Phone & Contract Type */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-400">NUMÉRO DE TÉLÉPHONE</label>
                            <input
                              type="text"
                              placeholder="ex: +33 6 12 34 56 78"
                              value={newPhone}
                              onChange={(e) => setNewPhone(e.target.value)}
                              className="bg-zinc-950 border border-white/10 px-3 py-2 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-400">TYPE DE CONTRAT</label>
                            <select
                              value={newContractType}
                              onChange={(e) => setNewContractType(e.target.value as any)}
                              className="bg-zinc-950 border border-white/10 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                            >
                              <option value="titulaire" className="bg-zinc-950 text-white">Titulaire (Interne)</option>
                              <option value="vacataire" className="bg-zinc-950 text-white">Vacataire (Externe)</option>
                              <option value="contractuel" className="bg-zinc-950 text-white">Contractuel</option>
                            </select>
                          </div>
                        </div>

                        {/* Hourly Rate & Biography */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-400">TARIF HORAIRE (€/H)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="ex: 45"
                              value={newHourlyRate}
                              onChange={(e) => setNewHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                              className="bg-zinc-950 border border-white/10 px-3 py-2 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-zinc-400">BIOGRAPHIE & COMMENTAIRE</label>
                            <textarea
                              rows={1}
                              placeholder="ex: Diplômée de la Sorbonne..."
                              value={newBio}
                              onChange={(e) => setNewBio(e.target.value)}
                              className="bg-zinc-950 border border-white/10 px-3 py-2 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 resize-none h-[38px] leading-tight"
                            />
                          </div>
                        </div>

                        {/* Class assignments */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-zinc-400 tracking-wider">AFFECTATION DE CLASSES</label>
                          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-950/40 border border-white/5 max-h-[100px] overflow-y-auto">
                            {classes.filter(c => c.schoolId === activeSchoolId).length === 0 ? (
                              <span className="text-[10px] text-zinc-500 italic">Aucune classe disponible dans cet établissement.</span>
                            ) : (
                              classes
                                .filter((c) => c.schoolId === activeSchoolId)
                                .map((c) => {
                                  const isAssigned = newAssignedClassIds.includes(c.id);
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        setNewAssignedClassIds((prev) =>
                                          prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                                        );
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold cursor-pointer transition-colors ${
                                        isAssigned
                                          ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                                      }`}
                                    >
                                      {c.name}
                                    </button>
                                  );
                                })
                            )}
                          </div>
                          <span className="text-[8px] text-zinc-500 font-medium">Affectez directement l'enseignant à ses classes respectives dès son recrutement.</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit / Action buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                  >
                    {editingTeacherId ? "Enregistrer les modifications" : "Valider le Recrutement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowMoreOptions(false);
                    }}
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
