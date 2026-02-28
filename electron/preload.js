const { contextBridge, ipcRenderer } = require('electron');

// Get initial file from URL query param
const urlParams = new URLSearchParams(window.location.search);
const initialFile = urlParams.get('file');
console.log('[Preload] Initial file:', initialFile);

// Expose file path and read function to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  initialFile: initialFile,
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),

  // Folder APIs
  openFolder: () => ipcRenderer.invoke('open-folder'),
  readFolder: (folderPath) => ipcRenderer.invoke('read-folder', folderPath),

  // Event listeners
  onNewFile: (callback) => ipcRenderer.on('new-file', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (event, data) => callback(data)),
  onSaveFile: (callback) => ipcRenderer.on('save-file', callback),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', callback),
  onFolderOpened: (callback) => ipcRenderer.on('folder-opened', (event, data) => callback(data))
});
