
import React, { useState } from 'react';
import { Download, Image as ImageIcon, Archive, PlusCircle } from 'lucide-react';
import JSZip from 'jszip';

const StickerGrid = ({ images = [], isPickingColor = false, onColorPick, onCollect, collectMode, setCollectMode }) => {
    const [isZipping, setIsZipping] = useState(false);

    // Native Download Helper
    // 使用原生 DOM 方式觸發下載，解決檔名亂碼或無效問題
    // Use native DOM element validation to ensure filenames are respected
    const triggerDownload = (href, fileName) => {
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Individual Download
    const handleDownload = (dataUrl, id) => {
        const fileName = String(id).padStart(2, '0') + '.png';
        triggerDownload(dataUrl, fileName);
    };

    // Batch Download (ZIP)
    const handleDownloadAll = async () => {
        if (!images || images.length === 0) return;

        setIsZipping(true);
        const zip = new JSZip();
        const folder = zip.folder("stickers");

        images.forEach((img) => {
            const base64Data = img.dataUrl.split(',')[1];
            const fileName = String(img.id).padStart(2, '0') + '.png';
            folder.file(fileName, base64Data, { base64: true });
        });

        try {
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            triggerDownload(url, "stickers_result.zip");
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("Failed to zip:", err);
            alert("Failed to create ZIP file.");
        } finally {
            setIsZipping(false);
        }
    };

    const handleImageClick = (e, img) => {
        if (!isPickingColor || !onColorPick) return;

        // Prevent download or other actions
        e.preventDefault();
        e.stopPropagation();

        // Get Original Canvas from the image object
        // NOTE: 'img' here refers to the processed image object. 
        // We assume it still holds the 'originalCanvas' reference from the slicing step.
        // If not, we can't extract the original color.
        const canvas = img.originalCanvas;
        if (!canvas) {
            console.warn("No original canvas found for eyedropper");
            return;
        }

        // Calculate click position relative to the displayed image
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Scale coordinates to actual canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = Math.floor(x * scaleX);
        const canvasY = Math.floor(y * scaleY);

        // Get pixel color
        const ctx = canvas.getContext('2d');
        const p = ctx.getImageData(canvasX, canvasY, 1, 1).data;

        // RGB to Hex
        const hex = "#" + ("000000" + ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)).slice(-6);

        onColorPick(hex);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="panel-bg p-6">
            <div className="flex flex-col xl:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2 w-full xl:w-auto justify-center xl:justify-start">
                    <ImageIcon className="w-5 h-5 text-line-green" />
                    <h2 className="text-lg font-bold text-white">Stickers Result (結果)</h2>
                </div>

                {/* Collection Mode Switch */}
                <div className="flex flex-wrap justify-center gap-4 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50 w-full xl:w-auto">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded hover:bg-slate-700/50 transition-colors">
                        <input
                            type="radio"
                            name="collectMode"
                            value="stickers"
                            checked={collectMode === 'stickers'}
                            onChange={(e) => setCollectMode(e.target.value)}
                            className="w-4 h-4 text-line-green bg-slate-800 border-slate-600 focus:ring-line-green"
                        />
                        <span className={`text-sm font-medium ${collectMode === 'stickers' ? 'text-white' : 'text-slate-400'}`}>貼圖圖片 (預設)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded hover:bg-slate-700/50 transition-colors">
                        <input
                            type="radio"
                            name="collectMode"
                            value="main"
                            checked={collectMode === 'main'}
                            onChange={(e) => setCollectMode(e.target.value)}
                            className="w-4 h-4 text-line-green bg-slate-800 border-slate-600 focus:ring-line-green"
                        />
                        <span className={`text-sm font-medium ${collectMode === 'main' ? 'text-white' : 'text-slate-400'}`}>主要圖片</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded hover:bg-slate-700/50 transition-colors">
                        <input
                            type="radio"
                            name="collectMode"
                            value="tab"
                            checked={collectMode === 'tab'}
                            onChange={(e) => setCollectMode(e.target.value)}
                            className="w-4 h-4 text-line-green bg-slate-800 border-slate-600 focus:ring-line-green"
                        />
                        <span className={`text-sm font-medium ${collectMode === 'tab' ? 'text-white' : 'text-slate-400'}`}>標籤圖片</span>
                    </label>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-end">
                    <button
                        onClick={handleDownloadAll}
                        disabled={isZipping}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all w-full xl:w-auto
                  ${isZipping
                                ? 'bg-slate-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg'}
                `}
                    >
                        <Archive className={`w-4 h-4 ${isZipping ? 'animate-spin' : ''}`} />
                        {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                    <div key={img.id} className={`group relative bg-slate-900 rounded-lg p-2 border transition-all ${isPickingColor ? 'cursor-crosshair border-line-green/50 hover:border-line-green' : 'border-slate-700 hover:border-line-green'}`}>
                        <div
                            className="aspect-square relative flex items-center justify-center overflow-hidden rounded bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat"
                            onClick={(e) => isPickingColor ? handleImageClick(e, img) : null}
                        >
                            <img
                                src={img.dataUrl}
                                alt={`Sticker ${img.id}`}
                                className="max-w-full max-h-full object-contain pointer-events-none"
                            />
                        </div>

                        {/* Overlay Actions - Hide when picking color */}
                        {!isPickingColor && (
                            <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDownload(img.dataUrl, img.id)}
                                    className="w-full bg-slate-800/90 hover:bg-line-green/90 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 backdrop-blur-sm"
                                >
                                    <Download className="w-3 h-3" />
                                    Download
                                </button>
                            </div>
                        )}

                        <div className="absolute top-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCollect(img);
                                }}
                                className="w-full bg-line-green/90 hover:bg-line-green text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 backdrop-blur-sm shadow-sm"
                            >
                                <PlusCircle className="w-3 h-3" />
                                收錄 (Collect)
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StickerGrid;
