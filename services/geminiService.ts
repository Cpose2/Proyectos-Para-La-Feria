import { GoogleGenAI, Type } from "@google/genai";
import { Challenge, ChallengeType } from "../types";

// Helper to get random challenge type
const getRandomType = (): ChallengeType => {
  const types = [ChallengeType.MULTIPLE_CHOICE, ChallengeType.ORDER_LOGIC, ChallengeType.DEBUGGING];
  return types[Math.floor(Math.random() * types.length)];
};

export const generateChallenge = async (
  difficulty: string,
  topicContext: string = "lógica de programación básica"
): Promise<Challenge> => {
  // Fallback challenge: Much simpler, based on daily life logic
  const fallbackChallenge: Challenge = {
    type: ChallengeType.MULTIPLE_CHOICE,
    question: "Si quieres hacer un sándwich, ¿cuál es el primer paso lógico?",
    options: ["Comer el sándwich", "Sacar el pan y los ingredientes", "Lavar los platos", "Cerrar el sándwich"],
    correctAnswer: "Sacar el pan y los ingredientes",
    explanation: "Un algoritmo es una serie de pasos ordenados. Antes de hacer o comer nada, necesitas tener los materiales listos (inicialización).",
    difficulty: "easy"
  };

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API_KEY found, returning fallback challenge.");
    return fallbackChallenge;
  }

  const ai = new GoogleGenAI({ apiKey });
  const selectedType = getRandomType();

  // Updated prompt: Emphasizes absolute beginner level and strictly requires options for all types
  const prompt = `
    Genera un reto de pensamiento lógico y programación MUY BÁSICO para principiantes absoluta (niños o secundaria sin experiencia).
    Usa lenguaje natural y analogías de la vida real (recetas, instrucciones de juegos, robots simples). Evita sintaxis de código compleja.
    
    Tipo de reto seleccionado: ${selectedType}.
    
    Instrucciones específicas por tipo:
    1. Si es ORDER_LOGIC: Devuelve una lista de pasos desordenados en 'options' y la lista CORRECTAMENTE ordenada en 'correctAnswer'. Ejemplo: "Pasos para plantar un árbol".
    2. Si es DEBUGGING: Pon un pseudocódigo muy simple (3-4 líneas) en 'codeSnippet' con un error lógico obvio. En 'options' devuelve 4 frases, donde una identifica el error o la solución.
    3. Si es MULTIPLE_CHOICE: Pregunta de lógica simple, patrones o secuencias con 4 opciones en 'options'.
    
    IMPORTANTE: Siempre debe haber 4 'options' para DEBUGGING y MULTIPLE_CHOICE.
    
    Responde estrictamente en JSON con este esquema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: [ChallengeType.MULTIPLE_CHOICE, ChallengeType.ORDER_LOGIC, ChallengeType.DEBUGGING] },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }, 
            correctOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            difficulty: { type: Type.STRING },
          },
          required: ["question", "type", "explanation", "difficulty", "options"], // Added options as required
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const data = JSON.parse(text);

    // Normalize response to our internal Challenge interface
    let normalizedAnswer: string | string[] = data.correctAnswer;
    
    if (data.type === ChallengeType.ORDER_LOGIC && data.correctOrder) {
        normalizedAnswer = data.correctOrder;
    }

    return {
      question: data.question,
      type: data.type as ChallengeType,
      options: data.options || [], // Ensure options is never null
      correctAnswer: normalizedAnswer,
      explanation: data.explanation,
      codeSnippet: data.codeSnippet,
      difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackChallenge;
  }
};