'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { IconZoomIn, IconZoomOut, IconRotateClockwise, IconCheck, IconX } from '@tabler/icons-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // width / height ratio, default 340 / 330
}

export function ImageCropperModal({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 340 / 330,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load image dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
  }, [imageSrc]);

  // Handle Dragging / Panning
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Execute Crop to Canvas
  const handleConfirmCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const targetWidth = 680; // High resolution output
    const targetHeight = Math.round(targetWidth / aspectRatio); // ~660px

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const cropBox = containerRef.current.getBoundingClientRect();
    const cropWidth = cropBox.width;
    const cropHeight = cropBox.height;

    const scaleFactor = targetWidth / cropWidth;

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    
    if (imgAspect > aspectRatio) {
      drawH = cropHeight * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = cropWidth * zoom;
      drawH = drawW / imgAspect;
    }

    const drawX = (offset.x * scaleFactor) - (drawW * scaleFactor) / 2;
    const drawY = (offset.y * scaleFactor) - (drawH * scaleFactor) / 2;

    ctx.drawImage(
      img,
      drawX,
      drawY,
      drawW * scaleFactor,
      drawH * scaleFactor
    );

    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `cropped_personnel_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        onCropComplete(file, previewUrl);
      }
    }, 'image/jpeg', 0.92);
  };

  const cropWindowWidth = 320;
  const cropWindowHeight = Math.round(cropWindowWidth / aspectRatio); // ~310px

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/10">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">ፎቶ ማስተካከያ (Crop Photo)</h3>
            <p className="text-xs text-slate-400">በሆም ፔጁ ላይ በሚታየው ልክ ፎቶውን ያስተካክሉ (Drag & Zoom)</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Interactive Crop Viewport */}
        <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-slate-950 p-6 select-none">
          
          {/* Crop Frame Box (Matches Homepage Card Aspect Ratio) */}
          <div
            ref={containerRef}
            style={{ width: cropWindowWidth, height: cropWindowHeight }}
            className="relative z-10 overflow-hidden rounded-2xl border-2 border-brand-blue shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {imageLoaded && imageRef.current && (
              <div
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <img
                  src={imageSrc}
                  alt="Crop Target"
                  className="max-w-none max-h-none object-cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
            
            {/* Guideline Grid */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col gap-4 border-t border-slate-800 bg-slate-900/90 p-5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
              className="text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <IconZoomOut size={18} />
            </button>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer accent-brand-blue"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <IconZoomIn size={18} />
            </button>
            
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="ml-2 rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white flex items-center gap-1 text-xs"
              title="Rotate Image"
            >
              <IconRotateClockwise size={16} /> Rotate
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              ሰርዝ (Cancel)
            </button>
            <button
              type="button"
              onClick={handleConfirmCrop}
              className="flex items-center gap-2 rounded-xl bg-[#014BAA] hover:bg-[#014BAA]/90 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all"
            >
              <IconCheck size={18} /> አረጋግጥ (Crop & Use)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
