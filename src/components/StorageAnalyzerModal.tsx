import React, { useState } from 'react';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { formatMediaUrl } from '../utils/mediaUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { HardDrive, Trash2, Copy, AlertTriangle, Sparkles, Check, FileCheck, Layers, PieChart as PieIcon } from 'lucide-react';

interface StorageAnalyzerModalProps {
  items: MediaItem[];
  trashItems: MediaItem[];
  onDeleteDuplicates: (dupIds: string[]) => void;
  onEmptyTrash: () => void;
  onDeleteLargeFile: (id: string) => void;
  onClose: () => void;
  soundEffectsEnabled: boolean;
}

export const StorageAnalyzerModal: React.FC<StorageAnalyzerModalProps> = ({
  items,
  trashItems,
  onDeleteDuplicates,
  onEmptyTrash,
  onDeleteLargeFile,
  onClose,
  soundEffectsEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'duplicates' | 'large_files' | 'trash'>('overview');

  // Calculate storage sizes in bytes
  const photosSize = items.filter((i) => i.type === 'photo').reduce((sum, i) => sum + i.sizeBytes, 0);
  const videosSize = items.filter((i) => i.type === 'video').reduce((sum, i) => sum + i.sizeBytes, 0);
  const audioSize = items.filter((i) => i.type === 'audio').reduce((sum, i) => sum + i.sizeBytes, 0);
  const docsSize = items.filter((i) => i.type === 'document').reduce((sum, i) => sum + i.sizeBytes, 0);
  const trashSize = trashItems.reduce((sum, i) => sum + i.sizeBytes, 0);

  const totalUsedBytes = photosSize + videosSize + audioSize + docsSize + trashSize;
  const totalCapacityBytes = 128 * 1024 * 1024 * 1024; // 128 GB simulated phone storage

  const pieData = [
    { name: 'Photos', value: Math.round(photosSize / 1024 / 1024), color: '#a855f7' },
    { name: 'Videos', value: Math.round(videosSize / 1024 / 1024), color: '#3b82f6' },
    { name: 'Audio', value: Math.round(audioSize / 1024 / 1024), color: '#10b981' },
    { name: 'Documents', value: Math.round(docsSize / 1024 / 1024), color: '#06b6d4' },
    { name: 'Trash Bin', value: Math.round(trashSize / 1024 / 1024), color: '#f43f5e' },
  ];

  // Duplicates list
  const duplicateItems = items.filter((i) => i.isDuplicate);
  // Large files (> 10 MB)
  const largeFiles = items.filter((i) => i.sizeBytes > 10 * 1024 * 1024).sort((a, b) => b.sizeBytes - a.sizeBytes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Storage & Optimizer Center
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Deep Analyzer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {(totalUsedBytes / 1024 / 1024 / 1024).toFixed(2)} GB used of 128 GB phone storage
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('overview');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Usage Charts
          </button>
          <button
            onClick={() => {
              setActiveTab('duplicates');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'duplicates'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicates ({duplicateItems.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('large_files');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'large_files'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Large Files ({largeFiles.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('trash');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Recycle Bin ({trashItems.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Storage Capacity Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Device Storage Usage</span>
                  <span className="text-purple-400">{((totalUsedBytes / totalCapacityBytes) * 100).toFixed(1)}% Full</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${(photosSize / totalCapacityBytes) * 100}%` }} className="bg-purple-500 h-full" />
                  <div style={{ width: `${(videosSize / totalCapacityBytes) * 100}%` }} className="bg-blue-500 h-full" />
                  <div style={{ width: `${(audioSize / totalCapacityBytes) * 100}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${(docsSize / totalCapacityBytes) * 100}%` }} className="bg-cyan-500 h-full" />
                  <div style={{ width: `${(trashSize / totalCapacityBytes) * 100}%` }} className="bg-rose-500 h-full" />
                </div>
              </div>

              {/* Pie Chart & Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col gap-2.5">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <div style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full" />
                        <span className="font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-400">{item.value} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'duplicates' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Found {duplicateItems.length} duplicate media copies
                </span>

                {duplicateItems.length > 0 && (
                  <button
                    onClick={() => {
                      onDeleteDuplicates(duplicateItems.map((d) => d.id));
                      playSoundEffect('delete', soundEffectsEnabled);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
                  >
                    1-Click Delete Duplicates
                  </button>
                )}
              </div>

              {duplicateItems.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800">
                  <FileCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-300">No duplicate photos or videos detected!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {duplicateItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <img src={formatMediaUrl(item.thumbnailUrl || item.url)} alt="Duplicate" className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                        <p className="text-[11px] text-slate-400">{(item.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Duplicate
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'large_files' && (
            <div className="flex flex-col gap-3">
              {largeFiles.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={formatMediaUrl(item.thumbnailUrl || item.url)} alt="Large" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 truncate max-w-xs">{item.title}</h4>
                      <p className="text-[11px] text-amber-400 font-semibold">{(item.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onDeleteLargeFile(item.id);
                      playSoundEffect('delete', soundEffectsEnabled);
                    }}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trash' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                <span className="text-xs font-bold text-rose-300">
                  Recycle Bin ({trashItems.length} items) • Auto purges after 30 days
                </span>

                {trashItems.length > 0 && (
                  <button
                    onClick={() => {
                      onEmptyTrash();
                      playSoundEffect('delete', soundEffectsEnabled);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                  >
                    Empty Trash
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trashItems.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={formatMediaUrl(item.thumbnailUrl || item.url)} alt="Trash" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded-lg">In Trash</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
