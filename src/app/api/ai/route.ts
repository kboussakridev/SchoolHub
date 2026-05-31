import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, systemPrompt } = body;

    const apiKey = process.env.GROQ_API_KEY;
    const url = process.env.GROQ_URL || "https://api.groq.com/openai/v1/chat/completions";
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json(
        { error: "La clé GROQ_API_KEY n'est pas configurée dans les variables d'environnement." },
        { status: 500 }
      );
    }

    // Formulate payload for Groq OpenAI-compatible Chat API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt || "Tu es l'assistant IA de SchoolHub, une plateforme scolaire moderne. Réponds de manière professionnelle et concise en français." },
          { role: "user", content: typeof prompt === "string" ? prompt : JSON.stringify(prompt) },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API Groq:", errorText);
      return NextResponse.json(
        { error: `Erreur Groq: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "";
    
    return NextResponse.json({ result: reply });
  } catch (error: any) {
    console.error("Erreur de proxy AI:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
