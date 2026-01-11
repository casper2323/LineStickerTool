
import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { PROMPT_THEMES, PROMPT_STYLES } from '../utils/promptData';

const PromptGenerator = () => {
    const [activeTheme, setActiveTheme] = useState('daily');
    const [activeStyle, setActiveStyle] = useState('qversion');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [copied, setCopied] = useState(false);

    // Generate prompt when selections change
    useEffect(() => {
        const theme = PROMPT_THEMES[activeTheme];
        const style = PROMPT_STYLES[activeStyle];

        const promptText = `✅ 12 Sticker Set | Prompt Suggestion
Please generate a 12-grid sticker set based on the character in the attached image.
Do NOT use emoji.

[Character & Style]
Consistency: Must strictly maintain the character's hair, clothes, facial features, and overall appearance.
Composition: "Character + Text" only. No background scenes.
Art Style: 【${style.desc}】
Sticker Style: Character and text must have a thick WHITE BORDER. Background must be pure GREEN (#00FF00).

[Layout & Specs]
Grid: 4 columns x 3 rows (Total 12 stickers).
Canvas Size: 1480 x 960 px.
Single Sticker: Approx 370 x 320 px.
Padding: ~0.2cm padding around each sticker to prevent merging.
Angles: Mix of full body and half body. Include front, side, and high angles.

[Text Design]
Language: 【Traditional Chinese (Taiwan)】
Text Content: 【${theme.texts}】
Font Style: Cute Q-version font, colorful, readable. 
IMPORTANT: DO NOT use Green or Black for text colors (causes removal issues). Use Red, Blue, Purple, Orange, etc.
Text Size: Approx 1/3 of the sticker. Text can overlap non-essential parts of clothing but NOT the face.

[Expressions & Actions]
Expressions: Exaggerated and rich: 【${theme.emotions}】
Actions: Match the text context: 【${theme.actions}】
Requirement: All 12 stickers must have DIFFERENT actions and expressions.

[Output Format]
One single image containing 4x3 stickers. Background #00FF00. Thick white border around everything.`;

        setGeneratedPrompt(promptText);
    }, [activeTheme, activeStyle]);

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
                <h2 className="text-lg font-bold text-white">Prompt Generator</h2>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Theme (主題)</label>
                <select
                    value={activeTheme}
                    onChange={(e) => setActiveTheme(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-line-green focus:border-line-green outline-none"
                >
                    {Object.entries(PROMPT_THEMES).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.label}
                        </option>
                    ))}
                </select>
                <div className="mt-2 text-xs text-slate-500 line-clamp-2">
                    {PROMPT_THEMES[activeTheme].texts}
                </div>
            </div>

            {/* Style Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Style (風格)</label>
                <select
                    value={activeStyle}
                    onChange={(e) => setActiveStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-line-green focus:border-line-green outline-none"
                >
                    {Object.entries(PROMPT_STYLES).map(([key, value]) => (
                        <option key={key} value={key}>
                            {value.label}
                        </option>
                    ))}
                </select>
                <div className="mt-2 text-xs text-slate-500">
                    {PROMPT_STYLES[activeStyle].desc}
                </div>
            </div>

            {/* Generated Prompt Output */}
            <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-sm font-medium text-slate-400 mb-2">Generated Prompt (生成結果)</label>
                <div className="relative flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-hidden group">
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

export default PromptGenerator;
