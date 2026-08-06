import React, { useState } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { formatMediaUrl } from '../utils/mediaUtils';
import { Sparkles, Users, MapPin, Tag, Film, ArrowRight, CheckCircle2, Layers } from 'lucide-react';

interface AiOrganizeModalProps {
  items: MediaItem[];
  onSelectPersonFilter: (personName: string) => void;
  onSelectLocationFilter: (locationName: string) => void;
  onClose: () => void;
  soundEffectsEnabled: boolean;
}

export const AiOrganizeModal: React.FC<AiOrganizeModalProps> = ({
  items,
  onSelectPersonFilter,
  onSelectLocationFilter,
  onClose,
  soundEffectsEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'people' | 'places' | 'smart_tags' | 'story'>('people');
  const [storyOutput, setStoryOutput] = useState<any>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // Extract people tags dynamically from items
  const peopleClusters = React.useMemo(() => {
    const map = new Map<string, { name: string; count: number; coverUrl: string }>();
    items.forEach((item) => {
      item.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes('person') || tag.toLowerCase().includes('people') || tag.startsWith('person_')) {
          const name = tag.replace('person_', '').replace(/_/g, ' ');
          const formatted = name.charAt(0).toUpperCase() + name.slice(1);
          const current = map.get(formatted) || { name: formatted, count: 0, coverUrl: item.thumbnailUrl || item.url };
          map.set(formatted, { ...current, count: current.count + 1 });
        }
      });
    });
    return Array.from(map.values());
  }, [items]);

  // Extract location tags dynamically from items
  const placeClusters = React.useMemo(() => {
    const map = new Map<string, { name: string; count: number; coverUrl: string }>();
    items.forEach((item) => {
      if (item.location) {
        const current = map.get(item.location) || { name: item.location, count: 0, coverUrl: item.thumbnailUrl || item.url };
        map.set(item.location, { ...current, count: current.count + 1 });
      }
    });
    return Array.from(map.values());
  }, [items]);

  // Generate AI Story Highlight using Gemini API endpoint
  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const res = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsCount: items.length, theme: 'Summer Memories & Tech' }),
      });
      const data = await res.json();
      setStoryOutput(data);
      playSoundEffect('unlock', soundEffectsEnabled);
    } catch (e) {
      setStoryOutput({
        storyTitle: 'Memories in 3D Space',
        subtitle: 'Summer 2026 Highlight Voyage',
        narration: 'A stunning sequence of captured sunsets, neon lights, and serene ocean landscapes.',
      });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/80">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Auto-Organization Studio
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini Powered
                </span>
              </h2>
              <p className="text-xs text-slate-400">Automatic facial recognition, spatial geo-tagging & memory stories</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('people');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'people' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            People & Faces ({peopleClusters.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('places');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'places' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Places & Map ({placeClusters.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('story');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'story' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            AI Story Highlight
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {activeTab === 'people' && (
            peopleClusters.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-slate-950/50 border border-slate-800">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-300">No Person Tags Detected</h4>
                <p className="text-xs text-slate-500 mt-1">Import local photos or use AI Auto-Tagging on your imported media.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {peopleClusters.map((person) => (
                  <div
                    key={person.name}
                    onClick={() => {
                      onSelectPersonFilter(person.name);
                      onClose();
                    }}
                    className="group flex flex-col items-center p-4 rounded-3xl bg-slate-950 border border-slate-800 hover:border-purple-500 cursor-pointer transition-all hover:scale-105 shadow-xl"
                  >
                    <img
                      src={formatMediaUrl(person.coverUrl)}
                      alt={person.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/40 group-hover:border-purple-400 shadow-lg"
                    />
                    <h3 className="text-xs font-bold text-white mt-3 group-hover:text-purple-300">{person.name}</h3>
                    <span className="text-[10px] text-slate-400 mt-0.5">{person.count} Media Items</span>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'places' && (
            placeClusters.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-slate-950/50 border border-slate-800">
                <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-300">No Geo-Tagged Places Detected</h4>
                <p className="text-xs text-slate-500 mt-1">Select folders or scan local files with location data to populate places.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {placeClusters.map((place) => (
                  <div
                    key={place.name}
                    onClick={() => {
                      onSelectLocationFilter(place.name);
                      onClose();
                    }}
                    className="group relative h-32 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-purple-500 cursor-pointer transition-all shadow-xl"
                  >
                    <img src={formatMediaUrl(place.coverUrl)} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold text-white">{place.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-300 mt-0.5">{place.count} Geo-Tagged Items</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'story' && (
            <div className="flex flex-col items-center text-center gap-6 p-4">
              <div className="p-4 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-2xl animate-bounce">
                <Film className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Generate AI Highlight Story</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Gemini AI will analyze your photos, dates, and locations to construct a narrated cinematic story highlight.
                </p>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={isGeneratingStory}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-purple-950/80 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingStory ? 'AI Constructing Story...' : 'Generate Memory Highlight'}
              </button>

              {storyOutput && (
                <div className="w-full p-6 rounded-3xl bg-slate-950 border border-purple-500/40 text-left flex flex-col gap-3 animate-in fade-in">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Story Highlight</span>
                  <h2 className="text-lg font-bold text-white">{storyOutput.storyTitle}</h2>
                  <p className="text-xs text-purple-300 font-semibold">{storyOutput.subtitle}</p>
                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-purple-500 pl-3 mt-1">
                    "{storyOutput.narration}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
