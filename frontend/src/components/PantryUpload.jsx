import React, { useRef } from 'react';

function PantryUpload({ imageBase64, setImageBase64 }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-card">
      <h3>Pantry Scan</h3>
      <p className="item-meta" style={{ marginBottom: '1rem' }}>
        Upload a photo of your spices/pantry so we don't buy what you already have.
      </p>
      
      <div 
        className="upload-zone"
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {imageBase64 ? (
          <img src={imageBase64} alt="Pantry Preview" className="preview-img" />
        ) : (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
            <p>Click to upload pantry photo</p>
          </div>
        )}
      </div>
      {imageBase64 && (
        <button 
          onClick={() => setImageBase64(null)} 
          className="btn" 
          style={{ background: 'transparent', border: '1px solid var(--border)', width: '100%', marginTop: '0.5rem' }}
        >
          Clear Image
        </button>
      )}
    </div>
  );
}

export default PantryUpload;
