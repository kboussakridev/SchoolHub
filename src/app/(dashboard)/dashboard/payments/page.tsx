"use client";

import React, { useState } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Search, ArrowUpRight, DollarSign, AlertCircle, CheckCircle, RefreshCw, SlidersHorizontal } from "lucide-react";

export default function PaymentsPage() {
  const { role, payments, students, users, payInvoice, activeSchoolId } = useSchoolHub();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [successPaymentId, setSuccessPaymentId] = useState<string | null>(null);

  const handlePay = (paymentId: string) => {
    payInvoice(paymentId);
    setSuccessPaymentId(paymentId);
    setTimeout(() => setSuccessPaymentId(null), 4000);
  };

  const isAdmin = role === "school_admin" || role === "super_admin";

  // Scoped Multi-Tenant Datasets wrapped in React.useMemo for rendering stability
  const schoolPayments = React.useMemo(() => payments.filter((p) => p.schoolId === activeSchoolId), [payments, activeSchoolId]);
  const schoolStudents = React.useMemo(() => students.filter((s) => s.schoolId === activeSchoolId), [students, activeSchoolId]);

  // Filter payments
  const filteredPayments = schoolPayments.filter((payment) => {
    const student = schoolStudents.find((s) => s.id === payment.studentId);
    const user = student ? users.find((u) => u.id === student.userId) : null;
    
    const matchesSearch = user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    // Si c'est un élève ou parent, il ne voit que ses propres factures (student_1 dans notre seed)
    const matchesUser = isAdmin || payment.studentId === "student_1";

    return matchesSearch && matchesStatus && matchesUser;
  });

  // Calculate aggregates
  const totalPaid = schoolPayments
    .filter((p) => p.status === "paid" && (isAdmin || p.studentId === "student_1"))
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = schoolPayments
    .filter((p) => p.status === "pending" && (isAdmin || p.studentId === "student_1"))
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = schoolPayments
    .filter((p) => p.status === "overdue" && (isAdmin || p.studentId === "student_1"))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-6 font-sans w-full max-w-7xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-400" />
            Comptabilité & Scolarité
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isAdmin 
              ? "Suivez l'état général des rentrées de frais de scolarité et gérez le grand livre."
              : "Suivez vos frais de scolarité mensuels et effectuez vos règlements sécurisés."}
          </p>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-card border border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">MONTANT ENCAISSÉ</span>
            <span className="text-2xl font-extrabold text-emerald-400">{totalPaid} €</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">SCOLARITÉ EN ATTENTE</span>
            <span className="text-2xl font-extrabold text-amber-400">{totalPending} €</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">IMPAYÉS EN RETARD</span>
            <span className="text-2xl font-extrabold text-red-400">{totalOverdue} €</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {successPaymentId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 animate-bounce" />
            Le paiement en ligne simulé a été traité avec succès et enregistré dans l'état comptable !
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par description ou élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/5 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/40"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-purple-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-white/5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="overdue">Impayé</option>
          </select>
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="rounded-2xl glass-card border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-bold uppercase tracking-wider">
                {isAdmin && <th className="py-4 px-5">Élève</th>}
                <th className="py-4 px-5">Libellé / Facture</th>
                <th className="py-4 px-5">Date d'Échéance</th>
                <th className="py-4 px-5">Statut</th>
                <th className="py-4 px-5">Montant</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-zinc-500 font-medium">
                    Aucune facture enregistrée sous ces critères.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const student = schoolStudents.find((s) => s.id === p.studentId);
                  const user = student ? users.find((u) => u.id === student.userId) : null;
                  
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors font-medium">
                      {isAdmin && (
                        <td className="py-4 px-5 flex items-center gap-3">
                          <img
                            src={user?.imageUrl}
                            alt={user?.name}
                            className="w-7 h-7 rounded-full object-cover border border-purple-500/20"
                          />
                          <span className="font-bold text-zinc-200">{user?.name}</span>
                        </td>
                      )}
                      <td className="py-4 px-5 text-zinc-300">
                        {p.description}
                      </td>
                      <td className="py-4 px-5 text-zinc-400 font-mono">
                        {p.dueDate}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          p.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                          p.status === "overdue" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {p.status === "paid" ? "Payée" : p.status === "overdue" ? "Retard" : "En attente"}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-extrabold text-zinc-100 font-mono">
                        {p.amount} €
                      </td>
                      <td className="py-4 px-5 text-right">
                        {p.status !== "paid" ? (
                          <button
                            onClick={() => handlePay(p.id)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-purple-500/15 cursor-pointer transition-all inline-flex items-center gap-1.5"
                          >
                            Régler
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-semibold italic">Reçu archivé</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
