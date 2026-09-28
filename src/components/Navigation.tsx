import React, { useState } from 'react';
import { 
  Gamepad2, 
  Users, 
  Sparkles, 
  Cloud, 
  Activity, 
  Download,
  PlusCircle,
  HelpCircle,
  FileCode2,
  BarChart3,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Search,
  Keyboard
} from 'lucide-react';

interface NavigationProps {
  activeTab: 'accounts' | 'analytics' | 'provisioning' | 'games' | 'luas' | 'saves' | 'logs';
  setActiveTab: (tab: 'accounts' | 'analytics' | 'provisioning' | 'games' | 'luas' | 'saves' | 'logs') => void;
  accountsCount: number;
  totalGames: number;
  installedLuasCount?: number;
  onOpenNewAccount: () => void;
  onExportVault: () => void;
  onOpenPolicy: () => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcuts?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  accountsCount,
  totalGames,
  installedLuasCount = 0,
  onOpenNewAccount,
  onExportVault,
  onOpenPolicy,
  onOpenCommandPalette,
  onOpenShortcuts
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: 'accounts' | 'analytics' | 'provisioning' | 'games' | 'luas' | 'saves' | 'logs') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none" 
            onClick={() => handleSelectTab('accounts')}
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  STEAM &amp; GAME HUB
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  PRO VAULT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden md:block">
                Account Fleet • Analytics • Live Top Games • .Luas • Cloud Saves
              </p>
            </div>
          </div>

          {/* Quick Metrics - Desktop & Tablet */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 text-xs font-mono bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API Gateway:</span>
              <span className="text-emerald-400 font-bold">Valve Live</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accounts: <b className="text-slate-200">{accountsCount}</b></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Catalog: <b className="text-cyan-300">{totalGames}</b></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>.Luas: <b className="text-emerald-300">{installedLuasCount}</b></span>
            </div>
          </div>

          {/* Primary Top Action buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs border border-slate-800/80 transition"
                title="Quick Command Palette (Ctrl+K or ⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Search &amp; Jump</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ⌘K
                </kbd>
              </button>
            )}

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                title="Keyboard Shortcuts Cheatsheet (?)"
                className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 flex items-center gap-1.5 text-xs font-medium"
              >
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <span className="hidden xl:inline">Shortcuts</span>
              </button>
            )}

            <button
              onClick={onOpenPolicy}
              title="Architecture & Compliance Guidelines"
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 flex items-center gap-1.5 text-xs font-medium"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">Policy</span>
            </button>

            <button
              onClick={onExportVault}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Export Vault</span>
            </button>

            <button
              onClick={onOpenNewAccount}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Account</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg md:hidden border border-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation - Desktop & Tablet Horizontal Scroll */}
        <nav className="hidden md:flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          <button
            onClick={() => handleSelectTab('accounts')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Accounts &amp; Credentials</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {accountsCount}
            </span>
          </button>

          {/* Visual Analytics Dashboard Tab */}
          <button
            onClick={() => handleSelectTab('analytics')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Visual Analytics &amp; Trends</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/60">
              Recharts
            </span>
          </button>

          <button
            onClick={() => handleSelectTab('provisioning')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'provisioning'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Onboarding Wizard</span>
          </button>

          <button
            onClick={() => handleSelectTab('games')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'games'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Steam Live Top Games</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/60">
              {totalGames}
            </span>
          </button>

          <button
            onClick={() => handleSelectTab('luas')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'luas'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>Game .Luas</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/60">
              {installedLuasCount} Active
            </span>
          </button>

          <button
            onClick={() => handleSelectTab('saves')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'saves'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Cloud Saves</span>
          </button>

          <button
            onClick={() => handleSelectTab('logs')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Sync Logs</span>
          </button>
        </nav>

        {/* Mobile Dropdown Menu for Small Screens (< md) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1.5 bg-slate-950/95 rounded-b-2xl shadow-2xl px-2 pb-4 animate-fadeIn">
            {/* Mobile Metric Strip */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800/80 mb-3 text-center text-[11px] font-mono">
              <div>
                <span className="text-slate-400 block">Accounts</span>
                <span className="text-white font-bold text-sm">{accountsCount}</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-slate-400 block">Games</span>
                <span className="text-cyan-400 font-bold text-sm">{totalGames}</span>
              </div>
              <div>
                <span className="text-slate-400 block">.Luas</span>
                <span className="text-emerald-400 font-bold text-sm">{installedLuasCount}</span>
              </div>
            </div>

            {/* Mobile Tabs List */}
            <button
              onClick={() => handleSelectTab('accounts')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'accounts'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Accounts &amp; Credentials</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {accountsCount}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('analytics')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Visual Analytics &amp; Trends</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/60">
                Recharts
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('provisioning')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'provisioning'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Onboarding Wizard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleSelectTab('games')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'games'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>Steam Live Top Games</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 font-mono">
                {totalGames}
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('luas')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'luas'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span>Game .Luas</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-mono">
                {installedLuasCount} Active
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('saves')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'saves'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>Cloud Save Backups</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => handleSelectTab('logs')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'logs'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Sync Logs &amp; Latency</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Command Palette &amp; Search (⌘K)</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenNewAccount();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Provision New Account</span>
              </button>

              {onOpenShortcuts && (
                <button
                  onClick={() => {
                    onOpenShortcuts();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold border border-slate-700"
                >
                  <Keyboard className="w-4 h-4 text-indigo-400" />
                  <span>Shortcuts Cheatsheet (?)</span>
                </button>
              )}

              <button
                onClick={() => {
                  onExportVault();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Vault JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
