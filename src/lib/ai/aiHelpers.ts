/**
 * SchoolHub AI Core Architecture & Helpers
 * Fichier préparant l'intégration future d'intelligence artificielle (LLM).
 * Ces modules de services pourront être directement branchés à l'API OpenAI, Claude ou Gemini.
 */

export interface AIExercisePrompt {
  classLevel: string; // "Primaire", "Collège", "Terminale", "Coranique"
  subject: string;     // "Mathématiques", "Arabe", "Tafsir"
  topic: string;       // "Fractions", "Mémorisation", etc.
  difficulty: "easy" | "medium" | "hard";
  count: number;
}

export interface AIExerciseResult {
  id: string;
  question: string;
  options?: string[]; // Pour les QCM
  correctAnswer: string;
  explanation: string;
}

/**
 * 1. GÉNÉRATEUR D'EXERCICES IA (MOCK COMPATIBLE GEMINI/OPENAI)
 */
export async function generateExercisesIA(prompt: AIExercisePrompt): Promise<AIExerciseResult[]> {
  // En production, cette fonction effectuera un appel Fetch vers un endpoint Next.js API route
  // avec un prompt structuré passé à un modèle (e.g. Gemini 1.5 Pro).
  
  console.log("Appel IA de génération d'exercices :", prompt);

  // Simulation de latence IA
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (prompt.subject === "Langue Arabe" || prompt.classLevel === "Coranique") {
    return [
      {
        id: "ex_ia_1",
        question: "Complétez le verset suivant de la sourate Al-Mulk : 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ ...'",
        options: ["أَحْسَنُ عَمَلًا", "أَكْثَرُ مَالًا", "أَقْوَى إِيمَانًا"],
        correctAnswer: "أَحْسَنُ عَمَلًا",
        explanation: "Le verset 2 de la sourate Al-Mulk se termine par 'أَحْسَنُ عَمَلًا' (le meilleur en œuvre).",
      },
      {
        id: "ex_ia_2",
        question: "Quelle est la signification du mot 'الغفور' dans le contexte théologique et linguistique ?",
        correctAnswer: "Le Pardonneur / Celui qui efface les péchés",
        explanation: "Dérivé de la racine Gha-Fa-Ra qui signifie couvrir ou protéger.",
      }
    ];
  }

  // Defaut Classique (ex: Mathématiques)
  return [
    {
      id: "ex_ia_1",
      question: "Simplifier la fraction suivante : 24 / 36.",
      options: ["2 / 3", "3 / 4", "4 / 6"],
      correctAnswer: "2 / 3",
      explanation: "En divisant le numérateur et le dénominateur par leur PGCD (12), on obtient 2/3.",
    },
    {
      id: "ex_ia_2",
      question: "Si un bus part à 08h30 et roule à 60 km/h pendant 45 minutes, quelle distance a-t-il parcourue ?",
      correctAnswer: "45 km",
      explanation: "Distance = Vitesse * Temps. 60 km/h * 0.75 h = 45 km.",
    }
  ];
}

export interface AIGradingPrompt {
  assignmentTitle: string;
  assignmentDescription: string;
  studentSubmission: string;
  maxScore: number;
}

export interface AIGradingResult {
  suggestedScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * 2. CORRECTION AUTOMATIQUE DE DEVOIRS IA
 */
export async function gradeHomeworkIA(prompt: AIGradingPrompt): Promise<AIGradingResult> {
  console.log("Appel IA d'aide à la correction :", prompt);

  // Simulation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    suggestedScore: Math.round(prompt.maxScore * 0.85), // Propose 17/20
    feedback: "L'élève a fourni un travail très structuré avec des réponses claires. La compréhension du sujet d'algèbre est évidente, bien que l'étape de factorisation sur le dernier exercice contienne une erreur de signe mineure.",
    strengths: [
      "Bonne rédaction générale.",
      "Compréhension solide des concepts clés.",
      "Raisonnement logique très bien détaillé."
    ],
    improvements: [
      "Faire attention aux changements de signes lors des factorisations complexes.",
      "Prendre le temps de relire les calculs arithmétiques simples."
    ]
  };
}

/**
 * 3. CHATBOT ASSISTANT SCOLAIRE IA
 */
export async function askSchoolHubIA(message: string, contextRole: string): Promise<string> {
  console.log(`Appel Chatbot IA (Role: ${contextRole}) :`, message);
  
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const msg = message.toLowerCase();
  
  if (msg.includes("absent") || msg.includes("présence")) {
    return "Sur SchoolHub, vous pouvez effectuer l'appel de vos élèves directement depuis l'onglet 'Présences' dans la barre de navigation. Les données sont ensuite enregistrées en temps réel et partagées avec la direction et les parents.";
  }
  
  if (msg.includes("devoir") || msg.includes("exercice")) {
    return "Pour créer un devoir, cliquez sur 'Créer un Devoir' dans l'onglet Devoirs. Vous pourrez alors spécifier le titre, le barème, la date de rendu, et l'affecter à une classe. Les élèves recevront une notification immédiate.";
  }

  return "Bonjour ! Je suis l'assistant intelligent de SchoolHub. Je peux vous guider dans l'utilisation de vos outils de gestion de classes, de feuilles d'appel numériques, de messagerie, ou vous aider à planifier vos devoirs.";
}
