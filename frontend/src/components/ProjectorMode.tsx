import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Minus, Palette, AlignLeft, AlignCenter, AlignRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjector } from '../contexts/useProjector';
import type { Lyric } from '../api/lyrics';

interface ProjectorModeProps {
  lyric?: Lyric;
  lyrics?: Lyric[];
  onClose: () => void;
}

export default function ProjectorMode({ lyric, lyrics, onClose }: ProjectorModeProps) {
  const { settings, updateSettings, increaseFontSize, decreaseFontSize, applyTheme } = useProjector();
  const [showControls, setShowControls] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayMode, setDisplayMode] = useState<'full' | 'line'>('full');
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Support both single lyric and multiple lyrics
  const lyricsArray = lyrics || (lyric ? [lyric] : []);
  const currentLyric = lyricsArray[currentLyricIndex];

  const lines = currentLyric ? currentLyric.content.split('\n').filter(line => line.trim() !== '') : [];

  // Reset line when lyric changes
  useEffect(() => {
    setCurrentLine(0);
  }, [currentLyricIndex]);

  const goToNextLyric = useCallback(() => {
    if (lyricsArray.length > 1) {
      setCurrentLyricIndex((prev) => (prev + 1) % lyricsArray.length);
    }
  }, [lyricsArray.length]);

  const goToPreviousLyric = useCallback(() => {
    if (lyricsArray.length > 1) {
      setCurrentLyricIndex((prev) => (prev - 1 + lyricsArray.length) % lyricsArray.length);
    }
  }, [lyricsArray.length]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && displayMode === 'line') {
        setCurrentLine(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' && displayMode === 'line') {
        setCurrentLine(prev => Math.min(lines.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' && lyricsArray.length > 1) {
        goToPreviousLyric();
      } else if (e.key === 'ArrowRight' && lyricsArray.length > 1) {
        goToNextLyric();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        increaseFontSize();
      } else if (e.key === '-' || e.key === '_') {
        decreaseFontSize();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [displayMode, lines.length, onClose, increaseFontSize, decreaseFontSize, lyricsArray.length, goToNextLyric, goToPreviousLyric]);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Measure navbar height when it's visible
  useEffect(() => {
    if (showControls && navbarRef.current) {
      const height = navbarRef.current.offsetHeight;
      setNavbarHeight(height);
    } else if (!showControls) {
      setNavbarHeight(0);
    }
  }, [showControls]);

  if (!currentLyric) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: settings.backgroundColor,
        color: settings.textColor
      }}
      onMouseMove={() => setShowControls(true)}
    >
      <div
        ref={navbarRef}
        className={`absolute top-0 left-0 right-0 bg-black bg-opacity-90 p-4 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-white font-semibold text-lg">{currentLyric.title}</h2>
            {lyricsArray.length > 1 && (
              <span className="text-white text-sm opacity-75">
                ({currentLyricIndex + 1} / {lyricsArray.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={decreaseFontSize}
              className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-white text-sm px-3">{settings.fontSize}px</span>
            <button
              onClick={increaseFontSize}
              className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ textAlign: 'left' })}
              className={`p-2 rounded transition ${
                settings.textAlign === 'left'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <AlignLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => updateSettings({ textAlign: 'center' })}
              className={`p-2 rounded transition ${
                settings.textAlign === 'center'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <AlignCenter className="w-5 h-5" />
            </button>
            <button
              onClick={() => updateSettings({ textAlign: 'right' })}
              className={`p-2 rounded transition ${
                settings.textAlign === 'right'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <AlignRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyTheme('dark')}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                settings.theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => applyTheme('light')}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                settings.theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Light
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white text-sm flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              BG:
            </label>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => updateSettings({ backgroundColor: e.target.value, theme: 'custom' })}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <label className="text-white text-sm ml-2">Text:</label>
            <input
              type="color"
              value={settings.textColor}
              onChange={(e) => updateSettings({ textColor: e.target.value, theme: 'custom' })}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode('full')}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                displayMode === 'full'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setDisplayMode('line')}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                displayMode === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Line by Line
            </button>
          </div>

          {lyricsArray.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousLyric}
                className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                title="Previous lyric (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextLyric}
                className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                title="Next lyric (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        className="flex items-center justify-center h-full p-8 overflow-hidden transition-all duration-300"
        style={{
          paddingTop: showControls ? `${navbarHeight + 32}px` : '32px'
        }}
      >
        <div
          className="max-w-6xl w-full h-full overflow-y-auto overflow-x-hidden"
          style={{
            fontSize: `${settings.fontSize}px`,
            textAlign: settings.textAlign,
            lineHeight: '1.5'
          }}
        >
          {displayMode === 'full' ? (
            <pre className="whitespace-pre-wrap font-sans">{currentLyric.content}</pre>
          ) : (
            <div className="font-sans">
              {lines[currentLine]}
              <div className="mt-8 text-sm opacity-50">
                Line {currentLine + 1} of {lines.length}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-sm opacity-50">
        Press ESC to exit | ↑↓ to navigate lines | +/- to adjust font
        {lyricsArray.length > 1 && ' | ←→ to navigate lyrics'}
      </div>
    </div>
  );
}
