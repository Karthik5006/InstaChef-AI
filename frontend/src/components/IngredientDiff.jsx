import React from 'react';

function IngredientDiff({ diff, recipeName }) {
  if (!diff) return null;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Recipe: {recipeName}</h3>
        <span className="badge badge-info">Autopilot Active</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✅</span> You Already Have
          </h4>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            {diff.have.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nothing detected in pantry.</div>
            ) : (
              diff.have.map((item, i) => (
                <div key={i} className="list-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">{item.quantity} {item.unit}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛒</span> Sourcing from Swiggy
          </h4>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            {diff.missing.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--success)' }}>You have everything!</div>
            ) : (
              diff.missing.map((item, i) => (
                <div key={i} className="list-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta badge badge-danger">Missing</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IngredientDiff;
