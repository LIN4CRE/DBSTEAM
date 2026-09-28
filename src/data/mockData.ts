import { SteamAccount, GameTitle, CloudSaveBackup, SyncLogEntry } from '../types';

// Zero fake accounts - user must import or register real accounts
export const INITIAL_ACCOUNTS: SteamAccount[] = [];

// Zero fake cloud saves - only real user-uploaded saves
export const INITIAL_CLOUD_SAVES: CloudSaveBackup[] = [];

// Zero fake sync logs - only logs from real actions and network probes
export const INITIAL_SYNC_LOGS: SyncLogEntry[] = [];

// Curated verified real Steam App IDs with real official Steam CDN assets
export const CURATED_STEAM_GAMES: GameTitle[] = [
  {
    appId: 2358720,
    title: 'Black Myth: Wukong',
    genre: ['Action', 'RPG', 'Soulslike'],
    platforms: ['Steam', 'PlayStation'],
    originalPrice: 59.99,
    currentPrice: 59.99,
    discountPercent: 0,
    currentPlayers: 0, // Loaded dynamically from Valve API
    peakPlayers: 2415714,
    reviewScorePercent: 96,
    reviewCount: 712000,
    releaseDate: 'Aug 20, 2024',
    storageGb: 130,
    imageUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
    headerUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg',
    description: 'An action RPG rooted in Chinese mythology. Journey west as the Destined One to uncover the obscured truth beneath a glorious legend.'
  },
  {
    appId: 1245620,
    title: 'ELDEN RING',
    genre: ['RPG', 'Action', 'Open World', 'Soulslike'],
    platforms: ['Steam', 'PlayStation', 'Xbox'],
    originalPrice: 59.99,
    currentPrice: 59.99,
    discountPercent: 0,
    currentPlayers: 0,
    peakPlayers: 953426,
    reviewScorePercent: 92,
    reviewCount: 654000,
    releaseDate: 'Feb 25, 2022',
    storageGb: 60,
    imageUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    headerUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    description: 'A fantasy action-RPG adventure through the Lands Between, brandishing the power of the Elden Ring.'
  },
  {
    appId: 1086940,
    title: "Baldur's Gate 3",
    genre: ['RPG', 'Strategy', 'Turn-Based'],
    platforms: ['Steam', 'GOG', 'PlayStation', 'Xbox'],
    originalPrice: 59.99,
    currentPrice: 47.99,
    discountPercent: 20,
    currentPlayers: 0,
    peakPlayers: 875343,
    reviewScorePercent: 96,
    reviewCount: 590000,
    releaseDate: 'Aug 3, 2023',
    storageGb: 150,
    imageUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    headerUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    description: 'An expansive party-based RPG set in the Dungeons & Dragons universe.'
  },
  {
    appId: 553850,
    title: 'HELLDIVERS 2',
    genre: ['Action', 'Shooter', 'Co-op'],
    platforms: ['Steam', 'PlayStation'],
    originalPrice: 39.99,
    currentPrice: 39.99,
    discountPercent: 0,
    currentPlayers: 0,
    peakPlayers: 458709,
    reviewScorePercent: 78,
    reviewCount: 382000,
    releaseDate: 'Feb 8, 2024',
    storageGb: 70,
    imageUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg',
    headerUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg',
    description: 'Third-person squad-based shooter where Helldivers enlist to fight for Galactic freedom.'
  },
  {
    appId: 730,
    title: 'Counter-Strike 2',
    genre: ['Action', 'Shooter', 'Competitive'],
    platforms: ['Steam'],
    originalPrice: 0.00,
    currentPrice: 0.00,
    discountPercent: 0,
    currentPlayers: 0,
    peakPlayers: 1818773,
    reviewScorePercent: 88,
    reviewCount: 8120000,
    releaseDate: 'Sep 27, 2023',
    storageGb: 85,
    imageUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    headerUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    description: 'The premier competitive tactical first-person shooter powered by the Source 2 engine.'
  },
  {
    appId: 1091500,
    title: 'Cyberpunk 2077',
    genre: ['RPG', 'Action', 'Open World', 'Sci-fi'],
    platforms: ['Steam', 'Epic', 'GOG', 'PlayStation', 'Xbox'],
    originalPrice: 59.99,
    currentPrice: 29.99,
    discountPercent: 50,
    currentPlayers: 0,
    peakPlayers: 1054388,
    reviewScorePercent: 88,
    reviewCount: 680000,
    releaseDate: 'Dec 10, 2020',
    storageGb: 70,
    imageUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    headerUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg',
    description: 'An open-world action-adventure RPG set in the megalopolis of Night City.'
  }
];
