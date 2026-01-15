
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Download, Trash2, Plus, Film, X } from 'lucide-react';
import { sliceImage, resizeImage } from '../utils/canvasUtils';
import UPNG from 'upng-js';
import WorkerScript from '../workers/imageProcessor.js?worker&url';
import StickerCollection from './StickerCollection';

const APNGMaker = ({
    collection,
    setCollection,
    mainImage,
    setMainImage,
    tabImage,
    setTabImage,
    onDelete,
    onClearAll
}) => {
    const [originalImage, setOriginalImage] = useState(null);
    const [frames, setFrames] = useState([]); // { id, dataUrl, originalCanvas? }
    const [sequence, setSequence] = useState([]); // Array of frame objects
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation Settings
    const [fps, setFps] = useState(10); // Max 20fps usually for stickers? Line constraint: Max 4 seconds.
    // Line: Max 4 seconds. Frame count: 5, 10, 15, 20.
    // Use loop count: 1, 2, 3, 4.
    const [loops, setLoops] = useState(0); // 0 = infinite (for preview), Line requires specific loops. 
    // Line specific: "Animation must loop 1, 2, 3, or 4 times, or not loop?"
    // Actually Line says: "Playback time: Max 4 secs". "Loop: specified number of times".

    const workerRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const animationRef = useRef(null);

    // Initialize Worker
    useEffect(() => {
        // @ts-ignore
        workerRef.current = new Worker(WorkerScript, { type: 'module' });

        workerRef.current.onmessage = (e) => {
            const { id, dataUrl } = e.data;
            setFrames(prev => {
                const newFrames = [...prev];
                const index = newFrames.findIndex(f => f.id === id);
                if (index !== -1) {
                    newFrames[index] = { ...newFrames[index], dataUrl, isProcessed: true };
                }
                return newFrames;
            });
        };

        return () => workerRef.current?.terminate();
    }, []);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            setOriginalImage(img);
            setIsProcessing(true);
            setFrames([]);
            setSequence([]);

            // 1. Slice (4x3 Grid)
            const slices = await sliceImage(img, { cols: 4, rows: 3, gap: 0 }); // Gap 0 for full coverage first

            // Initial frames state
            setFrames(slices);

            // 2. Batch Process (Green Screen Removal)
            slices.forEach(slice => {
                createImageBitmap(slice.originalCanvas).then(bitmap => {
                    workerRef.current.postMessage({
                        imageBitmap: bitmap,
                        id: slice.id,
                        targetColor: '#00FF00', // Auto Green
                        tolerance: 20,
                        smoothness: 5,
                        despill: true,
                        edgeErosion: 0
                    }, [bitmap]);
                });
            });

            setIsProcessing(false);
        };
    };

    const addToSequence = (frame) => {
        // Line Max Frames: 20
        if (sequence.length >= 20) {
            alert("Max 20 frames allowed for LINE Stickers.");
            return;
        }
        setSequence(prev => [...prev, { ...frame, uid: Date.now() + Math.random() }]);
    };

    const removeFromSequence = (index) => {
        setSequence(prev => prev.filter((_, i) => i !== index));
    };

    // Preview Logic
    useEffect(() => {
        if (!isPlaying || sequence.length === 0 || !previewCanvasRef.current) return;

        let frameIndex = 0;
        const interval = 1000 / fps;
        let lastTime = 0;

        const animate = (timestamp) => {
            if (!timestamp) timestamp = performance.now();
            if (timestamp - lastTime >= interval) {
                const ctx = previewCanvasRef.current.getContext('2d');
                const frame = sequence[frameIndex];

                const img = new Image();
                img.src = frame.dataUrl;
                img.onload = () => {
                    ctx.clearRect(0, 0, 320, 270);
                    // Draw checked bg
                    // ctx.fillStyle = '#ccc'; ...
                    // Just clear is fine for now, user sees checkerboard behind canvas
                    ctx.drawImage(img, 0, 0, 320, 270);
                };

                frameIndex = (frameIndex + 1) % sequence.length;
                lastTime = timestamp;
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, sequence, fps]);

    // Helper: Generate APNG Blob (Reused logic)
    const generateAPNGBuffer = async () => {
        const width = 320;
        const height = 270;
        const framesData = []; // Array of ArrayBuffers
        const delays = []; // Array of delays in ms

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        for (const frame of sequence) {
            const img = new Image();
            img.src = frame.dataUrl;
            await new Promise(r => img.onload = r);

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height).data.buffer;
            framesData.push(imageData);
            delays.push(1000 / fps);
        }

        return UPNG.encode(framesData, width, height, 0, delays);
    };

    const handleAddToCollection = async () => {
        if (sequence.length === 0) return;
        setIsProcessing(true);

        try {
            // 1. Generate APNG
            const apngBuffer = await generateAPNGBuffer();
            const blob = new Blob([apngBuffer], { type: 'image/png' });

            // 2. Convert to DataURL for Storage/Display
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const apngDataUrl = reader.result;

                // 3. Find Empty Slot
                setCollection(prev => {
                    const emptyIndex = prev.findIndex(item => item === null);
                    if (emptyIndex === -1) {
                        alert("Collection is full! Please delete some stickers.");
                        return prev;
                    }
                    const newCollection = [...prev];
                    newCollection[emptyIndex] = { id: Date.now(), dataUrl: apngDataUrl };
                    return newCollection;
                });

                // 4. Auto-Generate Main/Tab Images (from FIRST frame)
                // Only if they are currently empty
                const firstFrameUrl = sequence[0].dataUrl;

                if (!mainImage) {
                    const mainResized = await resizeImage(firstFrameUrl, 240, 240);
                    setMainImage({ id: 'main', dataUrl: mainResized });
                }

                if (!tabImage) {
                    const tabResized = await resizeImage(firstFrameUrl, 96, 74);
                    setTabImage({ id: 'tab', dataUrl: tabResized });
                }

                setIsProcessing(false);
            };

        } catch (error) {
            console.error("APNG Generation Failed", error);
            alert("Failed to create APNG");
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        if (sequence.length === 0) return;

        setIsProcessing(true);

        // Prepare frames for UPNG
        const width = 320;
        const height = 270;
        const framesData = []; // Array of ArrayBuffers
        const delays = []; // Array of delays in ms

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        for (const frame of sequence) {
            const img = new Image();
            img.src = frame.dataUrl;
            await new Promise(r => img.onload = r);

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height).data.buffer;
            framesData.push(imageData);
            delays.push(1000 / fps);
        }

        // UPNG.encode(imgs, w, h, cnum, delays)
        // cnum = 0 (lossless)
        const apngBuffer = UPNG.encode(framesData, width, height, 0, delays);

        const blob = new Blob([apngBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `sticker_anim_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsProcessing(false);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Left Panel: Source Grid & Frames */}
                <div className="flex-1 space-y-6">
                    {/* Upload Area */}
                    <div className="panel-bg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-purple-400" />
                                Source Image (4x3 Grid)
                            </h3>
                            {isProcessing && <span className="text-yellow-400 text-sm animate-pulse">Processing...</span>}
                        </div>

                        {!originalImage ? (
                            <label className="border-2 border-dashed border-gray-600 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-gray-400 text-sm">Upload 1280x810 Grid Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                            </label>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {frames.map((frame) => (
                                    <button
                                        key={frame.id}
                                        onClick={() => addToSequence(frame)}
                                        className="relative aspect-[320/270] bg-[#1a1a1a] rounded overflow-hidden hover:ring-2 hover:ring-purple-500 group"
                                    >
                                        <img src={frame.dataUrl} className="w-full h-full object-contain" alt={`Frame ${frame.id}`} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1 rounded">
                                            {frame.id}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Preview */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6">
                    {/* Preview */}
                    <div className="panel-bg p-6 sticky top-6">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Film className="w-5 h-5 text-purple-400" />
                            Preview & Export
                        </h3>

                        <div className="aspect-[320/270] bg-[url('https://media.discordapp.net/attachments/1113943781242318928/1113943890285838386/transparent-bg.png')] rounded-lg border border-gray-700 overflow-hidden mb-4 flex items-center justify-center">
                            <canvas ref={previewCanvasRef} width={320} height={270} className="w-full h-full object-contain" />
                        </div>

                        {/* Timeline / Sequence List */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Sequence ({sequence.length} frames)</span>
                                <button onClick={() => setSequence([])} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                            </div>
                            <div className="h-24 bg-slate-900 rounded p-2 flex gap-2 overflow-x-auto custom-scrollbar">
                                {sequence.length === 0 && <span className="text-xs text-gray-600 m-auto">Click frames to add</span>}

                                {sequence.map((frame, idx) => (
                                    <div key={frame.uid} className="relative min-w-[60px] h-full bg-[#2a2a2a] rounded overflow-hidden group">
                                        <img src={frame.dataUrl} className="w-full h-full object-cover" />
                                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-center text-white">{idx + 1}</span>
                                        <button
                                            onClick={() => removeFromSequence(idx)}
                                            className="absolute top-0 right-0 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">FPS</label>
                                <input
                                    type="number"
                                    value={fps}
                                    onChange={(e) => setFps(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-gray-700 rounded p-1 text-white text-sm"
                                    min="1" max="20"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Loops (0=Inf)</label>
                                <input
                                    type="number"
                                    value={loops}
                                    onChange={(e) => setLoops(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-gray-700 rounded p-1 text-white text-sm"
                                    min="0" max="4"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-slate-700 hover:bg-slate-600 text-white'
                                    }`}
                            >
                                <Play className={`w-4 h-4 ${isPlaying ? 'fill-current' : ''}`} />
                                {isPlaying ? 'Stop' : 'Play'}
                            </button>

                            <button
                                onClick={handleExport}
                                disabled={sequence.length === 0}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCollection}
                            disabled={sequence.length === 0}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-line-green hover:bg-green-600 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                            Add to Collection
                        </button>

                    </div>
                </div>
            </div>

            <div className="pb-8">
                <StickerCollection
                    collection={collection}
                    onDelete={onDelete}
                    onClearAll={onClearAll}
                    mainImage={mainImage}
                    setMainImage={setMainImage}
                    tabImage={tabImage}
                    setTabImage={setTabImage}
                />
            </div>
        </div>
    );
};

export default APNGMaker;
