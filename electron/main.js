const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let currentFilePath = null;

// Vite dev server URL
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

console.log('Starting MDon with args:', process.argv);

// Shared helper function to read directory contents recursively
function readDir(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  return items
    .filter(item => {
      // Filter out hidden files
      if (item.name.startsWith('.')) return false;
      if (item.isDirectory()) return true;
      return /\.(md|markdown|txt)$/i.test(item.name);
    })
    .map(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        return {
          name: item.name,
          path: fullPath,
          type: 'folder',
          children: readDir(fullPath)
        };
      }
      return {
        name: item.name,
        path: fullPath,
        type: 'file'
      };
    })
    .sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
}

function createWindow(filePathToOpen = null) {
  console.log('Creating window, filePathToOpen:', filePathToOpen);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
    title: 'MDon'
  });

  // Load URL based on environment
  if (process.env.VITE_DEV_SERVER_URL) {
    // In development, add file path as query param
    if (filePathToOpen) {
      const fileUrl = encodeURIComponent(filePathToOpen);
      mainWindow.loadURL(`${VITE_DEV_SERVER_URL}?file=${fileUrl}`);
    } else {
      mainWindow.loadURL(VITE_DEV_SERVER_URL);
    }
  } else {
    // Production: load from built files
    if (filePathToOpen) {
      // Read file BEFORE loading, then inject immediately after page starts loading
      let fileContent = '';
      try {
        fileContent = fs.readFileSync(filePathToOpen, 'utf-8');
      } catch (error) {
        console.error('Error reading file:', error);
      }

      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

      // Wait for page to be ready, then inject
      mainWindow.webContents.on('did-finish-load', () => {
        // Add longer delay to ensure React has mounted
        setTimeout(() => {
          const script = `
            window.localStorage.setItem('monk_initial_file', '${filePathToOpen.replace(/'/g, "\\'")}');
            window.localStorage.setItem('monk_initial_content', '${fileContent.replace(/'/g, "\\'").replace(/\n/g, "\\n")}');
            console.log('[Main] Injected initial file data');
            // Trigger custom event to notify app
            window.dispatchEvent(new CustomEvent('monk-file-loaded'));
          `;
          mainWindow.webContents.executeJavaScript(script);
        }, 1000);
      });
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  }
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            currentFilePath = null;
            mainWindow.webContents.send('new-file');
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }
              ]
            });
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              const content = fs.readFileSync(filePath, 'utf-8');
              currentFilePath = filePath;
              mainWindow.webContents.send('file-opened', { filePath, content });
            }
          }
        },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            try {
              const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory']
              });
              if (!result.canceled && result.filePaths.length > 0) {
                const folderPath = result.filePaths[0];
                const tree = readDir(folderPath);
                mainWindow.webContents.send('folder-opened', { folderPath, tree });
              }
            } catch (error) {
              console.error('Error opening folder:', error);
              dialog.showErrorBox('Error', `Failed to open folder: ${error.message}`);
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('save-file-as');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handler for file save
ipcMain.handle('save-file', async (event, { filePath, content }) => {
  try {
    if (filePath) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true, filePath };
    } else {
      const result = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      });
      if (!result.canceled) {
        fs.writeFileSync(result.filePath, content, 'utf-8');
        return { success: true, filePath: result.filePath };
      }
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
  return { success: false };
});

// IPC handler for opening folder dialog
ipcMain.handle('open-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, folderPath: result.filePaths[0] };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for reading folder contents
ipcMain.handle('read-folder', async (event, folderPath) => {
  try {
    const tree = readDir(folderPath);
    return { success: true, tree, folderPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handler for file read
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  // Check for file path argument - use app.commandLine for better compatibility
  const args = process.argv;
  console.log('Process argv:', args);

  // In packaged app, the structure is different
  // Look for file arguments
  let filePathToOpen = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.endsWith('.md') || arg.endsWith('.markdown') || arg.endsWith('.txt')) {
      filePathToOpen = arg;
      break;
    }
  }

  console.log('File to open:', filePathToOpen);
  createWindow(filePathToOpen);
  createMenu();
});

// Handle open-file event (macOS standard way)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  console.log('open-file event:', filePath);

  if (mainWindow) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      mainWindow.webContents.send('file-opened', { filePath, content });
    } catch (error) {
      console.error('Error opening file from open-file event:', error);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
