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
  { value: 'midnight', label: 'Midnight', icon: <Moon size={20} className="text-indigo-400 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" /> },
  { value: 'sunset', label: 'Sunset', icon: <Sun size={20} className="text-orange-400 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" /> },
];

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const { mode, setMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl bg-card border border-border-subtle shadow-2xl min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Theme Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-card-hover transition-colors min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            <X size={24} className="text-text-secondary min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" />
          </button>
        </div>

        {/* Mode Selection */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Color Mode</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {modeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => { setMode(value); onClose(); }}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${mode === value ? 'bg-white/10 ring-1 ring-accent-yellow' : 'hover:bg-white/5'}`}
              >
                {icon}
                <span className="text-sm font-medium text-text-primary min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{label}</span>
                {mode === value && (
                  <div className="w-2 h-2 rounded-full bg-accent-yellow min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-xs text-text-muted text-center min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            Theme preferences are saved to your browser
          </p>
        </div>
      </div>
    </div>
  );
};
