/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { AccountManager } from './components/AccountManager';
import { AccountProvisioningWalkthrough } from './components/AccountProvisioningWalkthrough';
import { GamesDiscovery } from './components/GamesDiscovery';
import { CloudSaveManager } from './components/CloudSaveManager';
import { SyncLogsView } from './components/SyncLogsView';
import { PolicyNoticeModal } from './components/PolicyNoticeModal';
import { VaultExportModal } from './components/VaultExportModal';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_GAMES, 
  INITIAL_CLOUD_SAVES, 
  INITIAL_SYNC_LOGS 
} from './data/mockData';
import { SteamAccount, CloudSaveBackup, SyncLogEntry } from './types';
import { CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'provisioning' | 'games' | 'saves' | 'logs'>('accounts');
  
  // Persisted state in localStorage
  const [accounts, setAccounts] = useState<SteamAccount[]>(() => {
    try {
      const saved = localStorage.getItem('steam_accounts_vault');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [saves, setSaves] = useState<CloudSaveBackup[]>(() => {
    try {
      const saved = localStorage.getItem('steam_cloud_saves');
      return saved ? JSON.parse(saved) : INITIAL_CLOUD_SAVES;
    } catch {
      return INITIAL_CLOUD_SAVES;
    }
  });

  const [logs, setLogs] = useState<SyncLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('steam_sync_logs');
      return saved ? JSON.parse(saved) : INITIAL_SYNC_LOGS;
    } catch {
      return INITIAL_SYNC_LOGS;
    }
  });

  const [games] = useState(INITIAL_GAMES);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);
  const [selectedGameForSaveFilter, setSelectedGameForSaveFilter] = useState<string>('');

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem('steam_accounts_vault', JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem('steam_cloud_saves', JSON.stringify(saves));
    } catch (e) {
      console.error(e);
    }
  }, [saves]);

  useEffect(() => {
    try {
      localStorage.setItem('steam_sync_logs', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  // Notification helper
  const showBanner = (msg: string) => {
    setGlobalBanner(msg);
    setTimeout(() => setGlobalBanner(null), 5000);
  };

  // Account creation handler
  const handleAccountCreated = (newAccount: SteamAccount) => {
    setAccounts(prev => [newAccount, ...prev]);
    
    // Add corresponding sync log
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: SyncLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      accountId: newAccount.id,
      accountUsername: newAccount.username,
      action: 'credentials_check',
      status: 'success',
      latencyMs: 118,
      details: `Account enrolled into Vault via assisted provisioning. ${newAccount.assignedGames.length} titles attached.`
    };
    setLogs(prev => [newLog, ...prev]);

    showBanner(`Successfully enrolled "${newAccount.username}" (${newAccount.email}) into the Vault!`);
    setActiveTab('accounts');
  };

  // Add / remove game from account
  const handleAddGameToAccount = (accountId: string, appId: number) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        if (acc.assignedGames.includes(appId)) return acc;
        return {
          ...acc,
          assignedGames: [...acc.assignedGames, appId],
          gamesCount: acc.assignedGames.length + 1
        };
      }
      return acc;
    }));

    const targetAcc = accounts.find(a => a.id === accountId);
    const game = games.find(g => g.appId === appId);
    if (targetAcc && game) {
      showBanner(`Attached "${game.title}" to ${targetAcc.username}'s library.`);
    }
  };

  const handleRemoveGameFromAccount = (accountId: string, appId: number) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          assignedGames: acc.assignedGames.filter(id => id !== appId),
          gamesCount: Math.max(0, acc.assignedGames.length - 1)
        };
      }
      return acc;
    }));
  };

  // Delete account
  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    showBanner(`Account removed from local vault.`);
  };

  // Sync single account
  const handleSyncAccount = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const latency = Math.floor(70 + Math.random() * 90);

    const newLog: SyncLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      accountId: acc.id,
      accountUsername: acc.username,
      action: 'library_sync',
      status: 'success',
      latencyMs: latency,
      details: `Synchronized ${acc.assignedGames.length} titles. Community status verified: VAC Clean, Guard Active.`
    };

    setLogs(prev => [newLog, ...prev]);
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, lastSynced: 'Just now' } : a));
    showBanner(`Synchronized ${acc.username} with Steamworks Web API (${latency}ms).`);
  };

  // Global sync
  const handleTriggerGlobalSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1200));

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newLogs: SyncLogEntry[] = accounts.map(acc => ({
      id: `log-${Date.now()}-${acc.id}`,
      timestamp: timeStr,
      accountId: acc.id,
      accountUsername: acc.username,
      action: 'status_ping',
      status: 'success',
      latencyMs: Math.floor(80 + Math.random() * 70),
      details: `Global probe: Token valid, VAC clean, ${acc.assignedGames.length} titles active.`
    }));

    setLogs(prev => [...newLogs, ...prev]);
    setIsSyncing(false);
    showBanner(`Global sync completed across ${accounts.length} accounts!`);
  };

  // Cloud saves
  const handleAddSave = (newSave: CloudSaveBackup) => {
    setSaves(prev => [newSave, ...prev]);
    showBanner(`Cloud save snapshot created for "${newSave.gameTitle}".`);
  };

  const handleDeleteSave = (id: string) => {
    setSaves(prev => prev.filter(s => s.id !== id));
    showBanner('Save snapshot deleted.');
  };

  const handleNavigateToSaves = (gameTitle: string) => {
    setSelectedGameForSaveFilter(gameTitle);
    setActiveTab('saves');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accountsCount={accounts.length}
        totalGames={games.length}
        onOpenNewAccount={() => setActiveTab('provisioning')}
        onExportVault={() => setIsExportModalOpen(true)}
        onOpenPolicy={() => setIsPolicyModalOpen(true)}
      />

      {/* Global Notification Banner */}
      {globalBanner && (
        <div className="bg-emerald-950/90 border-b border-emerald-700/60 text-emerald-200 py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-fadeIn z-30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{globalBanner}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'accounts' && (
          <AccountManager
            accounts={accounts}
            games={games}
            onAddGameToAccount={handleAddGameToAccount}
            onRemoveGameFromAccount={handleRemoveGameFromAccount}
            onDeleteAccount={handleDeleteAccount}
            onSyncAccount={handleSyncAccount}
            onAddNewAccountClick={() => setActiveTab('provisioning')}
          />
        )}

        {activeTab === 'provisioning' && (
          <AccountProvisioningWalkthrough
            onAccountCreated={handleAccountCreated}
            availableGames={games}
            existingAccountsCount={accounts.length}
          />
        )}

        {activeTab === 'games' && (
          <GamesDiscovery
            games={games}
            accounts={accounts}
            onAssignToAccount={(accId, appId) => handleAddGameToAccount(accId, appId)}
            onNavigateToSaves={handleNavigateToSaves}
          />
        )}

        {activeTab === 'saves' && (
          <CloudSaveManager
            saves={saves}
            games={games}
            accounts={accounts}
            initialFilterTitle={selectedGameForSaveFilter}
            onAddSave={handleAddSave}
            onDeleteSave={handleDeleteSave}
          />
        )}

        {activeTab === 'logs' && (
          <SyncLogsView
            logs={logs}
            accounts={accounts}
            onTriggerGlobalSync={handleTriggerGlobalSync}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-500 text-xs py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">Steam &amp; Game Hub</span>
            <span>•</span>
            <span>Assisted Onboarding, Game Discovery &amp; Cloud Save Vault</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Policy &amp; Architecture Notes
            </button>
            <span>•</span>
            <span className="text-slate-400">Zero-Phone Anonymous Email Support</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PolicyNoticeModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />

      <VaultExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        accounts={accounts}
        saves={saves}
      />
    </div>
  );
}
