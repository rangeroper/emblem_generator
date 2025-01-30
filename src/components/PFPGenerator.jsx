import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import './PFPGenerator.css';

import mintGreenArc from '../assets/overlays/mint_green_logo.png'; // Update path if necessary
import texture from '../assets/overlays/texture.jpg'; // Add texture image path

const PFPGenerator = ({ onImageUpload, onRemoveImage }) => {
  const [baseImage, setBaseImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBaseImage(e.target.result);
        onImageUpload();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setBaseImage(null);
    setFinalImage(null);
    fileInputRef.current.value = '';
    onRemoveImage();
  };

  const generatePFP = () => {
    if (!baseImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set the canvas size to 1000x1000
      canvas.width = 800;
      canvas.height = 1080;

      // Convert image to grayscale and increase contrast
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      enhanceContrastAndConvertToBW(ctx, canvas.width, canvas.height);

      // Apply halftone (microdots) effect
      createHalftoneEffect(ctx, canvas.width, canvas.height);

      // Apply the mint green arc overlay
      const overlayImg = new Image();
      overlayImg.onload = () => {
        const overlaySize = canvas.width * 0.6;
        const aspectRatio = overlayImg.width / overlayImg.height;
        const overlayWidth = overlaySize;
        const overlayHeight = overlaySize / aspectRatio;

        ctx.drawImage(
          overlayImg,
          (canvas.width - overlayWidth) / 2,
          (canvas.height - overlayHeight) / 2,
          overlayWidth,
          overlayHeight
        );

        setFinalImage(canvas.toDataURL('image/png'));
      };
      overlayImg.src = mintGreenArc;
    };

    img.src = baseImage;
  };

  const enhanceContrastAndConvertToBW = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    // Apply contrast adjustment to 115% (reduced from 130%)
    const factor = 1.15; // Reduced contrast factor
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
  
      // Apply contrast
      data[i] = Math.min(255, factor * (r - 128) + 128);
      data[i + 1] = Math.min(255, factor * (g - 128) + 128);
      data[i + 2] = Math.min(255, factor * (b - 128) + 128);
    }
  
    // Convert to grayscale by averaging RGB values
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;   // Red channel
      data[i + 1] = avg; // Green channel
      data[i + 2] = avg; // Blue channel
    }
  
    // Apply the updated image data
    ctx.putImageData(imageData, 0, 0);
  };


  const createHalftoneEffect = (ctx, width, height) => {
    const dotSpacing = 6;  // Adjusted to reduce spacing between dots
    const maxDotSize = 5; // Maximum size of the halftone dot
  
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  
    // Apply halftone dots in a triangular (hexagonal) pattern
    for (let y = 0; y < height; y += dotSpacing) {
      for (let x = 0; x < width; x += dotSpacing) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
  
        // Adjust dot size based on brightness
        const dotSize = Math.max(0, (1 - brightness / 255) * maxDotSize);
  
        // Shift every other row to create a triangular (hexagonal) pattern
        const offsetX = (y % (2 * dotSpacing) === 0) ? 0 : dotSpacing / 2;
  
        // Draw the dot
        ctx.beginPath();
        ctx.arc(x + offsetX, y, dotSize, 0, Math.PI * 2, false);
        ctx.fillStyle = 'black'; // Black ink for the halftone effect
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    if (baseImage) {
      generatePFP();
    }
  }, [baseImage]);

  const downloadImage = () => {
    if (finalImage) {
      const link = document.createElement('a');
      link.download = 'arc-pfp.png';
      link.href = finalImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="pfp-container">
      <div className="upload-area">
        <label>
          <Upload className="upload-icon" size={48} />
          <div className="upload-text">upload your image</div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {baseImage && (
        <button onClick={handleRemoveImage} className="remove-button">
          remove image
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {baseImage && (
        <div className="preview-parent">
          <div className="preview-container">
            <img
              src={finalImage || baseImage}
              alt="Generated profile picture"
              className="preview-image"
            />
          </div>

          <button onClick={downloadImage} className="download-button">
            download arc pfp
          </button>
        </div>
      )}
    </div>
  );
};

export default PFPGenerator;
