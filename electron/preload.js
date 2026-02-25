const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNewFile: (callback) => ipcRenderer.on('new-file', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (event, data) => callback(data)),
  onSaveFile: (callback) => ipcRenderer.on('save-file', callback),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', callback),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content })
});
