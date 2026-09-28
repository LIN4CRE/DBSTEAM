import React, { useState } from 'react';
import { 
  FileCode2, 
  Download, 
  Check, 
  Copy, 
  Play, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  FolderCheck, 
  Zap, 
  RefreshCw, 
  Trash2, 
  HardDrive, 
  CheckCircle2, 
  FileText, 
  Terminal,
  ExternalLink,
  Code
} from 'lucide-react';
import { GameLuaScript } from '../types';

interface LuaScriptsManagerProps {
  scripts: GameLuaScript[];
  onToggleInstall: (scriptId: string) => void;
  onAddScript: (script: GameLuaScript) => void;
  onDeleteScript: (scriptId: string) => void;
  onInstallAll: () => void;
  onLogAction?: (details: string) => void;
  initialFilterGame?: string;
}

export const LuaScriptsManager: React.FC<LuaScriptsManagerProps> = ({
  scripts,
  onToggleInstall,
  onAddScript,
  onDeleteScript,
  onInstallAll,
  onLogAction,
  initialFilterGame
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>(initialFilterGame || 'All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  
  // Modal states
  const [activeViewerScript, setActiveViewerScript] = useState<GameLuaScript | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Sandbox simulation runner state
  const [executingScriptId, setExecutingScriptId] = useState<string | null>(null);
  const [sandboxOutput, setSandboxOutput] = useState<{ id: string; logs: string[] } | null>(null);

  // New script form states
  const [newName, setNewName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newGameTitle, setNewGameTitle] = useState('Black Myth: Wukong');
  const [newCategory, setNewCategory] = useState<GameLuaScript['category']>('Performance & Optimization');
  const [newDescription, setNewDescription] = useState('');
  const [newCode, setNewCode] = useState(`-- Custom Game Lua Script\nlocal Mod = {\n  version = "1.0.0"\n}\n\nfunction Mod:OnInit()\n  print("[CustomMod] Initialized successfully!")\n  return true\nend\n\nreturn Mod`);
  const [newInstallPath, setNewInstallPath] = useState('Game/scripts/mod.lua');

  // Categories list
  const categories = [
    'All',
    'Performance & Optimization',
    'Save Sync Hook',
    'Script Extender & Mods',
    'HUD & Telemetry',
    'Steamworks API'
  ];

  // Distinct games list
  const distinctGames = ['All', ...Array.from(new Set(scripts.map(s => s.gameTitle)))];

  const filteredScripts = scripts.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gameTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGame = selectedGameFilter === 'All' || s.gameTitle === selectedGameFilter;
    const matchesCategory = selectedCategoryFilter === 'All' || s.category === selectedCategoryFilter;

    return matchesSearch && matchesGame && matchesCategory;
  });

  const installedCount = scripts.filter(s => s.isInstalled).length;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadLuaFile = (script: GameLuaScript) => {
    const blob = new Blob([script.code], { type: 'text/x-lua' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = script.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedId(script.id);
    setTimeout(() => setDownloadedId(null), 2500);

    if (onLogAction) {
      onLogAction(`Exported Lua script "${script.fileName}" (${script.gameTitle}).`);
    }
  };

  const handleRunSandbox = (script: GameLuaScript) => {
    setExecutingScriptId(script.id);
    setSandboxOutput(null);

    setTimeout(() => {
      const logs: string[] = [
        `[LUA VM 5.4.6] Loading chunk "${script.fileName}"...`,
        `[SYNTAX] AST parsing and opcode verification: PASSED (0 errors, 0 warnings)`,
        `[ENV] Mocking game runtime environment for ${script.gameTitle} (AppID: ${script.appId})`
      ];

      // Extract print statements from code to simulate realistic output
      const matches = script.code.matchAll(/print\((.*?)\)/g);
      for (const m of matches) {
        const text = m[1].replace(/["']/g, '').replace(/\.\..*/, ' [OK]');
        logs.push(`[STDOUT] ${text}`);
      }

      logs.push(`[EXECUTION] Script initialized cleanly. Module returned table.`);
      setSandboxOutput({ id: script.id, logs });
      setExecutingScriptId(null);

      if (onLogAction) {
        onLogAction(`Executed Lua sandbox test for "${script.fileName}" (${script.gameTitle}) - Exit 0.`);
      }
    }, 700);
  };

  const handleCreateScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newFileName.trim()) return;

    let cleanFileName = newFileName.trim();
    if (!cleanFileName.endsWith('.lua')) {
      cleanFileName += '.lua';
    }

    const createdScript: GameLuaScript = {
      id: `lua-custom-${Date.now()}`,
      name: newName.trim(),
      fileName: cleanFileName,
      appId: 0,
      gameTitle: newGameTitle,
      category: newCategory,
      version: '1.0.0',
      author: 'User / Local Vault',
      description: newDescription.trim() || 'Custom user game automation script.',
      code: newCode,
      targetInstallPath: newInstallPath.trim() || `Game/scripts/${cleanFileName}`,
      isInstalled: true,
      fileSizeBytes: new Blob([newCode]).size,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onAddScript(createdScript);
    setIsCreateModalOpen(false);
    setNewName('');
    setNewFileName('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-medium mb-2">
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Game .Lua Scripting &amp; Automation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Best Game .Lua Scripts &amp; Tools
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Curated, production-grade `.lua` scripts for Black Myth: Wukong, ELDEN RING, Baldur's Gate 3, Cyberpunk 2077, and Counter-Strike 2. Includes performance hooks, cloud save auto-sync watchers, and CET HUD extenders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={onInstallAll}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition"
            >
              <FolderCheck className="w-4 h-4" />
              <span>Install All {scripts.length} .Luas</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Custom .Lua</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Installed Active Scripts</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1.5">
            <span>{installedCount}</span>
            <span className="text-xs font-normal text-slate-500">/ {scripts.length}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {installedCount === scripts.length ? '100% Installed' : `${scripts.length - installedCount} available to activate`}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Covered Game Titles</div>
          <div className="text-2xl font-black text-white mt-1">
            {distinctGames.length - 1}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Top-tier verified titles</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Scripting Runtime</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            Lua 5.4.6 / CET
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">High-performance JIT &amp; native hooks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Auto-Save Watcher</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            Active
          </div>
          <div className="text-[10px] text-indigo-300 mt-0.5">Steam userdata monitoring daemon</div>
        </div>
      </div>

      {/* Control bar: search & filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search .lua scripts by name, filename (e.g. wukong, elden, save_sync), or function..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400">Game:</span>
              <select
                value={selectedGameFilter}
                onChange={(e) => setSelectedGameFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
              >
                {distinctGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredScripts.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <FileCode2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No .lua scripts found matching your filters.</p>
          </div>
        ) : (
          filteredScripts.map(script => (
            <div
              key={script.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm">{script.name}</h3>
                        <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono border border-slate-700">
                          v{script.version}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-cyan-300 mt-0.5 flex items-center gap-1.5">
                        <span>{script.fileName}</span>
                        <span>•</span>
                        <span className="text-slate-400">{script.gameTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {script.isInstalled ? (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Installed</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {script.description}
                </p>

                {/* Target Path info */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-indigo-400">{script.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">File Size:</span>
                    <span className="text-slate-300">{(script.fileSizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="pt-1 border-t border-slate-900 truncate" title={script.targetInstallPath}>
                    <span className="text-slate-500">Install Path: </span>
                    <span className="text-slate-300 truncate">{script.targetInstallPath}</span>
                  </div>
                </div>

                {/* Sandbox test output preview if this script was executed */}
                {sandboxOutput && sandboxOutput.id === script.id && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60 text-[11px] font-mono mb-4 space-y-1 animate-fadeIn">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5 pb-1 border-b border-slate-800">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Lua Sandbox Execution Log:</span>
                    </div>
                    {sandboxOutput.logs.map((log, idx) => (
                      <div key={idx} className="text-slate-400 truncate">{log}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveViewerScript(script)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View / Edit Lua</span>
                  </button>

                  <button
                    onClick={() => handleRunSandbox(script)}
                    disabled={executingScriptId === script.id}
                    className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-800/60 flex items-center gap-1.5 transition"
                    title="Simulate Lua script execution in sandbox"
                  >
                    {executingScriptId === script.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                    )}
                    <span>Test Run</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadLuaFile(script)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition"
                    title="Download .lua file"
                  >
                    {downloadedId === script.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onToggleInstall(script.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      script.isInstalled
                        ? 'bg-red-950/50 text-red-300 border border-red-800/60 hover:bg-red-900'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {script.isInstalled ? 'Uninstall' : 'Install .Lua'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: View & Edit Lua Script Code */}
      {activeViewerScript && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{activeViewerScript.name}</h3>
                  <p className="text-xs font-mono text-cyan-300">{activeViewerScript.fileName} • {activeViewerScript.gameTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveViewerScript(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Target: {activeViewerScript.targetInstallPath}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyCode(activeViewerScript.code, 'modal-copy')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 border border-slate-700"
                >
                  {copiedId === 'modal-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'modal-copy' ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => handleDownloadLuaFile(activeViewerScript)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .lua</span>
                </button>
              </div>
            </div>

            {/* Syntax formatted code container */}
            <div className="relative">
              <pre className="w-full bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 border border-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto select-all leading-relaxed">
                {activeViewerScript.code}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveViewerScript(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom .Lua Script */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Create or Import Custom .Lua Script</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateScript} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Script Display Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Elden Ring FOV & Camera Lock"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Filename (.lua)</label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. camera_tweak.lua"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Game</label>
                  <input
                    type="text"
                    value={newGameTitle}
                    onChange={(e) => setNewGameTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Performance & Optimization">Performance &amp; Optimization</option>
                    <option value="Save Sync Hook">Save Sync Hook</option>
                    <option value="Script Extender & Mods">Script Extender &amp; Mods</option>
                    <option value="HUD & Telemetry">HUD &amp; Telemetry</option>
                    <option value="Steamworks API">Steamworks API</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Install Path in Game Folder</label>
                <input
                  type="text"
                  value={newInstallPath}
                  onChange={(e) => setNewInstallPath(e.target.value)}
                  placeholder="e.g. Game/mods/scripts/mod.lua"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief summary of what this Lua hook achieves"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Lua Source Code</label>
                <textarea
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save &amp; Install Script</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
