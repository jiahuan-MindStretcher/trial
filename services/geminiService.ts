
import { GoogleGenAI, Type } from "@google/genai";
import type { EvaluationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "A score from 0 to 10 evaluating the character drawing. 0 is completely wrong, 10 is perfect. A score of 7 or higher is considered correct."
        },
        feedback: {
            type: Type.STRING,
            description: "One short, constructive sentence of feedback for the student, in a encouraging tone. Point out one specific area for improvement (e.g., stroke order, proportion, a specific radical)."
        },
        isCorrect: {
            type: Type.BOOLEAN,
            description: "True if the score is 7 or higher, otherwise false. This determines if the user passes the challenge."
        },
    },
    required: ["score", "feedback", "isCorrect"]
};


export const evaluateCharacterDrawing = async (character: string, imageBase64: string): Promise<EvaluationResult> => {
    const prompt = `You are a strict but fair Chinese calligraphy teacher. The user is a beginner learning to write characters. They are trying to write the character "${character}". 
    
    Evaluate their submitted drawing based on these criteria:
    1.  **Stroke Order:** Does it appear to follow the basic rules?
    2.  **Proportions:** Are the components of the character balanced?
    3.  **Accuracy:** Does it look like the target character?

    Provide a score from 0 to 10. A score of 7 or higher means the character is recognizable and the student can pass. Provide one single sentence of constructive feedback. Be encouraging but specific. Finally, provide a boolean for whether it is correct (score >= 7).`;

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: 'image/png',
        },
    };

    const textPart = {
        text: prompt,
    };
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema,
                temperature: 0.2, // Lower temperature for more consistent scoring
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as EvaluationResult;
        return result;

    } catch (error) {
        console.error("Error evaluating character drawing:", error);
        throw new Error("Failed to get evaluation from Gemini API.");
    }
};
