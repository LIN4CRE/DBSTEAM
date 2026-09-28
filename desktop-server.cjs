/**
 * DBSTEAM Desktop Backend Server
 * High-performance embedded Express server for local telemetry, Steam API proxying, and AI discovery.
 */

const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

function createServer() {
  const app = express();

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
    } catch (error) {
      console.error('Error fetching Steam top sellers:', error.message);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // API Route: Live Store Search from Steam
  app.get('/api/steam/search', async (req, res) => {
    try {
      const term = (req.query.term || '').trim();
      if (!term) {
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
      const items = (data.items || []).map((item) => ({
        appId: item.id,
        title: item.name,
        price: item.price ? (item.price.final / 100) : 0,
        originalPrice: item.price ? (item.price.initial / 100) : 0,
        discountPercent: item.price ? item.price.discount_percent : 0,
        tinyImage: item.tiny_image,
        headerImage: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`
      }));

      res.json({ items, total: data.total });
    } catch (error) {
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
    } catch (error) {
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
        genres: (appData.genres || []).map((g) => g.description),
        releaseDate: appData.release_date?.date,
        headerImage: appData.header_image,
        screenshots: (appData.screenshots || []).map((s) => s.path_thumbnail),
        pcRequirements: appData.pc_requirements,
        metacritic: appData.metacritic?.score
      });
    } catch (error) {
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

      const extractTag = (tag) => {
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
    } catch (error) {
      console.error('Error fetching steam profile:', error.message);
      res.status(500).json({ error: error.message || 'Profile lookup failed' });
    }
  });

  // API Route: Smart AI Search for Live Games
  app.post('/api/ai/smart-search', async (req, res) => {
    try {
      const query = (req.body.query || 'Trending top paid games on Steam right now').trim();
      let gamesList = [];
      let engineUsed = 'Steam Store Live Query';

      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = require('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `You are a real-time gaming intelligence assistant.
Identify 6 to 10 top played, highly rated, or trending paid commercial games on Steam matching this query: "${query}".
For each game, return the verified numerical Steam AppID, exact title, genre array, current USD price, short description, and reasonTrending.
Return ONLY valid JSON array with schema: [{"appId": 1938090, "title": "Game Title", "genre": ["Action"], "currentPrice": 59.99, "description": "...", "reasonTrending": "..."}]`;

          const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: { responseMimeType: 'application/json', temperature: 0.3 }
          });

          const text = (aiResponse.text || '').trim();
          if (text) {
            gamesList = JSON.parse(text);
            engineUsed = 'Gemini 3.1 Flash Lite';
          }
        } catch (aiErr) {
          console.warn('Gemini query error, falling back to Steam Store live search:', aiErr.message);
        }
      }

      if (!gamesList || gamesList.length === 0) {
        try {
          const steamRes = await fetch(
            `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`,
            { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
          );
          if (steamRes.ok) {
            const steamData = await steamRes.json();
            if (steamData.items && steamData.items.length > 0) {
              gamesList = steamData.items.slice(0, 10).map((it) => ({
                appId: it.id,
                title: it.name,
                genre: ['Top Commercial Release', 'Steam Verified'],
                currentPrice: it.price ? it.price.final / 100 : 59.99,
                description: `Live Steam commercial title ranked for query "${query}".`,
                reasonTrending: 'Direct live match from Valve Steam Store directory.'
              }));
            }
          }
        } catch (steamErr) {
          console.error('Steam Store query fallback error:', steamErr.message);
        }
      }

      const formatted = (Array.isArray(gamesList) ? gamesList : []).map((g) => {
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
      }).filter((g) => g.appId > 0);

      res.json({
        games: formatted,
        query,
        count: formatted.length,
        engine: engineUsed,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Smart AI Search error:', error);
      res.status(500).json({ error: error.message || 'Smart search failed' });
    }
  });

  // Dynamic static assets directory resolution:
  const localAppData = process.env.LOCALAPPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library', 'Application Support') : path.join(process.env.HOME || '', '.config'));
  const webCacheDir = path.join(localAppData, 'DBSTEAM', 'web');
  const devDistDir = path.join('D:', 'Projects', 'DBSTEAM', 'dist');
  const bundledDir = path.join(__dirname, 'dist');

  function getActiveStaticDir() {
    // 1. If hot-updated web cache exists and has index.html, use it (highest priority for remote updates)
    if (fs.existsSync(path.join(webCacheDir, 'index.html'))) {
      return webCacheDir;
    }
    // 2. If local developer dist exists and has index.html, use it (instant local development changes)
    if (fs.existsSync(path.join(devDistDir, 'index.html'))) {
      return devDistDir;
    }
    // 3. Fallback to bundled directory
    return bundledDir;
  }

  // API Route: Check for updates status
  app.get('/api/app/update-status', (req, res) => {
    try {
      const activeDir = getActiveStaticDir();
      res.json({
        activeDir,
        isCached: activeDir === webCacheDir,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/app/sync-updates', async (req, res) => {
    const updated = await checkForHotUpdates();
    res.json({ updated, activeDir: getActiveStaticDir() });
  });

  // Serve static assets from active static directory
  app.use((req, res, next) => {
    const activeDir = getActiveStaticDir();
    express.static(activeDir)(req, res, next);
  });

  // SPA fallback to active index.html
  app.get('*', (req, res) => {
    const activeDir = getActiveStaticDir();
    res.sendFile(path.join(activeDir, 'index.html'));
  });

  return app;
}

// Background Hot-Updater from GitHub Pages
async function checkForHotUpdates(onUpdateCallback) {
  try {
    const remoteIndexUrl = 'https://lin4cre.github.io/DBSTEAM/index.html';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(remoteIndexUrl, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeoutId);
    if (!resp.ok) return false;

    const remoteHtml = await resp.text();
    const localAppData = process.env.LOCALAPPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME || '', 'Library', 'Application Support') : path.join(process.env.HOME || '', '.config'));
    const webCacheDir = path.join(localAppData, 'DBSTEAM', 'web');
    const devDistDir = path.join('D:', 'Projects', 'DBSTEAM', 'dist');
    const bundledDir = path.join(__dirname, 'dist');

    let currentHtml = '';
    const activeDir = fs.existsSync(path.join(webCacheDir, 'index.html')) ? webCacheDir : (fs.existsSync(path.join(devDistDir, 'index.html')) ? devDistDir : bundledDir);
    const activeIndex = path.join(activeDir, 'index.html');
    if (fs.existsSync(activeIndex)) {
      try { currentHtml = fs.readFileSync(activeIndex, 'utf8'); } catch {}
    }

    // Compare HTML contents
    if (remoteHtml && remoteHtml.trim() !== currentHtml.trim()) {
      console.log('[Auto-Updater] Newer web deployment detected. Syncing assets...');
      if (!fs.existsSync(webCacheDir)) {
        fs.mkdirSync(webCacheDir, { recursive: true });
      }
      const assetsDir = path.join(webCacheDir, 'assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      // Extract asset files from remote HTML (e.g. assets/index-xxx.js and assets/index-xxx.css)
      const assetMatches = [...remoteHtml.matchAll(/(?:src|href)="(?:\.\/)?(assets\/[^"]+)"/g)];
      for (const match of assetMatches) {
        const assetRel = match[1];
        const assetUrl = `https://lin4cre.github.io/DBSTEAM/${assetRel}`;
        const assetDest = path.join(webCacheDir, assetRel);
        try {
          const aResp = await fetch(assetUrl);
          if (aResp.ok) {
            const buf = await aResp.arrayBuffer();
            fs.writeFileSync(assetDest, Buffer.from(buf));
            console.log(`[Auto-Updater] Synced: ${assetRel}`);
          }
        } catch (e) {
          console.warn(`[Auto-Updater] Failed asset fetch: ${assetRel}`, e.message);
        }
      }

      fs.writeFileSync(path.join(webCacheDir, 'index.html'), remoteHtml, 'utf8');
      console.log('[Auto-Updater] Hot update synchronized successfully to ' + webCacheDir);
      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback();
      }
      return true;
    } else {
      console.log('[Auto-Updater] Web assets are up to date.');
    }
  } catch (err) {
    console.warn('[Auto-Updater] Update check skipped (offline or timeout):', err.message);
  }
  return false;
}

function startBackend(desiredPort = 3000) {
  const app = createServer();
  
  return new Promise((resolve, reject) => {
    function tryListen(portToTry) {
      const server = http.createServer(app);

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${portToTry} in use, trying port ${portToTry + 1}...`);
          tryListen(portToTry + 1);
        } else {
          reject(err);
        }
      });

      server.listen(portToTry, '127.0.0.1', () => {
        const address = server.address();
        const activePort = typeof address === 'object' ? address.port : portToTry;
        console.log(`[DBSTEAM Desktop Server] Listening on http://127.0.0.1:${activePort}`);
        resolve({ server, port: activePort });
      });
    }

    tryListen(desiredPort);
  });
}

module.exports = { startBackend, createServer, checkForHotUpdates };
