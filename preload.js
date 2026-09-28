/**
 * DBSTEAM Electron Preload Script
 * Safely bridges desktop native functionality to renderer context.
 */

const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  openExternal: (url) => shell.openExternal(url),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});
