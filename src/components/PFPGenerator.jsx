import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import EasyCrop from 'react-easy-crop';
import './PFPGenerator.css';

import mintGreenArc from '../assets/overlays/mint_green_logo.png'; 
import texture from '../assets/overlays/texture.jpg'; 

const PFPGenerator = () => {
  const [baseImage, setBaseImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [generated, setGenerated] = useState(false);  // track if the final image is generated
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileUpload = useRef(null);
  const canvasRef = useRef(null);
  const processedImageRef = useRef(false);  // To prevent regenerating

  /********************************************** 
  image functions: upload, remove, download, crop
  ***********************************************/
  const uploadImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBaseImage(e.target.result);
        setGenerated(false);  // Reset generated state when a new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setBaseImage(null);
    setFinalImage(null);
    setGenerated(false);  // Reset generated state when the image is removed
    fileUpload.current.value = '';
    processedImageRef.current = false;
  };

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

  const cropImage = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  /**************************************** 
  image filters: BW, Halftone, Vignette
  *****************************************/
  const enhanceContrastAndConvertToBW = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    const brightnessBoost = 20;
    const contrastFactor = 2;
  
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY); // Max distance from center to the edge
  
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;  
      const y = Math.floor(i / 4 / width); 
  
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      const vignetteFactor = Math.min(1, distance / maxDistance);
  
      let r = data[i] + brightnessBoost;
      let g = data[i + 1] + brightnessBoost;
      let b = data[i + 2] + brightnessBoost;
  
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
  
      r = Math.max(0, r - vignetteFactor * 75);
      g = Math.max(0, g - vignetteFactor * 75); 
      b = Math.max(0, b - vignetteFactor * 75);
  
      const gray = Math.min(255, (r * 0.3 + g * 0.59 + b * 0.11) + 10);
  
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  
    ctx.putImageData(imageData, 0, 0);
  };
  

  const createHalftoneEffect = (ctx, width, height) => {
    const dotSpacing = 3;  
    const maxDotSize = 2; 
  
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  
    for (let y = 0; y < height; y += dotSpacing) {
      for (let x = 0; x < width; x += dotSpacing) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
  
        const dotSize = (1 - brightness / 255) * maxDotSize * 0.8;
  
        const noise = (Math.random() - 0.5) * 2;
  
        ctx.beginPath();
        ctx.arc(x + noise, y + noise, dotSize, 0, Math.PI * 2, false);
        ctx.fillStyle = 'black';
        ctx.fill();
      }
    }
  };  

  /**************************************** 
  Generate PFP Image
  *****************************************/
  const generatePFP = () => {
    if (!baseImage || processedImageRef.current) return; 
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000; 
      canvas.height = 1000; 

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const zoomedWidth = croppedAreaPixels.width * zoom;
      const zoomedHeight = croppedAreaPixels.height * zoom;

      ctx.drawImage(
        img, 
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 
        0, 
        canvas.width, 
        canvas.height 
      );

      enhanceContrastAndConvertToBW(ctx, canvas.width, canvas.height);
      createHalftoneEffect(ctx, canvas.width, canvas.height);

      const textureImg = new Image();
      textureImg.onload = () => {
        ctx.globalAlpha = 0.3; 
        ctx.drawImage(textureImg, 0, 0, canvas.width * 2, canvas.height * 2);
        ctx.globalAlpha = 1.0; // Reset globalalpha to default

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
      textureImg.src = texture;  
    };

    img.src = baseImage; 

    processedImageRef.current = true; 

    setGenerated(true);
  };


  /*********
  JSX Below
  **********/
  return (
    <div className="pfp-container">
      <div className="upload-area">
        <label>
          <Upload className="upload-icon" size={48} />
          <div className="upload-text">upload your image</div>
          <input
            ref={fileUpload}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={uploadImage}
          />
        </label>
      </div>

      {baseImage && (
        <button onClick={removeUploadedImage} className="remove-button">
          remove image
        </button>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {baseImage && !generated && (
        <div className="preview-parent">
          <div className="crop-container">
            <EasyCrop
              image={baseImage}
              crop={crop}
              zoom={zoom}
              aspect={1}  
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={cropImage}
            />
          </div>
        </div>
      )}

      {generated && (
        <div className="final-image-container">
          <img
            src={finalImage || baseImage}
            alt="Generated profile picture"
            className="preview-image"
          />
          <button onClick={downloadImage} className="download-button">
            Download Arc PFP
          </button>
        </div>
      )}

      {baseImage && !generated && (
        <div className="zoom-slider-container">
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="zoom-slider"
          />
          <div className="zoom-text">zoom: {zoom.toFixed(2)}</div>
        </div>
      )}

      {baseImage && !generated &&(
        <button onClick={generatePFP} className="generate-button">
              /generate_emblem
        </button>
      )}
    </div>
  );
};

export default PFPGenerator;
