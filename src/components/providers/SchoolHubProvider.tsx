"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  MockSchool,
  MockUser,
  MockMembership,
  MockStudent,
  MockTeacher,
  MockParent,
  MockClass,
  MockAttendance,
  MockAssignment,
  MockSubmission,
  MockGrade,
  MockPayment,
  MockConversation,
  MockMessage,
  MockEvent,
  MockAuditLog,
  mockSchools,
  mockUsers,
  mockMemberships,
  mockStudents,
  mockTeachers,
  mockParents,
  mockClasses,
  mockAttendance,
  mockAssignments,
  mockSubmissions,
  mockGrades,
  mockPayments,
  mockConversations,
  mockMessages,
  mockEvents,
  mockAuditLogs,
  avatarHashes,
} from "@/lib/mockData";

interface SchoolHubContextType {
  // Global SaaS Context
  role: "school_admin" | "teacher" | "student" | "parent" | "super_admin";
  setRole: (role: "school_admin" | "teacher" | "student" | "parent" | "super_admin") => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  currentUser: MockUser;

  // Multi-Tenant Context
  schools: MockSchool[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  activeSchool: MockSchool | undefined;

  // Memory Database States
  users: MockUser[];
  memberships: MockMembership[];
  students: MockStudent[];
  teachers: MockTeacher[];
  parents: MockParent[];
  classes: MockClass[];
  attendance: MockAttendance[];
  assignments: MockAssignment[];
  submissions: MockSubmission[];
  grades: MockGrade[];
  payments: MockPayment[];
  conversations: MockConversation[];
  messages: MockMessage[];
  events: MockEvent[];
  auditLogs: MockAuditLog[];

  // Tenant Scoped Mutators
  addStudent: (student: Omit<MockStudent, "id" | "schoolId" | "userId"> & { name: string; email: string }) => { success: boolean; error?: string };
  deleteStudent: (studentId: string) => void;
  addTeacher: (teacher: Omit<MockTeacher, "id" | "schoolId" | "userId"> & { name: string; email: string }) => void;
  deleteTeacher: (teacherId: string) => void;
  addClass: (cls: Omit<MockClass, "id" | "schoolId" | "schedule">) => void;
  takeAttendance: (classId: string, date: string, records: { studentId: string; status: "present" | "absent" | "late"; remarks?: string }[]) => void;
  justifyAbsence: (attendanceId: string, remarks: string, newRecord?: { studentId: string; classId: string; date: string }) => void;
  createAssignment: (assignment: Omit<MockAssignment, "id" | "schoolId">) => void;
  payInvoice: (paymentId: string) => void;
  createEvent: (event: Omit<MockEvent, "id" | "schoolId">) => void;
  sendMessage: (content: string, conversationId: string) => void;

  // SaaS Billing & Super Admin Controls
  toggleSchoolStatus: (schoolId: string) => void;
  changeSchoolPlan: (schoolId: string, plan: "basic" | "pro" | "enterprise") => void;
  updateSchoolDetails: (schoolId: string, name: string, address: string, primarySystem: string) => void;

  // Analytics Helpers
  getSchoolStats: () => {
    studentsCount: number;
    teachersCount: number;
    totalRevenue: number;
    attendanceRate: number;
    recentActivity: { id: string; action: string; details: string; time: string }[];
  };
  getSuperAdminStats: () => {
    schoolsCount: number;
    totalMRR: number;
    activeUsersCount: number;
    globalAttendanceRate: number;
  };
}

const SchoolHubContext = createContext<SchoolHubContextType | undefined>(undefined);

export function SchoolHubProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<"school_admin" | "teacher" | "student" | "parent" | "super_admin">("super_admin");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSchoolId, setActiveSchoolIdState] = useState<string>("school_alqalam");

  // Database Memory Store
  const [schools, setSchools] = useState<MockSchool[]>(mockSchools);
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [memberships, setMemberships] = useState<MockMembership[]>(mockMemberships);
  const [students, setStudents] = useState<MockStudent[]>(mockStudents);
  const [teachers, setTeachers] = useState<MockTeacher[]>(mockTeachers);
  const [parents] = useState<MockParent[]>(mockParents);
  const [classes, setClasses] = useState<MockClass[]>(mockClasses);
  const [attendance, setAttendance] = useState<MockAttendance[]>(mockAttendance);
  const [assignments, setAssignments] = useState<MockAssignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<MockSubmission[]>(mockSubmissions);
  const [grades, setGrades] = useState<MockGrade[]>(mockGrades);
  const [payments, setPayments] = useState<MockPayment[]>(mockPayments);
  const [conversations, setConversations] = useState<MockConversation[]>(mockConversations);
  const [messages, setMessages] = useState<MockMessage[]>(mockMessages);
  const [events, setEvents] = useState<MockEvent[]>(mockEvents);
  const [auditLogs, setAuditLogs] = useState<MockAuditLog[]>(mockAuditLogs);

  const currentUser = users.find((u) => u.id === "user_owner") || users[0];
  const activeSchool = schools.find((s) => s.id === activeSchoolId);

  // Load theme and session settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("schoolhub-theme") as "dark" | "light" | null;
    const savedRole = localStorage.getItem("schoolhub-role") as any;
    const savedSchool = localStorage.getItem("schoolhub-active-school");
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }
    if (savedRole) {
      setRoleState(savedRole);
    }
    if (savedSchool) {
      setActiveSchoolIdState(savedSchool);
    }
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    const root = window.document.documentElement;
    if (t === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("schoolhub-theme", nextTheme);
    applyTheme(nextTheme);
  };

  const setRole = (newRole: typeof role) => {
    setRoleState(newRole);
    localStorage.setItem("schoolhub-role", newRole);
  };

  const setActiveSchoolId = (schoolId: string) => {
    setActiveSchoolIdState(schoolId);
    localStorage.setItem("schoolhub-active-school", schoolId);
  };

  // Add system Audit Log
  const logSystemAction = (action: string, details: string, schoolId?: string) => {
    const newLog: MockAuditLog = {
      id: "log_" + Date.now(),
      schoolId,
      userId: currentUser.id,
      action,
      ipAddress: "192.168.1.15",
      details,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Multi-Tenant Mutators
  const addStudent = (studentData: Omit<MockStudent, "id" | "schoolId" | "userId"> & { name: string; email: string }) => {
    // 1. Quota Validation check
    const currentStudentsCount = students.filter((s) => s.schoolId === activeSchoolId).length;
    if (activeSchool && currentStudentsCount >= activeSchool.maxStudentsQuota) {
      return {
        success: false,
        error: `Quota d'élèves atteint (${activeSchool.maxStudentsQuota}/${activeSchool.maxStudentsQuota}). Veuillez passer au plan supérieur.`,
      };
    }

    const newUserId = "user_student_" + Date.now();
    const newStudentId = "student_" + Date.now();

    const newUser: MockUser = {
      id: newUserId,
      name: studentData.name,
      email: studentData.email,
      isSuperAdmin: false,
      imageUrl: `https://images.unsplash.com/photo-${avatarHashes[Math.floor(Math.random() * avatarHashes.length)]}?q=80&w=200`,
      createdAt: Date.now(),
    };

    const newStudent: MockStudent = {
      id: newStudentId,
      schoolId: activeSchoolId,
      userId: newUserId,
      classId: studentData.classId,
      parentId: studentData.parentId,
      level: studentData.level,
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      address: studentData.address || "Non renseignée",
      documents: [],
    };

    const newMembership: MockMembership = {
      id: "memb_" + Date.now(),
      userId: newUserId,
      schoolId: activeSchoolId,
      role: "student",
      createdAt: Date.now(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setStudents((prev) => [newStudent, ...prev]);
    setMemberships((prev) => [...prev, newMembership]);

    // Generer automatiquement un paiement frais de scolarité pour l'élève
    const newPayment: MockPayment = {
      id: "pay_" + Date.now(),
      schoolId: activeSchoolId,
      studentId: newStudentId,
      amount: activeSchoolId === "school_condorcet" ? 250 : 150,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "pending",
      description: "Frais d'inscription de scolarité",
    };
    setPayments((prev) => [newPayment, ...prev]);

    logSystemAction("CREATE_STUDENT", `Inscription de l'élève ${studentData.name}`, activeSchoolId);
    
    return { success: true };
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setUsers((prev) => prev.filter((u) => u.id !== student.userId));
      setMemberships((prev) => prev.filter((m) => !(m.userId === student.userId && m.schoolId === activeSchoolId)));
      logSystemAction("DELETE_STUDENT", `Suppression de l'élève ID: ${studentId}`, activeSchoolId);
    }
  };

  const addTeacher = (teacherData: Omit<MockTeacher, "id" | "schoolId" | "userId"> & { name: string; email: string }) => {
    const newUserId = "user_teacher_" + Date.now();
    const newTeacherId = "teacher_" + Date.now();

    const newUser: MockUser = {
      id: newUserId,
      name: teacherData.name,
      email: teacherData.email,
      isSuperAdmin: false,
      imageUrl: `https://images.unsplash.com/photo-${avatarHashes[Math.floor(Math.random() * avatarHashes.length)]}?q=80&w=200`,
      createdAt: Date.now(),
    };

    const newTeacher: MockTeacher = {
      id: newTeacherId,
      schoolId: activeSchoolId,
      userId: newUserId,
      subjects: teacherData.subjects,
      availability: teacherData.availability,
    };

    const newMembership: MockMembership = {
      id: "memb_" + Date.now(),
      userId: newUserId,
      schoolId: activeSchoolId,
      role: "teacher",
      createdAt: Date.now(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setTeachers((prev) => [newTeacher, ...prev]);
    setMemberships((prev) => [...prev, newMembership]);

    logSystemAction("CREATE_TEACHER", `Recrutement du Pr. ${teacherData.name}`, activeSchoolId);
  };

  const deleteTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher) {
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      setUsers((prev) => prev.filter((u) => u.id !== teacher.userId));
      setMemberships((prev) => prev.filter((m) => !(m.userId === teacher.userId && m.schoolId === activeSchoolId)));
      logSystemAction("DELETE_TEACHER", `Suppression de l'enseignant ID: ${teacherId}`, activeSchoolId);
    }
  };

  const addClass = (classData: Omit<MockClass, "id" | "schoolId" | "schedule">) => {
    const newClass: MockClass = {
      id: "class_" + Date.now(),
      schoolId: activeSchoolId,
      name: classData.name,
      level: classData.level,
      teacherId: classData.teacherId,
      schedule: [],
    };
    setClasses((prev) => [...prev, newClass]);
    logSystemAction("CREATE_CLASS", `Création de la classe ${classData.name}`, activeSchoolId);
  };

  const takeAttendance = (classId: string, date: string, records: { studentId: string; status: "present" | "absent" | "late"; remarks?: string }[]) => {
    // Supprimer l'ancienne présence pour cette classe et cette date
    setAttendance((prev) => prev.filter((a) => !(a.classId === classId && a.date === date && a.schoolId === activeSchoolId)));

    const newRecords: MockAttendance[] = records.map((r, idx) => ({
      id: `att_${Date.now()}_${idx}`,
      schoolId: activeSchoolId,
      studentId: r.studentId,
      classId,
      date,
      status: r.status,
      remarks: r.remarks,
      recordedBy: "teacher_alqalam",
    }));

    setAttendance((prev) => [...prev, ...newRecords]);
    logSystemAction("TAKE_ATTENDANCE", `Appel de classe enregistré pour le ${date}`, activeSchoolId);
  };

  const justifyAbsence = (
    attendanceId: string,
    remarks: string,
    newRecord?: { studentId: string; classId: string; date: string }
  ) => {
    if (attendanceId === "new" && newRecord) {
      const newAtt: MockAttendance = {
        id: `att_${Date.now()}`,
        schoolId: activeSchoolId,
        studentId: newRecord.studentId,
        classId: newRecord.classId,
        date: newRecord.date,
        status: "absent",
        remarks,
        recordedBy: "parent_alqalam",
      };
      setAttendance((prev) => [...prev, newAtt]);
      logSystemAction("JUSTIFY_ABSENCE", `Nouvelle absence justifiée enregistrée pour la date ${newRecord.date}`, activeSchoolId);
    } else {
      setAttendance((prev) =>
        prev.map((a) => (a.id === attendanceId ? { ...a, status: "absent" as const, remarks } : a))
      );
      logSystemAction("JUSTIFY_ABSENCE", `Justification enregistrée pour l'absence ID ${attendanceId}`, activeSchoolId);
    }
  };

  const createAssignment = (assignmentData: Omit<MockAssignment, "id" | "schoolId">) => {
    const newAssign: MockAssignment = {
      id: "assign_" + Date.now(),
      schoolId: activeSchoolId,
      ...assignmentData,
    };
    setAssignments((prev) => [newAssign, ...prev]);
    logSystemAction("CREATE_ASSIGNMENT", `Publication du devoir : ${assignmentData.title}`, activeSchoolId);
  };

  const payInvoice = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: "paid" as const, paidAt: Date.now() } : p))
    );
    logSystemAction("PAY_INVOICE", `Paiement scolarité reçu (ID: ${paymentId})`, activeSchoolId);
  };

  const createEvent = (eventData: Omit<MockEvent, "id" | "schoolId">) => {
    const newEv: MockEvent = {
      id: "event_" + Date.now(),
      schoolId: activeSchoolId,
      ...eventData,
    };
    setEvents((prev) => [newEv, ...prev]);
    logSystemAction("CREATE_EVENT", `Nouvel événement calendrier : ${eventData.title}`, activeSchoolId);
  };

  const sendMessage = (content: string, conversationId: string) => {
    const newMsg: MockMessage = {
      id: "msg_" + Date.now(),
      schoolId: activeSchoolId,
      conversationId,
      senderId: currentUser.id,
      content,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // SaaS Super Admin mutations
  const toggleSchoolStatus = (schoolId: string) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          const nextStatus = s.status === "active" ? ("suspended" as const) : ("active" as const);
          logSystemAction("SUSPEND_SCHOOL", `Statut de l'école ${s.name} passé à ${nextStatus}`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const changeSchoolPlan = (schoolId: string, plan: "basic" | "pro" | "enterprise") => {
    const quotas = { basic: 50, pro: 300, enterprise: 9999 };
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          logSystemAction("UPGRADE_SCHOOL_PLAN", `Abonnement de l'école ${s.name} upgradé vers ${plan}`);
          return { ...s, plan, maxStudentsQuota: quotas[plan] };
        }
        return s;
      })
    );
  };

  const updateSchoolDetails = (schoolId: string, name: string, address: string, primarySystem: string) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === schoolId) {
          logSystemAction("UPDATE_SCHOOL_SETTINGS", `Paramètres mis à jour pour l'école ${name}`);
          return {
            ...s,
            name,
            settings: {
              ...s.settings,
              address,
              primarySystem,
            },
          };
        }
        return s;
      })
    );
  };

  // Scoped metrics
  const getSchoolStats = () => {
    const schoolStudents = students.filter((s) => s.schoolId === activeSchoolId);
    const schoolTeachers = teachers.filter((t) => t.schoolId === activeSchoolId);
    const schoolPayments = payments.filter((p) => p.schoolId === activeSchoolId);
    const schoolAttendance = attendance.filter((a) => a.schoolId === activeSchoolId);
    const schoolLogs = auditLogs.filter((l) => l.schoolId === activeSchoolId);

    const studentsCount = schoolStudents.length;
    const teachersCount = schoolTeachers.length;
    const totalRevenue = schoolPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const absencesCount = schoolAttendance.filter((a) => a.status === "absent").length;
    const attendanceRate = schoolAttendance.length > 0
      ? Math.round(((schoolAttendance.length - absencesCount) / schoolAttendance.length) * 100)
      : 98;

    const recentActivity = schoolLogs.slice(0, 5).map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details,
      time: "Aujourd'hui",
    }));

    return {
      studentsCount,
      teachersCount,
      totalRevenue,
      attendanceRate,
      recentActivity,
    };
  };

  // Global MRR analytics for Super Admin
  const getSuperAdminStats = () => {
    const schoolsCount = schools.length;
    
    // MRR calculation based on active schools subscriptions
    const pricing = { basic: 49, pro: 129, enterprise: 499 };
    const totalMRR = schools
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + pricing[s.plan], 0);

    const activeUsersCount = users.length;
    
    const absences = attendance.filter((a) => a.status === "absent").length;
    const globalAttendanceRate = attendance.length > 0
      ? Math.round(((attendance.length - absences) / attendance.length) * 100)
      : 97;

    return {
      schoolsCount,
      totalMRR,
      activeUsersCount,
      globalAttendanceRate,
    };
  };

  return (
    <SchoolHubContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        currentUser,
        schools,
        activeSchoolId,
        setActiveSchoolId,
        activeSchool,
        users,
        memberships,
        students,
        teachers,
        parents,
        classes,
        attendance,
        assignments,
        submissions,
        grades,
        payments,
        conversations,
        messages,
        events,
        auditLogs,
        addStudent,
        deleteStudent,
        addTeacher,
        deleteTeacher,
        addClass,
        takeAttendance,
        justifyAbsence,
        createAssignment,
        payInvoice,
        createEvent,
        sendMessage,
        toggleSchoolStatus,
        changeSchoolPlan,
        updateSchoolDetails,
        getSchoolStats,
        getSuperAdminStats,
      }}
    >
      {children}
    </SchoolHubContext.Provider>
  );
}

export function useSchoolHub() {
  const context = useContext(SchoolHubContext);
  if (!context) {
    throw new Error("useSchoolHub must be used within a SchoolHubProvider");
  }
  return context;
}
