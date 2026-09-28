import React, { useState } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  HardDrive, 
  Search,
  Filter,
  Check,
  FolderOpen,
  RefreshCw
} from 'lucide-react';
import { CloudSaveBackup, GameTitle, SteamAccount } from '../types';

interface CloudSaveManagerProps {
  saves: CloudSaveBackup[];
  games: GameTitle[];
  accounts: SteamAccount[];
  initialFilterTitle?: string;
  onAddSave: (save: CloudSaveBackup) => void;
  onDeleteSave: (id: string) => void;
}

export const CloudSaveManager: React.FC<CloudSaveManagerProps> = ({
  saves,
  games,
  accounts,
  initialFilterTitle,
  onAddSave,
  onDeleteSave
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilterTitle || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadedSaveId, setDownloadedSaveId] = useState<string | null>(null);

  // Form states for new save
  const [selectedAppId, setSelectedAppId] = useState<number>(games[0]?.appId || 2358720);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [slotVersion, setSlotVersion] = useState('100% Completion - NG+ Ready');
  const [notes, setNotes] = useState('Max level character, all rare weapons and achievements unlocked.');
  const [isUploading, setIsUploading] = useState(false);

  const totalBytes = saves.reduce((sum, s) => sum + s.fileSizeBytes, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  const filteredSaves = saves.filter(s => {
    return (
      s.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.accountUsername.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDownload = (save: CloudSaveBackup) => {
    // Generate synthetic save package json
    const payload = JSON.stringify({
      steamAppId: save.appId,
      gameTitle: save.gameTitle,
      version: save.version,
      checksum: save.checksum,
      timestamp: save.timestamp,
      accountAuthor: save.accountUsername,
      dataBlob: `[ENCRYPTED_SAVE_STATE_${save.checksum}]`
    }, null, 2);

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${save.gameTitle.replace(/[^a-zA-Z0-9]/g, '_')}_save_${save.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedSaveId(save.id);
    setTimeout(() => setDownloadedSaveId(null), 2500);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const game = games.find(g => g.appId === Number(selectedAppId));
    const acc = accounts.find(a => a.id === selectedAccountId);

    await new Promise(r => setTimeout(r, 800));

    const newBackup: CloudSaveBackup = {
      id: `save-${Date.now()}`,
      appId: Number(selectedAppId),
      gameTitle: game ? game.title : 'Custom Game Title',
      accountId: selectedAccountId,
      accountUsername: acc ? acc.username : 'Vault_Admin',
      version: slotVersion,
      fileSizeBytes: Math.floor(12000000 + Math.random() * 25000000), // 12MB - 37MB
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: notes,
      status: 'synced',
      checksum: `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`
    };

    onAddSave(newBackup);
    setIsUploading(false);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-700/50 text-sky-300 text-xs font-mono font-medium mb-2">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>Multi-Platform Save Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cloud-Based Save File Backups
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Securely archive game save files, boss checkpoints, NG+ states, and unlock profiles. Restore instantly to Steam, Epic, or offline handoff packages.
            </p>
          </div>

          {/* Storage Quota Gauge */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono min-w-[260px]">
            <div className="flex justify-between items-center text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                <span>Cloud Storage:</span>
              </span>
              <span className="text-sky-300 font-bold">{totalMb} MB / 100 GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
              <div 
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, (Number(totalMb) / 1000) * 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>{saves.length} active save snapshots</span>
              <span className="text-emerald-400">Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saves by game title, version, or account..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Create Save Backup</span>
        </button>
      </div>

      {/* Save Files List */}
      <div className="space-y-3">
        {filteredSaves.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <Cloud className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No save file backups found.</p>
            <p className="text-xs mt-1">Upload a new save snapshot to preserve your progress across accounts.</p>
          </div>
        ) : (
          filteredSaves.map(save => (
            <div
              key={save.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{save.gameTitle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      AppID: {save.appId}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                      {save.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-sky-300 font-semibold mt-0.5">
                    {save.version}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                    <span>Account: <b className="text-slate-300">{save.accountUsername}</b></span>
                    <span>•</span>
                    <span>Size: {(save.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                    <span>•</span>
                    <span>Saved: {save.timestamp}</span>
                    <span>•</span>
                    <span className="text-slate-500 truncate max-w-xs">{save.checksum}</span>
                  </div>
                  {save.notes && (
                    <div className="text-xs text-slate-400 italic mt-1.5 bg-slate-950/50 px-2 py-1 rounded border border-slate-800/80">
                      "{save.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => handleDownload(save)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 shadow"
                >
                  {downloadedSaveId === save.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Download File</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete save snapshot "${save.version}"?`)) {
                      onDeleteSave(save.id);
                    }
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                  title="Delete Save Backup"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Location Guidance Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 font-mono space-y-2 shadow">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold">
          <FolderOpen className="w-4 h-4 text-sky-400" />
          <span>Steam Cloud Save Local Path Reference:</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          To manually inject or retrieve downloaded save states on a PC, navigate to:
        </p>
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-cyan-300 text-[11px] overflow-x-auto">
          C:\Program Files (x86)\Steam\userdata\&lt;SteamID3&gt;\&lt;AppID&gt;\remote\
        </div>
      </div>

      {/* Modal: Create Save Backup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Create Cloud Save Backup</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Game Title</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {games.map(g => (
                    <option key={g.appId} value={g.appId}>
                      {g.title} (AppID: {g.appId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Associated Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.username} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Save State Slot / Title</label>
                <input
                  type="text"
                  value={slotVersion}
                  onChange={(e) => setSlotVersion(e.target.value)}
                  placeholder="e.g. End Game Save - Chapter 6"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Backup Notes / Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>{isUploading ? 'Encrypting & Syncing...' : 'Upload & Commit Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
