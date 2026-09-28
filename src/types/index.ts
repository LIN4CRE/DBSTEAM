export type AccountStatus = 'active' | 'pending_verification' | 'restricted' | 'ready_for_distribution';

export interface SteamAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  steamId64: string;
  status: AccountStatus;
  vacStatus: 'Clean' | 'Banned';
  communityBan: boolean;
  tradeHold: boolean;
  gamesCount: number;
  totalPlaytimeHours: number;
  walletBalance: string;
  steamGuard: 'Email' | 'Mobile 2FA' | 'Disabled';
  createdAt: string;
  lastSynced: string;
  notes: string;
  assignedGames: number[]; // appIds
  tags: string[];
  avatarUrl?: string;
  customUrl?: string;
  isRealProfile?: boolean;
}

export interface GameTitle {
  appId: number;
  title: string;
  genre: string[];
  platforms: ('Steam' | 'Epic' | 'GOG' | 'Xbox' | 'PlayStation' | 'Switch')[];
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  currentPlayers: number;
  peakPlayers?: number;
  reviewScorePercent?: number;
  reviewCount?: number;
  releaseDate?: string;
  storageGb?: number;
  imageUrl: string;
  headerUrl?: string;
  description: string;
  isInstalled?: boolean;
}

export interface CloudSaveBackup {
  id: string;
  appId: number;
  gameTitle: string;
  accountId: string;
  accountUsername: string;
  version: string;
  fileSizeBytes: number;
  fileName?: string;
  fileData?: string; // base64 or text for real file backup
  timestamp: string;
  notes: string;
  status: 'synced' | 'local_newer' | 'conflict' | 'uploading';
  checksum: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  accountId: string;
  accountUsername: string;
  action: 'library_sync' | 'credentials_check' | 'cloud_save_sync' | 'achievement_refresh' | 'status_ping' | 'profile_verified' | 'lua_script_installed' | 'lua_script_executed' | 'library_manifest_sync';
  status: 'success' | 'warning' | 'error';
  latencyMs: number;
  details: string;
}

export interface GameLuaScript {
  id: string;
  name: string;
  fileName: string;
  appId: number;
  gameTitle: string;
  category: 'Performance & Optimization' | 'Save Sync Hook' | 'Script Extender & Mods' | 'HUD & Telemetry' | 'Steamworks API' | 'Depot Manifest';
  version: string;
  author: string;
  description: string;
  code: string;
  targetInstallPath: string;
  isInstalled: boolean;
  fileSizeBytes: number;
  updatedAt: string;
}
