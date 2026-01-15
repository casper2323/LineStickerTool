
import React, { useState, useEffect } from 'react';
import { Download, Trash2, Briefcase, PlusCircle, Plus, Minus, Play, Loader2, StopCircle } from 'lucide-react';
import { generateApng, resizeImage } from '../utils/canvasUtils';

const StickerWorkspace = ({ workspace, onDelete, onCollect, collectMode, setCollectMode, onUpdate, onClear, onPreview, onCollectResult }) => {
    // Helper to trigger download
    const triggerDownload = (dataUrl, fileName) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = (index) => {
        const sticker = workspace[index];
        if (!sticker) return;
        const fileName = `workspace_${String(index + 1).padStart(2, '0')}.png`;
        triggerDownload(sticker.dataUrl, fileName);
    };

    // Calculate Stats
    const validFrames = workspace.filter(f => f !== null);
    const [loopCount, setLoopCount] = useState(1);

    // Target Type State (sticker | main)
    const [targetType, setTargetType] = useState('sticker');

    // Base duration of one cycle
    const baseDuration = validFrames.reduce((acc, f) => acc + Number(f?.duration || 200), 0);
    // Total duration including loops
    const totalDuration = baseDuration * loopCount;
    const totalSeconds = (totalDuration / 1000).toFixed(1);

    // Preview Logic
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedApngUrl, setGeneratedApngUrl] = useState(null);
    const playTimeoutRef = React.useRef(null);

    // Reset generated APNG if workspace changes or loop count changes
    useEffect(() => {
        if (generatedApngUrl) {
            URL.revokeObjectURL(generatedApngUrl);
            setGeneratedApngUrl(null);
        }
        setIsPlaying(false);
        setPreviewSrc(null);
        if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    }, [workspace, loopCount]);

    // Set initial preview frame (static) or APNG if playing
    useEffect(() => {
        if (!isPlaying && !generatedApngUrl && validFrames.length > 0) {
            setPreviewSrc(validFrames[0].dataUrl);
            // Also ensure we clear any pending timeout if we stopped manually
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
        } else if (isPlaying && generatedApngUrl) {
            setPreviewSrc(generatedApngUrl);
        } else if (!isPlaying && !generatedApngUrl) {
            setPreviewSrc(null);
        }
    }, [isPlaying, generatedApngUrl, validFrames]);

    const handlePlayClick = async () => {
        // If stopping manually
        if (isPlaying) {
            setIsPlaying(false);
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

            if (validFrames.length > 0) {
                setPreviewSrc(validFrames[0].dataUrl);
            } else {
                setPreviewSrc(null);
            }
            return;
        }

        if (validFrames.length === 0) return;

        const startPlaying = (url) => {
            setPreviewSrc(url);
            setIsPlaying(true);

            // Auto-stop after total duration
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
            playTimeoutRef.current = setTimeout(() => {
                setIsPlaying(false);
                // After stopping, we revert to static frame automatically via the useEffect above
            }, totalDuration);
        };

        if (generatedApngUrl) {
            startPlaying(generatedApngUrl);
            return;
        }

        setIsGenerating(true);
        try {
            const framesToGenerate = Array.from({ length: loopCount }).flatMap(() => validFrames);
            const url = await generateApng(framesToGenerate);
            if (url) {
                setGeneratedApngUrl(url);
                startPlaying(url);
            } else {
                alert("Failed to generate preview.");
            }
        } catch (err) {
            console.error(err);
            alert("Error generating preview.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCollectClick = async () => {
        if (validFrames.length === 0) return;

        setIsGenerating(true);
        try {
            // Determine dimensions
            const width = targetType === 'main' ? 240 : 320;
            const height = targetType === 'main' ? 240 : 270;

            // Resize frames first
            const resizedFrames = await Promise.all(validFrames.map(async (frame) => {
                const resizedDataUrl = await resizeImage(frame.dataUrl, width, height);
                return { ...frame, dataUrl: resizedDataUrl };
            }));

            // Generate sequence
            // Note: We use resized frames for the APNG frames
            const framesToGenerate = Array.from({ length: loopCount }).flatMap(() => resizedFrames);
            const url = await generateApng(framesToGenerate);

            if (url) {
                // Fetch blob and convert to base64
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const target = targetType === 'main' ? 'main' : 'collection';
                    onCollectResult && onCollectResult(reader.result, true, target);
                };
                reader.readAsDataURL(blob);
            } else {
                alert("Failed to generate APNG for collection.");
            }
        } catch (err) {
            console.error(err);
            alert("Error collecting APNG.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="panel-bg p-6 mt-6">
            <div className="flex flex-col xl:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">
                            Workspace (工作區)
                        </h2>
                    </div>
                </div>
            </div>

            {/* Dashboard: Preview & Stats */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* 1. Preview Area */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-slate-300">預覽結果 (Preview)</h3>
                    <div className="w-48 h-48 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat relative">
                        {previewSrc ? (
                            <img
                                src={previewSrc}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <span className="text-slate-600 font-mono text-sm">No Frames</span>
                        )}

                        {/* Playback Controls */}
                        <div className="absolute bottom-2 right-2 flex gap-1">
                            <button
                                onClick={handlePlayClick}
                                disabled={isGenerating || validFrames.length === 0}
                                className={`p-1.5 rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-400' : 'bg-line-green hover:bg-emerald-400'} text-white shadow-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed`}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    isPlaying ? <StopCircle className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Area */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-slate-300">統計資訊 (Stats)</h3>
                    <div className="h-48 flex flex-col gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col justify-center min-w-[160px] h-full relative">

                            {/* Loop Count Control */}
                            <div className="mb-4">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1 block">播放次數 (Play Count)</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setLoopCount(Math.max(1, loopCount - 1))}
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-xl font-mono font-bold text-white w-8 text-center">{loopCount}</span>
                                    <button
                                        onClick={() => setLoopCount(Math.min(4, loopCount + 1))}
                                        className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-auto">
                                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Duration</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-mono font-bold ${totalSeconds > 4 ? 'text-red-400' : 'text-line-green'}`}>
                                        {totalSeconds}
                                    </span>
                                    <span className="text-sm text-slate-500 font-bold">s</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-2 mb-2">
                                    Count: {validFrames.length} frames<br />
                                    Limit: 4.0s
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Actions Area */}
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-bold text-slate-300">操作 (Actions)</h3>
                    <div className="h-48 flex flex-col justify-end gap-3 pb-1">

                        {/* Target Selection */}
                        <div className="flex flex-col gap-1.5 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="sticker"
                                    checked={targetType === 'sticker'}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    className="accent-blue-500 w-3.5 h-3.5"
                                />
                                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">貼圖圖片 <span className="text-slate-500">(320x270)</span></span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="main"
                                    checked={targetType === 'main'}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    className="accent-blue-500 w-3.5 h-3.5"
                                />
                                <span className="text-xs text-slate-300 group-hover:text-white transition-colors">主要圖片 <span className="text-slate-500">(240x240)</span></span>
                            </label>
                        </div>

                        <button
                            onClick={handleCollectClick}
                            disabled={isGenerating || validFrames.length === 0}
                            className="w-40 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-bold text-sm shadow-lg disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                            <PlusCircle className="w-4 h-4" />
                            收錄 (Collect)
                        </button>
                        <button
                            onClick={onClear}
                            className="w-40 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg transition-colors font-bold text-sm shadow-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                            清除 (Clear)
                        </button>
                    </div>
                </div>

                <div className="text-xs font-normal text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/30 h-fit self-end">
                    備註:<br />
                    -重複播放次數：每張貼圖1～4次（總播放時間不超過4秒）。<br />
                    -最長播放時間：每張貼圖4秒。
                </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                {workspace.map((sticker, index) => {
                    const slotNumber = String(index + 1).padStart(2, '0');
                    return (
                        <div key={index} className={`group relative bg - slate - 900 rounded - lg border aspect - square flex items - center justify - center ${sticker ? 'border-blue-500/50' : 'border-slate-800 border-dashed'} `}>

                            {!sticker && (
                                <span className="text-slate-600 font-mono text-lg">{slotNumber}</span>
                            )}

                            {sticker && (
                                <>
                                    <div className="relative w-full h-full p-2 flex items-center justify-center bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat overflow-hidden rounded">
                                        <img
                                            src={sticker.dataUrl}
                                            alt={`Workspace ${slotNumber} `}
                                            className="max-w-full max-h-full object-contain pointer-events-none"
                                        />
                                    </div>

                                    {/* Slot Number Badge */}
                                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded font-mono">
                                        {slotNumber}
                                    </div>



                                    <div className="absolute inset-x-1 bottom-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={() => handleDownload(index)}
                                            className="flex-1 bg-slate-800/90 hover:bg-blue-500/90 text-white text-[10px] font-bold py-1 rounded flex items-center justify-center backdrop-blur-sm shadow-sm"
                                            title="Download"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(index)}
                                            className="flex-1 bg-slate-800/90 hover:bg-red-500/90 text-white text-[10px] font-bold py-1 rounded flex items-center justify-center backdrop-blur-sm shadow-sm"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Duration Input */}
                                    <div className="absolute bottom-1 left-1 right-1 z-30">
                                        <div className="flex items-center bg-slate-900/90 rounded border border-slate-700 overflow-hidden h-8 shadow-lg">
                                            {/* Decrement Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    const current = sticker.duration || 200;
                                                    const newVal = Math.max(0, current - 100);
                                                    onUpdate && onUpdate(index, { duration: newVal });
                                                }}
                                                className="px-2 h-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border-r border-slate-700 flex items-center justify-center cursor-pointer"
                                                type="button"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            {/* Input */}
                                            <div className="flex-1 flex items-center justify-center min-w-0 px-1 h-full">
                                                <input
                                                    type="text"
                                                    value={sticker.duration || 200}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.target.focus();
                                                    }}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '') {
                                                            onUpdate && onUpdate(index, { duration: 0 });
                                                            return;
                                                        }
                                                        if (!/^\d+$/.test(val)) {
                                                            alert("請輸入數字！");
                                                            return;
                                                        }
                                                        onUpdate && onUpdate(index, { duration: Number(val) });
                                                    }}
                                                    className="w-full h-full bg-transparent text-white text-base font-bold text-center focus:outline-none font-mono"
                                                />
                                                <span className="text-xs text-slate-400 ml-0.5">ms</span>
                                            </div>

                                            {/* Increment Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    const current = sticker.duration || 200;
                                                    onUpdate && onUpdate(index, { duration: current + 100 });
                                                }}
                                                className="px-2 h-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border-l border-slate-700 flex items-center justify-center cursor-pointer"
                                                type="button"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default StickerWorkspace;
