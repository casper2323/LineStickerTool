import React from 'react';
import { Download, Trash2, Briefcase, PlusCircle, Plus, Minus, Play, XCircle } from 'lucide-react';

const StickerWorkspace = ({ workspace, onDelete, onCollect, collectMode, setCollectMode, onUpdate, onClear, onPreview }) => {
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

    return (
        <div className="panel-bg p-6 mt-6">
            <div className="flex flex-col xl:flex-row items-center justify-between mb-4 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">
                            Workspace (工作區 - 8x2)
                        </h2>
                    </div>
                    <div className="text-xs font-normal text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/30">
                        備註:<br />
                        -重複播放次數：每張貼圖1～4次（總播放時間不超過4秒）。<br />
                        -最長播放時間：每張貼圖4秒。
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onPreview}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        <Play className="w-4 h-4 ml-0.5" />
                        預覽
                    </button>
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-500/80 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        清除
                    </button>
                </div>

                {/* Collection Mode Switch */}
                <div className="flex flex-wrap justify-center gap-4 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50 w-full xl:w-auto">
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded hover:bg-slate-700/50 transition-colors">
                        <input
                            type="radio"
                            name="workspaceCollectMode"
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
                            name="workspaceCollectMode"
                            value="main"
                            checked={collectMode === 'main'}
                            onChange={(e) => setCollectMode(e.target.value)}
                            className="w-4 h-4 text-line-green bg-slate-800 border-slate-600 focus:ring-line-green"
                        />
                        <span className={`text-sm font-medium ${collectMode === 'main' ? 'text-white' : 'text-slate-400'}`}>主要圖片</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                {workspace.map((sticker, index) => {
                    const slotNumber = String(index + 1).padStart(2, '0');
                    return (
                        <div key={index} className={`group relative bg-slate-900 rounded-lg border aspect-square flex items-center justify-center ${sticker ? 'border-blue-500/50' : 'border-slate-800 border-dashed'}`}>

                            {!sticker && (
                                <span className="text-slate-600 font-mono text-lg">{slotNumber}</span>
                            )}

                            {sticker && (
                                <>
                                    <div className="relative w-full h-full p-2 flex items-center justify-center bg-[url('https://media.discordapp.net/attachments/1097486820202811463/1105470788642570290/grid-bg.png')] bg-repeat overflow-hidden rounded">
                                        <img
                                            src={sticker.dataUrl}
                                            alt={`Workspace ${slotNumber}`}
                                            className="max-w-full max-h-full object-contain pointer-events-none"
                                        />
                                    </div>

                                    {/* Slot Number Badge */}
                                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded font-mono">
                                        {slotNumber}
                                    </div>

                                    {/* Overlay Actions */}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={() => onCollect(sticker)}
                                            className="bg-line-green/90 hover:bg-line-green text-white p-1 rounded-full backdrop-blur-sm shadow-sm"
                                            title="Collect"
                                        >
                                            <PlusCircle className="w-3 h-3" />
                                        </button>
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
