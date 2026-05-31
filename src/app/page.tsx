"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, GraduationCap, Users, ArrowRight, Check, ChevronDown, Award, Star, MessageSquare, Sun, Moon } from "lucide-react";
import { useSchoolHub } from "@/components/providers/SchoolHubProvider";

export default function LandingPage() {
  const { theme, toggleTheme } = useSchoolHub();
  const router = useRouter();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setOpenFaq(openFaq === idx ? null : idx);

  const faqItems = [
    {
      q: "SchoolHub convient-il aux écoles classiques ainsi qu'aux écoles coraniques ?",
      a: "Absolument. SchoolHub a été conçu de manière modulaire. L'administration peut configurer les filières en mode 'Classique' (matières générales) et/ou 'Coranique / Arabe' (mémorisation, Tafsir, Tajwid). Les feuilles d'appel et devoirs s'adaptent instantanément.",
    },
    {
      q: "Comment fonctionne la gestion des 4 rôles utilisateurs ?",
      a: "Chaque utilisateur (Admin, Enseignant, Élève, Parent) dispose d'un espace de connexion sécurisé Clerk. Dès sa connexion, il est dirigé vers un tableau de bord sur-mesure contenant uniquement ses outils (appel rapide pour les profs, suivi multi-enfants pour les parents, devoirs pour les élèves).",
    },
    {
      q: "Est-il possible de tester l'application en mode Démonstration ?",
      a: "Oui ! SchoolHub intègre un mode 'Simulation' complet et immédiat. Vous pouvez changer de rôle à tout moment à l'aide du bouton flottant d'options en bas à droite pour prévisualiser l'ensemble des fonctionnalités.",
    },
    {
      q: "Les données sont-elles sauvegardées en temps réel ?",
      a: "Tout à fait. SchoolHub s'appuie sur Convex, une technologie de base de données réactive de pointe, permettant de propager toutes les modifications (messages, appels de présence, devoirs) en direct, sans aucun rafraîchissement de page.",
    },
  ];

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden relative"
      style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
    >
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] glow-violet opacity-50 pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] glow-indigo opacity-40 pointer-events-none -z-10" />

      {/* ─── HEADER ─── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md px-6 lg:px-12 h-20 flex items-center justify-between"
        style={{
          backgroundColor: "hsl(var(--background) / 0.85)",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))" }}
          >
            <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--primary-foreground))" }} />
          </div>
          <span className="font-extrabold text-lg tracking-wider gradient-text">SchoolHub</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
          <a href="#features" className="hover:opacity-80 transition-opacity" style={{ color: "hsl(var(--muted-foreground))" }}>Fonctionnalités</a>
          <a href="#mockup" className="hover:opacity-80 transition-opacity" style={{ color: "hsl(var(--muted-foreground))" }}>Aperçu</a>
          <a href="#pricing" className="hover:opacity-80 transition-opacity" style={{ color: "hsl(var(--muted-foreground))" }}>Tarifs</a>
          <a href="#faq" className="hover:opacity-80 transition-opacity" style={{ color: "hsl(var(--muted-foreground))" }}>FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
            title={theme === "dark" ? "Mode Clair" : "Mode Sombre"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Accéder au Dashboard
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative px-6 lg:px-12 pt-20 pb-16 flex flex-col items-center justify-center text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6"
          style={{
            backgroundColor: "hsl(var(--primary) / 0.1)",
            border: "1px solid hsl(var(--primary) / 0.25)",
            color: "hsl(var(--accent))",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Le SaaS Scolaire Tout-en-Un du Futur
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none font-display"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Gérez votre établissement scolaire avec une{" "}
          <span className="gradient-text font-black">fluidité absolue</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base max-w-2xl mt-6 leading-relaxed font-normal"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Une plateforme moderne et adaptative pour écoles classiques, privées et coraniques.
          Fédère l'administration, les enseignants, les élèves et les parents en temps réel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-xs font-bold shadow-xl cursor-pointer transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 10px 30px hsl(var(--primary) / 0.3)",
            }}
          >
            Lancer la Démo Interactive
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#mockup"
            className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-xs font-bold cursor-pointer transition-all duration-300"
            style={{
              backgroundColor: "hsl(var(--secondary))",
              color: "hsl(var(--secondary-foreground))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            Explorer l'Interface
          </a>
        </motion.div>
      </section>

      {/* ─── DASHBOARD VISUAL MOCKUP ─── */}
      <section id="mockup" className="px-6 lg:px-12 py-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="p-1 rounded-3xl shadow-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.15))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div
            className="rounded-[22px] p-6 flex flex-col gap-6 relative z-10"
            style={{ backgroundColor: "hsl(var(--card))" }}
          >
            <div
              className="flex justify-between items-center pb-4"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold font-mono ml-4 uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>
                  PREVIEW_ADMIN_DASHBOARD.PNG
                </span>
              </div>
              <span
                className="text-[9px] border px-2.5 py-0.5 rounded-full font-bold uppercase"
                style={{
                  backgroundColor: "hsl(var(--success) / 0.1)",
                  color: "hsl(var(--success))",
                  borderColor: "hsl(var(--success) / 0.3)",
                }}
              >
                Temps Réel Actif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Élèves inscrits", value: "124 élèves", sub: "+4 ce trimestre", subColor: "hsl(var(--success))" },
                { label: "Taux de présence", value: "96.5 %", sub: "Tendance positive", subColor: "hsl(var(--success))" },
                { label: "Recettes Scolarité", value: "12 450 €", sub: "Mensuel récurrent", subColor: "hsl(var(--accent))" },
              ].map((w) => (
                <div
                  key={w.label}
                  className="p-4 rounded-2xl glass-card flex flex-col justify-between h-28"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {w.label}
                  </span>
                  <span className="text-2xl font-black" style={{ color: "hsl(var(--foreground))" }}>
                    {w.value}
                  </span>
                  <span className="text-[9px] font-semibold" style={{ color: w.subColor }}>
                    {w.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="px-6 lg:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold font-display" style={{ color: "hsl(var(--foreground))" }}>
            Une architecture conçue pour tous les profils d'école
          </h2>
          <p className="text-sm mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            Découvrez nos modules hautement personnalisables adaptés à votre établissement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: "🏫", title: "Écoles Classiques", color: "hsl(var(--primary))", desc: "Suivi complet des matières générales, calcul automatique de moyennes, gestion de bulletins, et feuilles d'appel." },
            { emoji: "🕌", title: "Écoles Coraniques / Arabes", color: "hsl(var(--accent))", desc: "Suivi précis de la mémorisation (Sourates, versets), cours de langue arabe et Tajwid avec des rapports d'avancement détaillés." },
            { emoji: "🔒", title: "Sécurité & Rôles Intégrés", color: "hsl(var(--success))", desc: "Gestion fine des droits d'accès basée sur les rôles. Cryptage des données élèves et authentification premium via Clerk." },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl glass-card flex flex-col gap-3"
              style={{ border: "1px solid hsl(var(--border))" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: `${f.color}18` }}
              >
                {f.emoji}
              </div>
              <h4 className="font-extrabold text-sm mt-2" style={{ color: "hsl(var(--foreground))" }}>{f.title}</h4>
              <p className="text-[11px] leading-relaxed font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="px-6 lg:px-12 py-20 max-w-6xl mx-auto" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold font-display" style={{ color: "hsl(var(--foreground))" }}>
            Tarification Simple et Scalable
          </h2>
          <p className="text-sm mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            Choisissez le forfait adapté à la taille de votre structure scolaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div
            className="p-6 rounded-2xl glass-card flex flex-col justify-between gap-6 h-[400px]"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>STARTER</span>
              <h4 className="text-xl font-bold mt-1" style={{ color: "hsl(var(--foreground))" }}>École de Quartier</h4>
              <p className="text-[10.5px] mt-2 font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>Idéal pour les structures locales en phase de lancement.</p>
              <div className="flex items-baseline gap-1 mt-5">
                <span className="text-3xl font-black" style={{ color: "hsl(var(--foreground))" }}>49 €</span>
                <span className="text-[10px] font-bold uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>/ mois</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {["Jusqu'à 50 élèves", "Support par email sous 48h"].map((f) => (
                <span key={f} className="flex items-center gap-2.5 text-[10px] font-medium" style={{ color: "hsl(var(--card-foreground))" }}>
                  <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--accent))" }} /> {f}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-center py-3 rounded-xl font-bold text-xs cursor-pointer transition-all"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                color: "hsl(var(--secondary-foreground))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              Démarrer le test gratuit
            </button>
          </div>

          {/* Pro – Recommended */}
          <div
            className="p-6 rounded-2xl flex flex-col justify-between gap-6 h-[400px] relative glass-card"
            style={{ border: "2px solid hsl(var(--primary))" }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              RECOMMANDÉ
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--accent))" }}>PRO</span>
              <h4 className="text-xl font-bold mt-1" style={{ color: "hsl(var(--foreground))" }}>Établissement Privé</h4>
              <p className="text-[10.5px] mt-2 font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>Parfait pour les écoles privées en pleine croissance numérique.</p>
              <div className="flex items-baseline gap-1 mt-5">
                <span className="text-3xl font-black" style={{ color: "hsl(var(--foreground))" }}>129 €</span>
                <span className="text-[10px] font-bold uppercase" style={{ color: "hsl(var(--accent))" }}>/ mois</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {["Jusqu'à 300 élèves", "Toutes les fonctionnalités incluses", "Rapports PDF & Factures"].map((f) => (
                <span key={f} className="flex items-center gap-2.5 text-[10px] font-bold" style={{ color: "hsl(var(--card-foreground))" }}>
                  <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--accent))" }} /> {f}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-center py-3 rounded-xl font-bold text-xs shadow-lg cursor-pointer transition-all"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 8px 20px hsl(var(--primary) / 0.3)",
              }}
            >
              Essayer la version Pro
            </button>
          </div>

          {/* Enterprise */}
          <div
            className="p-6 rounded-2xl glass-card flex flex-col justify-between gap-6 h-[400px]"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>ENTERPRISE</span>
              <h4 className="text-xl font-bold mt-1" style={{ color: "hsl(var(--foreground))" }}>Multi-Écoles / Groupe</h4>
              <p className="text-[10.5px] mt-2 font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>Solution sur-mesure pour les réseaux scolaires et académies.</p>
              <div className="flex items-baseline gap-1 mt-5">
                <span className="text-3xl font-black" style={{ color: "hsl(var(--foreground))" }}>Sur devis</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {["Nombre d'élèves illimité", "Hébergement cloud dédié", "Support téléphonique 24h/7d"].map((f) => (
                <span key={f} className="flex items-center gap-2.5 text-[10px] font-medium" style={{ color: "hsl(var(--card-foreground))" }}>
                  <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--accent))" }} /> {f}
                </span>
              ))}
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-center py-3 rounded-xl font-bold text-xs cursor-pointer transition-all"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                color: "hsl(var(--secondary-foreground))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              Contacter le commercial
            </button>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-6 lg:px-12 py-20 max-w-4xl mx-auto" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <h2 className="text-3xl font-extrabold text-center font-display mb-12" style={{ color: "hsl(var(--foreground))" }}>
          Foire aux questions
        </h2>
        <div className="flex flex-col gap-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer"
                  style={{ color: "hsl(var(--card-foreground))" }}
                >
                  {item.q}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    style={{ color: isOpen ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))" }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-[11px] sm:text-xs leading-relaxed font-normal pt-3"
                      style={{
                        color: "hsl(var(--muted-foreground))",
                        borderTop: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--secondary))",
                      }}
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA & FOOTER ─── */}
      <section
        className="px-6 lg:px-12 py-20 text-center"
        style={{
          background: `linear-gradient(to top, hsl(var(--primary) / 0.1), transparent)`,
          borderTop: "1px solid hsl(var(--border))",
        }}
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display" style={{ color: "hsl(var(--foreground))" }}>
          Prêt à moderniser votre établissement ?
        </h2>
        <p className="text-sm max-w-xl mx-auto mt-4 leading-relaxed font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
          Inscrivez votre école dès aujourd'hui et commencez à digitaliser vos appels de présence, devoirs et messagerie.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold shadow-xl cursor-pointer transition-all duration-300 mx-auto mt-8"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))",
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 10px 30px hsl(var(--primary) / 0.3)",
          }}
        >
          Rejoindre SchoolHub Maintenant
          <ArrowRight className="w-4 h-4" />
        </button>

        <footer className="mt-20 pt-8 text-[10px] font-bold uppercase tracking-wider" style={{ borderTop: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          © 2026 SchoolHub • Tous droits réservés.
        </footer>
      </section>
    </div>
  );
}
