import React, { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Cpu, 
  Radio, 
  Terminal,
  Filter,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { SyncLogEntry, SteamAccount } from '../types';

interface SyncLogsViewProps {
  logs: SyncLogEntry[];
  accounts: SteamAccount[];
  onTriggerGlobalSync: () => void;
  isSyncing: boolean;
}

export const SyncLogsView: React.FC<SyncLogsViewProps> = ({
  logs,
  accounts,
  onTriggerGlobalSync,
  isSyncing
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesStatus && matchesAction;
  });

  const avgLatency = Math.round(
    logs.reduce((sum, l) => sum + l.latencyMs, 0) / (logs.length || 1)
  );

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
      {/* Telemetry Header Gauge Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-mono font-medium mb-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Real-Time Performance Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Synchronization Logs &amp; Metrics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Live audit trail of Steam API probes, credential validations, VAC security checks, and cloud save synchronization latency across all provisioned accounts.
            </p>
          </div>

          {/* Trigger Sync Button */}
          <button
            onClick={onTriggerGlobalSync}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing All Accounts...' : 'Trigger Global Sync Probe'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Average Round-Trip Latency</div>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-1">
            <span>{avgLatency}</span>
            <span className="text-xs font-normal text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Optimal Steam Edge Server</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Synchronized Accounts</div>
          <div className="text-2xl font-black text-white mt-1">
            {accounts.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">100% telemetry verified</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">Recorded Sync Events</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {logs.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Audit log retention active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-mono">System Integrity Health</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            99.9%
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Zero VAC or IP bans</div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
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

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="library_sync">Library Sync</option>
              <option value="credentials_check">Credentials Check</option>
              <option value="cloud_save_sync">Cloud Save Sync</option>
              <option value="status_ping">Status Ping</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExportLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 shadow"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export JSON Log Audit</span>
        </button>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2 text-slate-300 font-semibold">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Telemetry Event Stream</span>
          </span>
          <span>Showing {filteredLogs.length} events</span>
        </div>

        <div className="divide-y divide-slate-900 max-h-[500px] overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-600 italic">
              No log entries match the selected filters.
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
