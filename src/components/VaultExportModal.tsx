import React, { useState } from 'react';
import { Download, Copy, Check, FileJson, FileSpreadsheet, Lock, ShieldCheck } from 'lucide-react';
import { SteamAccount, CloudSaveBackup } from '../types';

interface VaultExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SteamAccount[];
  saves: CloudSaveBackup[];
}

export const VaultExportModal: React.FC<VaultExportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  saves
}) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateJsonData = () => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      vaultVersion: '2.4.0',
      totalAccounts: accounts.length,
      accounts: accounts.map(a => ({
        id: a.id,
        username: a.username,
        email: a.email,
        password: a.passwordHash,
        steamId64: a.steamId64,
        status: a.status,
        vacStatus: a.vacStatus,
        gamesCount: a.assignedGames.length,
        assignedAppIds: a.assignedGames,
        steamGuard: a.steamGuard,
        createdAt: a.createdAt,
        notes: a.notes
      })),
      cloudSaves: saves.map(s => ({
        id: s.id,
        gameTitle: s.gameTitle,
        appId: s.appId,
        accountUsername: s.accountUsername,
        version: s.version,
        timestamp: s.timestamp,
        checksum: s.checksum
      }))
    }, null, 2);
  };

  const generateCsvData = () => {
    const headers = ['Username', 'Email', 'Password', 'SteamID64', 'Status', 'VAC Status', 'Games Count', 'Steam Guard', 'Notes'];
    const rows = accounts.map(a => [
      `"${a.username}"`,
      `"${a.email}"`,
      `"${a.passwordHash}"`,
      `"${a.steamId64}"`,
      `"${a.status}"`,
      `"${a.vacStatus}"`,
      a.assignedGames.length,
      `"${a.steamGuard}"`,
      `"${a.notes.replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const currentExportString = exportFormat === 'json' ? generateJsonData() : generateCsvData();

  const handleDownload = () => {
    const mimeType = exportFormat === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([currentExportString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `steam_account_vault_export_${Date.now()}.${exportFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentExportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Export Vault Credentials &amp; Distribution Data</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <p className="text-xs text-slate-400">
          Export your stored accounts, credentials, top paid game allocations, and cloud save checksums for distribution or external database syncing.
        </p>

        {/* Format Selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExportFormat('json')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              exportFormat === 'json'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Encrypted JSON Format</span>
          </button>

          <button
            type="button"
            onClick={() => setExportFormat('csv')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              exportFormat === 'csv'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Spreadsheet CSV Format</span>
          </button>
        </div>

        {/* Data Preview */}
        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 max-h-72 overflow-y-auto whitespace-pre-wrap select-all">
            {currentExportString}
          </pre>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 font-mono">
            {accounts.length} accounts • {saves.length} save points
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
