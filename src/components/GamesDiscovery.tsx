import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Gamepad2, 
  Download, 
  TrendingUp, 
  ExternalLink, 
  Check, 
  Plus, 
  Zap, 
  RefreshCw, 
  Users, 
  Store, 
  Tag,
  FileCode2,
  Sparkles,
  Bot,
  Flame,
  ArrowRight,
  Filter
} from 'lucide-react';
import { GameTitle, SteamAccount } from '../types';

interface GamesDiscoveryProps {
  games: GameTitle[];
  accounts: SteamAccount[];
  onAssignToAccount: (accountId: string, appId: number) => void;
  onNavigateToSaves: (gameTitle: string) => void;
  onNavigateToLuas?: (gameTitle: string) => void;
  onAddNewGameToLibrary?: (game: GameTitle) => void;
  onRefreshLiveGames?: () => void;
}

export const GamesDiscovery: React.FC<GamesDiscoveryProps> = ({
  games,
  accounts,
  onAssignToAccount,
  onNavigateToSaves,
  onNavigateToLuas,
  onAddNewGameToLibrary
}) => {
  const [currentGames, setCurrentGames] = useState<GameTitle[]>(games);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState<string>('All');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<any[] | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<number, number>>({});
  const [installNotification, setInstallNotification] = useState<string | null>(null);
  const [selectedAccountForAssign, setSelectedAccountForAssign] = useState<string>(accounts[0]?.id || '');

  // Smart AI Search System states
  const [aiSearchPrompt, setAiSearchPrompt] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any[] | null>(null);
  const [aiSearchNotice, setAiSearchNotice] = useState<string | null>(null);

  // Franchise categories
  const franchises = [
    { id: 'All', label: `All Paid Games (${currentGames.length})` },
    { id: 'Call of Duty', label: 'Call of Duty' },
    { id: 'Need for Speed', label: 'Need for Speed' },
    { id: 'Colin McRae', label: 'Colin McRae / WRC' },
    { id: 'Final Fantasy', label: 'Final Fantasy' },
    { id: 'Digimon', label: 'Digimon' },
    { id: 'Control', label: 'Control & Resonance' },
    { id: 'Soulslike', label: 'Soulslike' },
    { id: 'Open World', label: 'Open World' },
    { id: 'Survival', label: 'Survival' },
    { id: 'Racing', label: 'Racing & Sims' }
  ];

  // Sync prop changes
  useEffect(() => {
    setCurrentGames(games);
  }, [games]);

  // Fetch real live player counts from Valve API
  const fetchRealPlayerCounts = async (appIds: number[]) => {
    const counts: Record<number, number> = {};

    await Promise.all(
      appIds.map(async (id) => {
        try {
          const res = await fetch(`/api/steam/player-count/${id}`);
          if (res.ok) {
            const data = await res.json();
            counts[id] = data.playerCount;
          }
        } catch (e) {
          // ignore individual fails
        }
      })
    );

    setPlayerCounts(prev => ({ ...prev, ...counts }));
  };

  // Run initial player counts on top 8 games
  useEffect(() => {
    if (currentGames.length > 0) {
      fetchRealPlayerCounts(currentGames.slice(0, 8).map(g => g.appId));
    }
  }, [currentGames]);

  // Live Steam Store Search as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await fetch(`/api/steam/search?term=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLiveSearchResults(data.items || []);
          if (data.items && data.items.length > 0) {
            fetchRealPlayerCounts(data.items.slice(0, 6).map((i: any) => i.appId));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingLive(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Smart Search AI Execution
  const handleRunAiSmartSearch = async (promptQuery?: string) => {
    const query = promptQuery || aiSearchPrompt.trim();
    if (!query) return;

    setIsAiSearching(true);
    setAiSearchNotice(null);

    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) {
        throw new Error('AI smart search service unavailable');
      }

      const data = await res.json();
      if (data.games && data.games.length > 0) {
        setAiSearchResults(data.games);
        setAiSearchNotice(`Gemini AI identified ${data.games.length} trending games for "${query}" (Grounded to NOW).`);
        fetchRealPlayerCounts(data.games.map((g: any) => g.appId));
      } else {
        setAiSearchNotice(`No specific games returned by AI for "${query}". Try another query.`);
      }
    } catch (e: any) {
      setAiSearchNotice(`AI Search error: ${e.message || 'Failed to connect to AI service'}`);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleTriggerInstall = (appId: number, title: string) => {
    const steamUri = `steam://install/${appId}`;
    try {
      window.location.href = steamUri;
    } catch (e) {
      console.log('Triggered protocol:', steamUri);
    }

    setInstallNotification(`Triggered native Steam client installer for "${title}" (steam://install/${appId})`);
    setTimeout(() => setInstallNotification(null), 5000);
  };

  const handleAddAiGame = (game: any) => {
    const newTitle: GameTitle = {
      appId: Number(game.appId),
      title: game.title,
      genre: game.genre || ['Top Paid', 'Trending'],
      platforms: ['Steam'],
      originalPrice: Number(game.originalPrice) || Number(game.currentPrice) || 59.99,
      currentPrice: Number(game.currentPrice) || 59.99,
      discountPercent: 0,
      currentPlayers: playerCounts[game.appId] || 0,
      imageUrl: game.imageUrl || `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appId}/header.jpg`,
      description: game.description || 'Discovered via Gemini AI Live Search.'
    };

    if (onAddNewGameToLibrary) {
      onAddNewGameToLibrary(newTitle);
    } else {
      setCurrentGames(prev => [newTitle, ...prev]);
    }

    setInstallNotification(`Added "${game.title}" to your permanent library!`);
    setTimeout(() => setInstallNotification(null), 4000);
  };

  // Filter games based on search & franchise tabs
  const filteredGames = currentGames.filter(game => {
    const matchesSearch = 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.appId.toString().includes(searchQuery);

    let matchesFranchise = true;
    if (selectedFranchise === 'Call of Duty') {
      matchesFranchise = game.title.toLowerCase().includes('call of duty');
    } else if (selectedFranchise === 'Need for Speed') {
      matchesFranchise = game.title.toLowerCase().includes('need for speed');
    } else if (selectedFranchise === 'Colin McRae') {
      matchesFranchise = 
        game.title.toLowerCase().includes('colin mcrae') || 
        game.title.toLowerCase().includes('dirt') || 
        game.title.toLowerCase().includes('wrc');
    } else if (selectedFranchise === 'Final Fantasy') {
      matchesFranchise = game.title.toLowerCase().includes('final fantasy');
    } else if (selectedFranchise === 'Digimon') {
      matchesFranchise = game.title.toLowerCase().includes('digimon');
    } else if (selectedFranchise === 'Control') {
      matchesFranchise = 
        game.title.toLowerCase().includes('control') || 
        game.title.toLowerCase().includes('resonance') ||
        game.genre.some(g => g.toLowerCase().includes('resonance')) ||
        game.title.toLowerCase().includes('alan wake') || 
        game.title.toLowerCase().includes('quantum break');
    } else if (selectedFranchise === 'Soulslike') {
      matchesFranchise = game.genre.includes('Soulslike') || game.title.includes('DARK SOULS') || game.title.includes('Sekiro') || game.title.includes('Lies of P');
    } else if (selectedFranchise === 'Open World') {
      matchesFranchise = game.genre.includes('Open World') || game.description.toLowerCase().includes('open world');
    } else if (selectedFranchise === 'Survival') {
      matchesFranchise = game.genre.includes('Survival') || game.description.toLowerCase().includes('survival');
    } else if (selectedFranchise === 'Racing') {
      matchesFranchise = game.genre.includes('Racing') || game.genre.includes('Simulation') || game.title.includes('Forza') || game.title.includes('Assetto');
    }

    return matchesSearch && matchesFranchise;
  });

  const displayedGames = liveSearchResults
    ? liveSearchResults.map(item => ({
        appId: item.appId,
        title: item.title,
        genre: ['Steam Store Search'],
        platforms: ['Steam' as const],
        originalPrice: item.originalPrice,
        currentPrice: item.price,
        discountPercent: item.discountPercent,
        currentPlayers: playerCounts[item.appId] || 0,
        imageUrl: item.headerImage || item.tinyImage,
        description: 'Verified live Steam Store title'
      }))
    : filteredGames;

  return (
    <div className="space-y-6">
      {/* Top Banner with 100+ Counter */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-medium mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>100+ Verified Commercial Paid Titles • Steam Live</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top Paid Games Library &amp; AI Live Discovery
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Includes full franchises for Call of Duty, Need for Speed, Colin McRae / WRC, Final Fantasy, Digimon, Control Resonance, and top trending paid releases.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {accounts.length > 0 && (
              <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 text-[10px] block">Assign To Giveaway Account:</span>
                <select
                  value={selectedAccountForAssign}
                  onChange={(e) => setSelectedAccountForAssign(e.target.value)}
                  className="bg-transparent text-cyan-300 font-semibold focus:outline-none text-xs"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                      {acc.username} ({acc.assignedGames.length} games)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Search AI Box (Gemini Grounded to NOW) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-purple-950/40 border border-indigo-800/60 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-cyan-400 shadow">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Smart Search AI System</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Google Search Grounded to NOW (2026)
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Ask Gemini to search the web for the newest live releases, DLCs, and trending Steam games.
              </p>
            </div>
          </div>
        </div>

        {/* AI Input bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Bot className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={aiSearchPrompt}
              onChange={(e) => setAiSearchPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunAiSmartSearch();
              }}
              placeholder="e.g. Find best co-op games trending on Steam right now, or latest Call of Duty releases..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

          <button
            onClick={() => handleRunAiSmartSearch()}
            disabled={isAiSearching}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-60 shrink-0"
          >
            {isAiSearching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Searching Live Web...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Search Live AI Games</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Presets:</span>
          </span>
          {[
            'Trending on Steam Right NOW',
            'Latest Call of Duty Releases',
            'Need for Speed Franchise',
            'Colin McRae & DiRT Rally',
            'Final Fantasy Series',
            'Digimon RPGs',
            'Control Resonance & Remedy'
          ].map(preset => (
            <button
              key={preset}
              onClick={() => {
                setAiSearchPrompt(preset);
                handleRunAiSmartSearch(preset);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* AI Notice */}
        {aiSearchNotice && (
          <div className="p-3 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-xs text-indigo-200 flex items-center justify-between shadow">
            <span>{aiSearchNotice}</span>
            {aiSearchResults && (
              <button
                onClick={() => setAiSearchResults(null)}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                Clear AI Results
              </button>
            )}
          </div>
        )}

        {/* AI Results Grid */}
        {aiSearchResults && aiSearchResults.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Discovered Live Games:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiSearchResults.map(aiGame => (
                <div
                  key={aiGame.appId}
                  className="p-3 bg-slate-950 border border-indigo-800/80 rounded-xl flex flex-col justify-between space-y-2 shadow-md hover:border-cyan-500 transition"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={aiGame.imageUrl}
                      alt={aiGame.title}
                      className="w-16 h-10 object-cover rounded border border-slate-700 shrink-0"
                      onError={(e: any) => {
                        e.target.src = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${aiGame.appId}/header.jpg`;
                      }}
                    />
                    <div className="truncate flex-1">
                      <h4 className="font-bold text-white text-xs truncate">{aiGame.title}</h4>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        AppID: {aiGame.appId} • ${aiGame.currentPrice || '59.99'}
                      </div>
                    </div>
                  </div>

                  {aiGame.reasonTrending && (
                    <div className="text-[10px] text-amber-300 italic bg-amber-950/30 p-1.5 rounded border border-amber-900/40">
                      "{aiGame.reasonTrending}"
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-slate-900">
                    <button
                      onClick={() => handleAddAiGame(aiGame)}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1 shadow"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Library</span>
                    </button>
                    <button
                      onClick={() => handleTriggerInstall(aiGame.appId, aiGame.title)}
                      className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-bold border border-slate-700"
                      title="Direct Steam URI install"
                    >
                      Install
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {installNotification && (
        <div className="p-3 bg-cyan-950/90 border border-cyan-500 text-cyan-200 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{installNotification}</span>
          </div>
          <button
            onClick={() => setInstallNotification(null)}
            className="text-cyan-400 hover:text-white ml-2 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Franchise Tabs & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all 100+ titles (e.g. Black Ops, Need for Speed, Final Fantasy, Digimon, Control, Wukong, Elden Ring)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          />
          {isSearchingLive && (
            <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Querying Steam Store...</span>
            </div>
          )}
        </div>

        {/* Franchise Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none pt-1">
          {franchises.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFranchise(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedFranchise === f.id
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Games Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>Showing {displayedGames.length} titles in {selectedFranchise} catalog</span>
        <span>Total Library: {currentGames.length} commercial titles</span>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayedGames.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <Gamepad2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No games found matching "{searchQuery}".</p>
          </div>
        ) : (
          displayedGames.map(game => {
            const livePlayers = playerCounts[game.appId];
            const isAssigned = accounts
              .find(a => a.id === selectedAccountForAssign)
              ?.assignedGames.includes(game.appId);

            return (
              <div
                key={game.appId}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  {/* Banner */}
                  <div className="relative h-40 bg-slate-950 overflow-hidden">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e: any) => {
                        e.target.src = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${game.appId}/header.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    {/* AppID tag */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-cyan-300 border border-cyan-800/50">
                        AppID: {game.appId}
                      </span>
                    </div>

                    {/* Price tag */}
                    <div className="absolute top-2 right-2">
                      {game.discountPercent > 0 ? (
                        <div className="flex items-center space-x-1">
                          <span className="bg-emerald-600 text-white font-black text-xs px-1.5 py-0.5 rounded">
                            -{game.discountPercent}%
                          </span>
                          <span className="bg-black/90 text-emerald-400 font-bold text-xs px-2 py-0.5 rounded border border-emerald-700/50">
                            ${game.currentPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : game.currentPrice > 0 ? (
                        <span className="bg-black/90 text-white font-bold text-xs px-2 py-0.5 rounded border border-slate-700">
                          ${game.currentPrice.toFixed(2)}
                        </span>
                      ) : (
                        <span className="bg-emerald-950 text-emerald-300 font-bold text-xs px-2 py-0.5 rounded border border-emerald-700">
                          Free to Play
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-white font-bold text-sm truncate drop-shadow-md">
                        {game.title}
                      </h3>
                      <div className="flex items-center space-x-1 mt-0.5">
                        {game.genre.slice(0, 3).map(g => (
                          <span key={g} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Body Metrics */}
                  <div className="p-4 space-y-3">
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>In-Game Now:</span>
                      </span>
                      <span className="text-emerald-400 font-black">
                        {livePlayers !== undefined ? (
                          livePlayers.toLocaleString()
                        ) : (
                          <button
                            onClick={() => fetchRealPlayerCounts([game.appId])}
                            className="text-cyan-400 hover:underline text-[11px]"
                          >
                            Query Valve
                          </button>
                        )}
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <a
                        href={`https://store.steampowered.com/app/${game.appId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Steam Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTriggerInstall(game.appId, game.title)}
                      className="py-2 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 shadow transition truncate"
                      title="Direct Steam client install command: steam://install/<appId>"
                    >
                      <Download className="w-3 h-3 shrink-0" />
                      <span className="truncate">Install</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateToSaves(game.title)}
                      className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-slate-700 transition truncate"
                    >
                      <span className="truncate">Saves</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateToLuas && onNavigateToLuas(game.title)}
                      className="py-2 px-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-emerald-800/60 transition truncate"
                      title="Inspect and install .lua scripts for this title"
                    >
                      <FileCode2 className="w-3 h-3 shrink-0 text-emerald-400" />
                      <span className="truncate">.Luas</span>
                    </button>
                  </div>

                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onAssignToAccount(selectedAccountForAssign, game.appId)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                        isAssigned
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-800/80 hover:bg-purple-900'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {isAssigned ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                          <span>Linked to Selected Account</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach to Selected Account</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
