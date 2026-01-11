
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from './components/Layout';
import PromptGenerator from './components/PromptGenerator';
import ImageUploader from './components/ImageUploader';
import StickerGrid from './components/StickerGrid';
import SettingsPanel from './components/SettingsPanel';
import { sliceImage } from './utils/canvasUtils';

// Import worker
import WorkerScript from './workers/imageProcessor.js?worker&url';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [slicedImages, setSlicedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);

  // Settings State
  const [settings, setSettings] = useState({
    autoRemoveBg: true,
    targetColor: '#00ff00',
    tolerance: 15,
    smoothness: 5,
    despill: true,
    gap: 0,
    marginTop: 0
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

      // Auto-detect background color logic (Keep it, but user can override)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
      const p = ctx.getImageData(0, 0, 1, 1).data;
      const hex = "#" + ("000000" + ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)).slice(-6);

      // We update the target color, BUT we keep other settings as is (or reset?)
      // Use logical defaults if first time
      setSettings(prev => ({
        ...prev,
        targetColor: hex
      }));

      // Initial Slice
      performSlicing(img, settings.gap, settings.marginTop, hex, settings);
    };
  };

  // Centralized Slice & Process function
  const performSlicing = async (img, gap, marginTop, currentHex, currentSettings) => {
    setIsProcessing(true);
    try {
      const slices = await sliceImage(img, { gap, marginTop });
      setSlicedImages(slices);

      // If Auto Remove is OFF, we show raw slices.
      // If ON, we set them to processedImages but then trigger worker to overwrite.
      setProcessedImages(slices);

      if (currentSettings.autoRemoveBg) {
        // Pass the *latest* settings explicitly
        triggerBatchProcessing(slices, { ...currentSettings, targetColor: currentHex });
      }
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
          despill: currentSettings.despill
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
        if (!newSettings.autoRemoveBg) {
          setProcessedImages(slicedImages);
        } else {
          triggerBatchProcessing(slicedImages, newSettings);
        }
      }
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
              <SettingsPanel settings={settings} onSettingChange={handleSettingChange} />
              <StickerGrid images={processedImages} />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;
