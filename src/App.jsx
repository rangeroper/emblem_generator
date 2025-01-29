import React, { useState } from 'react';
import PFPGenerator from './components/PFPGenerator';
import OverlaySelector from './components/OverlaySelector';
import ImageFilters from './components/ImageFilters';

function App() {
  const [overlayImage, setOverlayImage] = useState(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, tint: 'transparent' });

  const handleOverlaySelect = (overlay) => {
    setOverlayImage(overlay); 
  };

  const handleImageUpload = () => {
    setIsImageUploaded(true); 
  };

  const handleRemoveImage = () => {
    setIsImageUploaded(false);
    setFilters({ brightness: 100, contrast: 100, tint: 'transparent' }); // Reset filters
  };

  return (
    <div className="app-container">
      <h1 className="custom-heading">
        /arc_pfp_generator
      </h1>

      <p className="subheading-text">
        upload your image, choose from the available filters, and add an overlay to give it that arc touch. lets evolve.
      </p>

      <PFPGenerator
        overlayImage={overlayImage}
        filters={filters}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage} 
      />

      {/* Conditionally render the ImageFilters and OverlaySelector only when image is uploaded */}
      {isImageUploaded && (
        <>
          <div className="filters-container">
            <ImageFilters onFilterChange={setFilters} /> {/* This will update filters state */}
          </div>

          <div className="overlay-selector-container">
            <OverlaySelector onSelectOverlay={handleOverlaySelect} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
