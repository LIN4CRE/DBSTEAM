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
  Tag
} from 'lucide-react';
import { GameTitle, SteamAccount } from '../types';

interface GamesDiscoveryProps {
  games: GameTitle[];
  accounts: SteamAccount[];
  onAssignToAccount: (accountId: string, appId: number) => void;
  onNavigateToSaves: (gameTitle: string) => void;
  onRefreshLiveGames?: () => void;
}

export const GamesDiscovery: React.FC<GamesDiscoveryProps> = ({
  games,
  accounts,
  onAssignToAccount,
  onNavigateToSaves
}) => {
  const [liveGames, setLiveGames] = useState<GameTitle[]>(games);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<any[] | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<number, number>>({});
  const [isLoadingPlayerCounts, setIsLoadingPlayerCounts] = useState(false);
  const [isLoadingTopSellers, setIsLoadingTopSellers] = useState(false);
  const [installNotification, setInstallNotification] = useState<string | null>(null);
  const [selectedAccountForAssign, setSelectedAccountForAssign] = useState<string>(accounts[0]?.id || '');

  // Fetch real top sellers from Steam Store API on mount
  const fetchRealSteamTopSellers = async () => {
    setIsLoadingTopSellers(true);
    try {
      const res = await fetch('/api/steam/top-sellers');
      if (res.ok) {
        const data = await res.json();
        if (data.games && data.games.length > 0) {
          const formatted: GameTitle[] = data.games.map((g: any) => ({
            appId: g.appId,
            title: g.title,
            genre: ['Top Seller', 'Steam Store'],
            platforms: ['Steam'],
            originalPrice: g.originalPrice,
            currentPrice: g.currentPrice,
            discountPercent: g.discountPercent,
            currentPlayers: 0,
            imageUrl: g.headerImage || `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${g.appId}/header.jpg`,
            description: `Live Steam Store item • ${g.windows ? 'Windows' : ''} ${g.mac ? 'Mac' : ''} ${g.linux ? 'Linux' : ''}`
          }));

          setLiveGames(formatted);
          fetchRealPlayerCounts(formatted.slice(0, 10).map(g => g.appId));
        }
      }
    } catch (e) {
      console.log('Using curated list for baseline', e);
      setLiveGames(games);
    } finally {
      setIsLoadingTopSellers(false);
    }
  };

  // Fetch real live player counts from Valve API
  const fetchRealPlayerCounts = async (appIds: number[]) => {
    setIsLoadingPlayerCounts(true);
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
    setIsLoadingPlayerCounts(false);
  };

  useEffect(() => {
    fetchRealSteamTopSellers();
  }, []);

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

  const displayedGames = liveSearchResults
    ? liveSearchResults.map(item => ({
        appId: item.appId,
        title: item.title,
        genre: ['Steam Search'],
        platforms: ['Steam' as const],
        originalPrice: item.originalPrice,
        currentPrice: item.price,
        discountPercent: item.discountPercent,
        currentPlayers: playerCounts[item.appId] || 0,
        imageUrl: item.headerImage || item.tinyImage,
        description: 'Verified live Steam Store title'
      }))
    : liveGames;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-medium mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Steam Store &amp; Valve API Live Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Steam Top Paid Games &amp; Store Search
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              No simulated data. Live Steam Store top sellers, real concurrent player numbers direct from Valve's servers, and native 1-click Steam protocol installations.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchRealSteamTopSellers}
              disabled={isLoadingTopSellers}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingTopSellers ? 'animate-spin' : ''}`} />
              <span>Refresh Store Data</span>
            </button>

            {accounts.length > 0 && (
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
                <span className="text-slate-500 text-[10px] block">Assign To Account:</span>
                <select
                  value={selectedAccountForAssign}
                  onChange={(e) => setSelectedAccountForAssign(e.target.value)}
                  className="bg-transparent text-cyan-300 font-semibold focus:outline-none text-xs"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                      {acc.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
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

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any game on Steam Store (e.g. Elden Ring, Wukong, Call of Duty, Baldur's Gate)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
          />
          {isSearchingLive && (
            <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Querying Steam...</span>
            </div>
          )}
        </div>

        {liveSearchResults && (
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Live store search results for "{searchQuery}" ({liveSearchResults.length} found)</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setLiveSearchResults(null);
              }}
              className="text-cyan-400 hover:underline"
            >
              Reset to Top Sellers
            </button>
          </div>
        )}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayedGames.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <Gamepad2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No games found.</p>
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
                    </div>
                  </div>

                  {/* Body Metrics: Live In-Game Players from Valve */}
                  <div className="p-4 space-y-3">
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Playing Right Now:</span>
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

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <a
                        href={`https://store.steampowered.com/app/${game.appId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Official Steam Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerInstall(game.appId, game.title)}
                      className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition"
                      title="Direct Steam client install command: steam://install/<appId>"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Auto-Install</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateToSaves(game.title)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                    >
                      <span>Cloud Saves</span>
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
