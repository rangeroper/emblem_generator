import React from 'react';
import PFPGenerator from './components/PFPGenerator';

function App() {
  return (
    <div className="app-container">
      <h1 className="custom-heading">
        /arc_emblem
      </h1>

      <p className="subheading-text">
        upload your image, and let the arc touch transform it.
      </p>

      <PFPGenerator />
    </div>
  );
}

export default App;
