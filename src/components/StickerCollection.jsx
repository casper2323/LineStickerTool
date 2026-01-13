import React, { useState } from 'react';
import { Download, Trash2, Archive, Check } from 'lucide-react';
import JSZip from 'jszip';

const StickerCollection = ({
    collection = [],
    onDelete,
    onDownload,
    onClearAll,
    mainImage,
    setMainImage,
    tabImage,
    setTabImage
}) => {
    // collection is expected to be an array of length 40
    // elements are either null or { id, dataUrl, ... }

    const [isZipping, setIsZipping] = useState(false);

    // Native Download Helper
    const triggerDownload = (href, fileName) => {
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = (slotIndex) => {
        const sticker = collection[slotIndex];
        if (!sticker) return;

        // Filename: 01.png, 02.png... based on SLOT index (1-based), not sticker ID
        const fileName = String(slotIndex + 1).padStart(2, '0') + '.png';
        triggerDownload(sticker.dataUrl, fileName);
    };

    const handleDownloadAll = async () => {
        const validStickers = collection.map((s, i) => ({ s, i })).filter(item => item.s !== null);
        if (validStickers.length === 0 && !mainImage && !tabImage) return;

        setIsZipping(true);
        const zip = new JSZip();

        // 1. Collection Folder
        if (validStickers.length > 0) {
            const folder = zip.folder("collection");
            validStickers.forEach(({ s, i }) => {
                const base64Data = s.dataUrl.split(',')[1];
                const fileName = String(i + 1).padStart(2, '0') + '.png';
                folder.file(fileName, base64Data, { base64: true });
            });
        }

        // 2. Main Image
        if (mainImage) {
            const base64Data = mainImage.dataUrl.split(',')[1];
            zip.file("main.png", base64Data, { base64: true });
        }

        // 3. Tab Image
        if (tabImage) {
            const base64Data = tabImage.dataUrl.split(',')[1];
            zip.file("tab.png", base64Data, { base64: true });
        }

        try {
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            triggerDownload(url, "sticker_collection.zip");
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("Failed to zip:", err);
            alert("Failed to create ZIP file.");
        } finally {
            setIsZipping(false);
        }
    };

    const hasStickers = collection.some(x => x !== null) || mainImage || tabImage;

    // Helper to render a single slot (reused for main/tab)
    const renderSingleSlot = (image, setImage, title, label, placeholder) => (
        <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-300 mb-2">{title}</h3>
            <div className="w-32 h-32 group relative bg-slate-900 rounded-lg border aspect-square flex items-center justify-center border-slate-800 border-dashed">

                {!image && (
                    <span className="text-slate-600 font-mono text-xs text-center px-2">{placeholder}</span>
                )}

                {image && (
                    <>
                        <div className="relative w-full h-full p-2 flex items-center justify-center bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat overflow-hidden rounded">
                            <img
                                src={image.dataUrl}
                                alt={label}
                                className="max-w-full max-h-full object-contain pointer-events-none"
                            />
                        </div>

                        {/* Overlay Actions */}
                        <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => triggerDownload(image.dataUrl, label + '.png')}
                                className="flex-1 bg-slate-800/90 hover:bg-line-green/90 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 backdrop-blur-sm"
                                title="Download"
                            >
                                <Download className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setImage(null)}
                                className="flex-1 bg-slate-800/90 hover:bg-red-500/90 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 backdrop-blur-sm"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="panel-bg p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-line-green" />
                    <h2 className="text-lg font-bold text-white">Collection (收錄區)</h2>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClearAll}
                        disabled={!hasStickers}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all
                  ${!hasStickers
                                ? 'bg-slate-700 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-500 shadow-lg'}
                `}
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>

                    <button
                        onClick={handleDownloadAll}
                        disabled={isZipping || !hasStickers}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all
                  ${isZipping || !hasStickers
                                ? 'bg-slate-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg'}
                `}
                    >
                        <Archive className={`w-4 h-4 ${isZipping ? 'animate-spin' : ''}`} />
                        {isZipping ? 'Zipping...' : 'Download Collection (ZIP)'}
                    </button>
                </div>
            </div>

            {/* 1. Sticker Collection Grid */}
            <h3 className="text-sm font-bold text-slate-300 mb-2">貼圖圖片(8張、16張、24張、32張、40張)</h3>
            <div className="grid grid-cols-4 gap-4 mb-8">
                {collection.map((sticker, index) => {
                    const slotNumber = String(index + 1).padStart(2, '0');
                    return (
                        <div key={index} className={`group relative bg-slate-900 rounded-lg border aspect-square flex items-center justify-center ${sticker ? 'border-line-green' : 'border-slate-800 border-dashed'}`}>

                            {/* Empty State */}
                            {!sticker && (
                                <span className="text-slate-600 font-mono text-xl">{slotNumber}</span>
                            )}

                            {/* Filled State */}
                            {sticker && (
                                <>
                                    <div className="relative w-full h-full p-2 flex items-center justify-center bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat overflow-hidden rounded">
                                        <img
                                            src={sticker.dataUrl}
                                            alt={`Slot ${slotNumber}`}
                                            className="max-w-full max-h-full object-contain pointer-events-none"
                                        />
                                    </div>

                                    {/* Slot Number Badge */}
                                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                                        {slotNumber}
                                    </div>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDownload(index)}
                                            className="flex-1 bg-slate-800/90 hover:bg-line-green/90 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 backdrop-blur-sm"
                                            title="Download"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(index)}
                                            className="flex-1 bg-slate-800/90 hover:bg-red-500/90 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 backdrop-blur-sm"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-8">
                {/* 2. Main Image Section */}
                {renderSingleSlot(mainImage, setMainImage, "主要圖片", "main", "Main Image")}

                {/* 3. Tab Image Section */}
                {renderSingleSlot(tabImage, setTabImage, "聊天室標籤圖片", "tab", "Tab Image")}
            </div>

        </div>
    );
};
export default StickerCollection;
