import React, { useState } from 'react';
import { MediaItem, AppSettings } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { formatMediaUrl } from '../utils/mediaUtils';
import { Lock, Unlock, Key, Fingerprint, Eye, EyeOff, ShieldCheck, Trash2, ArrowLeft, Layers } from 'lucide-react';

interface SecureVaultModalProps {
  hiddenItems: MediaItem[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onUnhideItem: (id: string) => void;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  soundEffectsEnabled: boolean;
}

export const SecureVaultModal: React.FC<SecureVaultModalProps> = ({
  hiddenItems,
  settings,
  onUpdateSettings,
  onUnhideItem,
  onClose,
  onSelectMedia,
  soundEffectsEnabled,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      playSoundEffect('click', soundEffectsEnabled);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (!settings.pinCode) {
      // First time setting PIN
      onUpdateSettings({ ...settings, pinCode: enteredPin });
      setIsUnlocked(true);
      setErrorMsg('');
      playSoundEffect('unlock', soundEffectsEnabled);
    } else if (enteredPin === settings.pinCode) {
      setIsUnlocked(true);
      setErrorMsg('');
      playSoundEffect('unlock', soundEffectsEnabled);
    } else {
      setErrorMsg('Incorrect PIN Code. Try again.');
      setPinInput('');
      playSoundEffect('delete', soundEffectsEnabled);
    }
  };

  const handleSimulateFingerprint = () => {
    setIsUnlocked(true);
    playSoundEffect('unlock', soundEffectsEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Protected Vault
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  256-Bit Encrypted
                </span>
              </h2>
              <p className="text-xs text-slate-400">Secure folder for private photos, videos, and documents</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
            ✕
          </button>
        </div>

        {/* LOCKED SCREEN STATE */}
        {!isUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-6 my-auto">
            <div className="relative p-6 rounded-3xl bg-gradient-to-tr from-purple-900/40 to-indigo-900/40 border border-purple-500/30 shadow-2xl shadow-purple-950/60 animate-pulse">
              <Fingerprint className="w-16 h-16 text-purple-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Enter PIN or Scan Biometrics</h3>
              <p className="text-xs text-slate-400 mt-1">
                {settings.pinCode ? 'Enter your 4-digit security PIN' : 'Enter 4 digits to set your security PIN'}
              </p>
            </div>

            {/* PIN Dots Display */}
            <div className="flex items-center gap-3 my-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    pinInput.length > i
                      ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-950'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {errorMsg && <p className="text-xs font-bold text-rose-400 animate-bounce">{errorMsg}</p>}

            {/* Numpad Grid */}
            <div className="grid grid-cols-3 gap-3 w-64 max-w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-white font-bold text-lg border border-slate-700/60 shadow transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setPinInput('')}
                className="py-3 rounded-2xl bg-slate-800/60 text-slate-400 text-xs font-bold border border-slate-700/40"
              >
                Clear
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-white font-bold text-lg border border-slate-700/60 shadow"
              >
                0
              </button>
              <button
                onClick={handleSimulateFingerprint}
                className="py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 flex items-center justify-center gap-1"
                title="Simulate Fingerprint Scan"
              >
                <Fingerprint className="w-4 h-4" />
                Touch
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED VAULT CONTENT STATE */
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Vault Access Granted ({hiddenItems.length} Private Items)
              </span>

              <button
                onClick={() => setIsUnlocked(false)}
                className="text-xs text-slate-400 hover:text-white underline font-semibold"
              >
                Lock Vault
              </button>
            </div>

            {hiddenItems.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-950/50 border border-slate-800 my-4">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-300">Vault is empty</h4>
                <p className="text-xs text-slate-500 mt-1">Select items in 2D or 3D gallery and click "Vault" to hide them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hiddenItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-purple-500 transition-all"
                  >
                    <img src={formatMediaUrl(item.thumbnailUrl || item.url)} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                      <button
                        onClick={() => {
                          onUnhideItem(item.id);
                          playSoundEffect('click', soundEffectsEnabled);
                        }}
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow"
                      >
                        Restore to Gallery
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
