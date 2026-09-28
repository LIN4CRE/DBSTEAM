import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  Gamepad2,
  BarChart3,
  Cloud,
  Activity,
  FileCode2,
  Sparkles,
  Download,
  Zap,
  ArrowRight,
  ExternalLink,
  Share2,
  RefreshCw,
  PlusCircle,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { SteamAccount, GameTitle, GameLuaScript } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SteamAccount[];
  games: GameTitle[];
  luaScripts: GameLuaScript[];
  onNavigateTab: (tab: 'accounts' | 'analytics' | 'provisioning' | 'games' | 'saves' | 'logs' | 'luas') => void;
  onTriggerGlobalSync: () => void;
  onExportVault: () => void;
  onSeedDemoFleet: () => void;
  onProbeNetwork: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Actions' | 'Accounts' | 'Games';
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  accounts,
  games,
  luaScripts,
  onNavigateTab,
  onTriggerGlobalSync,
  onExportVault,
  onSeedDemoFleet,
  onProbeNetwork
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct all available command items
  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-accounts',
      title: 'Accounts & Credentials Vault',
      subtitle: `View all ${accounts.length} enrolled Steam accounts`,
      category: 'Navigation',
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      action: () => { onNavigateTab('accounts'); onClose(); },
      badge: `${accounts.length}`
    },
    {
      id: 'nav-analytics',
      title: 'Visual Analytics & Trends Dashboard',
      subtitle: 'View growth curves, genre composition, and playtime leaderboards',
      category: 'Navigation',
      icon: <BarChart3 className="w-4 h-4 text-cyan-400" />,
      action: () => { onNavigateTab('analytics'); onClose(); },
      badge: 'Recharts'
    },
    {
      id: 'nav-games',
      title: 'Steam Live Top Games Directory',
      subtitle: `Explore 100+ paid commercial games and live AI search`,
      category: 'Navigation',
      icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
      action: () => { onNavigateTab('games'); onClose(); },
      badge: `${games.length}`
    },
    {
      id: 'nav-luas',
      title: 'Game .Luas & Automation Hooks',
      subtitle: `Manage ${luaScripts.length} verified game scripts and CET extenders`,
      category: 'Navigation',
      icon: <FileCode2 className="w-4 h-4 text-emerald-400" />,
      action: () => { onNavigateTab('luas'); onClose(); },
      badge: `${luaScripts.filter(s => s.isInstalled).length} Active`
    },
    {
      id: 'nav-saves',
      title: 'Cloud Save Backup Center',
      subtitle: 'Manage local and multi-account game save snapshots with SHA-256',
      category: 'Navigation',
      icon: <Cloud className="w-4 h-4 text-sky-400" />,
      action: () => { onNavigateTab('saves'); onClose(); }
    },
    {
      id: 'nav-provisioning',
      title: 'Account Onboarding Wizard',
      subtitle: 'Launch assisted anonymous account setup without phone requirements',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => { onNavigateTab('provisioning'); onClose(); }
    },
    {
      id: 'nav-logs',
      title: 'Sync Logs & Network Performance',
      subtitle: 'View real-time Valve API latency telemetry and audit trail',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      action: () => { onNavigateTab('logs'); onClose(); }
    },

    // Quick Actions
    {
      id: 'act-sync-all',
      title: 'Probe & Sync All Accounts',
      subtitle: 'Ping Valve edge servers and refresh status for all accounts in vault',
      category: 'Actions',
      icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
      action: () => { onTriggerGlobalSync(); onClose(); },
      badge: 'Sync'
    },
    {
      id: 'act-export-vault',
      title: 'Export Complete Vault (JSON / CSV)',
      subtitle: 'Download complete backup of credentials and cloud save mappings',
      category: 'Actions',
      icon: <Download className="w-4 h-4 text-indigo-400" />,
      action: () => { onExportVault(); onClose(); },
      badge: 'Export'
    },
    {
      id: 'act-seed-fleet',
      title: 'Load Sample Fleet for Analytics',
      subtitle: 'Instantly populate 5 diverse managed accounts to visualize graphs',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      action: () => { onSeedDemoFleet(); onClose(); },
      badge: 'Demo Fleet'
    },
    {
      id: 'act-probe-ping',
      title: 'Probe Valve Edge Round-Trip Latency',
      subtitle: 'Send real HTTP ping to Valve Steam API to measure live network speed',
      category: 'Actions',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: () => { onProbeNetwork(); onClose(); },
      badge: 'Network'
    }
  ];

  // Add matching accounts
  accounts.forEach(acc => {
    allCommands.push({
      id: `acc-${acc.id}`,
      title: acc.username,
      subtitle: `${acc.email} • SteamID64: ${acc.steamId64} • ${acc.assignedGames.length} games`,
      category: 'Accounts',
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onNavigateTab('accounts');
        onClose();
      },
      badge: acc.status === 'ready_for_distribution' ? 'Ready for Handoff' : acc.status
    });
  });

  // Add matching top games
  games.forEach(game => {
    allCommands.push({
      id: `game-${game.appId}`,
      title: game.title,
      subtitle: `AppID: ${game.appId} • ${game.genre.join(', ')} • $${game.currentPrice.toFixed(2)}`,
      category: 'Games',
      icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
      action: () => {
        window.open(`steam://install/${game.appId}`, '_blank');
        onClose();
      },
      badge: `$${game.currentPrice.toFixed(2)}`
    });
  });

  // Filter items based on query
  const filteredCommands = allCommands.filter(cmd => {
    if (!query.trim()) return cmd.category === 'Navigation' || cmd.category === 'Actions';
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 p-4 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, account, game title, or action..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commands, accounts, or games found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition ${
                    isSelected
                      ? 'bg-indigo-600/30 text-white border border-indigo-500/50 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-indigo-950/90 border-indigo-600' : 'bg-slate-950 border-slate-800'
                    }`}>
                      {cmd.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-white truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {cmd.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {cmd.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 hidden sm:inline-block">
                        {cmd.badge}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">ESC</kbd> Close</span>
          </div>
          <span className="text-cyan-400 font-bold hidden sm:inline">Steam Hub Pro Vault</span>
        </div>
      </div>
    </div>
  );
};
