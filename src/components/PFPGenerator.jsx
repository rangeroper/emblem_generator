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

  /*************************** 
  image filters: BW, Halftone
  ***************************/
  const enhanceContrastAndConvertToBW = (ctx, width, height) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    const factor = 1.30; 
    const brightnessBoost = 30;
  
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
  
      // adjust brightness 
      let adjustedR = Math.min(255, r + brightnessBoost);
      let adjustedG = Math.min(255, g + brightnessBoost);
      let adjustedB = Math.min(255, b + brightnessBoost);
  
      // adjust contrast
      data[i] = Math.min(255, factor * (adjustedR - 128) + 128);
      data[i + 1] = Math.min(255, factor * (adjustedG - 128) + 128);
      data[i + 2] = Math.min(255, factor * (adjustedB - 128) + 128);
    }
  
    // convert to bw
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
  
    ctx.putImageData(imageData, 0, 0);
  };
  
  const createHalftoneEffect = (ctx, width, height) => {
    const dotSpacing = 6;
    const maxDotSize = 5;
  
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  
    for (let y = 0; y < height; y += dotSpacing) {
      for (let x = 0; x < width; x += dotSpacing) {
        const i = (y * width + x) * 4;
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
  
        const dotSize = Math.max(0, Math.pow((1 - brightness / 255), 0.9) * maxDotSize);
  
        const offsetX = (y % (2 * dotSpacing) === 0) ? 0 : dotSpacing / 2;
  
        if (dotSize > 0.1) { 
          ctx.beginPath();
          ctx.arc(x + offsetX, y, dotSize, 0, Math.PI * 2, false);
          ctx.fillStyle = 'black';
          ctx.fill();
        }
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
        ctx.globalAlpha = 0.2; 
        ctx.drawImage(textureImg, 0, 0, canvas.width * 2, canvas.height * 2);
        ctx.globalAlpha = 1.0; // Reset globalalpha to default

        const overlayImg = new Image();
        overlayImg.onload = () => {
          const overlaySize = canvas.width * 0.9;
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
      <div 
        className="upload-area"
        style={{
          backgroundColor: baseImage ? '#e0e0e0' : 'white', 
          borderColor: baseImage ? '#b0b0b0' : '#ccc', 
          cursor: baseImage ? 'not-allowed' : 'pointer' 
        }}
      >
        <label>
          <Upload 
            className="upload-icon" 
            size={48}
            style={{
              cursor: baseImage ? 'not-allowed' : 'pointer'
            }} 
          />
          <div 
            className="upload-text"
            style={{
              cursor: baseImage ? 'not-allowed' : 'pointer' 
            }}
          >
            upload your image
          </div>
          <input
            ref={fileUpload}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={uploadImage}
            disabled={baseImage !== null} 
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
            /download_emblem
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
