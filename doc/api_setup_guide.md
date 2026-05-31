# 🎓 SchoolHub — Guide APIs & Statut Fonctionnel

## 🟢 Le site est 100% fonctionnel en mode Démo

**Sans aucune API externe**, le site tourne déjà avec :

- ✅ Toutes les données simulées (élèves, enseignants, présences, paiements, messages...)
- ✅ Changement de rôle en temps réel (Super Admin → Directeur → Prof → Élève → Parent)
- ✅ Multi-tenant — switching entre plusieurs écoles
- ✅ CRUD complet en mémoire (ajouter élève, prendre présence, créer devoir, payer facture...)
- ✅ Mode sombre / clair (palette Navy & Clotted Cream)
- ✅ Landing page, dashboards, messagerie, paramètres, emploi du temps...

> **Vous pouvez déjà faire une vraie démo client sans rien configurer.**  
> C'est le but du mode Mock — toutes les données sont gérées en mémoire dans `SchoolHubProvider`.

---

## 🔌 Les 3 APIs optionnelles pour la production

| Service | Utilité | Sans lui |
|---|---|---|
| **Clerk** | Authentification réelle (email, Google, SSO) | N'importe qui peut accéder au dashboard |
| **Convex** | Base de données réactive temps réel | Les données sont perdues au refresh de la page |
| **Stripe** | Paiements SaaS pour vos abonnements écoles | Les paiements restent simulés |

---

## ⚙️ Configuration — Étape par étape

### Pré-requis : fichier `.env.local`

Créez un fichier `.env.local` à la **racine du projet** (à côté de `package.json`) :

```
SchoolHub/
├── .env.local        ← créer ce fichier
├── package.json
├── src/
└── ...
```

---

### 1. 🔐 Clerk — Authentification (15 min)

**Pourquoi ?** Permet à vos utilisateurs (admins, profs, parents, élèves) de se connecter avec un vrai compte sécurisé.

**Étapes :**

1. Créez un compte sur [https://clerk.com](https://clerk.com)
2. Créez une nouvelle application → choisissez `Next.js`
3. Copiez vos clés depuis le tableau de bord Clerk
4. Ajoutez dans `.env.local` :

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

5. Relancez le serveur : `npm run dev`

> ✅ Le code est déjà entièrement prêt — Clerk s'active automatiquement dès que les clés sont présentes.  
> Sans les clés, le site reste accessible librement (mode démo).

---

### 2. 🗄️ Convex — Base de données temps réel (30 min)

**Pourquoi ?** Remplace les données en mémoire par une vraie base de données réactive.  
Les modifications (présences, messages, paiements) sont persistées et synchronisées en temps réel entre tous les utilisateurs connectés.

**Étapes :**

1. Créez un compte sur [https://convex.dev](https://convex.dev)
2. Dans un terminal, lancez :

```bash
npx convex dev
```

3. Suivez les instructions — Convex crée automatiquement votre projet
4. Ajoutez dans `.env.local` :

```env
NEXT_PUBLIC_CONVEX_URL=https://xxxxxxxx.convex.cloud
```

5. Migrez les données Mock vers les tables Convex (schéma à créer dans `convex/schema.ts`)

> ⚠️ Cette étape nécessite de réécrire les appels de données dans `SchoolHubProvider.tsx`  
> pour utiliser `useQuery` et `useMutation` de Convex à la place des états React locaux.

---

### 3. 💳 Stripe — Paiements SaaS (1-2 heures)

**Pourquoi ?** Permet de facturer automatiquement les abonnements des écoles (Basic 49€, Pro 129€, Enterprise 499€) et de gérer les renouvellements, les échecs de paiement, et les webhooks.

**Étapes :**

1. Créez un compte sur [https://stripe.com](https://stripe.com)
2. Créez vos produits et tarifs dans le dashboard Stripe
3. Ajoutez dans `.env.local` :

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. Créez les routes API Next.js pour gérer les webhooks Stripe :
   - `src/app/api/stripe/checkout/route.ts` — création de session
   - `src/app/api/stripe/webhook/route.ts` — gestion des événements

> ⚠️ Stripe est uniquement utile si vous vendez des abonnements SaaS directement depuis l'app.  
> Pour une démo ou une gestion manuelle des paiements, ce n'est pas nécessaire.

---

## 📁 Fichier `.env.local` complet

Voici le template complet avec toutes les variables d'environnement :

```env
# ─── CLERK (Authentification) ───────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_
CLERK_SECRET_KEY=sk_test_

# ─── CONVEX (Base de données temps réel) ────────────────────────────
NEXT_PUBLIC_CONVEX_URL=https://

# ─── STRIPE (Paiements SaaS) ────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_
STRIPE_WEBHOOK_SECRET=whsec_
```

> ⚠️ **Ne committez jamais ce fichier sur GitHub !**  
> Vérifiez que `.env.local` est bien dans votre `.gitignore`.

---

## 🗺️ Roadmap recommandée

```
Phase 1 — Démo / Portfolio      → Aucune API nécessaire ✅ (vous êtes ici)
Phase 2 — Beta privée           → Ajouter Clerk (accès sécurisé)
Phase 3 — Lancement produit     → Ajouter Convex (données persistées)
Phase 4 — Monétisation          → Ajouter Stripe (abonnements réels)
```

---

*Document généré le 24 mai 2026 — SchoolHub v0.1.0*
