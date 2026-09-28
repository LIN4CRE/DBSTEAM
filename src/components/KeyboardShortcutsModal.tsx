import React, { useEffect } from 'react';
import { 
  Keyboard, 
  X, 
  Search, 
  Download, 
  RefreshCw, 
  Users, 
  Gamepad2, 
  BarChart3, 
  Sparkles, 
  Cloud, 
  FileCode2, 
  Activity,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  altKeys?: string[];
  description: string;
  icon: React.ReactNode;
}

interface ShortcutSection {
  title: string;
  description?: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutSections: ShortcutSection[] = [
    {
      title: 'Global Fast Actions',
      items: [
        {
          keys: ['⌘', 'K'],
          altKeys: ['Ctrl', 'K'],
          description: 'Open Command Palette & Instant Search',
          icon: <Search className="w-4 h-4 text-cyan-400" />
        },
        {
          keys: ['?'],
          description: 'Toggle Keyboard Shortcuts Cheatsheet',
          icon: <HelpCircle className="w-4 h-4 text-indigo-400" />
        },
        {
          keys: ['Ctrl', 'E'],
          description: 'Quick Export Accounts & Save Vault',
          icon: <Download className="w-4 h-4 text-emerald-400" />
        },
        {
          keys: ['Ctrl', 'Shift', 'S'],
          description: 'Trigger Global Valve Network Sync',
          icon: <RefreshCw className="w-4 h-4 text-purple-400" />
        },
        {
          keys: ['Esc'],
          description: 'Close active modal, drawer, or dropdown',
          icon: <X className="w-4 h-4 text-rose-400" />
        }
      ]
    },
    {
      title: 'Quick Tab Navigation (Number Keys)',
      description: 'Press any number key when not typing in text fields to switch views instantly:',
      items: [
        {
          keys: ['1'],
          description: 'Accounts Fleet Manager',
          icon: <Users className="w-4 h-4 text-indigo-400" />
        },
        {
          keys: ['2'],
          description: 'Visual Analytics & Growth Dashboard',
          icon: <BarChart3 className="w-4 h-4 text-cyan-400" />
        },
        {
          keys: ['3'],
          description: 'Account Provisioning Wizard',
          icon: <Sparkles className="w-4 h-4 text-purple-400" />
        },
        {
          keys: ['4'],
          description: 'Game Discovery & Curated Catalog',
          icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />
        },
        {
          keys: ['5'],
          description: 'Game .Lua Mod Scripts',
          icon: <FileCode2 className="w-4 h-4 text-teal-400" />
        },
        {
          keys: ['6'],
          description: 'Cloud Save Snapshots & Backups',
          icon: <Cloud className="w-4 h-4 text-sky-400" />
        },
        {
          keys: ['7'],
          description: 'Sync Logs & Network Telemetry',
          icon: <Activity className="w-4 h-4 text-amber-400" />
        }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Keyboard Shortcuts &amp; Pro Tips</h2>
              <p className="text-xs text-slate-400">Power user shortcuts to navigate and manage your Steam fleet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300 divide-y divide-slate-800/80">
          {shortcutSections.map((section, sIdx) => (
            <div key={sIdx} className={sIdx > 0 ? 'pt-5' : ''}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {section.title}
              </h3>
              {section.description && (
                <p className="text-xs text-slate-500 mb-3">{section.description}</p>
              )}
              <div className="space-y-2 mt-2">
                {section.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="text-xs text-slate-300 font-medium">{item.description}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 font-mono">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 text-[11px] font-semibold text-cyan-300 bg-slate-800 border border-slate-700 rounded-md shadow-inner"
                        >
                          {k}
                        </kbd>
                      ))}
                      {item.altKeys && (
                        <>
                          <span className="text-xs text-slate-500 px-1">or</span>
                          {item.altKeys.map((k, kIdx) => (
                            <kbd
                              key={kIdx}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-md shadow-inner"
                            >
                              {k}
                            </kbd>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pro Tips Footer */}
          <div className="pt-4">
            <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 rounded-xl p-3.5 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-200">Steam Desktop Client Integration</span>
                <p className="text-slate-400 leading-relaxed">
                  Clicking "Install" or "Play" automatically triggers native <code className="text-cyan-300">steam://install/&lt;appId&gt;</code> and <code className="text-cyan-300">steam://run/&lt;appId&gt;</code> protocol handlers registered by your installed Steam client.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-cyan-300">Esc</kbd> anytime to dismiss</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
