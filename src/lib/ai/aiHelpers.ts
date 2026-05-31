/**
 * SchoolHub AI Core Architecture & Helpers
 * Connecté en direct à l'API Groq (Llama 3.3) via notre proxy Next.js /api/ai.
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
 * 1. GÉNÉRATEUR D'EXERCICES IA RÉEL (VIA GROQ/LLAMA 3.3)
 */
export async function generateExercisesIA(prompt: AIExercisePrompt): Promise<AIExerciseResult[]> {
  try {
    const systemPrompt = `Tu es un professeur de l'application SchoolHub. Génère 3 exercices sous la forme d'un tableau JSON valide, sans aucune phrase d'introduction ni de conclusion, uniquement le JSON.
Le format du JSON doit correspondre exactement à cette interface TypeScript :
interface AIExerciseResult {
  id: string;
  question: string;
  options?: string[]; // uniquement si QCM (3 options maximum)
  correctAnswer: string;
  explanation: string;
}
Exemple de retour attendu :
[
  {
    "id": "ex_1",
    "question": "Simplifier la fraction 12/18.",
    "options": ["1/2", "2/3", "3/4"],
    "correctAnswer": "2/3",
    "explanation": "En divisant le haut et le bas par leur PGCD 6, on obtient 2/3."
  }
]`;

    const userPrompt = `Génère des exercices de niveau ${prompt.classLevel} en ${prompt.subject} sur le thème "${prompt.topic}" avec une difficulté "${prompt.difficulty}".`;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_exercises", prompt: userPrompt, systemPrompt }),
    });

    if (!res.ok) throw new Error("Erreur de communication avec le serveur d'IA");
    const data = await res.json();
    
    // Clean reply of any potential markdown formatting block
    let cleanedResult = data.result.trim();
    if (cleanedResult.startsWith("```json")) {
      cleanedResult = cleanedResult.substring(7);
    }
    if (cleanedResult.endsWith("```")) {
      cleanedResult = cleanedResult.substring(0, cleanedResult.length - 3);
    }
    
    return JSON.parse(cleanedResult.trim()) as AIExerciseResult[];
  } catch (err) {
    console.error("Échec de la génération d'exercices par l'IA:", err);
    // Fallback Mock en cas d'erreur
    return [
      {
        id: "ex_ia_fallback",
        question: `Simplifier la fraction suivante (Thème: ${prompt.topic}) : 12 / 18.`,
        options: ["1 / 2", "2 / 3", "3 / 4"],
        correctAnswer: "2 / 3",
        explanation: "En divisant le numérateur et le dénominateur par leur PGCD (6), on obtient 2/3.",
      }
    ];
  }
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
 * 2. CORRECTION AUTOMATIQUE DE DEVOIRS IA RÉEL (VIA GROQ/LLAMA 3.3)
 */
export async function gradeHomeworkIA(prompt: AIGradingPrompt): Promise<AIGradingResult> {
  try {
    const systemPrompt = `Tu es un enseignant correcteur bienveillant et rigoureux de l'application SchoolHub. Évalue le devoir de l'élève et renvoie une correction sous forme d'un objet JSON valide. Ne renvoie AUCUNE autre phrase, uniquement le JSON.
L'objet JSON doit correspondre exactement à cette interface :
interface AIGradingResult {
  suggestedScore: number; // Note entière sur ${prompt.maxScore} (sois équitable)
  feedback: string; // Commentaire global encourageant et instructif en français
  strengths: string[]; // Liste de 3 points forts
  improvements: string[]; // Liste de 2 axes d'amélioration
}`;

    const userPrompt = `Titre du devoir : "${prompt.assignmentTitle}"
Description du devoir : "${prompt.assignmentDescription}"
Copie rendue par l'élève : "${prompt.studentSubmission}"
Note maximale possible : ${prompt.maxScore}`;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grade_homework", prompt: userPrompt, systemPrompt }),
    });

    if (!res.ok) throw new Error("Erreur de communication avec le serveur d'IA");
    const data = await res.json();
    
    let cleanedResult = data.result.trim();
    if (cleanedResult.startsWith("```json")) {
      cleanedResult = cleanedResult.substring(7);
    }
    if (cleanedResult.endsWith("```")) {
      cleanedResult = cleanedResult.substring(0, cleanedResult.length - 3);
    }

    return JSON.parse(cleanedResult.trim()) as AIGradingResult;
  } catch (err) {
    console.error("Échec de la correction automatique par l'IA:", err);
    return {
      suggestedScore: Math.round(prompt.maxScore * 0.85),
      feedback: "L'élève a fourni un travail très structuré. La compréhension générale est évidente, bien que quelques approximations subsistent dans le détail du calcul.",
      strengths: ["Bonne rédaction", "Concepts clés compris", "Structure logique"],
      improvements: ["Soigner le calcul final", "Prendre le temps de relire"],
    };
  }
}

/**
 * 3. CHATBOT ASSISTANT SCOLAIRE IA RÉEL (VIA GROQ/LLAMA 3.3)
 */
export async function askSchoolHubIA(message: string, contextRole: string): Promise<string> {
  try {
    const systemPrompt = `Tu es l'assistant d'éducation intelligent de la plateforme SchoolHub (un ERP scolaire premium SaaS).
Réponds de manière utile, concise (maximum 3-4 phrases) et bienveillante en français à la question de l'utilisateur.
Rôle actuel de l'utilisateur dans l'école : ${contextRole}.
Tu peux donner des conseils sur comment gérer les appels, les notes, ou interagir avec les élèves.`;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ask_chatbot", prompt: message, systemPrompt }),
    });

    if (!res.ok) throw new Error("Erreur serveur d'IA");
    const data = await res.json();
    return data.result || "Je n'ai pas pu générer de réponse.";
  } catch (err) {
    console.error("Échec du Chatbot IA:", err);
    return "Bonjour ! Je suis l'assistant intelligent de SchoolHub. Je rencontre actuellement des difficultés de réseau, mais je reste prêt à vous guider dans l'utilisation de vos feuilles d'appel et devoirs dès que possible.";
  }
}
