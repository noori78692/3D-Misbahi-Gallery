import React, { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { processFilesFromLocalDevice, SUPPORTED_ANDROID_DIRECTORIES } from '../utils/mediaStoreScanner';
import { mediaStoreService } from '../services/mediaStoreService';
import { MediaStorePlugin } from '../plugins/MediaStorePlugin';
import { MediaItem } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import {
  Smartphone,
  ShieldCheck,
  FolderOpen,
  HardDrive,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PlusCircle,
  FileCheck2,
} from 'lucide-react';

interface AndroidPermissionScannerProps {
  onScanComplete: (items: MediaItem[]) => void;
  soundEffectsEnabled: boolean;
  isLight?: boolean;
}

export const AndroidPermissionScanner: React.FC<AndroidPermissionScannerProps> = ({
  onScanComplete,
  soundEffectsEnabled,
  isLight = false,
}) => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedDirectory, setScannedDirectory] = useState<string>('');

  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grant Android Permission Flow & Automatic Scan
  const handleGrantPermission = async () => {
    playSoundEffect('unlock', soundEffectsEnabled);
    setPermissionGranted(true);
    setIsScanning(true);
    setScanProgress(20);

    try {
      if (Capacitor.getPlatform() === 'android') {
        const checkStatus = await MediaStorePlugin.checkPermissions();
        if (!checkStatus.granted) {
          const reqStatus = await MediaStorePlugin.requestPermissions();
          if (!reqStatus.granted) {
            setIsScanning(false);
            setPermissionGranted(false);
            return;
          }
        }
      }

      setScannedDirectory('Internal Storage & MediaStore');
      setScanProgress(60);

      const result = await mediaStoreService.scanDeviceMedia();
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(result.items);
        playSoundEffect('favorite', soundEffectsEnabled);
      }, 400);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  // Directory / Folder Scanner Handler
  const handleSelectFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsScanning(true);
    setScanProgress(20);
    playSoundEffect('click', soundEffectsEnabled);

    try {
      const files = e.target.files;
      setScannedDirectory('Internal Storage / SD Card');
      setScanProgress(60);

      const newItems = await processFilesFromLocalDevice(files, 'camera');
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(newItems);
        playSoundEffect('favorite', soundEffectsEnabled);
      }, 400);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  // Multiple File Picker Handler
  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsScanning(true);
    setScanProgress(30);
    playSoundEffect('click', soundEffectsEnabled);

    try {
      const files = e.target.files;
      const newItems = await processFilesFromLocalDevice(files, 'camera');
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(newItems);
        playSoundEffect('favorite', soundEffectsEnabled);
      }, 400);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  // Directory / Folder Scanner Handler (Android vs Browser Native)
  const handleNativeDirectoryPicker = async () => {
    if (Capacitor.getPlatform() === 'android') {
      // On Android runtime, scanning is handled exclusively via native ContentResolver MediaStore
      await handleGrantPermission();
      return;
    }

    if ('showDirectoryPicker' in window) {
      try {
        setIsScanning(true);
        setScanProgress(10);
        playSoundEffect('click', soundEffectsEnabled);

        const dirHandle = await (window as any).showDirectoryPicker();
        setScannedDirectory(dirHandle.name);
        setScanProgress(40);

        const filesArr: File[] = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            filesArr.push(file);
          }
        }

        setScanProgress(80);
        const newItems = await processFilesFromLocalDevice(filesArr, 'camera');
        setScanProgress(100);

        setTimeout(() => {
          setIsScanning(false);
          onScanComplete(newItems);
          playSoundEffect('favorite', soundEffectsEnabled);
        }, 400);
      } catch (e) {
        setIsScanning(false);
        // Fallback to hidden file input
        folderInputRef.current?.click();
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto my-6 p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl transition-all ${
      isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Hidden inputs for folder and file selection */}
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-ignore
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleSelectFolder}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleSelectFiles}
      />

      {!permissionGranted ? (
        /* STEP 1: Android MediaStore Storage Permission Request Banner */
        <div className="flex flex-col items-center text-center space-y-6 py-6 animate-in fade-in duration-300">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-purple-950/50 animate-pulse">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-white shadow">
              ANDROID 10-16
            </span>
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Android Storage Permission Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              To view photos, videos, music, and documents stored on your internal storage or SD card, please grant MediaStore permission.
            </p>
          </div>

          <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-2 text-left bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            {SUPPORTED_ANDROID_DIRECTORIES.slice(0, 6).map((dir) => (
              <div key={dir.name} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-sm">{dir.icon}</span>
                <span className="text-[11px] font-bold text-slate-300 truncate">{dir.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleGrantPermission}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-2xl shadow-purple-950/80 transition-all hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-5 h-5" />
            Grant Storage Permission & Start Scanning
          </button>
        </div>
      ) : isScanning ? (
        /* STEP 2: Active Scanning Progress Screen */
        <div className="flex flex-col items-center text-center space-y-6 py-8 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-xl">
            <HardDrive className="w-12 h-12 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">Scanning Local MediaStore...</h3>
            <p className="text-xs text-slate-400">
              Reading Camera, Screenshots, Downloads & WhatsApp folders
            </p>
          </div>

          <div className="w-full max-w-md space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{scannedDirectory || 'Scanning directories...'}</span>
              <span>{scanProgress}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 3: Scanner Control Panel & Directory Pickers */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-500" />
                Scan Android Storage
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your device folders or internal storage to automatically index local photos & videos
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNativeDirectoryPicker}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-950/50 transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                Scan Folder / SD Card
              </button>

              <button
                onClick={Capacitor.getPlatform() === 'android' ? handleGrantPermission : () => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs border border-slate-700 transition-all"
              >
                <Upload className="w-4 h-4" />
                Select Local Files
              </button>
            </div>
          </div>

          {/* Directory Grid Listing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
              Android Storage Paths
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SUPPORTED_ANDROID_DIRECTORIES.map((dir) => (
                <div
                  key={dir.key}
                  onClick={handleNativeDirectoryPicker}
                  className="group flex flex-col p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{dir.icon}</span>
                    <PlusCircle className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 truncate">{dir.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">{dir.path}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
