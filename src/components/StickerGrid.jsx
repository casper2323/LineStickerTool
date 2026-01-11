
import React, { useState } from 'react';
import { Download, Image as ImageIcon, Archive } from 'lucide-react';
import JSZip from 'jszip';

const StickerGrid = ({ images = [] }) => {
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
        triggerDownload(dataUrl, `sticker_${id}.png`);
    };

    // Batch Download (ZIP)
    const handleDownloadAll = async () => {
        if (!images || images.length === 0) return;

        setIsZipping(true);
        const zip = new JSZip();
        const folder = zip.folder("stickers");

        images.forEach((img) => {
            // Remove "data:image/png;base64," header
            // Ensure we only have the base64 string
            const base64Data = img.dataUrl.split(',')[1];
            folder.file(`sticker_${img.id}.png`, base64Data, { base64: true });
        });

        try {
            // Generate ZIP as Blob
            const content = await zip.generateAsync({ type: "blob" });

            // Create Object URL
            const url = URL.createObjectURL(content);

            // Trigger download with explicit name
            triggerDownload(url, "line_stickers_set.zip");

            // Cleanup to prevent memory leaks
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("Failed to zip:", err);
            alert("Failed to create ZIP file.");
        } finally {
            setIsZipping(false);
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="panel-bg p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-line-green" />
                    <h2 className="text-lg font-bold text-white">Stickers Result (結果)</h2>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 hidden sm:inline">{images.length} stickers generated</span>
                    <button
                        onClick={handleDownloadAll}
                        disabled={isZipping}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all
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
                    <div key={img.id} className="group relative bg-slate-900 rounded-lg p-2 border border-slate-700 transition-all hover:border-line-green">
                        <div className="aspect-square relative flex items-center justify-center overflow-hidden rounded bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat">
                            <img
                                src={img.dataUrl}
                                alt={`Sticker ${img.id}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Overlay Actions */}
                        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDownload(img.dataUrl, img.id)}
                                className="w-full bg-slate-800/90 hover:bg-line-green/90 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 backdrop-blur-sm"
                            >
                                <Download className="w-3 h-3" />
                                Download
                            </button>
                        </div>

                        <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 rounded">
                            #{img.id}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StickerGrid;
