
import React from 'react';
import { Settings, Sliders, Droplet, Palette, Grid, Scissors } from 'lucide-react';

const SettingsPanel = ({ settings, onSettingChange }) => {
    if (!settings) return null;

    return (
        <div className="panel-bg p-6">
            <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-line-green" />
                <h2 className="text-lg font-bold text-white">Processing Settings (處理設定)</h2>
            </div>

            {/* Grid / Slicing Settings */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-4 text-slate-300">
                    <Grid className="w-4 h-4" />
                    <h3 className="text-sm font-bold">Slicing Adjustments (切片微調)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gap */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="font-medium text-slate-400">Gap (間距/縮邊)</label>
                            <span className="text-line-green">{settings.gap} px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={settings.gap}
                            onChange={(e) => onSettingChange('gap', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-line-green"
                        />
                    </div>
                    {/* Margin Top */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="font-medium text-slate-400">Margin Top (頂部偏移)</label>
                            <span className="text-line-green">{settings.marginTop} px</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.marginTop}
                            onChange={(e) => onSettingChange('marginTop', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-line-green"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Auto Remove BG Toggle */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoRemoveBg}
                            onChange={(e) => onSettingChange('autoRemoveBg', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 text-line-green focus:ring-line-green bg-slate-800"
                        />
                        <span className="text-sm font-medium text-slate-200">Auto Remove Background</span>
                    </label>
                </div>

                {/* Target Color Picker */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <label className="font-medium text-slate-200 flex items-center gap-1">
                            <Palette className="w-3 h-3" /> Target Color (去背色)
                        </label>
                        <span className="text-line-green uppercase">{settings.targetColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={settings.targetColor}
                            disabled={!settings.autoRemoveBg}
                            onChange={(e) => onSettingChange('targetColor', e.target.value)}
                            className="w-full h-8 bg-slate-800 rounded border border-slate-600 cursor-pointer disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Tolerance */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <label className="font-medium text-slate-200">Tolerance (容許度)</label>
                        <span className="text-line-green">{settings.tolerance}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.tolerance}
                        disabled={!settings.autoRemoveBg}
                        onChange={(e) => onSettingChange('tolerance', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-line-green disabled:opacity-50"
                    />
                </div>

                {/* Smoothness */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <label className="font-medium text-slate-200">Smoothness (平滑度)</label>
                        <span className="text-line-green">{settings.smoothness}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        value={settings.smoothness}
                        disabled={!settings.autoRemoveBg}
                        onChange={(e) => onSettingChange('smoothness', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-line-green disabled:opacity-50"
                    />
                </div>

                {/* Despill Toggle */}
                <div className="space-y-2 col-span-full">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                            type="checkbox"
                            checked={settings.despill}
                            disabled={!settings.autoRemoveBg}
                            onChange={(e) => onSettingChange('despill', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 text-line-green focus:ring-line-green bg-slate-800 disabled:opacity-50"
                        />
                        <span className="text-sm font-medium text-slate-200">Despill (去溢色) - Reduces green reflection</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
