import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeMode } from '../types/theme';
import { Moon, Sun, ChevronDown } from 'lucide-react';

const modeIcons: Record<ThemeMode, React.ReactNode> = {
  dark: <Moon size={18} />,
  light: <Sun size={18} />,
  midnight: <Moon size={18} className="text-indigo-400 " />,
  sunset: <Sun size={18} className="text-orange-400 " />
};

const modeLabels: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  midnight: 'Midnight',
  sunset: 'Sunset'
};

export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const modes: ThemeMode[] = ['dark', 'light', 'midnight', 'sunset'];

  return (
    <div className="relative ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 flex items-center gap-2 "
        aria-label="Theme settings"
      >
        {modeIcons[mode]}
        <span className="text-xs text-gray-400 hidden sm:inline ">{modeLabels[mode]}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 " onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-56 p-3 rounded-xl bg-gray-900/95 border border-white/10 shadow-2xl backdrop-blur-sm ">
            <div className="space-y-2 ">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 ">Theme</h4>
              <div className="grid grid-cols-5 gap-1 ">
                {modes.map((m) => {
                  const isActive = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5"}`}
                      title={modeLabels[m]}
                    >
                      <div className="text-lg ">{modeIcons[m]}</div>
                      <span className="text-[9px] font-medium ">{modeLabels[m]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-white/5 text-center ">
                <p className="text-[10px] text-gray-500 ">
                  Current: <span className="text-gray-300 ">{modeLabels[mode]}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
