import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table des Écoles (Tenants)
  schools: defineTable({
    name: v.string(),
    slug: v.string(), // Identifiant unique d'URL (ex: "al-qalam" ou "condorcet")
    plan: v.union(v.literal("basic"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("past_due")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    maxStudentsQuota: v.number(), // Limite d'élèves selon le forfait
    createdAt: v.number(),
    settings: v.object({
      primaryColor: v.string(), // ex: "#6366f1" (indigo) ou "#10b981" (emerald)
      logoUrl: v.optional(v.string()),
    }),
  }).index("by_slug", ["slug"]),

  // Table des profils utilisateurs unifiée (Global)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("teacher"), v.literal("parent"), v.literal("student")),
    isSuperAdmin: v.optional(v.boolean()), // Contrôle global sur la plateforme SaaS
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  // Adhésions (pivot relationnel) liant les utilisateurs aux écoles avec un rôle spécifique
  memberships: defineTable({
    userId: v.id("users"),
    schoolId: v.id("schools"),
    role: v.union(
      v.literal("school_admin"), // Administrateur de l'école (School Admin)
      v.literal("teacher"),      // Professeur
      v.literal("parent"),       // Parent d'élève
      v.literal("student")       // Élève
    ),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_school", ["schoolId"])
  .index("by_school_role", ["schoolId", "role"])
  .index("by_user_school", ["userId", "schoolId"]),

  // Élèves isolés par école
  students: defineTable({
    schoolId: v.id("schools"),
    userId: v.id("users"),
    classId: v.optional(v.id("classes")),
    parentId: v.optional(v.id("parents")),
    level: v.string(), // "Classique", "Coranique", etc.
    dateOfBirth: v.string(),
    gender: v.string(),
    address: v.optional(v.string()),
    documents: v.array(v.object({ name: v.string(), url: v.string() })),
  })
  .index("by_school", ["schoolId"])
  .index("by_userId", ["userId"])
  .index("by_class", ["classId"])
  .index("by_parent", ["parentId"]),

  // Enseignants isolés par école
  teachers: defineTable({
    schoolId: v.id("schools"),
    userId: v.id("users"),
    subjects: v.array(v.string()), // Matières enseignées
    availability: v.array(v.string()), // Jours disponibles
  })
  .index("by_school", ["schoolId"])
  .index("by_userId", ["userId"]),

  // Parents isolés par école
  parents: defineTable({
    schoolId: v.id("schools"),
    userId: v.id("users"),
    phone: v.string(),
    studentIds: v.array(v.id("students")),
  })
  .index("by_school", ["schoolId"])
  .index("by_userId", ["userId"]),

  // Classes isolées par école
  classes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    level: v.string(), // Primaire, Secondaire, etc.
    teacherId: v.optional(v.id("teachers")), // Prof principal
    schedule: v.array(v.object({
      day: v.string(),
      subject: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      teacherId: v.id("teachers"),
    })),
  }).index("by_school", ["schoolId"]),

  // Présences isolées par école
  attendance: defineTable({
    schoolId: v.id("schools"),
    studentId: v.id("students"),
    classId: v.id("classes"),
    date: v.string(), // YYYY-MM-DD
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late")),
    remarks: v.optional(v.string()),
    recordedBy: v.id("teachers"),
  })
  .index("by_school", ["schoolId"])
  .index("by_school_date", ["schoolId", "date"])
  .index("by_student_date", ["studentId", "date"])
  .index("by_class_date", ["classId", "date"]),

  // Devoirs / Exercices isolés par école
  assignments: defineTable({
    schoolId: v.id("schools"),
    classId: v.id("classes"),
    teacherId: v.id("teachers"),
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
    points: v.number(),
  })
  .index("by_school", ["schoolId"])
  .index("by_class", ["classId"]),

  // Soumissions de devoirs faites par les élèves
  submissions: defineTable({
    schoolId: v.id("schools"),
    assignmentId: v.id("assignments"),
    studentId: v.id("students"),
    submissionText: v.optional(v.string()),
    submissionAttachments: v.array(v.object({ name: v.string(), url: v.string() })),
    submittedAt: v.number(),
  })
  .index("by_school", ["schoolId"])
  .index("by_assignment_student", ["assignmentId", "studentId"])
  .index("by_student", ["studentId"]),

  // Notes et Évaluations associées aux devoirs
  grades: defineTable({
    schoolId: v.id("schools"),
    submissionId: v.id("submissions"),
    studentId: v.id("students"),
    score: v.number(),
    feedback: v.optional(v.string()),
    gradedBy: v.id("teachers"),
    createdAt: v.number(),
  })
  .index("by_school", ["schoolId"])
  .index("by_student", ["studentId"]),

  // Paiements de scolarité isolés par école
  payments: defineTable({
    schoolId: v.id("schools"),
    studentId: v.id("students"),
    amount: v.number(),
    dueDate: v.string(),
    status: v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue")),
    paidAt: v.optional(v.number()),
    description: v.string(),
  })
  .index("by_school", ["schoolId"])
  .index("by_student", ["studentId"]),

  // Factures Stripe scolaires générées
  invoices: defineTable({
    schoolId: v.id("schools"),
    paymentId: v.id("payments"),
    invoiceNumber: v.string(),
    pdfUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_school", ["schoolId"]),

  // Messagerie & Tchats en direct
  messages: defineTable({
    schoolId: v.id("schools"),
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
  .index("by_school", ["schoolId"])
  .index("by_conversation", ["conversationId"]),

  // Conversations (Chambres de tchat ou tchats directs)
  conversations: defineTable({
    schoolId: v.id("schools"),
    name: v.optional(v.string()), // ex: "Salon Général", "Tchat Classe 6ème"
    classId: v.optional(v.id("classes")), // Conversation groupe de classe
    isAnnouncement: v.boolean(), // Vrai si c'est un canal d'annonces unilatéral
    participants: v.array(v.id("users")), // Identifiants des participants
  })
  .index("by_school", ["schoolId"])
  .index("by_class", ["classId"]),

  // Notifications temps réel push/in-app
  notifications: defineTable({
    schoolId: v.id("schools"),
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
  .index("by_school", ["schoolId"])
  .index("by_user", ["userId"]),

  // Événements calendrier scolaire
  events: defineTable({
    schoolId: v.id("schools"),
    title: v.string(),
    description: v.string(),
    startDate: v.string(), // ISO YYYY-MM-DDTHH:mm
    endDate: v.string(),
    type: v.union(v.literal("exam"), v.literal("meeting"), v.literal("holiday"), v.literal("event")),
  })
  .index("by_school", ["schoolId"])
  .index("by_startDate", ["startDate"]),

  // Paramètres personnalisés de l'école
  settings: defineTable({
    schoolId: v.id("schools"),
    academicYear: v.string(), // ex: "2025-2026"
    allowedLevels: v.array(v.string()), // ex: ["Classique", "Coranique"]
    autoSuspensionOnOverdue: v.boolean(),
  }).index("by_school", ["schoolId"]),

  // Logs d'audit (Sécurité & traçabilité)
  auditLogs: defineTable({
    schoolId: v.optional(v.id("schools")), // Optionnel si l'action concerne le SaaS global
    userId: v.id("users"),
    action: v.string(), // ex: "CREATE_STUDENT", "DELETE_CLASS", "SUSPEND_SCHOOL"
    ipAddress: v.optional(v.string()),
    details: v.string(),
    timestamp: v.number(),
  })
  .index("by_school", ["schoolId"])
  .index("by_timestamp", ["timestamp"]),
});
