/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Military, TAFResult } from "../types";

let ai: any = null;

function getAI() {
  if (ai) return ai;
  // Use professional pattern for Gemini API Key in AI Studio
  const apiKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  ai = new GoogleGenAI(apiKey);
  return ai;
}

export async function getWorkoutSuggestion(military: Military, lastResult: TAFResult) {
  try {
    const aiInstance = getAI();
    if (!aiInstance) {
      console.warn("Gemini API Key não configurada.");
      return null;
    }
    const prompt = `
      Você é um instrutor de educação física do Exército Brasileiro.
      Analise o seguinte desempenho no TAF e sugira um treino personalizado para melhorar os pontos fracos.

      Militar: ${military.rank} ${military.name}
      Idade: ${military.age}
      Sexo: ${military.sex}
      Linha de Ensino: ${military.teachingLine}
      
      Resultados Atuais:
      - Corrida: ${lastResult.results.run}m (Menção: ${lastResult.mentions.run})
      - Flexão: ${lastResult.results.pushUps} (Menção: ${lastResult.mentions.pushUps})
      - Abdominal: ${lastResult.results.sitUps} (Menção: ${lastResult.mentions.sitUps})
      - Barra: ${lastResult.results.pullUps} (Menção: ${lastResult.mentions.pullUps})
      - Menção Geral: ${lastResult.mentions.overall}

      Forneça as sugestões em formato JSON com a seguinte estrutura:
      {
        "analysis": "Breve análise do desempenho",
        "focusModalities": ["modalidade1", "modalidade2"],
        "weeklyPlan": [
          {"day": "Segunda", "workout": "detalhes"},
          {"day": "Terça", "workout": "detalhes"},
          ...
        ],
        "tips": ["dica1", "dica2"]
      }
    `;

    const response = await aiInstance.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao gerar sugestão de treino:", error);
    return null;
  }
}
