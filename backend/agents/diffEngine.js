import Fuse from 'fuse.js';

export function calculateMissingIngredients(recipeIngredients, pantryItems) {
    // If no pantry items, everything is missing
    if (!pantryItems || pantryItems.length === 0) {
        return {
            have: [],
            missing: recipeIngredients,
            uncertain: []
        };
    }

    // Set up Fuse.js for fuzzy matching
    // We map pantry items to objects for Fuse
    const pantryList = pantryItems.map(item => ({ name: item }));
    
    const fuseOptions = {
        keys: ['name'],
        threshold: 0.4, // Lower is more strict. 0.4 allows some fuzziness
        includeScore: true
    };
    
    const fuse = new Fuse(pantryList, fuseOptions);

    const have = [];
    const missing = [];
    const uncertain = [];

    recipeIngredients.forEach(ingredient => {
        const results = fuse.search(ingredient.name);
        
        if (results.length > 0) {
            const bestMatch = results[0];
            // If score is very good (< 0.2), we assume we have it
            if (bestMatch.score < 0.25) {
                have.push({ ...ingredient, matchedWith: bestMatch.item.name });
            } 
            // If score is intermediate, put in uncertain
            else if (bestMatch.score < 0.4) {
                uncertain.push({ ...ingredient, potentialMatch: bestMatch.item.name });
            } 
            else {
                missing.push(ingredient);
            }
        } else {
            missing.push(ingredient);
        }
    });

    return { have, missing, uncertain };
}
