import { GoogleGenAI } from "@google/genai";
import type { FormData, GeneratedData, KineticPoint, GroundingSource, RecipeSuggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
  
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (formData: FormData): string => {
  const monomerDetails = formData.monomers
    .map(m => `- Monomer: ${m.name} (Initial Concentration: ${m.concentration} mol/L)`)
    .join('\n');
    
  let reactivityRatioDetails = '';
  if (formData.reactivityRatios && formData.monomers.length === 2 && formData.reactivityRatios.r1 && formData.reactivityRatios.r2) {
    reactivityRatioDetails = `
    - Reactivity Ratio r1 (${formData.monomers[0].name}): ${formData.reactivityRatios.r1}
    - Reactivity Ratio r2 (${formData.monomers[1].name}): ${formData.reactivityRatios.r2}

    Critically, you must use these provided reactivity ratios to inform the simulation. The relative rates of monomer consumption and the resulting copolymer composition should directly reflect these values.
    `;
  }

  let ctaDetails = '';
  if (formData.chainTransferAgent && formData.ctaConcentration) {
    ctaDetails = `
    - Chain Transfer Agent (CTA): ${formData.chainTransferAgent}
    - CTA Concentration: ${formData.ctaConcentration} mol/L

    The presence of this Chain Transfer Agent is critical. You must model its effect by significantly reducing the polymer's molecular weight (Mn and Mw) compared to a system without it. The summary should explicitly mention chain transfer as a key mechanism controlling the chain length.
    `;
  }

  let solventDetails = '';
  if (formData.solvent && formData.solventVolume) {
    solventDetails = `
    - Solvent: ${formData.solvent}
    - Solvent Volume: ${formData.solventVolume} mL
    
    Consider the potential effects of the solvent on the reaction (e.g., solubility of monomers and polymer, chain transfer to solvent).
    `;
  }

  return `
    You are a world-class chemical kinetics expert specializing in polymer chemistry.
    Your task is to generate simulated, scientifically-plausible kinetic data for a specific polymerization reaction.
    The data must be grounded in established chemical principles.

    The simulation must accurately reflect the kinetic mechanism of the specified '${formData.reactionType}'. For instance:
    - For Free Radical Polymerization: Consider initiation, propagation, termination (combination/disproportionation), and chain transfer. Dispersity (Đ) is typically high (>1.5).
    - For Anionic Polymerization: Consider the initiation and propagation steps involving carbanions and the potential for "living" polymerization characteristics (linear increase in molecular weight with conversion, low dispersity). Dispersity should be close to 1.0.
    - For Cationic Polymerization: Model the kinetics based on carbocationic intermediates.
    - For Ring-Opening Polymerization: Base the simulation on the mechanism for the specific monomer and initiator (e.g., anionic, cationic, or catalytic).
    - For Condensation Polymerization: Model a step-growth mechanism, which involves the formation of a small byproduct (like H2O or HCl). The molecular weight should build up slowly until very high conversion is reached. The dispersity (Đ) should approach 2.0 at high conversion.

    Use Google Search to find relevant kinetic parameters and reaction behaviors to ensure the simulation is as realistic as possible for the chosen reaction type.

    Reaction Details:
${monomerDetails}
    - Initiator / Catalyst: ${formData.initiator}
    - Initiator Concentration: ${formData.initiatorConcentration} mol/L
${reactivityRatioDetails}
${ctaDetails}
${solventDetails}
    - Temperature: ${formData.temperature}°C

    Your task is to provide the output as a single, minified JSON object with NO markdown formatting (e.g., \`\`\`json). The JSON object must have these exact keys: "summary", "kineticData", and "sources".

    - "summary": A string containing a concise, expert-level summary (2-3 sentences) explaining the expected kinetic profile, including comments on reaction rate, molecular weight development, and dispersity, based on the provided parameters.
    - "kineticData": An array of objects. Each object represents a time point and must have the keys: "time" (number, in minutes), "conversion" (an object with monomer names and "overall" as keys, and their conversion percentages as number values), "molecularWeightMn" (number-average molecular weight, number), and "molecularWeightMw" (weight-average molecular weight, number). Generate at least 20 data points, continuing until at least 95% overall conversion is reached or the reaction plateaus.
    - "sources": An array of objects from Google Search grounding, where each object has "uri" and "title" keys.

    Ensure all numerical values are numbers, not strings. The final output must be only the JSON object.
    `;
};

export const generateKineticsData = async (formData: FormData): Promise<GeneratedData> => {
    const prompt = buildPrompt(formData);
    const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}]
        }
    });

    try {
        const jsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(jsonString);

        if (!parsedData.summary || !parsedData.kineticData) {
            throw new Error('Received incomplete data from the model.');
        }

        const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web?.uri) ?? [];
        
        return {
            summary: parsedData.summary,
            kineticData: parsedData.kineticData as KineticPoint[],
            sources: sources,
            inputs: formData,
        };
    } catch (e) {
        console.error("Failed to parse Gemini response:", e, "Raw response:", response.text);
        throw new Error("The model returned data in an unexpected format. Please try adjusting your inputs.");
    }
};

export const getAIRecommendation = async (formData: FormData, type: 'initiator' | 'recipe'): Promise<string | RecipeSuggestion> => {
  const model = 'gemini-2.5-flash';
  
  if (type === 'recipe') {
    const monomerDetails = formData.monomers.map(m => m.name).join(', ');
    const prompt = `
      You are an expert polymer chemist. Based on the following reaction type and monomers, suggest a complete, scientifically-plausible starting recipe.
      - Reaction Type: ${formData.reactionType}
      - Monomers: ${monomerDetails}

      Provide your response as a single, minified JSON object with NO markdown formatting. The JSON object must conform to the following TypeScript interface:
      
      interface RecipeSuggestion {
        monomerConcentrations: { name: string; concentration: string }[];
        initiator: string;
        initiatorConcentration: string;
        temperature: string;
        chainTransferAgent?: string | null;
        ctaConcentration?: string | null;
        solvent?: string | null;
        solventVolume?: string | null;
        justification: string; // A brief (2-3 sentences) scientific justification for your choices.
      }

      Ensure all values are strings. For monomerConcentrations, the names must exactly match the input monomer names: ${monomerDetails}. If a CTA or solvent is not typically used for this reaction, provide 'null' for those fields. The recipe should be a realistic starting point for a lab experiment.
    `;

    const response = await ai.models.generateContent({ model, contents: prompt });
    try {
      // Clean the response to ensure it's valid JSON
      const jsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const recipe = JSON.parse(jsonString);
      // Basic validation
      if (!recipe.justification || !recipe.monomerConcentrations) {
          throw new Error('AI response is missing required recipe fields.');
      }
      return recipe as RecipeSuggestion;
    } catch (e) {
      console.error("Failed to parse AI recipe suggestion:", e, "Raw response:", response.text);
      throw new Error("The AI provided a recipe in an invalid format. Please try again.");
    }

  } else { // 'initiator'
      const monomerDetails = formData.monomers.map(m => m.name).join(' and ');
      const prompt = `
        You are an expert polymer chemist. For a '${formData.reactionType}' of ${monomerDetails}, suggest 2-3 suitable initiators or catalysts.
        For each suggestion, provide a brief, one-sentence justification for its use.
        Format your response clearly, for example:
        * **Initiator Name:** Justification for its use.
      `;
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text;
  }
};