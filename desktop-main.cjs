/**
 * DBSTEAM - Windows 11 Desktop Application Entry Point
 * Electron Main Process script for high-performance desktop execution.
 */

const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron');
const path = require('path');
const { startBackend, checkForHotUpdates } = require('./desktop-server.cjs');

let mainWindow = null;
let tray = null;
let serverInstance = null;
let activePort = 3000;

// Enforce single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

async function createMainWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'DBSTEAM - Next-Gen Steam & Gaming Operations Hub',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#0a0d14',
    show: true,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const targetUrl = `http://127.0.0.1:${port}`;
  mainWindow.loadURL(targetUrl).catch((err) => {
    console.error('Failed to load local URL:', err);
  });

  mainWindow.focus();

  // Open target="_blank" links in default external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.isQuitting = true;
    app.quit();
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload Application',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload()
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => mainWindow && mainWindow.setFullScreen(!mainWindow.isFullScreen())
        },
        { type: 'separator' },
        {
          label: 'Exit DBSTEAM',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Ctrl+Shift+I',
          click: () => mainWindow && mainWindow.webContents.toggleDevTools()
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Official GitHub Repository',
          click: () => shell.openExternal('https://github.com/LIN4CRE/DBSTEAM')
        },
        {
          label: 'Download Latest Releases',
          click: () => shell.openExternal('https://github.com/LIN4CRE/DBSTEAM/releases')
        },
        {
          label: 'Linacre Ecosystem Portal',
          click: () => shell.openExternal('https://linacre.site')
        },
        { type: 'separator' },
        {
          label: 'About DBSTEAM',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About DBSTEAM',
              message: 'DBSTEAM Hub v1.0.0',
              detail: 'Next-Gen Steam & Gaming Operations Hub\nSteamDB Commercial Intelligence • Cloud Save Vault • Lua Automation Scripting • Gemini AI\n\n© 2026 David Linacre (https://linacre.site)'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createSystemTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.ico');
  try {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open DBSTEAM Hub',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit DBSTEAM',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('DBSTEAM - Next-Gen Gaming Operations Hub');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (err) {
    console.warn('System Tray initialization warning:', err.message);
  }
}

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide();
});

app.whenReady().then(async () => {
  try {
    const { server, port } = await startBackend(3000);
    serverInstance = server;
    activePort = port;

    createApplicationMenu();
    await createMainWindow(activePort);
    createSystemTray();

    // Trigger instant background auto-update check from GitHub Pages
    checkForHotUpdates(() => {
      console.log('[Electron Main] Fresh deployment synchronized! Hot-reloading active interface...');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow(activePort);
    });
  } catch (err) {
    console.error('Fatal startup error in DBSTEAM Desktop:', err);
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {
      // server already closed
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Kept alive for system tray background execution
  }
});
