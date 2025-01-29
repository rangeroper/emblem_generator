import React, { useState, useEffect } from 'react';
import './OverlaySelector.css';

const OverlaySelector = ({ onSelectOverlay }) => {
  const [overlays, setOverlays] = useState([]);

  useEffect(() => {
    const importOverlays = import.meta.glob('../assets/overlays/*.png'); 

    const overlayPromises = Object.keys(importOverlays).map((filePath) => {
      const overlayName = filePath
        .split('/')
        .pop()
        .replace('.png', '') 
        .replace(/_/g, ' '); 
      return importOverlays[filePath]().then((overlaySrc) => {
        return { name: overlayName, src: overlaySrc.default }; 
      });
    });

    Promise.all(overlayPromises).then((loadedOverlays) => {
      setOverlays(loadedOverlays);
    });
  }, []);

  const [selectedOverlay, setSelectedOverlay] = useState(null);

  const handleOverlayChange = (overlaySrc, overlayName) => {
    setSelectedOverlay(overlayName);
    onSelectOverlay(overlaySrc);
  };

  return (
    <div className="overlay-selector">
      <h3>select overlay</h3>
      <div className="radio-buttons">
        {overlays.map((overlay, index) => (
          <label key={index} className="radio-container">
            <input
              type="radio"
              name="overlay"
              value={overlay.name}
              onChange={() => handleOverlayChange(overlay.src, overlay.name)}
              checked={selectedOverlay === overlay.name}
            />
            <span className="radio-label">{overlay.name}</span>
            <img
              src={overlay.src}
              alt={overlay.name}
              className="overlay-image"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default OverlaySelector;
