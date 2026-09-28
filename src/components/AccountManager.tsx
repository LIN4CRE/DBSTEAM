import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Key, 
  Gamepad2, 
  Clock, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Share2, 
  Trash2, 
  Plus, 
  Filter, 
  Search, 
  Download, 
  AlertCircle, 
  Globe, 
  RefreshCw, 
  UserCheck, 
  CheckSquare, 
  Square, 
  MinusSquare, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  FileSpreadsheet,
  ArrowUpDown,
  LayoutGrid,
  List,
  Edit3,
  Tag,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { SteamAccount, GameTitle, AccountStatus } from '../types';

interface AccountManagerProps {
  accounts: SteamAccount[];
  games: GameTitle[];
  onAddGameToAccount: (accountId: string, appId: number) => void;
  onRemoveGameFromAccount: (accountId: string, appId: number) => void;
  onDeleteAccount: (accountId: string) => void;
  onSyncAccount: (accountId: string) => void;
  onAddNewAccountClick: () => void;
  onImportRealProfile: (account: SteamAccount) => void;
  onUpdateAccount?: (account: SteamAccount) => void;
  // Bulk actions handlers
  onBulkSync?: (accountIds: string[]) => Promise<void> | void;
  onBulkAssignGames?: (accountIds: string[], appIds: number[]) => void;
  onBulkDelete?: (accountIds: string[]) => void;
  onBulkUpdateStatus?: (accountIds: string[], status: AccountStatus) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  games,
  onAddGameToAccount,
  onRemoveGameFromAccount,
  onDeleteAccount,
  onSyncAccount,
  onAddNewAccountClick,
  onImportRealProfile,
  onUpdateAccount,
  onBulkSync,
  onBulkAssignGames,
  onBulkDelete,
  onBulkUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'username' | 'games_count' | 'playtime' | 'status'>('recent');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isBulkExportModalOpen, setIsBulkExportModalOpen] = useState(false);
  const [bulkSelectedGameIds, setBulkSelectedGameIds] = useState<Set<number>>(new Set());
  const [bulkGameSearchQuery, setBulkGameSearchQuery] = useState('');
  
  // Single Distribution / Game modal state
  const [distributionModalAccount, setDistributionModalAccount] = useState<SteamAccount | null>(null);
  const [gamePickerModalAccount, setGamePickerModalAccount] = useState<SteamAccount | null>(null);

  // Edit Notes & Tags Modal
  const [editingNotesAccount, setEditingNotesAccount] = useState<SteamAccount | null>(null);
  const [editNotesValue, setEditNotesValue] = useState('');
  const [editTagsValue, setEditTagsValue] = useState('');

  // Real Steam Profile Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importIdentifier, setImportIdentifier] = useState('');
  const [importEmail, setImportEmail] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const togglePasswordVisibility = (accountId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered & Sorted Accounts
  const filteredAccounts = useMemo(() => {
    const list = accounts.filter(acc => {
      const matchesSearch = 
        acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.steamId64.includes(searchQuery) ||
        (acc.tags && acc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Apply Sorting
    list.sort((a, b) => {
      if (sortBy === 'username') return a.username.localeCompare(b.username);
      if (sortBy === 'games_count') return b.assignedGames.length - a.assignedGames.length;
      if (sortBy === 'playtime') return (b.totalPlaytimeHours || 0) - (a.totalPlaytimeHours || 0);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      // Default: recent
      return new Date(b.createdAt || '2026-01-01').getTime() - new Date(a.createdAt || '2026-01-01').getTime();
    });

    return list;
  }, [accounts, searchQuery, statusFilter, sortBy]);

  // Bulk Selection Helpers
  const isAllSelected = filteredAccounts.length > 0 && filteredAccounts.every(a => selectedAccountIds.has(a.id));
  const isPartiallySelected = filteredAccounts.some(a => selectedAccountIds.has(a.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAccountIds(prev => {
        const next = new Set(prev);
        filteredAccounts.forEach(a => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedAccountIds(prev => {
        const next = new Set(prev);
        filteredAccounts.forEach(a => next.add(a.id));
        return next;
      });
    }
  };

  const handleToggleSelectAccount = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAccountIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedAccountIds(new Set());
  };

  // Bulk Actions Handlers
  const handleExecuteBulkSync = async () => {
    if (selectedAccountIds.size === 0) return;
    setIsBulkSyncing(true);
    const ids = Array.from(selectedAccountIds);

    if (onBulkSync) {
      await onBulkSync(ids);
    } else {
      for (const id of ids) {
        onSyncAccount(id);
      }
    }
    setIsBulkSyncing(false);
  };

  const handleExecuteBulkAssignGames = () => {
    if (selectedAccountIds.size === 0 || bulkSelectedGameIds.size === 0) return;
    const accountIds = Array.from(selectedAccountIds);
    const appIds = Array.from(bulkSelectedGameIds);

    if (onBulkAssignGames) {
      onBulkAssignGames(accountIds, appIds);
    } else {
      accountIds.forEach(accId => {
        appIds.forEach(appId => {
          onAddGameToAccount(accId, appId);
        });
      });
    }

    setIsBulkAssignModalOpen(false);
    setBulkSelectedGameIds(new Set());
  };

  const handleExecuteBulkDelete = () => {
    const count = selectedAccountIds.size;
    if (count === 0) return;
    if (window.confirm(`Are you sure you want to permanently remove ${count} selected account(s) from your local vault?`)) {
      const ids = Array.from(selectedAccountIds);
      if (onBulkDelete) {
        onBulkDelete(ids);
      } else {
        ids.forEach(id => onDeleteAccount(id));
      }
      setSelectedAccountIds(new Set());
    }
  };

  const handleExecuteBulkStatusChange = (newStatus: AccountStatus) => {
    const ids = Array.from(selectedAccountIds);
    if (onBulkUpdateStatus) {
      onBulkUpdateStatus(ids, newStatus);
    }
  };

  // Notes & Tags Editor
  const handleOpenEditNotes = (acc: SteamAccount) => {
    setEditingNotesAccount(acc);
    setEditNotesValue(acc.notes || '');
    setEditTagsValue((acc.tags || []).join(', '));
  };

  const handleSaveEditedNotes = () => {
    if (!editingNotesAccount) return;
    const parsedTags = editTagsValue
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const updated: SteamAccount = {
      ...editingNotesAccount,
      notes: editNotesValue.trim(),
      tags: parsedTags
    };

    if (onUpdateAccount) {
      onUpdateAccount(updated);
    }
    setEditingNotesAccount(null);
  };

  const getHandoffText = (acc: SteamAccount) => {
    const accountGames = games.filter(g => acc.assignedGames.includes(g.appId)).map(g => `• ${g.title}`).join('\n');
    return `🎮 STEAM ACCOUNT GIVEAWAY HANDOFF PACKAGE
==================================================
Username: ${acc.username}
Password: ${acc.passwordHash || '(Kept private or managed via Steam Guard)'}
Email: ${acc.email}
SteamID64: ${acc.steamId64}
Steam Guard: ${acc.steamGuard}
VAC Status: ${acc.vacStatus}

INCLUDED TITLES (${acc.assignedGames.length}):
${accountGames || '• Standard library'}

HOW TO ACCESS:
1. Log into Steam Client using the credentials above.
2. If Steam Guard prompts for a code, check ${acc.email.endsWith('@linacre.site') ? `your primary inbox (emails to ${acc.email} are routed via linacre.site catch-all)` : `the inbox for ${acc.email}`}.
3. Once logged in, download any title from your Library.
==================================================`;
  };

  const getBulkExportHandoffText = () => {
    const selectedAccounts = accounts.filter(a => selectedAccountIds.has(a.id));
    return selectedAccounts.map(acc => getHandoffText(acc)).join('\n\n' + '='.repeat(50) + '\n\n');
  };

  const handleDownloadBulkJson = () => {
    const selectedAccounts = accounts.filter(a => selectedAccountIds.has(a.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedAccounts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `steam_accounts_bulk_${selectedAccounts.length}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Real Profile Import via Steam Community
  const handleFetchRealSteamProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importIdentifier.trim()) return;

    setIsImporting(true);
    setImportError(null);

    try {
      let cleanId = importIdentifier.trim();
      const idMatch = cleanId.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
      const profileMatch = cleanId.match(/steamcommunity\.com\/profiles\/([^/?#]+)/i);
      if (idMatch) cleanId = idMatch[1];
      else if (profileMatch) cleanId = profileMatch[1];

      const res = await fetch(`/api/steam/profile/${encodeURIComponent(cleanId)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch public profile from Steam Community');
      }

      const profile = await res.json();

      const newAccount: SteamAccount = {
        id: `acc-${Date.now()}`,
        username: profile.steamID || cleanId,
        email: importEmail.trim() || `${profile.steamID || cleanId}@verified.steam`,
        passwordHash: importPassword.trim() || 'Managed_Via_SteamGuard',
        steamId64: profile.steamId64 || (cleanId.match(/^\d{17}$/) ? cleanId : `76561198${Date.now()}`),
        status: 'active',
        vacStatus: profile.vacBanned ? 'Banned' : 'Clean',
        communityBan: false,
        tradeHold: profile.tradeBanState !== 'None',
        gamesCount: 0,
        totalPlaytimeHours: 0,
        walletBalance: 'Profile Synced',
        steamGuard: 'Email',
        createdAt: new Date().toISOString().split('T')[0],
        lastSynced: 'Just now',
        notes: `Imported from real Steam profile (${profile.customURL || profile.steamId64}). VAC: ${profile.vacBanned ? 'Banned' : 'Clean'}.`,
        assignedGames: [],
        tags: ['Verified Steam Profile', profile.vacBanned ? 'VAC Banned' : 'VAC Clean'],
        avatarUrl: profile.avatarMedium,
        customUrl: profile.customURL,
        isRealProfile: true
      };

      onImportRealProfile(newAccount);
      setIsImportModalOpen(false);
      setImportIdentifier('');
      setImportEmail('');
      setImportPassword('');
    } catch (err: any) {
      setImportError(err.message || 'Could not verify Steam profile');
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = selectedAccountIds.size;

  return (
    <div className="space-y-6 pb-20">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Vault Accounts
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{accounts.length}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              {accounts.length === 0 ? 'Empty vault' : `${accounts.filter(a => a.vacStatus === 'Clean').length} VAC Clean`}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Ready for Handoff
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              {accounts.filter(a => a.status === 'ready_for_distribution').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Handoff cards ready</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Assigned Games
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
              {accounts.reduce((sum, a) => sum + a.assignedGames.length, 0)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Across account libraries</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shrink-0">
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Bulk Selected
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
              {selectedCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              {selectedCount > 0 ? 'Actions active' : 'Click checkboxes to select'}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400 shrink-0">
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Control bar: search, filters, sorting, view mode & actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between shadow-md">
        {/* Left: Search, Select All & Filters */}
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap">
          {/* Select All Checkbox Button */}
          {accounts.length > 0 && (
            <button
              onClick={handleToggleSelectAll}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition shrink-0 ${
                isAllSelected
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : isPartiallySelected
                  ? 'bg-slate-800 border-indigo-600 text-indigo-300'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isAllSelected ? 'Deselect All' : 'Select All'}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : isPartiallySelected ? (
                <MinusSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span className="hidden sm:inline">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
              <span className="text-[10px] font-mono opacity-80">
                ({selectedCount}/{filteredAccounts.length})
              </span>
            </button>
          )}

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search username, email, SteamID, or tags..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none w-full sm:w-auto font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="ready_for_distribution">Ready for Handoff</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          {/* Sort By Dropdown (QoL) */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none w-full sm:w-auto font-medium"
            >
              <option value="recent">Sort: Newest Added</option>
              <option value="username">Sort: Username (A-Z)</option>
              <option value="playtime">Sort: Most Playtime</option>
              <option value="games_count">Sort: Most Games</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
        </div>

        {/* Right: View Mode Toggle & Primary Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* View Mode Toggle: Cards vs Table (QoL) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compact Table / List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import Profile</span>
          </button>

          <button
            onClick={onAddNewAccountClick}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Provision</span>
          </button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="sticky bottom-4 z-30 bg-slate-900/95 border-2 border-indigo-500/70 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {selectedCount} {selectedCount === 1 ? 'account' : 'accounts'} selected
            </span>
            <button
              onClick={handleClearSelection}
              className="text-xs text-slate-400 hover:text-white underline ml-2"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExecuteBulkSync}
              disabled={isBulkSyncing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              title="Probe and synchronize status of all selected accounts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isBulkSyncing ? 'Syncing...' : 'Bulk Sync'}</span>
            </button>

            <button
              onClick={() => setIsBulkAssignModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
              title="Assign games to all selected accounts simultaneously"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>Assign Games</span>
            </button>

            <button
              onClick={() => setIsBulkExportModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              title="Export credentials for selected accounts"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bulk Export</span>
            </button>

            <button
              onClick={() => handleExecuteBulkStatusChange('ready_for_distribution')}
              className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              title="Mark all selected accounts as ready for distribution"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Set Ready</span>
            </button>

            <button
              onClick={handleExecuteBulkDelete}
              className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 rounded-lg transition"
              title="Delete all selected accounts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Accounts List / Clean Empty State */}
      {accounts.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Your Account Vault is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              No mock accounts are loaded. Add your genuine gaming accounts or provision an anonymous account using the guided setup wizard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 shadow"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Import Real SteamID64 / Profile</span>
            </button>

            <button
              onClick={onAddNewAccountClick}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Account Provisioning Wizard</span>
            </button>
          </div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
          No accounts matched your search "{searchQuery}".
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (QoL) - Dense List Layout */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button onClick={handleToggleSelectAll} className="focus:outline-none">
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : isPartiallySelected ? (
                        <MinusSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">User &amp; Profile</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">SteamID64</th>
                  <th className="p-3">Security &amp; VAC</th>
                  <th className="p-3">Playtime</th>
                  <th className="p-3">Games</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredAccounts.map(account => {
                  const isSelected = selectedAccountIds.has(account.id);
                  const isPasswordVisible = revealedPasswords[account.id] || false;

                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => handleToggleSelectAccount(account.id, e)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          {account.avatarUrl ? (
                            <img
                              src={account.avatarUrl}
                              alt={account.username}
                              className="w-7 h-7 rounded-lg border border-slate-700 object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                              {account.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white font-sans text-xs flex items-center gap-1.5">
                              <span className="truncate">{account.username}</span>
                              {account.isRealProfile && (
                                <span className="px-1 text-[9px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                  Verified
                                </span>
                              )}
                            </div>
                            {account.tags && account.tags.length > 0 && (
                              <div className="text-[9px] text-slate-400 truncate max-w-[140px]">
                                {account.tags.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-300">
                        <div className="flex items-center gap-1 truncate max-w-[150px]">
                          <span className="truncate">{account.email}</span>
                          <button
                            onClick={() => handleCopy(account.email, `tbl-email-${account.id}`)}
                            className="text-slate-500 hover:text-cyan-400 shrink-0"
                          >
                            {copiedId === `tbl-email-${account.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-slate-300">
                        <div className="flex items-center gap-1">
                          <span>{account.steamId64}</span>
                          <button
                            onClick={() => handleCopy(account.steamId64, `tbl-sid-${account.id}`)}
                            className="text-slate-500 hover:text-cyan-400"
                          >
                            {copiedId === `tbl-sid-${account.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{account.vacStatus} • {account.steamGuard}</span>
                        </span>
                      </td>

                      <td className="p-3 text-slate-200">
                        {account.totalPlaytimeHours || 0} hrs
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => setGamePickerModalAccount(account)}
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <Gamepad2 className="w-3 h-3" />
                          <span>{account.assignedGames.length} titles</span>
                        </button>
                      </td>

                      <td className="p-3">
                        {account.status === 'ready_for_distribution' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {account.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDistributionModalAccount(account)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg"
                            title="Client Handoff Card"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditNotes(account)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            title="Edit Notes & Tags"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onSyncAccount(account.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            title="Sync Status"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${account.username} from vault?`)) {
                                onDeleteAccount(account.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAccounts.map(account => {
            const isSelected = selectedAccountIds.has(account.id);
            const isPasswordVisible = revealedPasswords[account.id] || false;
            const accountGamesList = games.filter(g => account.assignedGames.includes(g.appId));

            return (
              <div 
                key={account.id} 
                className={`bg-slate-900 border rounded-xl p-4 sm:p-5 shadow-lg transition flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/15'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top row: Checkbox, username, avatar & status badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Selection Checkbox */}
                      <button
                        onClick={(e) => handleToggleSelectAccount(account.id, e)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center border transition shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                            : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500'
                        }`}
                        title={isSelected ? 'Deselect account' : 'Select account'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Avatar */}
                      {account.avatarUrl ? (
                        <img
                          src={account.avatarUrl}
                          alt={account.username}
                          className="w-10 h-10 rounded-lg border border-slate-700 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center font-bold text-white text-base shadow shrink-0">
                          {account.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-sm truncate max-w-[150px] sm:max-w-[200px]">
                            {account.username}
                          </span>
                          {account.isRealProfile && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-1 truncate">
                          <span className="truncate max-w-[160px] sm:max-w-[220px]">{account.email}</span>
                          <button
                            onClick={() => handleCopy(account.email, `email-${account.id}`)}
                            title="Copy Email"
                            className="text-slate-500 hover:text-cyan-400 shrink-0"
                          >
                            {copiedId === `email-${account.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {account.status === 'ready_for_distribution' ? (
                        <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                          {account.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Credentials & Details Block */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs font-mono space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Key className="w-3 h-3 text-indigo-400" />
                        <span>Password:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200">
                          {isPasswordVisible ? account.passwordHash : '••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(account.id)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(account.passwordHash, `pwd-${account.id}`)}
                          className="text-slate-500 hover:text-cyan-400"
                        >
                          {copiedId === `pwd-${account.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <span className="text-slate-500">SteamID64:</span>
                      <div className="flex items-center gap-1 text-slate-300">
                        <span className="text-[11px] sm:text-xs">{account.steamId64}</span>
                        <button
                          onClick={() => handleCopy(account.steamId64, `sid-${account.id}`)}
                          className="text-slate-500 hover:text-cyan-400"
                        >
                          {copiedId === `sid-${account.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                      <span className="text-slate-500">VAC / Security:</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{account.vacStatus} • Guard ({account.steamGuard})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                      <span className="text-slate-500">Playtime Tracked:</span>
                      <span className="text-slate-300 font-mono">
                        {account.totalPlaytimeHours || 0} hrs
                      </span>
                    </div>
                  </div>

                  {/* Assigned Games Preview */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Assigned Games ({account.assignedGames.length}):</span>
                      </span>
                      <button
                        onClick={() => setGamePickerModalAccount(account)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        + Manage Titles
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
                      {accountGamesList.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">No games assigned yet</span>
                      ) : (
                        accountGamesList.map(game => (
                          <span
                            key={game.appId}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] truncate max-w-[180px]"
                            title={game.title}
                          >
                            {game.title}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Notes & Tags (QoL) */}
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 mb-3 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        <span>Notes &amp; Tags:</span>
                      </span>
                      <button
                        onClick={() => handleOpenEditNotes(account)}
                        className="text-cyan-400 hover:underline text-[10px]"
                      >
                        Edit
                      </button>
                    </div>
                    {account.notes ? (
                      <p className="text-slate-300 italic mb-1.5">{account.notes}</p>
                    ) : (
                      <p className="text-slate-500 italic mb-1.5">No custom notes yet</p>
                    )}
                    {account.tags && account.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {account.tags.map(t => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDistributionModalAccount(account)}
                      className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Handoff Card</span>
                    </button>
                    <button
                      onClick={() => onSyncAccount(account.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                      title="Sync and verify status"
                    >
                      Sync
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditNotes(account)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit Notes & Tags"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete account ${account.username} from local vault?`)) {
                          onDeleteAccount(account.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                      title="Remove from Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Edit Notes & Tags (QoL) */}
      {editingNotesAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Edit Notes &amp; Tags for {editingNotesAccount.username}
                </h3>
              </div>
              <button
                onClick={() => setEditingNotesAccount(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Account Notes / Description:
                </label>
                <textarea
                  value={editNotesValue}
                  onChange={(e) => setEditNotesValue(e.target.value)}
                  placeholder="e.g. Tournament account with Call of Duty franchises..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tags (Comma separated):
                </label>
                <input
                  type="text"
                  value={editTagsValue}
                  onChange={(e) => setEditTagsValue(e.target.value)}
                  placeholder="e.g. Main, FPS Pro, Tournament Ready, Giveaway"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Quick Tag Suggestions */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Quick Tag Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Main Account', 'Giveaway Handoff', 'FPS Pro', 'Racing Sim', 'JRPG Master', 'VAC Clean'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = editTagsValue ? editTagsValue.split(',').map(s => s.trim()) : [];
                        if (!current.includes(tag)) {
                          setEditTagsValue([...current, tag].join(', '));
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingNotesAccount(null)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedNotes}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Assign Games to Multiple Accounts */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Bulk Assign Games ({selectedCount} Accounts)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select one or more titles from your 100+ paid games catalog to link across all {selectedCount} selected accounts simultaneously.
            </p>

            {/* Game Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={bulkGameSearchQuery}
                onChange={(e) => setBulkGameSearchQuery(e.target.value)}
                placeholder="Search catalog titles or genres..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Games Checklist */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {games
                .filter(g => 
                  g.title.toLowerCase().includes(bulkGameSearchQuery.toLowerCase()) ||
                  g.genre.some(gen => gen.toLowerCase().includes(bulkGameSearchQuery.toLowerCase()))
                )
                .slice(0, 40)
                .map(game => {
                  const isChecked = bulkSelectedGameIds.has(game.appId);
                  return (
                    <div
                      key={game.appId}
                      onClick={() => {
                        setBulkSelectedGameIds(prev => {
                          const next = new Set(prev);
                          if (next.has(game.appId)) next.delete(game.appId);
                          else next.add(game.appId);
                          return next;
                        });
                      }}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition ${
                        isChecked
                          ? 'bg-indigo-950/60 border-indigo-600 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold truncate">{game.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            AppID: {game.appId} • ${game.currentPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 font-mono">
                        {game.genre[0] || 'Game'}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                {bulkSelectedGameIds.size} game(s) selected
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkAssignModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkAssignGames}
                  disabled={bulkSelectedGameIds.size === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>Assign to {selectedCount} Accounts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Export */}
      {isBulkExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Bulk Export ({selectedCount} Selected Accounts)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkExportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Export account credentials and assigned libraries in bulk as a structured JSON file or formatted client distribution packages.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadBulkJson}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download .JSON Vault File</span>
                </button>

                <button
                  onClick={() => handleCopy(getBulkExportHandoffText(), 'bulk-handoff')}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow"
                >
                  {copiedId === 'bulk-handoff' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied All Packages!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-200" />
                      <span>Copy All Handoff Cards</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="relative">
                <pre className="w-full bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-cyan-300 border border-slate-800 whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {getBulkExportHandoffText()}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkExportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Real Steam Profile */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Import Genuine Steam Profile</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter any real public SteamID64 or vanity username (e.g. <code className="text-cyan-300">gabelogannewell</code> or a 17-digit SteamID). The system will fetch authentic VAC and community status directly from Steam.
            </p>

            {importError && (
              <div className="p-3 bg-red-950/80 border border-red-700 text-red-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{importError}</span>
              </div>
            )}

            <form onSubmit={handleFetchRealSteamProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  SteamID64, Custom URL Name, or Profile Link:
                </label>
                <input
                  type="text"
                  value={importIdentifier}
                  onChange={(e) => setImportIdentifier(e.target.value)}
                  placeholder="e.g. 76561197960287930 or gabelogannewell"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Optional Contact Email:
                </label>
                <input
                  type="email"
                  value={importEmail}
                  onChange={(e) => setImportEmail(e.target.value)}
                  placeholder="Associated email for notifications"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Optional Password or Guard Token (Stored locally):
                </label>
                <input
                  type="password"
                  value={importPassword}
                  onChange={(e) => setImportPassword(e.target.value)}
                  placeholder="Password for client handoff"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{isImporting ? 'Querying Valve Community...' : 'Verify & Import'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribution Package Modal */}
      {distributionModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Client Giveaway Distribution Package</h3>
              </div>
              <button
                onClick={() => setDistributionModalAccount(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Clean credentials card ready to paste to your winner or client.
            </p>

            <div className="relative">
              <pre className="w-full bg-slate-950 p-4 rounded-xl text-xs font-mono text-cyan-300 border border-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto">
                {getHandoffText(distributionModalAccount)}
              </pre>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDistributionModalAccount(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleCopy(getHandoffText(distributionModalAccount), 'handoff-card')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                {copiedId === 'handoff-card' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'handoff-card' ? 'Copied to Clipboard!' : 'Copy Handoff Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Picker / Library Association Modal */}
      {gamePickerModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Manage Titles for {gamePickerModalAccount.username}
                </h3>
              </div>
              <button
                onClick={() => setGamePickerModalAccount(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Attach or detach top paid titles and DLCs associated with this account.
            </p>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {games.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">No games loaded yet.</div>
              ) : (
                games.map(game => {
                  const isAssigned = gamePickerModalAccount.assignedGames.includes(game.appId);
                  return (
                    <div
                      key={game.appId}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-200 truncate">{game.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          AppID: {game.appId}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isAssigned) {
                            onRemoveGameFromAccount(gamePickerModalAccount.id, game.appId);
                          } else {
                            onAddGameToAccount(gamePickerModalAccount.id, game.appId);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                          isAssigned
                            ? 'bg-red-950/60 text-red-400 border border-red-800/80 hover:bg-red-900'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                        }`}
                      >
                        {isAssigned ? 'Remove' : 'Assign'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGamePickerModalAccount(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
