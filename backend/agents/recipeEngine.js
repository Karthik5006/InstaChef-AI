import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'MISSING');

// Define the schema for the output
const recipeSchema = {
    type: SchemaType.OBJECT,
    properties: {
        dishName: { type: SchemaType.STRING },
        servings: { type: SchemaType.INTEGER },
        ingredients: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    quantity: { type: SchemaType.NUMBER },
                    unit: { type: SchemaType.STRING },
                    category: { type: SchemaType.STRING }
                },
                required: ["name", "quantity", "unit", "category"]
            }
        },
        instructions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
        }
    },
    required: ["dishName", "servings", "ingredients", "instructions"]
};

// --- Smart mock recipes for offline / API key failure fallback ---
const MOCK_RECIPES = {
    sambar: {
        dishName: "South Indian Sambar",
        servings: 4,
        ingredients: [
            { name: "toor dal", quantity: 200, unit: "g", category: "pantry" },
            { name: "tamarind", quantity: 30, unit: "g", category: "pantry" },
            { name: "tomatoes", quantity: 3, unit: "medium", category: "produce" },
            { name: "drumstick", quantity: 2, unit: "pieces", category: "produce" },
            { name: "sambar powder", quantity: 2, unit: "tbsp", category: "spice" },
            { name: "mustard seeds", quantity: 1, unit: "tsp", category: "spice" },
            { name: "curry leaves", quantity: 2, unit: "sprigs", category: "produce" },
            { name: "dry red chillies", quantity: 4, unit: "pieces", category: "spice" },
            { name: "turmeric powder", quantity: 0.5, unit: "tsp", category: "spice" },
            { name: "asafoetida", quantity: 0.25, unit: "tsp", category: "spice" },
            { name: "small onions", quantity: 10, unit: "pieces", category: "produce" },
            { name: "coconut oil", quantity: 2, unit: "tbsp", category: "pantry" }
        ],
        instructions: [
            "Soak tamarind in warm water and extract pulp.",
            "Pressure cook toor dal until soft and mushy.",
            "Cook drumstick and small onions with tamarind water and sambar powder.",
            "Add cooked dal and tomatoes, simmer for 15 minutes.",
            "Temper mustard seeds, curry leaves, dry red chillies in hot coconut oil.",
            "Add asafoetida to tempering and pour over sambar. Serve hot."
        ]
    },
    "butter chicken": {
        dishName: "Butter Chicken",
        servings: 4,
        ingredients: [
            { name: "chicken", quantity: 1, unit: "kg", category: "meat" },
            { name: "yogurt", quantity: 0.5, unit: "cup", category: "dairy" },
            { name: "butter", quantity: 4, unit: "tbsp", category: "dairy" },
            { name: "cream", quantity: 0.5, unit: "cup", category: "dairy" },
            { name: "tomato puree", quantity: 400, unit: "ml", category: "pantry" },
            { name: "ginger garlic paste", quantity: 2, unit: "tbsp", category: "pantry" },
            { name: "kashmiri red chilli powder", quantity: 2, unit: "tsp", category: "spice" },
            { name: "garam masala", quantity: 1, unit: "tsp", category: "spice" },
            { name: "kasuri methi", quantity: 1, unit: "tsp", category: "spice" },
            { name: "onions", quantity: 2, unit: "large", category: "produce" }
        ],
        instructions: [
            "Marinate chicken in yogurt and spices, rest for 4 hours.",
            "Grill or pan-fry chicken until charred.",
            "Cook onions, ginger garlic paste in butter.",
            "Add tomato puree and simmer 20 minutes.",
            "Blend sauce smooth, add cream and kasuri methi.",
            "Add chicken to sauce and simmer 10 minutes."
        ]
    },
    biryani: {
        dishName: "Hyderabadi Dum Biryani",
        servings: 4,
        ingredients: [
            { name: "basmati rice", quantity: 500, unit: "g", category: "pantry" },
            { name: "chicken", quantity: 1, unit: "kg", category: "meat" },
            { name: "onions", quantity: 4, unit: "large", category: "produce" },
            { name: "ginger garlic paste", quantity: 2, unit: "tbsp", category: "pantry" },
            { name: "biryani masala", quantity: 2, unit: "tbsp", category: "spice" },
            { name: "shah jeera", quantity: 1, unit: "tsp", category: "spice" },
            { name: "mint leaves", quantity: 1, unit: "bunch", category: "produce" },
            { name: "coriander leaves", quantity: 1, unit: "bunch", category: "produce" },
            { name: "yogurt", quantity: 1, unit: "cup", category: "dairy" },
            { name: "ghee", quantity: 4, unit: "tbsp", category: "dairy" },
            { name: "saffron", quantity: 1, unit: "pinch", category: "spice" }
        ],
        instructions: [
            "Marinate chicken with yogurt, spices, and ginger garlic paste for 2 hours.",
            "Parboil the basmati rice with whole spices until 70% cooked.",
            "Layer marinated chicken and parboiled rice in a heavy-bottomed pan.",
            "Cook on dum (sealed) for 40 minutes on low heat."
        ]
    }
};

function getMockRecipe(prompt) {
    const p = prompt.toLowerCase();
    for (const [key, recipe] of Object.entries(MOCK_RECIPES)) {
        if (p.includes(key)) return recipe;
    }
    return MOCK_RECIPES.biryani; // default
}

export async function generateRecipe(prompt) {
    const hasKey = process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'MISSING';

    if (!hasKey) {
        console.warn("No GOOGLE_API_KEY — using mock recipe engine");
        return getMockRecipe(prompt);
    }

    console.log("Calling Gemini for recipe:", prompt);

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
        }
    });

    const systemInstruction = `You are an expert Indian chef. Provide authentic regional Indian recipes. 
    Pay close attention to regional spice names. Return ONLY valid JSON matching the schema.
    Normalize ingredient names: use 'shah jeera' not 'black cumin', 'ghee' not 'clarified butter', 'toor dal' not 'pigeon pea'.`;

    try {
        const result = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: systemInstruction + "\n\nUser Request: " + prompt }] }
            ]
        });
        const text = result.response.text();
        console.log("✅ Gemini responded successfully for:", prompt);
        return JSON.parse(text);
    } catch (err) {
        console.error("❌ Gemini API error:", err.message);
        console.warn("Falling back to mock recipe for:", prompt);
        return getMockRecipe(prompt);
    }
}
