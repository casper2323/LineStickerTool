import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const ColorPickerOverlay = ({ imageSrc, onColorPick, onCancel }) => {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    // Initial Draw (Optional, but good for debug)
    // Actually, we process clicks relative to the displayed image, 
    // but reading pixel data requires drawing to an offscreen canvas.
    // We can do this on-the-fly on click.

    const handleClick = (e) => {
        if (!imgRef.current) return;

        // Get coordinates relative to the IMAGE element
        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Scale to natural image size
        const naturalWidth = imgRef.current.naturalWidth;
        const naturalHeight = imgRef.current.naturalHeight;

        // displayed size
        const displayWidth = rect.width;
        const displayHeight = rect.height;

        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        // Check if click is actually on the image (it should be due to rect)
        // Draw to temp canvas to read pixel
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');

        // Draw ONLY the 1x1 pixel we need. optimization.
        // sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH
        const sx = Math.floor(x * scaleX);
        const sy = Math.floor(y * scaleY);

        ctx.drawImage(imgRef.current, sx, sy, 1, 1, 0, 0, 1, 1);

        const p = ctx.getImageData(0, 0, 1, 1).data;
        const hex = "#" + ("000000" + ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)).slice(-6);

        onColorPick(hex);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8">
            {/* Toolbar */}
            <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md pointer-events-auto shadow-xl border border-white/10">
                    <span className="font-bold mr-2">Pick Color Mode</span>
                    <span className="text-sm opacity-75">Click anywhere on the image</span>
                </div>
            </div>

            <button
                onClick={onCancel}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                title="Cancel"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {imageSrc && (
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Pick Color Source"
                        onClick={handleClick}
                        className="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl border border-slate-700/50"
                        style={{ imageRendering: 'auto' }}
                        // Drag disable to prevent ghosting
                        draggable={false}
                    />
                )}
            </div>
        </div>
    );
};

export default ColorPickerOverlay;
