
import React from 'react';
import { Settings, Sliders, Droplet, Palette, Grid, Scissors } from 'lucide-react';

const SettingsPanel = ({ settings, onSettingChange, updateSettings, isPickingColor, onTogglePicker }) => {
    // Local state for Grid Inputs to avoid triggering re-slice on every keystroke
    const [localGrid, setLocalGrid] = React.useState({ cols: settings.cols || 4, rows: settings.rows || 3 });

    // Sync local state when settings change externally (e.g. reset)
    React.useEffect(() => {
        setLocalGrid({ cols: settings.cols || 4, rows: settings.rows || 3 });
    }, [settings.cols, settings.rows]);

    const handleGridApply = () => {
        if (updateSettings) {
            updateSettings({ cols: localGrid.cols, rows: localGrid.rows });
        }
    };

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
                    <h3 className="text-sm font-bold">Grid Layout (格狀設定)</h3>
                </div>
                {/* Columns & Rows Input */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">Columns (直列)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={localGrid.cols}
                            onChange={(e) => setLocalGrid(prev => ({ ...prev, cols: parseInt(e.target.value) || 1 }))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-line-green outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">Rows (橫排)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={localGrid.rows}
                            onChange={(e) => setLocalGrid(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:border-line-green outline-none"
                        />
                    </div>
                </div>
                {/* Apply Grid Change Button */}
                <div className="mb-6">
                    <button
                        onClick={handleGridApply}
                        className="w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded border border-slate-600 transition-colors"
                    >
                        Apply Change (變更格數)
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4 text-slate-300 border-t border-slate-700/50 pt-4">
                    <Scissors className="w-4 h-4" />
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
                            disabled={isPickingColor}
                            onChange={(e) => onSettingChange('targetColor', e.target.value)}
                            className="w-10 h-8 bg-slate-800 rounded border border-slate-600 cursor-pointer disabled:opacity-50"
                        />
                        <button
                            onClick={onTogglePicker}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded border text-xs font-bold transition-all
                                ${isPickingColor
                                    ? 'bg-line-green text-black border-line-green animate-pulse'
                                    : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <Droplet className="w-3 h-3" />
                            {isPickingColor ? 'Picking...' : 'Pick Color (吸管)'}
                        </button>
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
                        onChange={(e) => onSettingChange('smoothness', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-line-green disabled:opacity-50"
                    />
                </div>

                {/* Edge Erosion */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <label className="font-medium text-slate-200">Edge Erosion (邊緣收縮)</label>
                        <span className="text-line-green">{settings.edgeErosion} px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={settings.edgeErosion}
                        onChange={(e) => onSettingChange('edgeErosion', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-line-green disabled:opacity-50"
                    />
                </div>

                {/* Despill Toggle */}
                <div className="space-y-2 col-span-full">
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                            type="checkbox"
                            checked={settings.despill}
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
