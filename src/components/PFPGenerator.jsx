import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import './PFPGenerator.css';

const PFPGenerator = ({ overlayImage, filters, onImageUpload, onRemoveImage }) => {
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
        generatePFP(e.target.result, overlayImage, filters); 
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

  const generatePFP = (imageSrc, overlaySrc, appliedFilters) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;

      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 200, 200, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      const { brightness = 100, contrast = 100, tint = 'transparent' } = appliedFilters;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      if (tint && tint !== 'transparent') {
        ctx.fillStyle = tint;
        ctx.globalAlpha = 0.3; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0; 
      }

      ctx.restore();

      if (overlaySrc) {
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
        overlayImg.src = overlaySrc;
      } else {
        setFinalImage(canvas.toDataURL('image/png')); 
      }
    };

    img.src = imageSrc;
  };

  useEffect(() => {
    if (baseImage) {
      generatePFP(baseImage, overlayImage, filters);
    }
  }, [overlayImage, filters, baseImage]);

  const downloadImage = () => {
    if (finalImage) {
      const link = document.createElement('a');
      link.download = 'arc-pfp.png';
      link.href = finalImage;
      link.click();
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

      {/* Show the remove button only if an image is uploaded */}
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
