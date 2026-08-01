import React, { useState, useRef } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { X, Check, RotateCcw, RotateCw, Crop, Sliders, Wand2, Sun, Contrast, Droplets, Save } from 'lucide-react';

interface PhotoEditorProps {
  item: MediaItem;
  onSave: (newItem: MediaItem) => void;
  onClose: () => void;
  soundEffectsEnabled: boolean;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ item, onSave, onClose, soundEffectsEnabled }) => {
  const [rotation, setRotation] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'cyber' | 'vivid' | 'bw' | 'warm' | 'emerald'>('normal');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const filters = [
    { id: 'normal', name: 'Original', style: {} },
    { id: 'cyber', name: 'Cyber Neon', style: { filter: 'hue-rotate(180deg) saturate(160%) contrast(120%)' } },
    { id: 'vivid', name: 'Vivid HDR', style: { filter: 'saturate(200%) contrast(130%)' } },
    { id: 'bw', name: 'B&W Film', style: { filter: 'grayscale(100%) contrast(150%)' } },
    { id: 'warm', name: 'Sunset Warm', style: { filter: 'sepia(40%) saturate(140%) hue-rotate(-15deg)' } },
    { id: 'emerald', name: 'Emerald Glow', style: { filter: 'hue-rotate(90deg) saturate(150%)' } },
  ];

  const combinedFilterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) ${
    activeFilter === 'cyber'
      ? 'hue-rotate(180deg) saturate(160%)'
      : activeFilter === 'vivid'
      ? 'saturate(200%)'
      : activeFilter === 'bw'
      ? 'grayscale(100%)'
      : activeFilter === 'warm'
      ? 'sepia(40%)'
      : activeFilter === 'emerald'
      ? 'hue-rotate(90deg)'
      : ''
  }`;

  const handleSaveEdited = () => {
    playSoundEffect('photo_snap', soundEffectsEnabled);
    const editedItem: MediaItem = {
      ...item,
      id: `edited_${Date.now()}`,
      title: `${item.title} (Edited)`,
      dateAdded: new Date().toISOString(),
      tags: [...item.tags, 'edited'],
    };
    onSave(editedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200 select-none">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-white">Photo Studio Editor</h2>
        </div>

        <button
          onClick={handleSaveEdited}
          className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/80 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Copy
        </button>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-8 bg-slate-950 overflow-hidden">
        <img
          src={item.url}
          alt="Edit Preview"
          style={{
            transform: `rotate(${rotation}deg)`,
            filter: combinedFilterStyle,
          }}
          className="max-w-full max-h-[65vh] object-contain rounded-2xl transition-all duration-200 shadow-2xl"
        />
      </div>

      {/* Editor Controls Footer */}
      <div className="p-6 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-6 backdrop-blur-xl">
        {/* Rotation & Quick Flip */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setRotation((r) => r - 90);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            Rotate Left
          </button>
          <button
            onClick={() => {
              setRotation((r) => r + 90);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
          >
            <RotateCw className="w-4 h-4" />
            Rotate Right
          </button>
        </div>

        {/* Preset Filters Row */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Preset Color Profiles</span>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id as any);
                  playSoundEffect('click', soundEffectsEnabled);
                }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all min-w-[80px] ${
                  activeFilter === f.id
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/50'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden border border-slate-700">
                  <img src={item.thumbnailUrl || item.url} alt={f.name} style={f.style} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-semibold">{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Adjustments Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness</span>
              <span>{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="accent-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5 text-purple-400" /> Contrast</span>
              <span>{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="accent-purple-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-cyan-400" /> Saturation</span>
              <span>{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
