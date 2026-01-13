
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from './components/Layout';
import PromptGenerator from './components/PromptGenerator';
import ImageUploader from './components/ImageUploader';
import StickerGrid from './components/StickerGrid';
import StickerCollection from './components/StickerCollection';
import SettingsPanel from './components/SettingsPanel';
import ColorPickerOverlay from './components/ColorPickerOverlay';
import { sliceImage } from './utils/canvasUtils';

// Import worker
import WorkerScript from './workers/imageProcessor.js?worker&url';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [slicedImages, setSlicedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);

  // Create 40 slots for collection
  const [collection, setCollection] = useState(Array(40).fill(null));

  // Special Slots
  const [mainImage, setMainImage] = useState(null);
  const [tabImage, setTabImage] = useState(null);

  // Collection Mode
  const [collectMode, setCollectMode] = useState('stickers'); // 'stickers' | 'main' | 'tab'

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
    cols: 4,
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

      // Disabled auto-detect per user request (Default to #00ff00 or current setting)
      // const canvas = document.createElement('canvas');
      // canvas.width = 1;
      // ... 

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
        // Debouncing recommended for sliders, but direct for now
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
  const handleCollect = (sticker) => {
    if (collectMode === 'main') {
      setMainImage(sticker);
    } else if (collectMode === 'tab') {
      setTabImage(sticker);
    } else {
      // Default: Add to list
      setCollection(prev => {
        // Find first empty slot
        const emptyIndex = prev.findIndex(item => item === null);
        if (emptyIndex === -1) {
          alert("Collection is full! Please delete some stickers first.");
          return prev;
        }
        const newCollection = [...prev];
        newCollection[emptyIndex] = sticker;
        return newCollection;
      });
    }
  };

  const handleDeleteFromCollection = (index) => {
    setCollection(prev => {
      const newCollection = [...prev];
      newCollection[index] = null;
      return newCollection;
    });
  };

  const handleClearCollection = () => {
    if (window.confirm("Are you sure you want to clear the entire collection?")) {
      setCollection(Array(40).fill(null));
      setMainImage(null);
      setTabImage(null);
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Prompt Generator */}
        <div className="lg:col-span-4 h-full">
          <div className="sticky top-24">
            <PromptGenerator />
          </div>
        </div>

        {/* Right Content: Image Processing */}
        <div className="lg:col-span-8 space-y-6">
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
              <StickerCollection
                collection={collection}
                onDelete={handleDeleteFromCollection}
                onClearAll={handleClearCollection}
                mainImage={mainImage}
                setMainImage={setMainImage}
                tabImage={tabImage}
                setTabImage={setTabImage}
              />
            </>
          )}
        </div>
      </div>

      {/* Color Picker Overlay */}
      {isPickingColor && originalImage && (
        <ColorPickerOverlay
          imageSrc={originalImage.src}
          onColorPick={handleColorPick}
          onCancel={() => setIsPickingColor(false)}
        />
      )}
    </Layout>
  );
}

export default App;
