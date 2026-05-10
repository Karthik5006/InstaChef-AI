import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'MOCK_KEY');

const pantrySchema = {
    type: SchemaType.OBJECT,
    properties: {
        items: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING, description: "Normalized ingredient name (e.g., 'basmati rice', 'onions', 'turmeric powder')" }
        }
    },
    required: ["items"]
};

export async function analyzePantry(imageBase64) {
    if (!imageBase64) return [];

    if (!process.env.GOOGLE_API_KEY) {
        console.warn("Using MOCK pantry vision due to missing GOOGLE_API_KEY");
        // Mock returning some common items
        return ["basmati rice", "salt", "turmeric powder", "onions"];
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: pantrySchema,
        }
    });

    const systemInstruction = `You are an Indian pantry scanner. List all food ingredients you can see in the image.
    Include Indian brand names if visible (MDH, Everest, Aashirvaad, etc.) but normalize the core ingredient name (e.g. 'Aashirvaad whole wheat atta' -> 'whole wheat flour', 'MDH Biryani Masala' -> 'biryani masala'). 
    Output as a JSON array of strings.`;

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: "image/jpeg" // We assume jpeg/png
        }
    };

    const result = await model.generateContent({
        contents: [
            { role: "user", parts: [{ text: systemInstruction }, imagePart] }
        ]
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed.items || [];
}
