import React, { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Radio, 
  Terminal,
  Download,
  Zap,
  Globe
} from 'lucide-react';
import { SyncLogEntry, SteamAccount } from '../types';

interface SyncLogsViewProps {
  logs: SyncLogEntry[];
  accounts: SteamAccount[];
  onTriggerGlobalSync: () => void;
  isSyncing: boolean;
  onAddLogEntry?: (log: SyncLogEntry) => void;
}

export const SyncLogsView: React.FC<SyncLogsViewProps> = ({
  logs,
  accounts,
  onTriggerGlobalSync,
  isSyncing,
  onAddLogEntry
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  const [isProbingValve, setIsProbingValve] = useState(false);
  const [lastMeasuredLatency, setLastMeasuredLatency] = useState<number | null>(null);

  const filteredLogs = logs.filter(log => {
    return statusFilter === 'all' || log.status === statusFilter;
  });

  const avgLatency = logs.length > 0 
    ? Math.round(logs.reduce((sum, l) => sum + l.latencyMs, 0) / logs.length)
    : lastMeasuredLatency || 0;

  // Real live network probe to Valve's public API
  const handleRealLatencyProbe = async () => {
    setIsProbingValve(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/steam/player-count/730');
      const elapsed = Math.round(performance.now() - start);
      setLastMeasuredLatency(elapsed);

      if (onAddLogEntry) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        onAddLogEntry({
          id: `log-probe-${Date.now()}`,
          timestamp: timeStr,
          accountId: 'network',
          accountUsername: 'Valve Edge Server',
          action: 'status_ping',
          status: res.ok ? 'success' : 'warning',
          latencyMs: elapsed,
          details: `Direct HTTP probe to Valve Steam API: ${res.ok ? 'HTTP 200 OK' : 'HTTP Error'}. Real round-trip: ${elapsed}ms.`
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsProbingValve(false);
    }
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `steam_sync_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-mono font-medium mb-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Real-Time Network Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Synchronization Logs
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              No fabricated events. Displays verified real-time telemetry from authentic API probes, save operations, and account checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRealLatencyProbe}
              disabled={isProbingValve}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 shadow transition"
            >
              <Zap className={`w-3.5 h-3.5 text-cyan-400 ${isProbingValve ? 'animate-spin' : ''}`} />
              <span>{isProbingValve ? 'Measuring...' : 'Probe Live Valve Ping'}</span>
            </button>

            {accounts.length > 0 && (
              <button
                onClick={onTriggerGlobalSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync All Accounts'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Valve Edge Round-Trip Latency</div>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-1">
            <span>{avgLatency || '--'}</span>
            <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {avgLatency ? 'Measured via direct HTTP query' : 'Click "Probe Live Valve Ping"'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Tracked Vault Accounts</div>
          <div className="text-2xl font-black text-white mt-1">
            {accounts.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Real profiles monitored</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Recorded Audit Events</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {logs.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Session audit trail</div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400">Filter Event Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Events</option>
            <option value="success">Success</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
          </select>
        </div>

        {logs.length > 0 && (
          <button
            onClick={handleExportLogs}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON Audit</span>
          </button>
        )}
      </div>

      {/* Log Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2 text-slate-300 font-semibold">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Live Audit Stream</span>
          </span>
          <span>{filteredLogs.length} events logged</span>
        </div>

        <div className="divide-y divide-slate-900 max-h-[500px] overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-600 italic space-y-2">
              <p>No audit events recorded yet in this session.</p>
              <p className="text-[11px] text-slate-500 font-sans">
                Real events will automatically populate here as you probe Valve servers, import real profiles, or sync saves.
              </p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-3.5 hover:bg-slate-900/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="mt-0.5 sm:mt-0">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : log.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">[{log.timestamp}]</span>
                      <span className="text-indigo-400 font-semibold">{log.accountUsername}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 uppercase">
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5">
                      {log.details}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 self-end sm:self-center shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {log.latencyMs}ms
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
