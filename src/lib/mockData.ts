// ==========================================
// 1. TYPAGES ET INTERFACES MULTI-TENANT
// ==========================================

export interface MockSchool {
  id: string;
  name: string;
  slug: string;
  plan: "basic" | "pro" | "enterprise";
  status: "active" | "suspended" | "past_due";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  maxStudentsQuota: number;
  createdAt: number;
  settings: {
    primaryColor: string;
    logoUrl?: string;
    address?: string;
    primarySystem?: string;
  };
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  imageUrl: string;
  createdAt: number;
}

export interface MockMembership {
  id: string;
  userId: string;
  schoolId: string;
  role: "school_admin" | "teacher" | "parent" | "student";
  createdAt: number;
}

export interface MockStudent {
  id: string;
  schoolId: string;
  userId: string;
  classId?: string;
  parentId?: string;
  level: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  documents: { name: string; url: string }[];
}

export interface MockTeacher {
  id: string;
  schoolId: string;
  userId: string;
  subjects: string[];
  availability: string[];
}

export interface MockParent {
  id: string;
  schoolId: string;
  userId: string;
  phone: string;
  studentIds: string[];
}

export interface MockClass {
  id: string;
  schoolId: string;
  name: string;
  level: string;
  teacherId?: string;
  schedule: {
    day: string;
    subject: string;
    startTime: string;
    endTime: string;
    teacherId: string;
  }[];
}

export interface MockAttendance {
  id: string;
  schoolId: string;
  studentId: string;
  classId: string;
  date: string;
  status: "present" | "absent" | "late";
  remarks?: string;
  recordedBy: string;
}

export interface MockAssignment {
  id: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
}

export interface MockSubmission {
  id: string;
  schoolId: string;
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  submittedAt: number;
}

export interface MockGrade {
  id: string;
  schoolId: string;
  submissionId: string;
  studentId: string;
  score: number;
  feedback?: string;
  gradedBy: string;
  createdAt: number;
}

export interface MockPayment {
  id: string;
  schoolId: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidAt?: number;
  description: string;
}

export interface MockConversation {
  id: string;
  schoolId: string;
  name?: string;
  classId?: string;
  isAnnouncement: boolean;
  participants: string[];
}

export interface MockMessage {
  id: string;
  schoolId: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
}

export interface MockEvent {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: "exam" | "meeting" | "holiday" | "event";
}

export interface MockAuditLog {
  id: string;
  schoolId?: string;
  userId: string;
  action: string;
  ipAddress?: string;
  details: string;
  timestamp: number;
}

// ==========================================
// 2. DONNÉES DE SEED MULTI-TENANT INITIALES
// ==========================================

// Liste des Écoles (Tenants)
export const mockSchools: MockSchool[] = [
  {
    id: "school_alqalam",
    name: "Académie Al-Qalam - Coranique",
    slug: "al-qalam",
    plan: "basic",
    status: "active",
    stripeCustomerId: "cus_mock_alqalam_123",
    stripeSubscriptionId: "sub_mock_alqalam_basic",
    maxStudentsQuota: 50,
    createdAt: Date.now() - 365 * 86400000,
    settings: {
      primaryColor: "#8b5cf6", // Violet
    },
  },
  {
    id: "school_condorcet",
    name: "Lycée Condorcet - Classique",
    slug: "condorcet",
    plan: "pro",
    status: "active",
    stripeCustomerId: "cus_mock_condorcet_456",
    stripeSubscriptionId: "sub_mock_condorcet_pro",
    maxStudentsQuota: 300,
    createdAt: Date.now() - 180 * 86400000,
    settings: {
      primaryColor: "#10b981", // Emerald Green
    },
  },
];

// Profils Utilisateurs Globaux
export const mockUsers: MockUser[] = [
  {
    id: "user_owner",
    name: "Karim Boussakri",
    email: "boussakri.karim@gmail.com",
    isSuperAdmin: true, // Super Admin SaaS Global
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    createdAt: Date.now() - 365 * 86400000,
  },
  {
    id: "user_teacher_alqalam",
    name: "Pr. Sofia Belkacem",
    email: "sofia.belkacem@alqalam.com",
    isSuperAdmin: false,
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    createdAt: Date.now() - 100 * 86400000,
  },
  {
    id: "user_teacher_condorcet",
    name: "Pr. Marc Dubois",
    email: "marc.dubois@condorcet.com",
    isSuperAdmin: false,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: "user_parent_1",
    name: "Khalid Mansour",
    email: "parent.khalid@mail.com",
    isSuperAdmin: false,
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    createdAt: Date.now() - 80 * 86400000,
  },
  {
    id: "user_student_alqalam",
    name: "Yasmine Mansour",
    email: "yasmine.mansour@alqalam.com",
    isSuperAdmin: false,
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
    createdAt: Date.now() - 75 * 86400000,
  },
  {
    id: "user_student_condorcet",
    name: "Lucas Dubois",
    email: "lucas.dubois@condorcet.com",
    isSuperAdmin: false,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
    createdAt: Date.now() - 60 * 86400000,
  },
];

// Table pivot d'adhésion : attribue un rôle spécifique au sein d'une école
export const mockMemberships: MockMembership[] = [
  // Karim Boussakri est School Admin de l'Académie Al-Qalam
  {
    id: "memb_1",
    userId: "user_owner",
    schoolId: "school_alqalam",
    role: "school_admin",
    createdAt: Date.now() - 365 * 86400000,
  },
  // Sofia Belkacem est professeur à Al-Qalam
  {
    id: "memb_2",
    userId: "user_teacher_alqalam",
    schoolId: "school_alqalam",
    role: "teacher",
    createdAt: Date.now() - 100 * 86400000,
  },
  // Marc Dubois est professeur à Condorcet
  {
    id: "memb_3",
    userId: "user_teacher_condorcet",
    schoolId: "school_condorcet",
    role: "teacher",
    createdAt: Date.now() - 90 * 86400000,
  },
  // Khalid Mansour est Parent à Al-Qalam
  {
    id: "memb_4",
    userId: "user_parent_1",
    schoolId: "school_alqalam",
    role: "parent",
    createdAt: Date.now() - 80 * 86400000,
  },
  // Yasmine Mansour est élève à Al-Qalam
  {
    id: "memb_5",
    userId: "user_student_alqalam",
    schoolId: "school_alqalam",
    role: "student",
    createdAt: Date.now() - 75 * 86400000,
  },
  // Lucas Dubois est élève à Condorcet
  {
    id: "memb_6",
    userId: "user_student_condorcet",
    schoolId: "school_condorcet",
    role: "student",
    createdAt: Date.now() - 60 * 86400000,
  },
];

// Enseignants
export const mockTeachers: MockTeacher[] = [
  {
    id: "teacher_alqalam",
    schoolId: "school_alqalam",
    userId: "user_teacher_alqalam",
    subjects: ["Tajwid", "Mémorisation Coran", "Langue Arabe"],
    availability: ["Lundi", "Mardi", "Jeudi", "Vendredi"],
  },
  {
    id: "teacher_condorcet",
    schoolId: "school_condorcet",
    userId: "user_teacher_condorcet",
    subjects: ["Mathématiques", "Physique-Chimie"],
    availability: ["Lundi", "Mercredi", "Vendredi"],
  },
];

// Parents
export const mockParents: MockParent[] = [
  {
    id: "parent_alqalam",
    schoolId: "school_alqalam",
    userId: "user_parent_1",
    phone: "+33 6 12 34 56 78",
    studentIds: ["student_alqalam"],
  },
];

// Classes
export const mockClasses: MockClass[] = [
  {
    id: "class_alqalam_1",
    schoolId: "school_alqalam",
    name: "Classe Al-Forqane (Coranique)",
    level: "Coranique",
    teacherId: "teacher_alqalam",
    schedule: [
      { day: "Lundi", subject: "Langue Arabe", startTime: "09:00", endTime: "11:00", teacherId: "teacher_alqalam" },
      { day: "Mardi", subject: "Mémorisation", startTime: "14:00", endTime: "17:00", teacherId: "teacher_alqalam" },
    ],
  },
  {
    id: "class_condorcet_1",
    schoolId: "school_condorcet",
    name: "Terminale S1 (Sciences)",
    level: "Classique",
    teacherId: "teacher_condorcet",
    schedule: [
      { day: "Lundi", subject: "Mathématiques", startTime: "08:30", endTime: "10:30", teacherId: "teacher_condorcet" },
      { day: "Mercredi", subject: "Physique-Chimie", startTime: "10:00", endTime: "12:00", teacherId: "teacher_condorcet" },
    ],
  },
];

// Élèves
export const mockStudents: MockStudent[] = [
  {
    id: "student_alqalam",
    schoolId: "school_alqalam",
    userId: "user_student_alqalam",
    classId: "class_alqalam_1",
    parentId: "parent_alqalam",
    level: "Coranique",
    dateOfBirth: "2013-05-15",
    gender: "Féminin",
    address: "24 Avenue de Versailles, Paris",
    documents: [{ name: "Certificat d'Aptitude", url: "#" }],
  },
  {
    id: "student_condorcet",
    schoolId: "school_condorcet",
    userId: "user_student_condorcet",
    classId: "class_condorcet_1",
    level: "Classique",
    dateOfBirth: "2009-10-22",
    gender: "Masculin",
    address: "8 Rue de la Victoire, Paris",
    documents: [],
  },
];

// Présences
export const mockAttendance: MockAttendance[] = [
  {
    id: "att_1",
    schoolId: "school_alqalam",
    studentId: "student_alqalam",
    classId: "class_alqalam_1",
    date: "2026-05-22",
    status: "present",
    recordedBy: "teacher_alqalam",
  },
  {
    id: "att_2",
    schoolId: "school_condorcet",
    studentId: "student_condorcet",
    classId: "class_condorcet_1",
    date: "2026-05-22",
    status: "late",
    remarks: "Problème de métro ligne 13",
    recordedBy: "teacher_condorcet",
  },
];

// Devoirs
export const mockAssignments: MockAssignment[] = [
  {
    id: "assign_alqalam",
    schoolId: "school_alqalam",
    classId: "class_alqalam_1",
    teacherId: "teacher_alqalam",
    title: "Sourate An-Naba : Versets 1 à 20",
    description: "Mémoriser parfaitement la première moitié de la sourate avec la prononciation correcte (Tajwid).",
    dueDate: "2026-05-28",
    points: 10,
  },
  {
    id: "assign_condorcet",
    schoolId: "school_condorcet",
    classId: "class_condorcet_1",
    teacherId: "teacher_condorcet",
    title: "Calcul Matriciel et Dérivées Complexes",
    description: "Résoudre les problèmes géométriques d'analyse linéaire sur votre feuille de rendu.",
    dueDate: "2026-05-29",
    points: 20,
  },
];

// Rendus de devoirs
export const mockSubmissions: MockSubmission[] = [
  {
    id: "sub_1",
    schoolId: "school_alqalam",
    assignmentId: "assign_alqalam",
    studentId: "student_alqalam",
    submissionText: "Je récite couramment les versets 1 à 20 de la sourate, prête pour mercredi !",
    submittedAt: Date.now() - 43200000,
  },
  {
    id: "sub_2",
    schoolId: "school_condorcet",
    assignmentId: "assign_condorcet",
    studentId: "student_condorcet",
    submissionText: "Voici les réponses du devoir d'analyse complexe (fichier PDF joint en pièce jointe).",
    submittedAt: Date.now() - 86400000,
  },
];

// Évaluations (Grades)
export const mockGrades: MockGrade[] = [
  {
    id: "grade_1",
    schoolId: "school_alqalam",
    submissionId: "sub_1",
    studentId: "student_alqalam",
    score: 9,
    feedback: "Mémorisation remarquable Sofia. Excellent respect des règles de Tajwid sur la lettre Ra.",
    gradedBy: "teacher_alqalam",
    createdAt: Date.now() - 3600000,
  },
];

// Paiements (Frais Scolarité)
export const mockPayments: MockPayment[] = [
  {
    id: "pay_alqalam_1",
    schoolId: "school_alqalam",
    studentId: "student_alqalam",
    amount: 150,
    dueDate: "2026-06-01",
    status: "pending",
    description: "Frais de scolarité - Juin 2026",
  },
  {
    id: "pay_alqalam_2",
    schoolId: "school_alqalam",
    studentId: "student_alqalam",
    amount: 150,
    dueDate: "2026-05-01",
    status: "paid",
    paidAt: Date.now() - 15 * 86400000,
    description: "Frais de scolarité - Mai 2026",
  },
  {
    id: "pay_condorcet_1",
    schoolId: "school_condorcet",
    studentId: "student_condorcet",
    amount: 250,
    dueDate: "2026-05-01",
    status: "overdue",
    description: "Frais de scolarité trimestriel",
  },
];

// Conversations
export const mockConversations: MockConversation[] = [
  {
    id: "conv_alqalam_ann",
    schoolId: "school_alqalam",
    name: "Megaphone Général",
    isAnnouncement: true,
    participants: ["user_owner", "user_teacher_alqalam", "user_parent_1", "user_student_alqalam"],
  },
  {
    id: "conv_alqalam_class",
    schoolId: "school_alqalam",
    name: "Discussion Al-Forqane",
    classId: "class_alqalam_1",
    isAnnouncement: false,
    participants: ["user_teacher_alqalam", "user_parent_1", "user_student_alqalam"],
  },
  {
    id: "conv_condorcet_class",
    schoolId: "school_condorcet",
    name: "Timeline Terminale S1",
    classId: "class_condorcet_1",
    isAnnouncement: false,
    participants: ["user_teacher_condorcet", "user_student_condorcet"],
  },
];

// Messages
export const mockMessages: MockMessage[] = [
  {
    id: "msg_alqalam_1",
    schoolId: "school_alqalam",
    conversationId: "conv_alqalam_ann",
    senderId: "user_owner",
    content: "Bienvenue sur SchoolHub ! L'Académie Al-Qalam dispose maintenant de son portail en ligne réactif.",
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: "msg_alqalam_2",
    schoolId: "school_alqalam",
    conversationId: "conv_alqalam_class",
    senderId: "user_teacher_alqalam",
    content: "Assalamou alaykoum les élèves. Révisez bien la sourate An-Naba pour la récitation écrite de jeudi !",
    createdAt: Date.now() - 10 * 3600000,
  },
  {
    id: "msg_condorcet_1",
    schoolId: "school_condorcet",
    conversationId: "conv_condorcet_class",
    senderId: "user_teacher_condorcet",
    content: "Bonjour. N'oubliez pas vos calculatrices scientifiques complexes pour le contrôle de mercredi.",
    createdAt: Date.now() - 12 * 3600000,
  },
];

// Événements scolaires
export const mockEvents: MockEvent[] = [
  {
    id: "event_alqalam_1",
    schoolId: "school_alqalam",
    title: "Récitation Générale Trimestrielle",
    description: "Grand oral annuel de mémorisation en présence des examinateurs du conseil académique.",
    startDate: "2026-06-03T09:00",
    endDate: "2026-06-03T17:00",
    type: "exam",
  },
  {
    id: "event_condorcet_1",
    schoolId: "school_condorcet",
    title: "Baccalauréat Blanc - Epreuve Mathématiques",
    description: "Épreuve officielle d'entraînement de 4 heures pour tous les élèves de Terminale S.",
    startDate: "2026-06-08T08:00",
    endDate: "2026-06-08T12:00",
    type: "exam",
  },
];

// Logs d'audit sécurité
export const mockAuditLogs: MockAuditLog[] = [
  {
    id: "log_1",
    schoolId: "school_alqalam",
    userId: "user_owner",
    action: "CREATE_STUDENT",
    ipAddress: "192.168.1.15",
    details: "Inscription de l'élève Yasmine Mansour dans la classe Al-Forqane.",
    timestamp: Date.now() - 2 * 3600000,
  },
  {
    id: "log_2",
    userId: "user_owner",
    action: "SUSPEND_SCHOOL",
    details: "Suspension système de démonstration révoquée.",
    timestamp: Date.now() - 12 * 3600000,
  },
];

export const avatarHashes = [
  "1534528741775-53994a69daeb",
  "1494790108377-be9c29b29330",
  "1507003211169-0a1dd7228f2d",
  "1500648767791-00dcc994a43e",
  "1438761681033-6461ffad8d80",
  "1539571696357-5a69c17a67c6",
  "1506794778202-cad84cf45f1d",
  "1524504388940-b1c1722653e1",
  "1544005313-94ddf0286df2",
  "1517841905240-472988babdf9",
  "1501196354995-cbb51c65aaea",
  "1488426862026-3ee34a7d66df",
  "1522075469751-3a6694fb2f61",
  "1542206395-9feb3edaa68d",
  "1508214751196-bcfd4ca60f91",
  "1492562080023-ab3db95bfbce",
  "1472099645785-5658abf4ff4e",
  "1580489944761-15a19d654956",
  "1507003211169-0a1dd7228f2d",
  "1534528741775-53994a69daeb"
];

// ==========================================
// 3. GENERATION DYNAMIQUE DE 100+ ELEVES POUR LES TESTS SAAS
// ==========================================

const firstNames = [
  "Yasmine", "Lucas", "Sofia", "Marc", "Khalid", "Amine", "Sarah", "Thomas", "Inès", "Ryan", 
  "Léa", "Adam", "Chloé", "Mohamed", "Emma", "Mehdi", "Camille", "Rayan", "Lina", "Nathan", 
  "Anissa", "Hugo", "Manal", "Enzo", "Imane", "Louis", "Youssef", "Jade", "Bilal", "Alice", 
  "Kenza", "Arthur", "Selma", "Mathis", "Farah", "Léo", "Nour", "Paul", "Sami", "Zoé", "Karim",
  "Nadia", "Yanis", "Sonia", "Idris", "Myriam", "Wassim", "Hana", "Rayane", "Layla", "Fares"
];

const lastNames = [
  "Mansour", "Dubois", "Belkacem", "Martin", "Benali", "Moreau", "Haddad", "Laurent", "Meziane", "Simon", 
  "Kassab", "Michel", "Zouari", "Garcia", "Guerin", "Amrani", "Rousseau", "Tazi", "Blanc", "Naji", 
  "Gérard", "Bennani", "Dupont", "Saidi", "Fournier", "Fekih", "Lefebvre", "Daoud", "Mercier", "Masmoudi"
];

// Générer 110 élèves supplémentaires
for (let i = 1; i <= 110; i++) {
  const isAlqalam = i % 2 === 0;
  const schoolId = isAlqalam ? "school_alqalam" : "school_condorcet";
  const level = isAlqalam ? "Coranique" : "Classique";
  const classId = isAlqalam ? "class_alqalam_1" : "class_condorcet_1";
  
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[(i * 3) % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${i}@schoolhub.com`;
  
  const userId = `user_gen_${i}`;
  const studentId = `student_gen_${i}`;
  const gender = i % 3 === 0 ? "Masculin" : "Féminin";
  
  // 1. Ajouter l'utilisateur
  mockUsers.push({
    id: userId,
    name,
    email,
    isSuperAdmin: false,
    imageUrl: `https://images.unsplash.com/photo-${avatarHashes[i % avatarHashes.length]}?q=80&w=200`,
    createdAt: Date.now() - (60 + (i % 30)) * 86400000,
  });

  // 2. Ajouter l'adhésion
  mockMemberships.push({
    id: `memb_gen_${i}`,
    userId,
    schoolId,
    role: "student",
    createdAt: Date.now() - 60 * 86400000,
  });

  // 3. Ajouter le profil élève
  mockStudents.push({
    id: studentId,
    schoolId,
    userId,
    classId,
    parentId: isAlqalam ? "parent_alqalam" : undefined,
    level,
    dateOfBirth: `201${4 + (i % 3)}-0${1 + (i % 8)}-${10 + (i % 18)}`,
    gender,
    address: `${10 + i} Rue de la République, Paris`,
    documents: [],
  });

  // 4. Ajouter des paiements de scolarité
  mockPayments.push({
    id: `pay_gen_june_${i}`,
    schoolId,
    studentId,
    amount: isAlqalam ? 150 : 250,
    dueDate: "2026-06-01",
    status: i % 5 === 0 ? "overdue" : i % 4 === 0 ? "paid" : "pending",
    paidAt: i % 4 === 0 ? Date.now() - (i % 10) * 86400000 : undefined,
    description: `Scolarité Mensuelle Juin 2026`,
  });

  mockPayments.push({
    id: `pay_gen_may_${i}`,
    schoolId,
    studentId,
    amount: isAlqalam ? 150 : 250,
    dueDate: "2026-05-01",
    status: i % 9 === 0 ? "overdue" : "paid",
    paidAt: Date.now() - (15 + (i % 10)) * 86400000,
    description: `Scolarité Mensuelle Mai 2026`,
  });

  // 5. De temps en temps, ajouter un message de chat dans les classes
  if (i % 10 === 0) {
    mockMessages.push({
      id: `msg_gen_chat_${i}`,
      schoolId,
      conversationId: isAlqalam ? "conv_alqalam_class" : "conv_condorcet_class",
      senderId: userId,
      content: i % 20 === 0 
        ? "Est-ce que quelqu'un a compris l'exercice 4 pour demain ?" 
        : "J'ai fini d'apprendre les versets ! C'était super agréable.",
      createdAt: Date.now() - (i % 5) * 3600000,
    });
  }
}
