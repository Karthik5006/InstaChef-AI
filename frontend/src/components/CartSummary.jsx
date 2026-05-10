import React, { useState } from 'react';

function CartSummary({ cart }) {
  const [ordered, setOrdered] = useState(false);

  if (!cart) return null;

  const handleCheckout = () => {
    // In reality, this would hit /api/confirm-order
    setOrdered(true);
  };

  if (ordered) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: 'var(--success)' }}>Order Confirmed!</h2>
        <p>Your Swiggy Instamart delivery will arrive in ~15 minutes.</p>
        <p className="item-meta" style={{ marginTop: '1rem' }}>Time to start prepping the ingredients you already have!</p>
      </div>
    );
  }

  // Handle mock cart shape
  const items = cart.items || cart || [];
  const total = cart.total || items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="flex-row">
          <span style={{ fontSize: '1.5rem' }}>🛍️</span>
          <h3>Instamart Cart Ready</h3>
        </div>
        <span className="badge badge-warning">Action Required</span>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
        {items.map((item, i) => (
          <div key={i} className="list-item" style={{ padding: '0.5rem 0' }}>
            <div>
              <div className="item-name">{item.name}</div>
              <div className="item-meta">For: {item.originalRecipeItem || item.name} ({item.unit})</div>
            </div>
            <div style={{ fontWeight: '600' }}>₹{item.price}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{total}</span>
        </div>
      </div>

      <button onClick={handleCheckout} className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem' }}>
        Confirm & Pay ₹{total}
      </button>
      <p className="item-meta" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
        Estimated delivery: 15-20 mins
      </p>
    </div>
  );
}

export default CartSummary;
