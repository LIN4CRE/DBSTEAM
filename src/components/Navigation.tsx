import React from 'react';
import { 
  Gamepad2, 
  Users, 
  Sparkles, 
  Database, 
  Cloud, 
  Activity, 
  ShieldCheck, 
  Download,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface NavigationProps {
  activeTab: 'accounts' | 'provisioning' | 'games' | 'saves' | 'logs';
  setActiveTab: (tab: 'accounts' | 'provisioning' | 'games' | 'saves' | 'logs') => void;
  accountsCount: number;
  totalGames: number;
  onOpenNewAccount: () => void;
  onExportVault: () => void;
  onOpenPolicy: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  accountsCount,
  totalGames,
  onOpenNewAccount,
  onExportVault,
  onOpenPolicy
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('accounts')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  STEAM &amp; GAME HUB
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  PRO VAULT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Account Manager • Top Games • Cloud Saves
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center space-x-4 text-xs font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sync Daemon:</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accounts: <b className="text-slate-200">{accountsCount}</b></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tracked Games: <b className="text-slate-200">{totalGames}</b></span>
            </div>
          </div>

          {/* Primary Top Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenPolicy}
              title="Architecture & Compliance Guidelines"
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 flex items-center gap-1.5 text-xs font-medium"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Policy &amp; Architecture</span>
            </button>

            <button
              onClick={onExportVault}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export Vault</span>
            </button>

            <button
              onClick={onOpenNewAccount}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Account Wizard</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Accounts &amp; Credentials Vault</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {accountsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('provisioning')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'provisioning'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Account Onboarding Walkthrough</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-cyan-900/60 text-cyan-300 font-mono">
              Auto-Assist
            </span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'games'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>SteamDB Top Paid Games</span>
          </button>

          <button
            onClick={() => setActiveTab('saves')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'saves'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Cloud Save Backup Center</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Sync Logs &amp; Performance</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
