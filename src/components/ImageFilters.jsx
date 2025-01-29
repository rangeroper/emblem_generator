import React, { useState, useEffect } from 'react';
import './ImageFilters.css';

const ImageFilters = ({ onFilterChange }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [tint, setTint] = useState('transparent');

  useEffect(() => {
    onFilterChange({ brightness: Number(brightness), contrast: Number(contrast), tint });
  }, [brightness, contrast, tint]);

  return (
    <div className="filters-container">
      <h3>adjust image filters</h3>

      <div className="filter-slider">
        <label>brightness</label>
        <input
          type="range"
          min="50"
          max="150"
          value={brightness}
          onChange={(e) => setBrightness(e.target.value)}
        />
      </div>

      <div className="filter-slider">
        <label>contrast</label>
        <input
          type="range"
          min="50"
          max="150"
          value={contrast}
          onChange={(e) => setContrast(e.target.value)}
        />
      </div>

      <div className="filter-buttons">
        <button onClick={() => setTint('rgba(255, 0, 0, 0.7)')}>red tint</button>
        <button onClick={() => setTint('rgba(0, 255, 0, 0.7)')}>green tint</button>
        <button onClick={() => setTint('rgba(0, 0, 255, 0.7)')}>blue tint</button>
        <button onClick={() => setTint('transparent')}>reset tint</button>
      </div>
    </div>
  );
};

export default ImageFilters;
