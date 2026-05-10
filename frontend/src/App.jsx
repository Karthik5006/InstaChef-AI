import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import PantryUpload from './components/PantryUpload';
import IngredientDiff from './components/IngredientDiff';
import CartSummary from './components/CartSummary';

function App() {
  const [imageBase64, setImageBase64] = useState(null);
  const [agentState, setAgentState] = useState({
    status: 'idle', // idle, analyzing, complete, error
    recipe: null,
    pantry: null,
    diff: null,
    cart: null,
    error: null
  });

  const handleAnalyze = async (prompt) => {
    // Always fully reset before a new request
    setAgentState({ status: 'analyzing', recipe: null, pantry: null, diff: null, cart: null, error: null });
    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageBase64 }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setAgentState({ status: 'complete', recipe: data.recipe, pantry: data.pantry, diff: data.diff, cart: data.cart, error: null });
    } catch (error) {
      console.error("Analysis failed:", error);
      setAgentState({ status: 'error', recipe: null, pantry: null, diff: null, cart: null, error: error.message });
    }
  };

  const handleReset = () => {
    setAgentState({ status: 'idle', recipe: null, pantry: null, diff: null, cart: null, error: null });
    setImageBase64(null);
  };

  return (
    <div className="app-container">
      {/* Left Column - Input */}
      <div className="left-panel">
        <div className="header-row glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', justifyContent: 'space-between' }}>
          <div className="header-row" style={{ marginBottom: 0 }}>
            <span className="status-indicator status-active"></span>
            <h2>InstaChef AI</h2>
          </div>
          {agentState.status !== 'idle' && (
            <button onClick={handleReset} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', boxShadow: 'none', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              🔄 New Search
            </button>
          )}
        </div>
        
        <PantryUpload 
          imageBase64={imageBase64} 
          setImageBase64={setImageBase64} 
        />
        
        <ChatInterface 
          onSend={handleAnalyze} 
          isLoading={agentState.status === 'analyzing'} 
          error={agentState.error}
        />
      </div>

      {/* Right Column - Results */}
      <div className="right-panel">
        {agentState.status === 'idle' && (
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Upload your pantry image and tell me what you want to cook.<br/>
              I'll build your shopping cart automatically.
            </p>
          </div>
        )}

        {agentState.status === 'analyzing' && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div className="loader" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
            <h3>Orchestrating AI Agents...</h3>
            <p className="item-meta">1. Generating Authentic Recipe</p>
            <p className="item-meta">2. Scanning Pantry Image</p>
            <p className="item-meta">3. Cross-referencing Ingredients</p>
            <p className="item-meta">4. Searching Swiggy Instamart</p>
          </div>
        )}

        {agentState.status === 'error' && (
          <div className="glass-card" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: 'var(--danger)' }}>Agent Error</h3>
            <p className="item-meta" style={{ marginTop: '0.5rem' }}>{agentState.error}</p>
            <button onClick={handleReset} className="btn" style={{ marginTop: '1.5rem' }}>Try Again</button>
          </div>
        )}

        {agentState.status === 'complete' && (
          <>
            <IngredientDiff diff={agentState.diff} recipeName={agentState.recipe?.dishName} />
            <CartSummary cart={agentState.cart} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
