import React, { useState } from 'react';
import { 
  Users, 
  Key, 
  Mail, 
  ShieldCheck, 
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
  ExternalLink,
  Sparkles,
  Download,
  AlertCircle
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
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  games,
  onAddGameToAccount,
  onRemoveGameFromAccount,
  onDeleteAccount,
  onSyncAccount,
  onAddNewAccountClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Distribution modal state
  const [distributionModalAccount, setDistributionModalAccount] = useState<SteamAccount | null>(null);
  const [gamePickerModalAccount, setGamePickerModalAccount] = useState<SteamAccount | null>(null);

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

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.steamId64.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate high level metrics
  const totalAccounts = accounts.length;
  const readyAccounts = accounts.filter(a => a.status === 'ready_for_distribution').length;
  const totalLibraryGames = accounts.reduce((acc, a) => acc + a.assignedGames.length, 0);

  const getHandoffText = (acc: SteamAccount) => {
    const accountGames = games.filter(g => acc.assignedGames.includes(g.appId)).map(g => `• ${g.title}`).join('\n');
    return `🎮 STEAM ACCOUNT GIVEAWAY HANDOFF PACKAGE
==================================================
Username: ${acc.username}
Password: ${acc.passwordHash}
Email: ${acc.email}
SteamID64: ${acc.steamId64}
Steam Guard: ${acc.steamGuard}
VAC Status: ${acc.vacStatus} (No restrictions)

INCLUDED TOP PAID GAMES (${acc.assignedGames.length}):
${accountGames || '• Standard library'}

HOW TO ACCESS:
1. Log into Steam Client using the credentials above.
2. If Steam Guard prompts for a code, check the email inbox for ${acc.email}.
3. Once logged in, download any title from your Library.
4. You may change your password and attach your own Steam Guard Authenticator.
==================================================`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Registered Accounts</div>
            <div className="text-2xl font-black text-white mt-1">{totalAccounts}</div>
            <div className="text-[11px] text-indigo-400 mt-0.5">Secure credential vault</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Ready For Distribution</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{readyAccounts}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">No phone verification required</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Share2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Games Provisioned Across Accounts</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">{totalLibraryGames}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Top-tier paid game licenses</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control bar: search, filters & actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        <div className="flex flex-1 w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username, email, or SteamID..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="ready_for_distribution">Ready For Distribution</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
        </div>

        <button
          onClick={onAddNewAccountClick}
          className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Accounts List / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAccounts.length === 0 ? (
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-400">No matching accounts found.</p>
            <p className="text-xs mt-1">Try refining your search query or generate an account using the Provisioning Wizard.</p>
          </div>
        ) : (
          filteredAccounts.map(account => {
            const isPasswordVisible = revealedPasswords[account.id] || false;
            const accountGamesList = games.filter(g => account.assignedGames.includes(g.appId));

            return (
              <div 
                key={account.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  {/* Top row: username & status tag */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center font-bold text-white text-base shadow">
                        {account.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{account.username}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {account.steamId64.slice(-6)}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <span>{account.email}</span>
                          <button
                            onClick={() => handleCopy(account.email, `email-${account.id}`)}
                            title="Copy Email"
                            className="text-slate-500 hover:text-cyan-400"
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

                    <div>
                      {account.status === 'ready_for_distribution' ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Ready for Handoff
                        </span>
                      ) : account.status === 'active' ? (
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-950 border border-amber-800 text-amber-400">
                          Pending Setup
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
                        <span>{account.steamId64}</span>
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
                        <span>{account.vacStatus} • Steam Guard ({account.steamGuard})</span>
                      </span>
                    </div>
                  </div>

                  {/* Assigned Games Preview */}
                  <div className="space-y-1.5 mb-4">
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

                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                      {accountGamesList.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">No games assigned yet</span>
                      ) : (
                        accountGamesList.map(game => (
                          <span
                            key={game.appId}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] truncate max-w-[200px]"
                            title={game.title}
                          >
                            {game.title}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Notes / Tags */}
                  {account.notes && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/60 mb-3">
                      <span className="text-slate-500 font-bold">Notes: </span>
                      <span>{account.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDistributionModalAccount(account)}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Handoff Card</span>
                    </button>
                    <button
                      onClick={() => onSyncAccount(account.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                      title="Probe Steam API & Sync Status"
                    >
                      Sync
                    </button>
                  </div>

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
            );
          })
        )}
      </div>

      {/* Distribution Package Modal */}
      {distributionModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
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
              Formatted clean credentials card ready to paste to your winner or client. Does not require their phone number or another email.
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
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

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {games.map(game => {
                const isAssigned = gamePickerModalAccount.assignedGames.includes(game.appId);
                return (
                  <div
                    key={game.appId}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{game.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        AppID: {game.appId} • {game.storageGb} GB
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isAssigned
                          ? 'bg-red-950/60 text-red-400 border border-red-800/80 hover:bg-red-900'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isAssigned ? 'Remove' : 'Assign'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
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
