import React, { useState } from 'react';
import PFPGenerator from './components/PFPGenerator';

function App() {
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const handleImageUpload = () => {
    setIsImageUploaded(true);
  };

  const handleRemoveImage = () => {
    setIsImageUploaded(false);
  };

  return (
    <div className="app-container">
      <h1 className="custom-heading">
        /arc_pfp_generator
      </h1>

      <p className="subheading-text">
        upload your image, and let the arc touch transform it.
      </p>

      <PFPGenerator
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
      />  
      
    </div>
  );
}

export default App;
