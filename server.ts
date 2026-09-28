import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Route: Live Top Sellers from Steam Store API
  app.get('/api/steam/top-sellers', async (req, res) => {
    try {
      const response = await fetch(
        'https://store.steampowered.com/api/featuredcategories/?l=english&cc=US',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch from Steam Store API' });
      }

      const data = await response.json();
      const topSellers = data.top_sellers?.items || [];
      const specials = data.specials?.items || [];

      // Combine and deduplicate
      const seen = new Set();
      const games = [];

      for (const item of [...topSellers, ...specials]) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          games.push({
            appId: item.id,
            title: item.name,
            originalPrice: item.original_price ? item.original_price / 100 : (item.final_price ? item.final_price / 100 : 0),
            currentPrice: item.final_price ? item.final_price / 100 : 0,
            discountPercent: item.discount_percent || 0,
            headerImage: item.header_image || item.large_capsule_image,
            windows: item.windows_available ?? true,
            mac: item.mac_available ?? false,
            linux: item.linux_available ?? false,
            source: 'Steam Live Store'
          });
        }
      }

      res.json({ games, timestamp: new Date().toISOString() });
    } catch (error: any) {
      console.error('Error fetching Steam top sellers:', error.message);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // API Route: Live Store Search from Steam
  app.get('/api/steam/search', async (req, res) => {
    try {
      const term = (req.query.term as string) || '';
      if (!term.trim()) {
        return res.json({ items: [] });
      }

      const response = await fetch(
        `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Steam search API failed' });
      }

      const data = await response.json();
      const items = (data.items || []).map((item: any) => ({
        appId: item.id,
        title: item.name,
        price: item.price ? (item.price.final / 100) : 0,
        originalPrice: item.price ? (item.price.initial / 100) : 0,
        discountPercent: item.price ? item.price.discount_percent : 0,
        tinyImage: item.tiny_image,
        headerImage: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`
      }));

      res.json({ items, total: data.total });
    } catch (error: any) {
      console.error('Error searching Steam store:', error.message);
      res.status(500).json({ error: error.message || 'Search failed' });
    }
  });

  // API Route: Real-Time Current Player Count from Valve Public API
  app.get('/api/steam/player-count/:appId', async (req, res) => {
    try {
      const appId = req.params.appId;
      const response = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Player count query failed' });
      }

      const data = await response.json();
      const playerCount = data.response?.player_count ?? 0;
      res.json({ appId: Number(appId), playerCount, result: data.response?.result ?? 1 });
    } catch (error: any) {
      console.error('Error fetching player count:', error.message);
      res.status(500).json({ error: error.message || 'Player count query failed' });
    }
  });

  // API Route: App Details from Steam Store
  app.get('/api/steam/app-details/:appId', async (req, res) => {
    try {
      const appId = req.params.appId;
      const response = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english&cc=US`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'App details query failed' });
      }

      const data = await response.json();
      const appData = data[appId]?.data;
      if (!appData) {
        return res.status(404).json({ error: 'Game not found on Steam' });
      }

      res.json({
        appId: Number(appId),
        title: appData.name,
        description: appData.short_description,
        genres: (appData.genres || []).map((g: any) => g.description),
        releaseDate: appData.release_date?.date,
        headerImage: appData.header_image,
        screenshots: (appData.screenshots || []).map((s: any) => s.path_thumbnail),
        pcRequirements: appData.pc_requirements,
        metacritic: appData.metacritic?.score
      });
    } catch (error: any) {
      console.error('Error fetching app details:', error.message);
      res.status(500).json({ error: error.message || 'App details query failed' });
    }
  });

  // API Route: Real Public Steam Community Profile Inspection
  app.get('/api/steam/profile/:identifier', async (req, res) => {
    try {
      const identifier = req.params.identifier.trim();
      const isSteamId64 = /^\d{17}$/.test(identifier);
      const url = isSteamId64
        ? `https://steamcommunity.com/profiles/${identifier}/?xml=1`
        : `https://steamcommunity.com/id/${identifier}/?xml=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return res.status(404).json({ error: 'Steam profile not reachable' });
      }

      const xmlText = await response.text();
      if (xmlText.includes('<error>The specified profile could not be found.</error>')) {
        return res.status(404).json({ error: 'Profile not found on Steam Community' });
      }

      // Simple regex extraction from official Steam XML
      const extractTag = (tag: string) => {
        const match = xmlText.match(new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`)) ||
                      xmlText.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`));
        return match ? match[1] : null;
      };

      const steamId64 = extractTag('steamID64') || (isSteamId64 ? identifier : '');
      const steamID = extractTag('steamID') || identifier;
      const avatarMedium = extractTag('avatarMedium') || extractTag('avatarIcon') || '';
      const vacBanned = extractTag('vacBanned') === '1';
      const tradeBanState = extractTag('tradeBanState') || 'None';
      const isLimitedAccount = extractTag('isLimitedAccount') === '1';
      const customURL = extractTag('customURL') || '';
      const privacyState = extractTag('privacyState') || 'public';

      res.json({
        steamId64,
        steamID,
        avatarMedium,
        vacBanned,
        tradeBanState,
        isLimitedAccount,
        customURL,
        privacyState,
        verified: true
      });
    } catch (error: any) {
      console.error('Error fetching steam profile:', error.message);
      res.status(500).json({ error: error.message || 'Profile lookup failed' });
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Steam & Game Hub server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
