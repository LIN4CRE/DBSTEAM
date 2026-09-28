import { SteamAccount, GameTitle, CloudSaveBackup, SyncLogEntry } from '../types';
import { COMPREHENSIVE_PAID_GAMES_LIBRARY } from './allPaidGames';

// Zero fake accounts - user must import or register real accounts
export const INITIAL_ACCOUNTS: SteamAccount[] = [];

// Zero fake cloud saves - only real user-uploaded saves
export const INITIAL_CLOUD_SAVES: CloudSaveBackup[] = [];

// Zero fake sync logs - only logs from real actions and network probes
export const INITIAL_SYNC_LOGS: SyncLogEntry[] = [];

// Over 100+ verified real paid Steam titles with official AppIDs and CDN images
export const CURATED_STEAM_GAMES: GameTitle[] = COMPREHENSIVE_PAID_GAMES_LIBRARY;
