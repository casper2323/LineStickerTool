
import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageUploader = ({ onUpload, isProcessing }) => {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="panel-bg p-6">
            <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-line-green" />
                <h2 className="text-lg font-bold text-white">Image Upload (圖片上傳)</h2>
            </div>

            <div
                className={`relative h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
          ${dragActive ? 'border-line-green bg-line-green/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />

                {isProcessing ? (
                    <div className="flex flex-col items-center text-line-green animate-pulse">
                        <Loader2 className="w-10 h-10 animate-spin mb-3" />
                        <p className="font-medium">Processing Image...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <div className="p-4 bg-slate-800 rounded-full mb-4 shadow-lg">
                            <Upload className="w-8 h-8 text-line-green" />
                        </div>
                        <p className="text-lg font-medium text-slate-200">Click or Drag & Drop Image Here</p>
                        <p className="text-sm mt-2 text-slate-500">Supports 4x3 Grid Images (Midjourney/DALL-E)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
