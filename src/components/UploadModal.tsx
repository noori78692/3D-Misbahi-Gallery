import React, { useState } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { Upload, Sparkles, Check, Image, Film, Music, FileText, X } from 'lucide-react';

interface UploadModalProps {
  onAddMediaItem: (newItem: MediaItem) => void;
  onClose: () => void;
  soundEffectsEnabled: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onAddMediaItem, onClose, soundEffectsEnabled }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;
    setIsUploading(true);
    setStatusText('Processing file & AI auto-tagging...');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const fileUrl = e.target?.result as string;

        let type: 'photo' | 'video' | 'audio' | 'document' = 'photo';
        if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (!file.type.startsWith('image/')) type = 'document';

        // AI analysis trigger
        let aiTags = ['User Upload', 'Gallery'];
        let aiDescription = 'Uploaded to 3D Misbahi Gallery.';

        try {
          const res = await fetch('/api/ai/analyze-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: file.name,
              type,
              base64Image: type === 'photo' ? fileUrl : undefined,
            }),
          });
          const aiData = await res.json();
          if (aiData.tags) aiTags = aiData.tags;
          if (aiData.description) aiDescription = aiData.description;
        } catch (err) {
          console.warn('AI tagging fallback', err);
        }

        const newItem: MediaItem = {
          id: `upload_${Date.now()}_${i}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type,
          source: 'camera',
          url: fileUrl,
          thumbnailUrl: fileUrl,
          sizeBytes: file.size,
          dateAdded: new Date().toISOString(),
          dateTaken: new Date().toISOString(),
          year: new Date().getFullYear(),
          month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          tags: aiTags,
          aiDescription,
          isFavorite: false,
          isHidden: false,
          isInTrash: false,
        };

        onAddMediaItem(newItem);
        playSoundEffect('photo_snap', soundEffectsEnabled);
      };

      reader.readAsDataURL(file);
    }

    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Import Media Files
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Auto-Tag
                </span>
              </h2>
              <p className="text-xs text-slate-400">Photos, Videos, Audio tracks & Documents</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag Drop Target */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all cursor-pointer ${
            dragActive ? 'border-purple-500 bg-purple-950/20' : 'border-slate-800 hover:border-purple-500/50 bg-slate-950/50'
          }`}
        >
          <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Drag & drop files here</h3>
            <p className="text-xs text-slate-400 mt-1">or click below to choose from device storage</p>
          </div>

          <label className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/80 cursor-pointer transition-all">
            Choose Local Files
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />
          </label>

          {statusText && <p className="text-xs font-semibold text-purple-300 animate-pulse">{statusText}</p>}
        </div>
      </div>
    </div>
  );
};
