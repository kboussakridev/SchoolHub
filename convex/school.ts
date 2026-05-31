import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==========================================
// 1. MUTATION DE SEED (DONNÉES FICTIVES)
// ==========================================
export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Nettoyer les anciennes données pour éviter les doublons de démonstration
    const allUsers = await ctx.db.query("users").collect();
    for (const u of allUsers) await ctx.db.delete(u._id);

    const allStudents = await ctx.db.query("students").collect();
    for (const s of allStudents) await ctx.db.delete(s._id);

    const allTeachers = await ctx.db.query("teachers").collect();
    for (const t of allTeachers) await ctx.db.delete(t._id);

    const allParents = await ctx.db.query("parents").collect();
    for (const p of allParents) await ctx.db.delete(p._id);

    const allClasses = await ctx.db.query("classes").collect();
    for (const c of allClasses) await ctx.db.delete(c._id);

    const allAttendance = await ctx.db.query("attendance").collect();
    for (const a of allAttendance) await ctx.db.delete(a._id);

    const allAssignments = await ctx.db.query("assignments").collect();
    for (const a of allAssignments) await ctx.db.delete(a._id);

    const allGrades = await ctx.db.query("grades").collect();
    for (const g of allGrades) await ctx.db.delete(g._id);

    const allMessages = await ctx.db.query("messages").collect();
    for (const m of allMessages) await ctx.db.delete(m._id);

    const allPayments = await ctx.db.query("payments").collect();
    for (const p of allPayments) await ctx.db.delete(p._id);

    const allEvents = await ctx.db.query("events").collect();
    for (const e of allEvents) await ctx.db.delete(e._id);

    const allNotifications = await ctx.db.query("notifications").collect();
    for (const n of allNotifications) await ctx.db.delete(n._id);

    // 2. Création des Utilisateurs de base (Clerk ID simulés pour démo)
    const adminId = await ctx.db.insert("users", {
      clerkId: "mock_admin_clerk_id",
      email: "boussakri.karim@gmail.com",
      name: "Karim Boussakri",
      role: "admin",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      createdAt: Date.now(),
    });

    const teacherId1 = await ctx.db.insert("users", {
      clerkId: "mock_teacher_clerk_id_1",
      email: "sofia.belkacem@schoolhub.com",
      name: "Pr. Sofia Belkacem",
      role: "teacher",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      createdAt: Date.now(),
    });

    const teacherId2 = await ctx.db.insert("users", {
      clerkId: "mock_teacher_clerk_id_2",
      email: "marc.dubois@schoolhub.com",
      name: "Pr. Marc Dubois",
      role: "teacher",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      createdAt: Date.now(),
    });

    const parentId1 = await ctx.db.insert("users", {
      clerkId: "mock_parent_clerk_id_1",
      email: "parent.khalid@schoolhub.com",
      name: "Khalid Mansour",
      role: "parent",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
      createdAt: Date.now(),
    });

    const studentIdUser1 = await ctx.db.insert("users", {
      clerkId: "mock_student_clerk_id_1",
      email: "yasmine.mansour@schoolhub.com",
      name: "Yasmine Mansour",
      role: "student",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
      createdAt: Date.now(),
    });

    const studentIdUser2 = await ctx.db.insert("users", {
      clerkId: "mock_student_clerk_id_2",
      email: "lucas.dubois@schoolhub.com",
      name: "Lucas Dubois",
      role: "student",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
      createdAt: Date.now(),
    });

    // 3. Liaison Tables Spécifiques
    const teacherRef1 = await ctx.db.insert("teachers", {
      userId: teacherId1,
      subjects: ["Mathématiques", "Sciences", "Langue Arabe"],
      availability: ["Lundi", "Mardi", "Jeudi", "Vendredi"],
    });

    const teacherRef2 = await ctx.db.insert("teachers", {
      userId: teacherId2,
      subjects: ["Histoire-Géographie", "Français"],
      availability: ["Lundi", "Mardi", "Mercredi", "Vendredi"],
    });

    const parentRef1 = await ctx.db.insert("parents", {
      userId: parentId1,
      phone: "+33 6 12 34 56 78",
      studentIds: [], // Rempli après création élève
    });

    // 4. Création des Classes
    const classId1 = await ctx.db.insert("classes", {
      name: "6ème Alpha - Classique",
      level: "Classique",
      teacherId: teacherRef1,
      schedule: [
        { day: "Lundi", subject: "Mathématiques", startTime: "08:30", endTime: "10:30", teacherId: teacherRef1 },
        { day: "Lundi", subject: "Français", startTime: "10:45", endTime: "12:15", teacherId: teacherRef2 },
        { day: "Mardi", subject: "Langue Arabe", startTime: "14:00", endTime: "16:00", teacherId: teacherRef1 },
      ],
    });

    const classId2 = await ctx.db.insert("classes", {
      name: "Classe Al-Qalam - Coranique",
      level: "Coranique",
      teacherId: teacherRef1,
      schedule: [
        { day: "Mercredi", subject: "Mémorisation", startTime: "09:00", endTime: "12:00", teacherId: teacherRef1 },
        { day: "Vendredi", subject: "Tafsir", startTime: "14:00", endTime: "16:00", teacherId: teacherRef1 },
      ],
    });

    // 5. Création des Élèves
    const studentRef1 = await ctx.db.insert("students", {
      userId: studentIdUser1,
      classId: classId1,
      parentId: parentRef1,
      level: "Classique",
      dateOfBirth: "2014-06-15",
      gender: "Féminin",
      address: "12 Rue de la Paix, Paris",
      documents: [{ name: "Certificat Médical", url: "#" }],
    });

    const studentRef2 = await ctx.db.insert("students", {
      userId: studentIdUser2,
      classId: classId2,
      parentId: undefined,
      level: "Coranique",
      dateOfBirth: "2013-11-20",
      gender: "Masculin",
      address: "45 Avenue des Champs, Paris",
      documents: [],
    });

    // Mettre à jour la liaison du parent
    await ctx.db.patch(parentRef1, {
      studentIds: [studentRef1],
    });

    // 6. Création de Présences
    await ctx.db.insert("attendance", {
      studentId: studentRef1,
      classId: classId1,
      date: "2026-05-22",
      status: "present",
      recordedBy: teacherRef1,
    });

    await ctx.db.insert("attendance", {
      studentId: studentRef2,
      classId: classId2,
      date: "2026-05-22",
      status: "late",
      remarks: "Retard de 10 min (problème de bus)",
      recordedBy: teacherRef1,
    });

    // 7. Création de Devoirs
    const assignmentId1 = await ctx.db.insert("assignments", {
      classId: classId1,
      teacherId: teacherRef1,
      title: "Exercices d'Algèbre Chapitre 3",
      description: "Résoudre les exercices 4, 5 et 9 à la page 42 du livre de maths. Rendre la copie propre.",
      dueDate: "2026-05-29",
      attachments: [{ name: "Enoncé-Ex42.pdf", url: "#" }],
      points: 20,
    });

    const assignmentId2 = await ctx.db.insert("assignments", {
      classId: classId2,
      teacherId: teacherRef1,
      title: "Mémorisation Sourate Al-Mulk",
      description: "Réviser et mémoriser les versets 1 à 15 de la sourate pour récitation collective.",
      dueDate: "2026-05-27",
      attachments: [],
      points: 10,
    });

    // 8. Rendu et notes
    await ctx.db.insert("grades", {
      assignmentId: assignmentId1,
      studentId: studentRef1,
      submissionText: "Voici mes réponses pour l'algèbre. J'ai un peu bloqué sur le numéro 9.",
      submissionAttachments: [],
      submittedAt: Date.now() - 86400000,
      score: 17,
      feedback: "Excellent travail d'ensemble. Pour l'exercice 9, revois la factorisation.",
      status: "graded",
    });

    await ctx.db.insert("grades", {
      assignmentId: assignmentId2,
      studentId: studentRef2,
      status: "pending",
      submissionText: "Je suis prêt pour la récitation de mercredi !",
      submissionAttachments: [],
    });

    // 9. Paiements
    await ctx.db.insert("payments", {
      studentId: studentRef1,
      amount: 150,
      dueDate: "2026-06-01",
      status: "pending",
      description: "Frais de scolarité - Juin 2026",
    });

    await ctx.db.insert("payments", {
      studentId: studentRef1,
      amount: 150,
      dueDate: "2026-05-01",
      status: "paid",
      paidAt: Date.now() - 15 * 86400000,
      description: "Frais de scolarité - Mai 2026",
    });

    await ctx.db.insert("payments", {
      studentId: studentRef2,
      amount: 120,
      dueDate: "2026-05-01",
      status: "overdue",
      description: "Frais de scolarité - Mai 2026",
    });

    // 10. Calendrier / Événements
    await ctx.db.insert("events", {
      title: "Réunion Parents-Professeurs 6ème",
      description: "Bilan du troisième trimestre et préparation de l'année prochaine.",
      startDate: "2026-06-02T17:30",
      endDate: "2026-06-02T20:00",
      type: "meeting",
      classId: classId1,
    });

    await ctx.db.insert("events", {
      title: "Examen Final de Langue Arabe",
      description: "Écrit et oral pour tous les niveaux classique/coranique.",
      startDate: "2026-06-10T09:00",
      endDate: "2026-06-10T12:00",
      type: "exam",
    });

    // 11. Notifications
    await ctx.db.insert("notifications", {
      userId: adminId,
      title: "Nouveau professeur inscrit",
      message: "Sofia Belkacem a complété son onboarding.",
      read: false,
      createdAt: Date.now(),
    });

    // 12. Messages
    await ctx.db.insert("messages", {
      senderId: adminId,
      isAnnouncement: true,
      content: "Bienvenue sur SchoolHub ! La plateforme est maintenant en ligne pour le troisième trimestre.",
      createdAt: Date.now() - 3 * 86400000,
    });

    await ctx.db.insert("messages", {
      senderId: teacherId1,
      classId: classId1,
      isAnnouncement: false,
      content: "Bonjour chers élèves de 6ème. Pensez à réviser vos fractions pour le cours de lundi !",
      createdAt: Date.now() - 12 * 3600000,
    });

    return { success: true };
  },
});

// ==========================================
// 2. STATISTIQUES ET DASHBOARDS
// ==========================================

export const getAdminStats = query({
  handler: async (ctx) => {
    // Nombre d'élèves
    const students = await ctx.db.query("students").collect();
    const studentsCount = students.length;

    // Nombre d'enseignants
    const teachers = await ctx.db.query("teachers").collect();
    const teachersCount = teachers.length;

    // Revenus mensuels cumulés
    const payments = await ctx.db.query("payments").collect();
    const totalRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((acc, p) => acc + p.amount, 0);

    // Taux d'absences moyen
    const attendance = await ctx.db.query("attendance").collect();
    const absencesCount = attendance.filter((a) => a.status === "absent").length;
    const attendanceRate = attendance.length > 0
      ? Math.round(((attendance.length - absencesCount) / attendance.length) * 100)
      : 100;

    // Activités récentes
    const recentUsers = await ctx.db.query("users").order("desc").take(5);
    const recentActivity = recentUsers.map((u) => ({
      id: u._id,
      type: "user",
      title: "Nouvel utilisateur",
      description: `${u.name} a rejoint la plateforme en tant que ${u.role}`,
      time: new Date(u.createdAt).toLocaleDateString("fr-FR"),
    }));

    return {
      studentsCount,
      teachersCount,
      totalRevenue,
      attendanceRate,
      recentActivity,
    };
  },
});

// Récupère les données adaptées pour chaque rôle
export const getDashboardConfig = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { error: "Non authentifié" };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return { error: "Utilisateur non trouvé en base" };

    if (user.role === "admin") {
      const stats = await getAdminStats(ctx, {});
      return { role: "admin", user, stats };
    }

    if (user.role === "teacher") {
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .unique();

      if (!teacher) return { role: "teacher", user, error: "Profil prof introuvable" };

      // Classes assignées
      const classes = await ctx.db
        .query("classes")
        .collect();

      const teacherClasses = classes.filter((c) => c.teacherId === teacher._id);

      // Devoirs donnés par ce prof
      const assignments = await ctx.db
        .query("assignments")
        .collect();
      const teacherAssignments = assignments.filter((a) => a.teacherId === teacher._id);

      return {
        role: "teacher",
        user,
        teacher,
        classes: teacherClasses,
        assignments: teacherAssignments,
      };
    }

    if (user.role === "student") {
      const student = await ctx.db
        .query("students")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .unique();

      if (!student) return { role: "student", user, error: "Profil élève introuvable" };

      // Classe
      let classData = null;
      if (student.classId) {
        classData = await ctx.db.get(student.classId);
      }

      // Devoirs de sa classe
      const assignments = await ctx.db.query("assignments").collect();
      const studentAssignments = student.classId
        ? assignments.filter((a) => a.classId === student.classId)
        : [];

      // Notes
      const grades = await ctx.db
        .query("grades")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .collect();

      // Paiements
      const payments = await ctx.db
        .query("payments")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .collect();

      return {
        role: "student",
        user,
        student,
        classData,
        assignments: studentAssignments,
        grades,
        payments,
      };
    }

    if (user.role === "parent") {
      const parent = await ctx.db
        .query("parents")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .unique();

      if (!parent) return { role: "parent", user, error: "Profil parent introuvable" };

      // Élève(s) associé(s)
      const children = [];
      for (const childId of parent.studentIds) {
        const student = await ctx.db.get(childId);
        if (student) {
          const userDetails = await ctx.db.get(student.userId);
          const grades = await ctx.db
            .query("grades")
            .withIndex("by_student", (q) => q.eq("studentId", student._id))
            .collect();
          const payments = await ctx.db
            .query("payments")
            .withIndex("by_student", (q) => q.eq("studentId", student._id))
            .collect();
          const attendance = await ctx.db
            .query("attendance")
            .collect();
          const childAttendance = attendance.filter((a) => a.studentId === student._id);

          children.push({
            student,
            userDetails,
            grades,
            payments,
            attendance: childAttendance,
          });
        }
      }

      return {
        role: "parent",
        user,
        parent,
        children,
      };
    }

    return { role: "none", user };
  },
});

// ==========================================
// 3. GESTION DES ÉLÈVES (CRUD)
// ==========================================

export const getStudents = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    const detailedStudents = [];
    for (const student of students) {
      const user = await ctx.db.get(student.userId);
      const classData = student.classId ? await ctx.db.get(student.classId) : null;
      detailedStudents.push({
        ...student,
        user,
        className: classData ? classData.name : "Non assigné",
      });
    }
    return detailedStudents;
  },
});

export const createStudent = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    gender: v.string(),
    level: v.string(),
    dateOfBirth: v.string(),
    address: v.optional(v.string()),
    classId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Créer d'abord l'utilisateur générique
    const userId = await ctx.db.insert("users", {
      clerkId: "manual_" + Math.random().toString(36).substring(7),
      email: args.email,
      name: args.name,
      role: "student",
      imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      createdAt: Date.now(),
    });

    const parsedClassId = args.classId ? (args.classId as Id<"classes">) : undefined;

    // Créer le profil élève
    const studentId = await ctx.db.insert("students", {
      userId,
      gender: args.gender,
      level: args.level,
      dateOfBirth: args.dateOfBirth,
      address: args.address,
      classId: parsedClassId,
      documents: [],
    });

    return studentId;
  },
});

export const deleteStudent = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.id);
    if (!student) throw new Error("Élève introuvable");

    // Supprimer l'utilisateur et le profil élève
    await ctx.db.delete(student.userId);
    await ctx.db.delete(args.id);
  },
});

// ==========================================
// 4. GESTION DES ENSEIGNANTS (CRUD)
// ==========================================

export const getTeachers = query({
  args: {},
  handler: async (ctx) => {
    const teachers = await ctx.db.query("teachers").collect();
    const detailedTeachers = [];
    for (const teacher of teachers) {
      const user = await ctx.db.get(teacher.userId);
      detailedTeachers.push({
        ...teacher,
        user,
      });
    }
    return detailedTeachers;
  },
});

export const createTeacher = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    subjects: v.array(v.string()),
    availability: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      clerkId: "manual_" + Math.random().toString(36).substring(7),
      email: args.email,
      name: args.name,
      role: "teacher",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200",
      createdAt: Date.now(),
    });

    const teacherId = await ctx.db.insert("teachers", {
      userId,
      subjects: args.subjects,
      availability: args.availability,
    });

    return teacherId;
  },
});

export const deleteTeacher = mutation({
  args: { id: v.id("teachers") },
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Professeur introuvable");

    await ctx.db.delete(teacher.userId);
    await ctx.db.delete(args.id);
  },
});

// ==========================================
// 5. GESTION DES CLASSES
// ==========================================

export const getClasses = query({
  args: {},
  handler: async (ctx) => {
    const classes = await ctx.db.query("classes").collect();
    const detailedClasses = [];
    for (const cls of classes) {
      let teacherUser = null;
      if (cls.teacherId) {
        const teacher = await ctx.db.get(cls.teacherId);
        if (teacher) {
          teacherUser = await ctx.db.get(teacher.userId);
        }
      }
      detailedClasses.push({
        ...cls,
        teacherName: teacherUser ? teacherUser.name : "Non assigné",
      });
    }
    return detailedClasses;
  },
});

export const createClass = mutation({
  args: {
    name: v.string(),
    level: v.string(),
    teacherId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parsedTeacherId = args.teacherId ? (args.teacherId as Id<"teachers">) : undefined;
    return await ctx.db.insert("classes", {
      name: args.name,
      level: args.level,
      teacherId: parsedTeacherId,
      schedule: [],
    });
  },
});

// ==========================================
// 6. PRÉSENCE (ATTENDANCE)
// ==========================================

export const getAttendanceRecords = query({
  args: { classId: v.id("classes"), date: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_class_date", (q) => q.eq("classId", args.classId).eq("date", args.date))
      .collect();

    return records;
  },
});

export const submitAttendance = mutation({
  args: {
    classId: v.id("classes"),
    date: v.string(),
    records: v.array(v.object({
      studentId: v.id("students"),
      status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
      remarks: v.optional(v.string()),
    })),
    recordedByTeacherId: v.id("teachers"),
  },
  handler: async (ctx, args) => {
    // Supprimer d'anciennes présences pour cette classe/date pour pouvoir refaire l'appel
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_class_date", (q) => q.eq("classId", args.classId).eq("date", args.date))
      .collect();

    for (const record of existing) {
      await ctx.db.delete(record._id);
    }

    // Insérer les nouveaux appels
    for (const item of args.records) {
      await ctx.db.insert("attendance", {
        classId: args.classId,
        studentId: item.studentId,
        date: args.date,
        status: item.status,
        remarks: item.remarks,
        recordedBy: args.recordedByTeacherId,
      });
    }

    return { success: true };
  },
});

// ==========================================
// 7. MESSAGERIE INTERNE (CHATS)
// ==========================================

export const getMessages = query({
  args: { classId: v.optional(v.id("classes")), isAnnouncement: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("messages");

    if (args.isAnnouncement) {
      const announcements = await queryBuilder.order("desc").collect();
      const filtered = announcements.filter((m) => m.isAnnouncement);
      const output = [];
      for (const m of filtered) {
        const sender = await ctx.db.get(m.senderId);
        output.push({ ...m, senderName: sender?.name || "Système", senderRole: sender?.role || "admin" });
      }
      return output;
    }

    if (args.classId) {
      const classMsgs = await queryBuilder.withIndex("by_class", (q) => q.eq("classId", args.classId)).order("desc").collect();
      const output = [];
      for (const m of classMsgs) {
        const sender = await ctx.db.get(m.senderId);
        output.push({ ...m, senderName: sender?.name || "Inconnu", senderImage: sender?.imageUrl });
      }
      return output;
    }

    // Par défaut, retourner tous les messages récents publics/annonces
    const all = await queryBuilder.order("desc").take(50);
    const output = [];
    for (const m of all) {
      const sender = await ctx.db.get(m.senderId);
      output.push({ ...m, senderName: sender?.name || "Système", senderImage: sender?.imageUrl });
    }
    return output;
  },
});

export const sendMessage = mutation({
  args: {
    senderClerkId: v.string(),
    classId: v.optional(v.id("classes")),
    isAnnouncement: v.boolean(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.senderClerkId))
      .unique();

    if (!user) throw new Error("Utilisateur émetteur introuvable");

    await ctx.db.insert("messages", {
      senderId: user._id,
      classId: args.classId,
      isAnnouncement: args.isAnnouncement,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// ==========================================
// 8. DEVOIRS (ASSIGNMENTS)
// ==========================================

export const createAssignment = mutation({
  args: {
    classId: v.id("classes"),
    teacherId: v.id("teachers"),
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
    points: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assignments", {
      classId: args.classId,
      teacherId: args.teacherId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      attachments: [],
      points: args.points,
    });
  },
});

// ==========================================
// 9. PAIEMENTS (SIMULATE)
// ==========================================

export const payInvoice = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Facture introuvable");

    await ctx.db.patch(args.paymentId, {
      status: "paid",
      paidAt: Date.now(),
    });

    return { success: true };
  },
});

// ==========================================
// 10. CALENDRIER SCOLAIRE
// ==========================================

export const getEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").order("asc").collect();
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    type: v.union(v.literal("exam"), v.literal("meeting"), v.literal("holiday"), v.literal("event")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      type: args.type,
    });
  },
});
