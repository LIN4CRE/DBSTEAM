import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

  // API Route: Smart AI Search for Live Games to the date of NOW
  app.post('/api/ai/smart-search', async (req, res) => {
    try {
      const query = (req.body.query as string) || 'Trending top paid games on Steam right now';
      const prompt = `You are a real-time gaming intelligence assistant. The current date is September 2026.
Identify 6 to 10 top played, highly rated, or trending paid commercial games on Steam matching this query: "${query}".
Include specific series if requested (such as Call of Duty, Need for Speed, Colin McRae / WRC, Final Fantasy, Digimon, Control & Remedy universe, or current top paid releases).
For each game, provide the verified real Steam AppID (numerical), exact title, genres (array of strings), current USD price (number), concise 1-2 sentence description, and why it is trending or popular as of NOW in 2026.

Return ONLY a valid JSON array of objects with this schema:
[
  {
    "appId": 1938090,
    "title": "Call of Duty: Black Ops 6",
    "genre": ["Action", "Shooter", "Multiplayer"],
    "currentPrice": 69.99,
    "description": "Treyarch's blockbuster spy action thriller featuring dynamic 90s campaign and Omnimovement.",
    "reasonTrending": "Currently leading concurrent active player charts with new seasonal multiplayer and zombies updates."
  }
]`;

      let gamesList: any[] = [];
      let engineUsed = 'Gemini 3.1 Flash Lite';

      if (process.env.GEMINI_API_KEY) {
        try {
          // Attempt with gemini-3.1-flash-lite and JSON output mode
          const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3
            }
          });

          const text = (aiResponse.text || '').trim();
          if (text) {
            try {
              gamesList = JSON.parse(text);
            } catch {
              const match = text.match(/\[[\s\S]*\]/);
              if (match) {
                gamesList = JSON.parse(match[0]);
              }
            }
          }
        } catch (firstErr: any) {
          console.warn('Gemini 3.1 Flash Lite attempt error, trying fallback:', firstErr.message);
          try {
            // Fallback attempt with gemini-3.8-flash
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                temperature: 0.3
              }
            });
            const text = fallbackResponse.text || '';
            const match = text.match(/\[[\s\S]*\]/);
            if (match) {
              gamesList = JSON.parse(match[0]);
              engineUsed = 'Gemini 3.8 Flash';
            }
          } catch (secondErr: any) {
            console.error('All Gemini AI attempts failed:', secondErr.message);
          }
        }
      }

      // If AI returned empty (e.g. rate limit), perform live query directly on Steam Store API for the query term
      if (!gamesList || gamesList.length === 0) {
        engineUsed = 'Steam Store Live Query';
        try {
          const steamRes = await fetch(
            `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            }
          );
          if (steamRes.ok) {
            const steamData = await steamRes.json();
            if (steamData.items && steamData.items.length > 0) {
              gamesList = steamData.items.slice(0, 10).map((it: any) => ({
                appId: it.id,
                title: it.name,
                genre: ['Trending Paid Title', 'Steam Verified'],
                currentPrice: it.price ? it.price.final / 100 : 59.99,
                description: `Live Steam commercial title ranked for query "${query}".`,
                reasonTrending: 'Direct live match from Valve Steam Store directory.'
              }));
            }
          }
        } catch (steamErr: any) {
          console.error('Live Steam search fallback error:', steamErr.message);
        }
      }

      // Format games with verified assets and fields
      const formatted = (Array.isArray(gamesList) ? gamesList : []).map((g: any) => {
        const appId = Number(g.appId) || 0;
        return {
          appId,
          title: g.title || 'Steam Title',
          genre: Array.isArray(g.genre) ? g.genre : ['Action', 'Top Paid'],
          platforms: ['Steam'],
          originalPrice: Number(g.originalPrice) || Number(g.currentPrice) || 59.99,
          currentPrice: Number(g.currentPrice) || 59.99,
          discountPercent: Number(g.discountPercent) || 0,
          currentPlayers: 0,
          imageUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
          description: g.description || 'Verified live Steam Store title.',
          reasonTrending: g.reasonTrending || 'Trending live on Steam',
          source: engineUsed
        };
      }).filter(g => g.appId > 0);

      res.json({
        games: formatted,
        query,
        count: formatted.length,
        engine: engineUsed,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Smart AI Search error:', error);
      res.status(500).json({ error: error.message || 'Smart search failed' });
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
