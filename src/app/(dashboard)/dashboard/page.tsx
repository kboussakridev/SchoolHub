"use client";

import React from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import ParentDashboard from "@/components/dashboard/ParentDashboard";

export default function DashboardHome() {
  const { role } = useSchoolHub();

  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "school_admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    default:
      return <AdminDashboard />;
  }
}
