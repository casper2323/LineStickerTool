
import React, { useState } from 'react';
import { Copy, Check, Sparkles, Wand2 } from 'lucide-react';
import { PROMPT_THEMES, PROMPT_STYLES } from '../utils/promptData';

const DynamicPromptGenerator = () => {
    const [activeTheme, setActiveTheme] = useState('daily');
    const [activeStyle, setActiveStyle] = useState('qversion');

    // Custom Inputs
    const [customTheme, setCustomTheme] = useState('');
    const [customStyle, setCustomStyle] = useState('');

    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        let themeData = { texts: '', emotions: '', actions: '' };
        let styleDesc = '';

        // Get Theme Data
        if (activeTheme === 'custom') {
            themeData = {
                texts: customTheme,
                emotions: 'Custom Expressions',
                actions: 'Custom Actions based on input'
            };
        } else {
            themeData = PROMPT_THEMES[activeTheme];
        }

        // Get Style Data
        if (activeStyle === 'custom') {
            styleDesc = customStyle;
        } else {
            styleDesc = PROMPT_STYLES[activeStyle].desc;
        }

        const promptText = `✅ LINE Dynamic Sticker (APNG) | 4x3 Grid Source Generator
Please generate a single high-resolution image containing a 4x3 grid of character variations.

[Core Requirements]
- **Layout**: 4 columns x 3 rows (Total 12 panels).
- **Total Image Size**: 1280 x 810 px (Landscape aspect ratio).
- **Sub-panel Size**: Approx 320 x 270 px per panel.
- **Background**: **PURE GREEN (#00FF00)** for easy chroma keying.
- **Padding**: Ensure clear separation (~20px) between each character to prevent overlapping.

[Character & Style]
- **Consistency**: The SAME character must appear in all 12 panels.
- **Art Style**: 【${styleDesc}】
- **Outline**: Thick WHITE outline around the character and text (Sticker style).
- **Content**: Character + Text only. No complex background scenes.

[Animation Sequence / Grid Content]
- **Concept**: This grid will be sliced to create a dynamic animation loop or a varied sticker set.
- **Theme**: 【${themeData.label}】
- **Text Content**: 【${themeData.texts}】
- **Expressions**: 【${themeData.emotions}】
- **Actions**: 【${themeData.actions}】

[Important Constraints]
- **Do NOT** use green colors on the character/text (it will disappear with the background).
- **Text Visibility**: Text should be large, readable, and colorful (Red, Blue, Orange, Pink).
- **Variety**: Each of the 12 panels should have a slightly different pose or frame of the animation.
`;

        setGeneratedPrompt(promptText);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPrompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="panel-bg p-6 h-full flex flex-col border border-purple-500/30 relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Wand2 className="w-32 h-32 text-purple-500" />
            </div>

            <div className="flex items-center gap-2 mb-6 relative z-10">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Dynamic Sticker Prompt (動態貼圖)</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    APNG Mode
                </span>
            </div>

            {/* Theme Selection */}
            <div className="mb-6 relative z-10">
                <label className="block text-sm font-medium text-purple-200/70 mb-2">Theme (主題)</label>
                <select
                    value={activeTheme}
                    onChange={(e) => setActiveTheme(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/30 text-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                    {Object.entries(PROMPT_THEMES).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.label}
                        </option>
                    ))}
                    <option value="custom">Custom (自定義)</option>
                </select>

                {activeTheme === 'custom' ? (
                    <textarea
                        value={customTheme}
                        onChange={(e) => setCustomTheme(e.target.value)}
                        placeholder="Enter theme details, texts, emotions..."
                        className="mt-2 w-full h-24 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs resize-none focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                ) : (
                    <div className="mt-2 text-xs text-slate-500 line-clamp-2">
                        {PROMPT_THEMES[activeTheme].texts}
                    </div>
                )}
            </div>

            {/* Style Selection */}
            <div className="mb-6 relative z-10">
                <label className="block text-sm font-medium text-purple-200/70 mb-2">Style (風格)</label>
                <select
                    value={activeStyle}
                    onChange={(e) => setActiveStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-500/30 text-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                >
                    {Object.entries(PROMPT_STYLES).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.label}
                        </option>
                    ))}
                    <option value="custom">Custom (自定義)</option>
                </select>

                {activeStyle === 'custom' ? (
                    <textarea
                        value={customStyle}
                        onChange={(e) => setCustomStyle(e.target.value)}
                        placeholder="Enter art style description..."
                        className="mt-2 w-full h-20 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs resize-none focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                ) : (
                    <div className="mt-2 text-xs text-slate-500">
                        {PROMPT_STYLES[activeStyle].desc}
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                className="mb-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg relative z-10"
            >
                <Wand2 className="w-4 h-4" />
                Generate 4x3 Grid Prompt (產生動態素材指令)
            </button>

            {/* Generated Prompt Output */}
            <div className="flex-1 flex flex-col min-h-0 relative z-10">
                <label className="block text-sm font-medium text-purple-200/70 mb-2">Generated Prompt (生成結果)</label>
                <div className="relative h-[300px] lg:h-[400px] bg-slate-950 rounded-lg border border-purple-500/30 p-3 overflow-hidden group">
                    <textarea
                        readOnly
                        value={generatedPrompt}
                        className="w-full h-full bg-transparent text-slate-300 text-xs font-mono resize-none focus:outline-none custom-scrollbar"
                    />
                    {/* Fading bottom effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleCopy}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all duration-200 relative z-10 ${copied
                    ? 'bg-green-500/10 text-green-500 border border-green-500/50'
                    : 'bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20'
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

export default DynamicPromptGenerator;
