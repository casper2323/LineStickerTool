
import React, { useState } from 'react';
import Layout from './components/Layout';
import PromptGenerator from './components/PromptGenerator';
import ApngPromptGenerator from './components/ApngPromptGenerator';
import StickerEditor from './components/StickerEditor';

function App() {
  // Create 40 slots for collection
  const [collection, setCollection] = useState(Array(40).fill(null));
  // Workspace State (5x4 = 20 slots)
  const [workspace, setWorkspace] = useState(Array(20).fill(null));

  // Special Slots
  const [mainImage, setMainImage] = useState(null);
  const [tabImage, setTabImage] = useState(null);

  // Collection Limit State
  const [collectionLimit, setCollectionLimit] = useState(40);

  // Tab State
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'editor' | 'apng-prompt' | 'apng-editor'

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Adjust collection limit based on tab type
    if (tab === 'apng-editor') {
      // APNG max is 24. If current limit > 24, reset to 24. 
      // Or just default to 24 when switching to this tab? 
      // Let's safe-guard:
      if (collectionLimit > 24) setCollectionLimit(24);
    } else if (tab === 'editor') {
      // Static can go up to 40. We don't necessarily force it up, 
      // but the user might have set it low. Let's leave it unless they change it, 
      // or maybe default to 40? 
      // The user request is about modifying the collection area to support these counts.
      // If we switch to 'editor', we support up to 40.
    }
  };

  const handleDeleteFromCollection = (index) => {
    setCollection(prev => {
      const newCollection = [...prev];
      newCollection[index] = null;
      return newCollection;
    });
  };

  const handleDeleteFromWorkspace = (index) => {
    setWorkspace(prev => {
      const newWorkspace = [...prev];
      newWorkspace[index] = null;
      return newWorkspace;
    });
  };

  const handleUpdateWorkspace = (index, updates) => {
    setWorkspace(prev => {
      const newWorkspace = [...prev];
      if (newWorkspace[index]) {
        newWorkspace[index] = { ...newWorkspace[index], ...updates };
      }
      return newWorkspace;
    });
  };

  const handleClearWorkspace = () => {
    if (window.confirm("Are you sure you want to clear the entire workspace?")) {
      setWorkspace(Array(20).fill(null));
    }
  };

  const handlePreviewWorkspace = () => {
    // Placeholder for APNG preview
    alert("Preview feature coming soon! (APNG Generation)");
  };

  const handleClearCollection = () => {
    if (window.confirm("Are you sure you want to clear the entire collection?")) {
      setCollection(Array(40).fill(null));
      setMainImage(null);
      setTabImage(null);
    }
  };

  const handleCollectResult = (dataUrl, isApng = false, target = 'collection') => {
    if (target === 'main') {
      setMainImage({
        id: Date.now(),
        dataUrl: dataUrl,
        isApng: isApng
      });
      return;
    }

    setCollection(prev => {
      const emptyIndex = prev.findIndex((item, idx) => item === null && idx < collectionLimit);
      if (emptyIndex === -1) {
        alert(`Collection is full (Limit: ${collectionLimit})! Please delete some stickers first.`);
        return prev;
      }
      const newCollection = [...prev];
      newCollection[emptyIndex] = {
        id: Date.now(),
        dataUrl: dataUrl,
        isApng: isApng
      };
      return newCollection;
    });
  };

  return (
    <Layout>
      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-700 mb-6">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'prompt'
            ? 'text-white border-b-2 border-primary-500'
            : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => handleTabChange('prompt')}
        >
          Prompt Generator
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'editor'
            ? 'text-white border-b-2 border-primary-500'
            : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => handleTabChange('editor')}
        >
          Sticker Editor
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'apng-prompt'
            ? 'text-white border-b-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => handleTabChange('apng-prompt')}
        >
          APNG Prompt
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'apng-editor'
            ? 'text-white border-b-2 border-green-500'
            : 'text-gray-400 hover:text-gray-200'
            }`}
          onClick={() => handleTabChange('apng-editor')}
        >
          APNG Editor
        </button>
      </div>

      <div className="space-y-6">
        {/* Left Sidebar: Prompt Generator */}
        <div className={activeTab === 'prompt' ? 'block' : 'hidden'}>
          <div className="max-w-4xl mx-auto">
            <PromptGenerator />
          </div>
        </div>

        {/* Sticker Editor */}
        <div className={activeTab === 'editor' ? 'block' : 'hidden'}>
          <div className="max-w-6xl mx-auto h-full">
            <StickerEditor
              collection={collection}
              setCollection={setCollection}
              mainImage={mainImage}
              setMainImage={setMainImage}
              tabImage={tabImage}
              setTabImage={setTabImage}
              onDelete={handleDeleteFromCollection}
              onClearAll={handleClearCollection}
              defaultCols={4}
              workspace={workspace}
              setWorkspace={setWorkspace}
              onDeleteWorkspace={handleDeleteFromWorkspace}
              onUpdateWorkspace={handleUpdateWorkspace}
              onClearWorkspace={handleClearWorkspace}
              onPreviewWorkspace={handlePreviewWorkspace}
              onCollectResult={handleCollectResult}
              collectionLimit={collectionLimit}
              setCollectionLimit={setCollectionLimit}
              allowedCounts={[8, 16, 24, 32, 40]}
            />
          </div>
        </div>

        {/* APNG Prompt Generator */}
        <div className={activeTab === 'apng-prompt' ? 'block' : 'hidden'}>
          <div className="max-w-4xl mx-auto">
            <ApngPromptGenerator />
          </div>
        </div>

        {/* APNG Editor */}
        <div className={activeTab === 'apng-editor' ? 'block' : 'hidden'}>
          <div className="max-w-6xl mx-auto h-full">
            <StickerEditor
              collection={collection}
              setCollection={setCollection}
              mainImage={mainImage}
              setMainImage={setMainImage}
              tabImage={tabImage}
              setTabImage={setTabImage}
              onDelete={handleDeleteFromCollection}
              onClearAll={handleClearCollection}
              defaultCols={3}
              collectionSize={{ width: 320, height: 270 }}
              workspace={workspace}
              setWorkspace={setWorkspace}
              onDeleteWorkspace={handleDeleteFromWorkspace}
              onUpdateWorkspace={handleUpdateWorkspace}
              onClearWorkspace={handleClearWorkspace}
              onPreviewWorkspace={handlePreviewWorkspace}
              onCollectResult={handleCollectResult}
              collectionLimit={collectionLimit}
              setCollectionLimit={setCollectionLimit}
              allowedCounts={[8, 16, 24]}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
