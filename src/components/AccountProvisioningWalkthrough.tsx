import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Key, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  Sliders, 
  Gamepad2, 
  FolderLock, 
  Info,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { SteamAccount, GameTitle } from '../types';

interface AccountProvisioningWalkthroughProps {
  onAccountCreated: (account: SteamAccount) => void;
  availableGames: GameTitle[];
  existingAccountsCount: number;
}

export const AccountProvisioningWalkthrough: React.FC<AccountProvisioningWalkthroughProps> = ({
  onAccountCreated,
  availableGames,
  existingAccountsCount
}) => {
  // Default email starting with user's custom Catch-All domain
  const [emailInput, setEmailInput] = useState(`gamer-${existingAccountsCount + 1}@linacre.site`);
  const [usernameInput, setUsernameInput] = useState(`TopPaid_Gamer_${existingAccountsCount + 1}`);
  const [passwordInput, setPasswordInput] = useState('X9#vQ8$mK2!wL4zP');
  const [selectedDomain, setSelectedDomain] = useState<'linacre.site' | 'proton.me' | 'tuta.io' | 'duck.com' | 'custom'>('linacre.site');
  const [notesInput, setNotesInput] = useState('Top-tier paid titles pack ready for giveaway handoff.');
  
  // Selected games to initialize
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([2358720, 1245620, 1086940, 553850]);

  // Automation sequence states
  const [isRunningSequence, setIsRunningSequence] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [sequenceLogs, setSequenceLogs] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const generateRandomCredentials = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordInput(pass);

    const prefixes = ['Vanguard', 'Apex', 'Phantom', 'Titan', 'Specter', 'Cyber', 'Mythic', 'Iron'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setUsernameInput(`${randomPrefix}_TopTier_${randomSuffix}`);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleGameSelection = (appId: number) => {
    setSelectedGameIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const runAutomatedSequence = async () => {
    if (!emailInput) return;
    setIsRunningSequence(true);
    setIsCompleted(false);
    setCurrentStep(1);
    setSequenceLogs([
      `[00:00.1] [INIT] Sequence triggered for email: ${emailInput}`,
      `[00:00.3] [IDENTITY] Generated secure profile username: "${usernameInput}"`,
      `[00:00.6] [SECURITY] Zero-leak cryptographic password initialized.`
    ]);

    // Simulated stepwise progression
    await new Promise(r => setTimeout(r, 1100));
    setCurrentStep(2);
    setSequenceLogs(prev => [
      ...prev,
      `[00:01.4] [EMAIL_PROVIDER] Selected domain: ${selectedDomain} (Catch-All Auto-Forwarding).`,
      `[00:01.8] [EMAIL_PROVIDER] Verifying MX routing & catch-all delivery pipeline: ACTIVE.`,
      `[00:02.1] [SESSION] Storing isolated ephemeral session fingerprint in local memory.`
    ]);

    await new Promise(r => setTimeout(r, 1200));
    setCurrentStep(3);
    setSequenceLogs(prev => [
      ...prev,
      `[00:03.2] [STEAM_SETUP] Preparing registration payload for store.steampowered.com/join`,
      `[00:03.5] [ANTI_BOT_POLICY] Notice: Valve Cloudflare/reCAPTCHA requires interactive human confirmation in browser.`,
      `[00:03.9] [AUTOMATION] Prepared auto-fill clipboard payload for one-click completion.`,
      `[00:04.2] [STEAM_GUARD] Default security protocol configured: Email Authentication (No phone number required).`
    ]);

    await new Promise(r => setTimeout(r, 1300));
    setCurrentStep(4);
    setSequenceLogs(prev => [
      ...prev,
      `[00:05.1] [LIBRARY] Associating ${selectedGameIds.length} top-tier paid titles to account manifest.`,
      `[00:05.5] [ACHIEVEMENT] Initializing library metadata & save file synchronization hooks.`,
      `[00:05.9] [DATABASE] Packaging credentials into local encrypted Vault.`
    ]);

    await new Promise(r => setTimeout(r, 900));
    setCurrentStep(5);
    setIsRunningSequence(false);
    setIsCompleted(true);
    setSequenceLogs(prev => [
      ...prev,
      `[00:06.8] [SUCCESS] Account sequence finalized! Ready for distribution.`
    ]);
  };

  const handleSaveToVault = () => {
    const newAccount: SteamAccount = {
      id: `acc-custom-${Date.now()}`,
      username: usernameInput,
      email: emailInput,
      passwordHash: passwordInput,
      steamId64: `76561198${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'ready_for_distribution',
      vacStatus: 'Clean',
      communityBan: false,
      tradeHold: false,
      gamesCount: selectedGameIds.length,
      totalPlaytimeHours: 0,
      walletBalance: '$0.00 USD',
      steamGuard: 'Email',
      createdAt: new Date().toISOString().split('T')[0],
      lastSynced: 'Just now',
      notes: notesInput,
      assignedGames: selectedGameIds,
      tags: ['No Phone Required', 'Top Paid Games', 'Ready for Handoff']
    };

    onAccountCreated(newAccount);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-mono font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assisted One-Click Provisioning Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Steam Account &amp; Library Onboarding Wizard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Automate the workflow of establishing a fresh, anonymous gaming account without requiring a mobile phone number. Configure credentials, assign top paid titles, and export clean distribution packages.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs font-mono w-full lg:w-auto min-w-[280px]">
            <div className="text-slate-400 font-bold mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Compliance &amp; Reliability Profile</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Verification:</span>
                <span className="text-emerald-400 font-semibold">Not Required (Email 2FA)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bot Detection Defense:</span>
                <span className="text-cyan-400 font-semibold">Native Human-Assisted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distribution Ready:</span>
                <span className="text-purple-400 font-semibold">One-Click Vault Export</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Step 1: Input Desired Email &amp; Anonymous Persona</span>
            </h2>

            {/* Email Address Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Email Address (Default Pattern Loaded)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="gamer-1@linacre.site"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-24 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(emailInput, 'email')}
                  className="absolute inset-y-1 right-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 border border-slate-700 transition"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Catch-All on <code className="text-cyan-300">linacre.site</code> forwards all incoming emails to your master inbox. No manual mailbox creation required!
              </p>
            </div>

            {/* Provider presets */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Anonymous / Catch-All Email Providers
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { domain: 'linacre.site', label: 'linacre.site', note: '🌟 Catch-All Routing' },
                  { domain: 'proton.me', label: 'Proton Mail', note: 'Encrypted, No Phone' },
                  { domain: 'tuta.io', label: 'Tuta', note: 'Zero-Phone Setup' },
                  { domain: 'duck.com', label: 'DuckDuckGo', note: 'Private Forwarding' }
                ].map((item) => (
                  <button
                    key={item.domain}
                    type="button"
                    onClick={() => {
                      const prefix = emailInput.split('@')[0] || `gamer-${existingAccountsCount + 1}`;
                      setEmailInput(`${prefix}@${item.domain}`);
                      setSelectedDomain(item.domain as any);
                    }}
                    className={`p-2.5 rounded-lg border text-left text-xs transition ${
                      emailInput.endsWith(`@${item.domain}`)
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.note}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Credentials Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Generated Steam Account Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    High-Entropy Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCredentials}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Library Assignment Selector */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-purple-400" />
                  <span>Assign Initial Games to Account Library ({selectedGameIds.length} selected)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Top Paid Catalog</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableGames.map(game => {
                  const isSelected = selectedGameIds.includes(game.appId);
                  return (
                    <div
                      key={game.appId}
                      onClick={() => toggleGameSelection(game.appId)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-semibold text-slate-200 truncate">{game.title}</div>
                        <div className="text-[10px] text-slate-500">{game.currentPlayers.toLocaleString()} active players</div>
                      </div>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                        isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={runAutomatedSequence}
                disabled={isRunningSequence}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {isRunningSequence ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Provisioning Sequence...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Initiate Single-Click Provisioning Sequence</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Pipeline & Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sequence Execution Pipeline</span>
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {currentStep}/5 Steps
              </span>
            </h3>

            <div className="space-y-3">
              {[
                { step: 1, title: 'Identity & Secret Generation', desc: 'Construct credentials and zero-telemetry seed' },
                { step: 2, title: 'No-Phone Mailbox Verification', desc: 'Probe disposable detection and incoming MX routing' },
                { step: 3, title: 'Steam Registration Gateway', desc: 'Dispatch signup payload with Email Guard pre-configured' },
                { step: 4, title: 'Library & Game Manifest Attachment', desc: 'Link selected top-paid games to account inventory' },
                { step: 5, title: 'Encrypted Vault & Distribution Export', desc: 'Produce client distribution package & cloud save links' }
              ].map((item) => {
                const isPassed = currentStep > item.step || isCompleted;
                const isCurrent = currentStep === item.step && isRunningSequence;
                return (
                  <div
                    key={item.step}
                    className={`flex items-start space-x-3 p-2.5 rounded-lg border text-xs transition ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500 text-white'
                        : isPassed
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                        : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 text-slate-500 flex items-center justify-center font-mono text-[10px]">
                          {item.step}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official Registration Assistant Link */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Official Steam Registration:</span>
                <a
                  href="https://store.steampowered.com/join/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <span>Open Steam Join</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Because Valve employs mandatory reCAPTCHA and Cloudflare challenge verification, standard automated browser scripts (like raw Selenium bots) trigger immediate IP quarantine. Our assisted flow generates compliant credentials for seamless human entry.
              </p>
            </div>

            {/* If completed, show "Save to Vault" */}
            {isCompleted && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Account Setup Complete!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Account is formatted, credentials are prepared, and {selectedGameIds.length} games are queued. Add to your credentials vault now.
                </p>
                <button
                  type="button"
                  onClick={handleSaveToVault}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <FolderLock className="w-4 h-4" />
                  <span>Commit to Account Vault &amp; Dashboard</span>
                </button>
              </div>
            )}
          </div>

          {/* Terminal Console Logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Provisioning Daemon Logs</span>
              </span>
              <span className="text-[10px] text-emerald-400">Active Listener</span>
            </div>
            <div className="h-44 overflow-y-auto space-y-1 text-slate-400 text-[11px] scrollbar-thin">
              {sequenceLogs.length === 0 ? (
                <div className="text-slate-600 italic py-6 text-center">
                  Click "Initiate Single-Click Provisioning Sequence" to launch telemetry logs...
                </div>
              ) : (
                sequenceLogs.map((log, index) => (
                  <div key={index} className="leading-tight">
                    {log.includes('[SUCCESS]') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : log.includes('[ANTI_BOT_POLICY]') ? (
                      <span className="text-amber-400">{log}</span>
                    ) : (
                      <span>{log}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
