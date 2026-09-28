import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Gamepad2, 
  Download, 
  Play, 
  TrendingUp, 
  Star, 
  HardDrive, 
  ExternalLink, 
  Check, 
  Plus, 
  Layers, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { GameTitle, SteamAccount } from '../types';

interface GamesDiscoveryProps {
  games: GameTitle[];
  accounts: SteamAccount[];
  onAssignToAccount: (accountId: string, appId: number) => void;
  onNavigateToSaves: (gameTitle: string) => void;
}

export const GamesDiscovery: React.FC<GamesDiscoveryProps> = ({
  games,
  accounts,
  onAssignToAccount,
  onNavigateToSaves
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'players' | 'peak' | 'rating' | 'price'>('players');
  const [installNotification, setInstallNotification] = useState<string | null>(null);
  const [selectedAccountForAssign, setSelectedAccountForAssign] = useState<string>(accounts[0]?.id || '');

  const genres = ['All', 'Action', 'RPG', 'Strategy', 'Shooter', 'Open World', 'Survival', 'Soulslike'];
  const platforms = ['All', 'Steam', 'Epic', 'GOG', 'PlayStation', 'Xbox'];

  const filteredGames = games
    .filter(game => {
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.appId.toString().includes(searchQuery);

      const matchesGenre = selectedGenre === 'All' || game.genre.includes(selectedGenre);
      const matchesPlatform = selectedPlatform === 'All' || game.platforms.includes(selectedPlatform as any);

      return matchesSearch && matchesGenre && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === 'players') return b.currentPlayers - a.currentPlayers;
      if (sortBy === 'peak') return b.peakPlayers - a.peakPlayers;
      if (sortBy === 'rating') return b.reviewScorePercent - a.reviewScorePercent;
      if (sortBy === 'price') return a.currentPrice - b.currentPrice;
      return 0;
    });

  const handleTriggerInstall = (game: GameTitle) => {
    // Protocol URI triggers local Steam client download/install dialogue automatically
    const steamUri = `steam://install/${game.appId}`;
    try {
      window.location.href = steamUri;
    } catch (e) {
      console.log('Dispatched protocol:', steamUri);
    }

    setInstallNotification(`Launched Steam installation protocol for "${game.title}" (steam://install/${game.appId})`);
    setTimeout(() => setInstallNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with SteamDB live telemetry style */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-medium mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>SteamDB Real-Time Telemetry Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Top-Played Paid Games Catalog
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Browse top trending paid titles across Steam, Epic, and console platforms. Launch 1-click automatic installations directly into your local Steam client via native URI triggers.
            </p>
          </div>

          {/* Quick Target Account Select */}
          {accounts.length > 0 && (
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
              <label className="text-slate-400 block mb-1">Target Account for 1-Click Assignment:</label>
              <select
                value={selectedAccountForAssign}
                onChange={(e) => setSelectedAccountForAssign(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2.5 py-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.username} ({acc.assignedGames.length} games)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {installNotification && (
        <div className="p-3 bg-cyan-950/90 border border-cyan-500 text-cyan-200 rounded-xl text-xs flex items-center justify-between shadow-lg animate-fadeIn">
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

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, genre, AppID (e.g. Wukong, Elden Ring, 1086940)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="players">Most Concurrent Players</option>
                <option value="peak">All-Time Peak</option>
                <option value="rating">Highest Steam Rating</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills & Platform Pills */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Category:</span>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                  selectedGenre === genre
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Platform:</span>
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                  selectedPlatform === platform
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredGames.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <Gamepad2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No games found matching your filters.</p>
          </div>
        ) : (
          filteredGames.map(game => {
            const isAssignedToSelected = accounts
              .find(a => a.id === selectedAccountForAssign)
              ?.assignedGames.includes(game.appId);

            return (
              <div
                key={game.appId}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition flex flex-col justify-between group"
              >
                <div>
                  {/* Game Banner Header */}
                  <div className="relative h-40 bg-slate-950 overflow-hidden">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    {/* AppID and Price badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-cyan-300 border border-cyan-800/50">
                        AppID: {game.appId}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      {game.discountPercent > 0 ? (
                        <div className="flex items-center space-x-1">
                          <span className="bg-emerald-600 text-white font-black text-xs px-1.5 py-0.5 rounded">
                            -{game.discountPercent}%
                          </span>
                          <span className="bg-black/80 text-emerald-400 font-bold text-xs px-2 py-0.5 rounded border border-emerald-700/50">
                            ${game.currentPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="bg-black/80 text-white font-bold text-xs px-2 py-0.5 rounded border border-slate-700">
                          ${game.currentPrice}
                        </span>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-white font-bold text-sm truncate drop-shadow-md">
                        {game.title}
                      </h3>
                      <div className="flex items-center space-x-1 mt-0.5">
                        {game.platforms.map(p => (
                          <span key={p} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Body Metrics: Live Players & Ratings */}
                  <div className="p-4 space-y-3">
                    {/* SteamDB Live Telemetry Row */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>In-Game Now:</span>
                        </div>
                        <div className="text-emerald-400 font-black text-xs mt-0.5">
                          {game.currentPlayers.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500">All-Time Peak:</div>
                        <div className="text-slate-200 font-bold text-xs mt-0.5">
                          {game.peakPlayers.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Reviews & Storage */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <Star className="w-3.5 h-3.5 fill-cyan-400" />
                        <span className="font-semibold">{game.reviewScorePercent}% Positive</span>
                        <span className="text-[10px] text-slate-500">({(game.reviewCount / 1000).toFixed(0)}k)</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        <span>{game.storageGb} GB</span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Install Trigger Button */}
                    <button
                      type="button"
                      onClick={() => handleTriggerInstall(game)}
                      className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition"
                      title="Direct Steam client install command: steam://install/..."
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Auto-Install</span>
                    </button>

                    {/* Cloud Saves Trigger Button */}
                    <button
                      type="button"
                      onClick={() => onNavigateToSaves(game.title)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 transition"
                    >
                      <span>Cloud Saves</span>
                    </button>
                  </div>

                  {/* Account Library Assignment Button */}
                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onAssignToAccount(selectedAccountForAssign, game.appId)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition ${
                        isAssignedToSelected
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-800/80 hover:bg-purple-900'
                          : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {isAssignedToSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                          <span>Linked to Active Account</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach to Active Account</span>
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
