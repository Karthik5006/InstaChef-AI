import { generateRecipe } from './recipeEngine.js';
import { analyzePantry } from './pantryVision.js';
import { calculateMissingIngredients } from './diffEngine.js';
import { SwiggyMcpClient } from './mcpClient.js';

export async function runAgentFlow(prompt, imageBase64) {
    console.log("Starting agent flow for:", prompt);
    
    // 1. Generate Recipe
    console.log("Generating recipe...");
    const recipe = await generateRecipe(prompt);
    
    // 2. Analyze Pantry
    console.log("Analyzing pantry image...");
    const pantryItems = await analyzePantry(imageBase64);
    
    // 3. Diff
    console.log("Calculating missing ingredients...");
    const diff = calculateMissingIngredients(recipe.ingredients, pantryItems);
    
    // 4. MCP Tools - Source missing items
    console.log("Sourcing missing items from Swiggy Instamart...");
    const mcpClient = new SwiggyMcpClient();
    await mcpClient.connect();

    const cartItems = [];
    for (const item of diff.missing) {
        // Search for the product
        const searchResults = await mcpClient.searchProducts(item.name);
        if (searchResults && searchResults.length > 0) {
            // Pick the first result for now
            const bestMatch = searchResults[0];
            cartItems.push({
                ...bestMatch,
                originalRecipeItem: item.name
            });
        }
    }

    // 5. Update Cart
    let cartState = null;
    if (cartItems.length > 0) {
        console.log("Updating Swiggy cart...");
        cartState = await mcpClient.updateCart(cartItems);
    }

    return {
        recipe,
        pantry: pantryItems,
        diff,
        cart: cartState
    };
}
