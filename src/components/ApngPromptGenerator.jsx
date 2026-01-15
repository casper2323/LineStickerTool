
import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

const ApngPromptGenerator = () => {
    const [generatedPrompt, setGeneratedPrompt] = useState(
        `將我上傳的圖片，生成line動態貼圖的分格圖 3x3 九宮格，主角必須維持在中心，文字不要有任何變動，
背景色採用**PURE GREEN (#00FF00)**，單張尺寸 320 x 270， 總尺寸960 x 810 px。`
    );
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="panel-bg p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-line-green" />
                <h2 className="text-lg font-bold text-white">APNG Prompt Generator</h2>
            </div>



            {/* Generated Prompt Output */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="relative h-72 bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-hidden group">
                    <textarea
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className="w-full h-full bg-transparent text-slate-300 text-xs font-mono resize-none focus:outline-none custom-scrollbar"
                        placeholder="Enter prompt here..."
                    />
                    {/* Fading bottom effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleCopy}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all duration-200 ${copied
                    ? 'bg-green-500/10 text-green-500 border border-green-500/50'
                    : 'bg-line-green hover:bg-green-600 text-white shadow-lg shadow-line-green/20 hover:shadow-line-green/30'
                    }`}
            >
                {copied ? (
                    <>
                        <Check className="w-5 h-5" />
                        <span>Copied! (已複製)</span>
                    </>
                ) : (
                    <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Prompt</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ApngPromptGenerator;
