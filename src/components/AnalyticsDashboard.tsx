import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  Clock,
  PieChart as PieIcon,
  Gamepad2,
  Users,
  ShieldCheck,
  DollarSign,
  HardDrive,
  Download,
  Sparkles,
  RefreshCw,
  BarChart3,
  Layers,
  Award,
  Flame,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { SteamAccount, GameTitle } from '../types';

interface AnalyticsDashboardProps {
  accounts: SteamAccount[];
  games: GameTitle[];
  onNavigateToAccounts: () => void;
  onNavigateToGames: () => void;
  onSeedDemoFleet?: () => void;
}

// Chart color palettes - Steam cyberpunk dark palette
const GENRE_COLORS = [
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#a855f7', // purple-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#8b5cf6'  // violet-500
];

const STATUS_COLORS: Record<string, string> = {
  'active': '#3b82f6',
  'ready_for_distribution': '#10b981',
  'pending_verification': '#f59e0b',
  'restricted': '#ef4444'
};

// Custom Tooltip for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 shadow-2xl backdrop-blur text-xs">
        <p className="font-bold text-white mb-1.5 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: item.color || item.fill }}
              />
              {item.name}:
            </span>
            <span className="font-mono font-bold text-white">
              {typeof item.value === 'number'
                ? item.name.toLowerCase().includes('value') || item.name.toLowerCase().includes('price')
                  ? `$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : item.name.toLowerCase().includes('hours') || item.name.toLowerCase().includes('playtime')
                    ? `${item.value.toLocaleString()} hrs`
                    : item.value.toLocaleString()
                : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  accounts,
  games,
  onNavigateToAccounts,
  onNavigateToGames,
  onSeedDemoFleet
}) => {
  const [timeHorizon, setTimeHorizon] = useState<'all' | '90d' | '30d'>('all');
  const [activeMetricTab, setActiveMetricTab] = useState<'overview' | 'growth' | 'genres' | 'playtime'>('overview');
  const [copiedReport, setCopiedReport] = useState(false);

  // Map games by appId for rapid lookup
  const gamesMap = useMemo(() => {
    const map = new Map<number, GameTitle>();
    games.forEach(g => map.set(g.appId, g));
    return map;
  }, [games]);

  // Aggregate Key Metrics
  const totalAccounts = accounts.length;
  const totalAssignedGamesCount = accounts.reduce((acc, a) => acc + a.assignedGames.length, 0);
  const totalPlaytime = accounts.reduce((acc, a) => acc + (a.totalPlaytimeHours || 0), 0);
  const avgPlaytime = totalAccounts > 0 ? Math.round(totalPlaytime / totalAccounts) : 0;
  const readyForDistributionCount = accounts.filter(a => a.status === 'ready_for_distribution').length;
  const vacCleanCount = accounts.filter(a => a.vacStatus === 'Clean').length;
  const vacCleanPercent = totalAccounts > 0 ? Math.round((vacCleanCount / totalAccounts) * 100) : 100;

  // Calculate estimated vault library monetary value ($) and total disk footprint (GB)
  const { totalVaultValue, totalStorageGb, uniqueOwnedAppIds } = useMemo(() => {
    let value = 0;
    let storage = 0;
    const uniqueIds = new Set<number>();

    accounts.forEach(acc => {
      acc.assignedGames.forEach(appId => {
        uniqueIds.add(appId);
        const game = gamesMap.get(appId);
        if (game) {
          value += (game.currentPrice || 0);
          storage += (game.storageGb || 35);
        }
      });
    });

    return {
      totalVaultValue: value,
      totalStorageGb: storage,
      uniqueOwnedAppIds: uniqueIds
    };
  }, [accounts, gamesMap]);

  // 1. Account Growth & Cumulative Expansion Timeline
  const growthTimelineData = useMemo(() => {
    if (accounts.length === 0) return [];

    // Sort accounts by creation date
    const sorted = [...accounts].sort((a, b) => 
      new Date(a.createdAt || '2026-01-01').getTime() - new Date(b.createdAt || '2026-01-01').getTime()
    );

    let cumulativeAcc = 0;
    let cumulativeGames = 0;
    let cumulativeValue = 0;
    let cumulativeHours = 0;

    // Group or generate data points
    const points: Array<{
      date: string;
      accounts: number;
      assignedGames: number;
      estimatedValue: number;
      playtimeHours: number;
      accountLabel: string;
    }> = [];

    sorted.forEach((acc, index) => {
      cumulativeAcc += 1;
      cumulativeGames += acc.assignedGames.length;
      cumulativeHours += (acc.totalPlaytimeHours || 0);

      const accValue = acc.assignedGames.reduce((sum, id) => {
        const g = gamesMap.get(id);
        return sum + (g ? g.currentPrice : 0);
      }, 0);
      cumulativeValue += accValue;

      const dateStr = acc.createdAt ? acc.createdAt.slice(5) : `Node ${index + 1}`; // e.g. "08-15"

      points.push({
        date: dateStr,
        accountLabel: acc.username,
        accounts: cumulativeAcc,
        assignedGames: cumulativeGames,
        estimatedValue: parseFloat(cumulativeValue.toFixed(2)),
        playtimeHours: cumulativeHours
      });
    });

    return points;
  }, [accounts, gamesMap]);

  // 2. Game Library Composition by Genre
  const genreCompositionData = useMemo(() => {
    const genreCountMap: Record<string, number> = {};

    accounts.forEach(acc => {
      acc.assignedGames.forEach(appId => {
        const game = gamesMap.get(appId);
        if (game && game.genre) {
          game.genre.forEach(g => {
            genreCountMap[g] = (genreCountMap[g] || 0) + 1;
          });
        }
      });
    });

    // If accounts have few assigned games, also reflect broader library genre balance
    if (Object.keys(genreCountMap).length === 0) {
      games.forEach(g => {
        if (g.genre) {
          g.genre.forEach(gen => {
            genreCountMap[gen] = (genreCountMap[gen] || 0) + 1;
          });
        }
      });
    }

    const entries = Object.entries(genreCountMap).map(([name, count]) => ({
      name,
      value: count
    }));

    // Sort descending and take top 8, cluster rest into "Other"
    entries.sort((a, b) => b.value - a.value);
    const topEntries = entries.slice(0, 7);
    const otherEntries = entries.slice(7);
    if (otherEntries.length > 0) {
      const otherSum = otherEntries.reduce((sum, item) => sum + item.value, 0);
      topEntries.push({ name: 'Other Genres', value: otherSum });
    }

    return topEntries;
  }, [accounts, games, gamesMap]);

  // 3. Playtime Hours Comparison Across Managed Accounts
  const accountPlaytimeData = useMemo(() => {
    return [...accounts]
      .sort((a, b) => (b.totalPlaytimeHours || 0) - (a.totalPlaytimeHours || 0))
      .slice(0, 10)
      .map(acc => ({
        username: acc.username.length > 12 ? acc.username.slice(0, 10) + '…' : acc.username,
        fullUsername: acc.username,
        playtimeHours: acc.totalPlaytimeHours || 0,
        gamesCount: acc.assignedGames.length,
        status: acc.status
      }));
  }, [accounts]);

  // 4. Top Franchises / Games Represented Across Accounts
  const topGamesAssignmentData = useMemo(() => {
    const gameFreq: Record<number, number> = {};
    accounts.forEach(acc => {
      acc.assignedGames.forEach(appId => {
        gameFreq[appId] = (gameFreq[appId] || 0) + 1;
      });
    });

    // If no assigned games, pick top popular games from library
    if (Object.keys(gameFreq).length === 0) {
      return games.slice(0, 6).map(g => ({
        title: g.title.length > 18 ? g.title.slice(0, 16) + '…' : g.title,
        fullTitle: g.title,
        accountsCount: 0,
        currentPrice: g.currentPrice,
        genre: g.genre[0] || 'Game'
      }));
    }

    const list = Object.entries(gameFreq).map(([appIdStr, count]) => {
      const appId = parseInt(appIdStr, 10);
      const game = gamesMap.get(appId);
      return {
        title: game ? (game.title.length > 18 ? game.title.slice(0, 16) + '…' : game.title) : `App ${appId}`,
        fullTitle: game ? game.title : `AppID ${appId}`,
        accountsCount: count,
        currentPrice: game ? game.currentPrice : 0,
        genre: game?.genre[0] || 'Commercial'
      };
    });

    list.sort((a, b) => b.accountsCount - a.accountsCount);
    return list.slice(0, 8);
  }, [accounts, games, gamesMap]);

  // 5. Account Status & Security Breakdown
  const accountStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      'Active': 0,
      'Ready for Handoff': 0,
      'Pending': 0,
      'Restricted': 0
    };

    accounts.forEach(acc => {
      if (acc.status === 'ready_for_distribution') statusCounts['Ready for Handoff']++;
      else if (acc.status === 'active') statusCounts['Active']++;
      else if (acc.status === 'pending_verification') statusCounts['Pending']++;
      else if (acc.status === 'restricted') statusCounts['Restricted']++;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  }, [accounts]);

  const handleCopySummaryReport = () => {
    const report = `📊 STEAM VAULT ANALYTICS EXECUTIVE REPORT
==================================================
Generated: ${new Date().toLocaleString()}
Total Managed Accounts: ${totalAccounts}
Total Playtime Tracked: ${totalPlaytime.toLocaleString()} Hours
Average Playtime/Account: ${avgPlaytime} Hours
Assigned Games in Fleet: ${totalAssignedGamesCount}
Unique Vault Titles: ${uniqueOwnedAppIds.size}
Total Vault Value: $${totalVaultValue.toFixed(2)}
Total Storage Footprint: ${totalStorageGb.toLocaleString()} GB
VAC Clean Security Rate: ${vacCleanPercent}%
Ready for Distribution: ${readyForDistributionCount} Accounts

TOP GENRES:
${genreCompositionData.map(g => `• ${g.name}: ${g.value} allocations`).join('\n')}

FLEET PLAYTIME LEADERBOARD:
${accountPlaytimeData.slice(0, 5).map(a => `• ${a.fullUsername}: ${a.playtimeHours} hrs (${a.gamesCount} games)`).join('\n')}
==================================================`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Visual Analytics &amp; Fleet Intelligence
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50 uppercase tracking-wider">
                Recharts Live
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              High-resolution visualization of account growth trajectory, genre compositions, total playtime distribution, and multi-account asset valuation.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySummaryReport}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition shadow"
            >
              {copiedReport ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Report Copied!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            {accounts.length === 0 && onSeedDemoFleet && (
              <button
                onClick={onSeedDemoFleet}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Load Sample Fleet Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation / Metric Filter Tabs */}
        <div className="flex items-center space-x-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveMetricTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeMetricTab === 'overview'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveMetricTab('growth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeMetricTab === 'growth'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Account Growth Trends</span>
          </button>

          <button
            onClick={() => setActiveMetricTab('genres')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeMetricTab === 'genres'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Library Composition</span>
          </button>

          <button
            onClick={() => setActiveMetricTab('playtime')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeMetricTab === 'playtime'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hours Played &amp; Activity</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row - Responsive Typography & Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Accounts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Managed Accounts
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalAccounts}</span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">
              {readyForDistributionCount} ready
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
            <span>VAC Clean Rate:</span>
            <span className="text-emerald-400 font-bold">{vacCleanPercent}%</span>
          </div>
        </div>

        {/* Card 2: Total Playtime */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Hours Played
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {totalPlaytime.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">hrs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
            <span>Fleet Avg:</span>
            <span className="text-slate-300 font-bold">{avgPlaytime} hrs / account</span>
          </div>
        </div>

        {/* Card 3: Library Allocations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Games Allocated
            </span>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400">
              {totalAssignedGamesCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({uniqueOwnedAppIds.size} unique)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
            <span>Total Storage:</span>
            <span className="text-slate-300 font-bold">~{totalStorageGb.toLocaleString()} GB</span>
          </div>
        </div>

        {/* Card 4: Estimated Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Estimated Vault Value
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              ${totalVaultValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
            <span>Store Base:</span>
            <span className="text-slate-300 font-bold">{games.length} cataloged titles</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      {accounts.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/50 border border-indigo-800/60 flex items-center justify-center mx-auto text-indigo-400">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">No Accounts Currently Enrolled</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Add your accounts in the Account Manager or load a sample fleet to visualize the growth curves, genre compositions, and total hours played.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onSeedDemoFleet && (
              <button
                onClick={onSeedDemoFleet}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Fleet for Visualization</span>
              </button>
            )}
            <button
              onClick={onNavigateToAccounts}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Go to Account Vault</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart 1: Account Growth & Vault Trajectory (AreaChart) */}
          {(activeMetricTab === 'overview' || activeMetricTab === 'growth') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Account Growth &amp; Library Scaling Trajectory
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cumulative accounts enrolled, assigned game licenses, and estimated vault valuation.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                    Accounts: <b className="text-white">{totalAccounts}</b>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">
                    Games: <b className="text-white">{totalAssignedGamesCount}</b>
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthTimelineData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="assignedGames"
                      name="Assigned Game Titles"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorGames)"
                    />
                    <Area
                      type="monotone"
                      dataKey="accounts"
                      name="Cumulative Accounts"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorAccounts)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Grid Row: Genre Composition & Status Distribution */}
          {(activeMetricTab === 'overview' || activeMetricTab === 'genres') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genre Composition Donut Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2">
                      <PieIcon className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        Game Library Genre Composition
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {genreCompositionData.length} Genres
                    </span>
                  </div>

                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genreCompositionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {genreCompositionData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                              stroke="#0f172a"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Genre percentage breakdown list */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                  {genreCompositionData.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-400 pr-2">
                      <span className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: GENRE_COLORS[idx % GENRE_COLORS.length] }}
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-200 ml-1">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Distribution Readiness BarChart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        Account Distribution &amp; Security Health
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {vacCleanPercent}% VAC Clean
                    </span>
                  </div>

                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accountStatusData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="status"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="count"
                          name="Account Count"
                          radius={[6, 6, 0, 0]}
                        >
                          {accountStatusData.map((entry, index) => {
                            let color = '#3b82f6';
                            if (entry.status === 'Ready for Handoff') color = '#10b981';
                            if (entry.status === 'Pending') color = '#f59e0b';
                            if (entry.status === 'Restricted') color = '#ef4444';
                            return <Cell key={`status-bar-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Steam Guard Protection:</span>
                  <span className="text-cyan-400">
                    {accounts.filter(a => a.steamGuard !== 'Disabled').length} / {totalAccounts} Secured
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Chart 3: Playtime Leaderboard Across Accounts (Horizontal or Vertical BarChart) */}
          {(activeMetricTab === 'overview' || activeMetricTab === 'playtime') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Hours Played per Account */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Playtime Hours Across Managed Accounts
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Top {accountPlaytimeData.length} Accounts
                  </span>
                </div>

                <div className="h-64 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={accountPlaytimeData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        type="number"
                        stroke="#64748b"
                        fontSize={11}
                        unit="h"
                      />
                      <YAxis
                        type="category"
                        dataKey="username"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        width={85}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="playtimeHours"
                        name="Total Playtime (Hours)"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Most Allocated / Popular Titles Across the Fleet */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <Gamepad2 className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Most Assigned Titles Across Fleet
                    </h3>
                  </div>
                  <button
                    onClick={onNavigateToGames}
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    View All Games &rarr;
                  </button>
                </div>

                <div className="h-64 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topGamesAssignmentData}
                      margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="title"
                        stroke="#64748b"
                        fontSize={10}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="accountsCount"
                        name="Accounts Owning Title"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
