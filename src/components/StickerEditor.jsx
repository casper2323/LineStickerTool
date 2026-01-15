import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from './ImageUploader';
import StickerGrid from './StickerGrid';
import StickerWorkspace from './StickerWorkspace';
import StickerCollection from './StickerCollection';
import SettingsPanel from './SettingsPanel';
import ColorPickerOverlay from './ColorPickerOverlay';
import { sliceImage, resizeImage } from '../utils/canvasUtils';
// Import worker
import WorkerScript from '../workers/imageProcessor.js?worker&url';

const StickerEditor = ({
    collection,
    setCollection,
    mainImage,
    setMainImage,
    tabImage,
    setTabImage,
    onDelete,
    onClearAll,
    defaultCols = 4,
    collectionSize = { width: 370, height: 320 },
    workspace,
    setWorkspace,
    onDeleteWorkspace,
    onUpdateWorkspace,
    onClearWorkspace,

    onPreviewWorkspace,
    onCollectResult,
    collectionLimit = 40,
    setCollectionLimit,
    allowedCounts = [8, 16, 24, 32, 40]
}) => {
    const [originalImage, setOriginalImage] = useState(null);
    const [slicedImages, setSlicedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImages, setProcessedImages] = useState([]);

    // Collection Mode and Workspace Mode
    const [collectMode, setCollectMode] = useState('workspace'); // Grid -> 'workspace' | 'tab'
    const [workspaceCollectMode, setWorkspaceCollectMode] = useState('stickers'); // Workspace -> 'stickers' | 'main'

    // Settings State
    const [settings, setSettings] = useState({
        autoRemoveBg: true, // Always true now
        targetColor: '#00ff00',
        tolerance: 15,
        smoothness: 5,
        despill: true,
        edgeErosion: 0,
        gap: 0,
        marginTop: 0,
        cols: defaultCols,
        rows: 3
    });

    const workerRef = useRef(null);

    // Initialize Worker
    useEffect(() => {
        // @ts-ignore
        workerRef.current = new Worker(WorkerScript, { type: 'module' });

        workerRef.current.onmessage = (e) => {
            const { id, dataUrl } = e.data;

            setProcessedImages(prev => {
                const newImages = [...prev];
                const index = newImages.findIndex(img => img.id === id);
                if (index !== -1) {
                    newImages[index] = { ...newImages[index], dataUrl };
                }
                return newImages;
            });
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Handle Image Upload
    const handleImageUpload = (file) => {
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            setOriginalImage(img);
            setIsProcessing(true);

            // Just use the current settings
            performSlicing(img, settings.gap, settings.marginTop, settings.targetColor, settings);
        };
    };

    // Centralized Slice & Process function
    const performSlicing = async (img, gap, marginTop, currentHex, currentSettings) => {
        setIsProcessing(true);
        try {
            const slices = await sliceImage(img, {
                gap,
                marginTop,
                cols: currentSettings.cols,
                rows: currentSettings.rows
            });
            setSlicedImages(slices);

            // If Auto Remove is OFF, we show raw slices.
            // If ON, we set them to processedImages but then trigger worker to overwrite.
            setProcessedImages(slices);

            setProcessedImages(slices);

            // Always trigger background removal
            triggerBatchProcessing(slices, { ...currentSettings, targetColor: currentHex });
        } catch (error) {
            console.error("Processing failed", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Trigger processing for all slices
    const triggerBatchProcessing = (slices, currentSettings) => {
        if (!workerRef.current) return;

        slices.forEach(slice => {
            createImageBitmap(slice.originalCanvas).then(bitmap => {
                workerRef.current.postMessage({
                    imageBitmap: bitmap,
                    id: slice.id,
                    targetColor: currentSettings.targetColor,
                    tolerance: currentSettings.tolerance,
                    smoothness: currentSettings.smoothness,
                    despill: currentSettings.despill,
                    edgeErosion: currentSettings.edgeErosion
                }, [bitmap]);
            });
        });
    };

    // Handle Setting Changes
    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        if (originalImage) {
            // If Slicing params changed (Gap, Margin), we MUST re-slice
            if (key === 'gap' || key === 'marginTop') {
                performSlicing(originalImage, newSettings.gap, newSettings.marginTop, newSettings.targetColor, newSettings);
            } else {
                // Just Re-process Background (No re-slice needed)
                triggerBatchProcessing(slicedImages, newSettings);
            }
        }
    };

    // Handle Batch Updates (e.g., Grid Change)
    const updateSettings = (newPartialSettings) => {
        const newSettings = { ...settings, ...newPartialSettings };
        setSettings(newSettings);

        if (originalImage) {
            // If Grid or Slicing params changed, re-slice
            if ('cols' in newPartialSettings || 'rows' in newPartialSettings || 'gap' in newPartialSettings || 'marginTop' in newPartialSettings) {
                performSlicing(originalImage, newSettings.gap, newSettings.marginTop, newSettings.targetColor, newSettings);
            } else {
                // Just Re-process Background
                triggerBatchProcessing(slicedImages, newSettings);
            }
        }
    };

    // --- Eyedropper Logic ---
    const [isPickingColor, setIsPickingColor] = useState(false);

    const togglePicker = () => {
        setIsPickingColor(!isPickingColor);
    };

    const handleColorPick = (hex) => {
        setIsPickingColor(false);
        handleSettingChange('targetColor', hex);
    };

    // --- Collection Logic ---
    const handleCollect = async (sticker) => {
        if (collectMode === 'main') {
            const resized = await resizeImage(sticker.dataUrl, 240, 240);
            setMainImage({ ...sticker, dataUrl: resized });
        } else if (collectMode === 'tab') {
            const resized = await resizeImage(sticker.dataUrl, 96, 74);
            setTabImage({ ...sticker, dataUrl: resized });
        } else if (collectMode === 'workspace' && setWorkspace) {
            // Workspace (5x4 = 20 slots)
            const resized = await resizeImage(sticker.dataUrl, collectionSize.width, collectionSize.height);
            setWorkspace(prev => {
                const emptyIndex = prev.findIndex(item => item === null);
                if (emptyIndex === -1) {
                    alert("Workspace is full!");
                    return prev;
                }
                const newWorkspace = [...prev];
                newWorkspace[emptyIndex] = { ...sticker, dataUrl: resized };
                return newWorkspace;
            });
        } else {
            // Default: Add to list (Resize to 320x270)
            const resized = await resizeImage(sticker.dataUrl, 320, 270);

            setCollection(prev => {
                // Find first empty slot
                const emptyIndex = prev.findIndex((item, idx) => item === null && idx < collectionLimit);
                if (emptyIndex === -1) {
                    alert(`Collection is full (Limit: ${collectionLimit})! Please delete some stickers or increase the limit.`);
                    return prev;
                }
                const newCollection = [...prev];
                newCollection[emptyIndex] = { ...sticker, dataUrl: resized };
                return newCollection;
            });
        }
    };

    // --- Workspace Collection Logic ---
    const handleWorkspaceCollect = async (sticker) => {
        if (workspaceCollectMode === 'main') {
            const resized = await resizeImage(sticker.dataUrl, 240, 240);
            setMainImage({ ...sticker, dataUrl: resized });
        } else {
            // Default: Add to list
            const resized = await resizeImage(sticker.dataUrl, collectionSize.width, collectionSize.height);

            setCollection(prev => {
                // Find first empty slot
                const emptyIndex = prev.findIndex((item, idx) => item === null && idx < collectionLimit);
                if (emptyIndex === -1) {
                    alert(`Collection is full (Limit: ${collectionLimit})! Please delete some stickers or increase the limit.`);
                    return prev;
                }
                const newCollection = [...prev];
                newCollection[emptyIndex] = { ...sticker, dataUrl: resized };
                return newCollection;
            });
        }
    };

    return (
        <div className="space-y-6">
            <ImageUploader onUpload={handleImageUpload} isProcessing={isProcessing} />

            {slicedImages.length > 0 && (
                <>
                    <SettingsPanel
                        settings={settings}
                        onSettingChange={handleSettingChange}
                        updateSettings={updateSettings}
                        isPickingColor={isPickingColor}
                        onTogglePicker={togglePicker}
                    />
                    <StickerGrid
                        images={processedImages}
                        isPickingColor={false}  // Disable grid picking since we use Overlay
                        onColorPick={handleColorPick}
                        onCollect={handleCollect}
                        collectMode={collectMode}
                        setCollectMode={setCollectMode}
                    />
                    {workspace && (
                        <StickerWorkspace
                            workspace={workspace}
                            onDelete={onDeleteWorkspace}
                            onCollect={handleWorkspaceCollect}
                            collectMode={workspaceCollectMode}
                            setCollectMode={setWorkspaceCollectMode}
                            onUpdate={onUpdateWorkspace}
                            onClear={onClearWorkspace}
                            onPreview={onPreviewWorkspace}
                            onCollectResult={onCollectResult}
                        />
                    )}
                    <StickerCollection
                        collection={collection}
                        onDelete={onDelete}
                        onClearAll={onClearAll}
                        mainImage={mainImage}
                        setMainImage={setMainImage}
                        tabImage={tabImage}
                        setTabImage={setTabImage}
                        limit={collectionLimit}
                        setLimit={setCollectionLimit}
                        allowedCounts={allowedCounts}
                    />
                </>
            )}

            {/* Color Picker Overlay */}
            {isPickingColor && originalImage && (
                <ColorPickerOverlay
                    imageSrc={originalImage.src}
                    onColorPick={handleColorPick}
                    onCancel={() => setIsPickingColor(false)}
                />
            )}
        </div>
    );
};

export default StickerEditor;
