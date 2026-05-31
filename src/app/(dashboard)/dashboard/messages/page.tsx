"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Megaphone, Users, Sparkles, Check, Paperclip } from "lucide-react";

export default function MessagesPage() {
  const { role, messages, users, sendMessage, activeSchoolId, conversations, memberships, currentUser } = useSchoolHub();
  const [activeChannel, setActiveChannel] = useState<"announcements" | "class">("announcements");
  const [typedMessage, setTypedMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scoped Multi-Tenant conversations wrapped in useMemo for stable references
  const schoolConversations = React.useMemo(() => conversations.filter(c => c.schoolId === activeSchoolId), [conversations, activeSchoolId]);
  const announcementsConv = React.useMemo(() => schoolConversations.find(c => c.isAnnouncement), [schoolConversations]);
  const classConv = React.useMemo(() => schoolConversations.find(c => !c.isAnnouncement && c.classId), [schoolConversations]);

  const activeConv = activeChannel === "announcements" ? announcementsConv : classConv;

  // Automatically scroll chat to bottom when a message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConv) return;

    sendMessage(
      typedMessage,
      activeConv.id
    );

    setTypedMessage("");
  };

  // Scoped Multi-Tenant Datasets wrapped in useMemo for rendering stability
  const schoolMessages = React.useMemo(() => messages.filter((m) => m.schoolId === activeSchoolId), [messages, activeSchoolId]);

  // Filter messages for active channel
  const filteredMessages = schoolMessages.filter((m) => m.conversationId === activeConv?.id);

  const isAdminOrSuper = role === "school_admin" || role === "super_admin";

  return (
    <div className="flex gap-6 font-sans w-full max-w-7xl mx-auto text-white h-[calc(100vh-160px)]">
      
      {/* 1. CHANNELS SIDE PANEL */}
      <div className="w-64 rounded-2xl glass-card border border-white/5 p-4 flex flex-col gap-5 shrink-0 hidden md:flex">
        <h3 className="font-extrabold text-sm border-b border-white/5 pb-3 text-zinc-100">Discussions</h3>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveChannel("announcements")}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChannel === "announcements"
                ? "bg-gradient-to-r from-purple-500/20 to-indigo-600/10 text-purple-400 border border-purple-500/20 scale-[1.02]"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            Annonces École
            <span className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          </button>

          <button
            onClick={() => setActiveChannel("class")}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeChannel === "class"
                ? "bg-gradient-to-r from-purple-500/20 to-indigo-600/10 text-purple-400 border border-purple-500/20 scale-[1.02]"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Classe 6ème Alpha
          </button>
        </div>

        {/* AI helper banner in channels */}
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 mt-auto flex flex-col gap-2">
          <span className="flex items-center gap-1 text-[10px] text-purple-400 font-extrabold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            ASSISTANT IA
          </span>
          <p className="text-[9.5px] text-zinc-500 leading-normal font-normal">
            Générez des réponses administratives formelles en un clic grâce à l'assistant IA intégré.
          </p>
        </div>
      </div>

      {/* 2. ACTIVE CHAT AREA */}
      <div className="flex-1 rounded-2xl glass-card border border-white/5 flex flex-col overflow-hidden relative">
        
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeChannel === "announcements" ? (
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
            ) : (
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Users className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-xs text-white">
                {activeChannel === "announcements" ? "Megaphone d'école • Annonces" : "Tableau d'échange • Classe 6ème Alpha"}
              </span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                {activeChannel === "announcements" ? "Réservé aux Administrateurs" : "Ouvert aux professeurs et élèves"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages thread feed */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">Aucun message dans cette discussion.</div>
          ) : (
            filteredMessages.map((m) => {
              const sender = users.find((u) => u.id === m.senderId) || users[0];
              const userMembership = memberships.find((memb) => memb.userId === sender.id && memb.schoolId === activeSchoolId);
              const senderRole = userMembership?.role || (sender.isSuperAdmin ? "super_admin" : "Membre");
              const isMe = sender.id === currentUser.id;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[75%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                >
                  <img
                    src={sender.imageUrl}
                    alt={sender.name}
                    className="w-8 h-8 rounded-full border border-purple-500/10 shrink-0 object-cover"
                  />
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wide px-1">
                      <span>{sender.name}</span>
                      <span>•</span>
                      <span className="text-purple-400">{senderRole}</span>
                    </div>

                    <div className={`p-3.5 rounded-2xl text-xs font-normal leading-relaxed ${
                      isMe 
                        ? "bg-gradient-to-tr from-purple-500/90 to-indigo-600/90 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/5 text-zinc-200 rounded-tl-none"
                    }`}>
                      {m.content}
                    </div>

                    <span className="text-[8px] text-zinc-600 font-bold self-end mt-0.5 flex items-center gap-0.5">
                      {mounted ? new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                      {isMe && <Check className="w-3 h-3 text-purple-400" />}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-zinc-950/45 flex items-center gap-3">
          <button
            type="button"
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          <input
            type="text"
            placeholder={
              activeChannel === "announcements" && !isAdminOrSuper
                ? "Lecture seule. Seuls les administrateurs peuvent publier."
                : "Rédigez votre message..."
            }
            disabled={activeChannel === "announcements" && !isAdminOrSuper}
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-grow bg-zinc-950 border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500/40 text-zinc-200 placeholder-zinc-700 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={activeChannel === "announcements" && !isAdminOrSuper}
            className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
