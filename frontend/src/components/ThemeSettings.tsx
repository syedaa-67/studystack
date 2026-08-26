import React from 'react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../types/theme';
import { X, Moon, Sun } from 'lucide-react';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'dark', label: 'Dark', icon: <Moon size={20} /> },
  { value: 'light', label: 'Light', icon: <Sun size={20} /> },
  { value: 'midnight', label: 'Midnight', icon: <Moon size={20} className="text-indigo-400" /> },
  { value: 'sunset', label: 'Sunset', icon: <Sun size={20} className="text-orange-400" /> },
];

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const { mode, setMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl bg-card border border-border-subtle shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Theme Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-card-hover transition-colors"
          >
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        {/* Mode Selection */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Color Mode</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => { setMode(value); onClose(); }}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${mode === value ? 'bg-white/10 ring-1 ring-accent-yellow' : 'hover:bg-white/5'}`}
              >
                {icon}
                <span className="text-sm font-medium text-text-primary">{label}</span>
                {mode === value && (
                  <div className="w-2 h-2 rounded-full bg-accent-yellow" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle">
          <p className="text-xs text-text-muted text-center">
            Theme preferences are saved to your browser
          </p>
        </div>
      </div>
    </div>
  );
};