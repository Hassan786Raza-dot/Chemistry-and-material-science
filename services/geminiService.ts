
import { GoogleGenAI } from "@google/genai";
import type { FormData, GeneratedData, KineticPoint, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (formData: FormData): string => {
  return `
    You are a world-class chemical kinetics expert specializing in polymer chemistry.
    Your task is to generate simulated, scientifically-plausible kinetic data for a specific polymerization reaction.
    The data should be grounded in established chemical principles and reflect typical behavior for the given conditions.
    Use Google Search to find relevant kinetic parameters and reaction behaviors to ensure the simulation is as realistic as possible.

    Reaction Details:
    - Monomer: ${formData.monomer}
    - Initiator: ${formData.initiator}
    - Reaction Type: ${formData.reactionType}
    - Initial Monomer Concentration: ${formData.monomerConcentration} mol/L
    - Initial Initiator Concentration: ${formData.initiatorConcentration} mol/L
    - Temperature: ${formData.temperature} °C

    Output Requirements:
    Provide a response in a strict JSON format. Do not include any text, explanations, or markdown formatting outside of the JSON object.
    The JSON object must have two keys: "summary" and "kineticData".

    1.  "summary": A concise, one-paragraph scientific summary explaining the expected kinetic behavior of this reaction under these conditions. Mention factors like initiation, propagation, termination, and how the chosen conditions might affect the reaction rate and polymer properties.
    2.  "kineticData": An array of at least 20 data points simulating the reaction over time. Each object in the array should represent a time point and contain three keys:
        - "time" (number): Time in minutes. Start from 0 and go up to a point where the reaction approaches completion (e.g., >95% conversion). The time intervals should be realistic.
        - "conversion" (number): Monomer conversion as a percentage (from 0 to 100).
        - "molecularWeight" (number): Number-average molecular weight (Mn) in g/mol. This should generally increase with conversion.

    Example of the required JSON structure:
    {
      "summary": "The free radical polymerization of styrene initiated by AIBN at 60°C is expected to exhibit classical kinetics...",
      "kineticData": [
        { "time": 0, "conversion": 0, "molecularWeight": 0 },
        { "time": 10, "conversion": 15.5, "molecularWeight": 25000 },
        { "time": 20, "conversion": 28.2, "molecularWeight": 45000 },
        ...
      ]
    }
  `;
};

export const generateKineticsData = async (formData: FormData): Promise<GeneratedData> => {
  const prompt = buildPrompt(formData);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: 'application/json' is not allowed with googleSearch
      },
    });
    
    // Clean and parse the response text
    let jsonText = response.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    
    const parsedData = JSON.parse(jsonText) as { summary: string; kineticData: KineticPoint[] };

    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundingSource[] = rawSources
      .map((s: any) => s.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ uri: web.uri, title: web.title }));

    return {
      summary: parsedData.summary,
      kineticData: parsedData.kineticData,
      sources: sources,
    };
  } catch (error) {
    console.error("Error calling or parsing Gemini API response:", error);
    throw new Error("The model returned an invalid or unparsable response.");
  }
};
