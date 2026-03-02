# MDon 多文件与文件夹支持 - 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 MDon 添加文件夹浏览和多文件 Tab 切换功能

**Architecture:** 纯 React State 管理，在现有 TipTapEditor 基础上改造

**Tech Stack:** React, Electron, TipTap

---

## Task 1: 更新 Main Process - 添加文件夹相关 IPC Handlers

**Files:**
- Modify: `monk/electron/main.js:150-180`

**Step 1: 添加 open-folder handler**

在 `ipcMain.handle('save-file'` 之后添加：

```javascript
// IPC handler for opening folder dialog
ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, folderPath: result.filePaths[0] };
  }
  return { success: false };
});

// IPC handler for reading folder contents
ipcMain.handle('read-folder', async (event, folderPath) => {
  try {
    const readDir = (dirPath) => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      return items
        .filter(item => {
          // 过滤隐藏文件和常见不需要的文件
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
          // 文件夹优先
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });
    };

    const tree = readDir(folderPath);
    return { success: true, tree, folderPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

**Step 2: 添加 Open Folder 菜单项**

在 `createMenu()` 的 File submenu 中，在 "Open" 之后添加：

```javascript
{
  label: 'Open Folder',
  accelerator: 'CmdOrCtrl+Shift+O',
  click: async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      // Read folder contents
      const readDir = (dirPath) => {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        return items
          .filter(item => {
            if (item.name.startsWith('.')) return false;
            return true;
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
            if (/\.(md|markdown|txt)$/i.test(item.name)) {
              return {
                name: item.name,
                path: fullPath,
                type: 'file'
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
          });
      };
      const tree = readDir(folderPath);
      mainWindow.webContents.send('folder-opened', { folderPath, tree });
    }
  }
},
```

**Step 3: Commit**

```bash
cd monk
git add electron/main.js
git commit -m "feat: add folder IPC handlers and menu"
```

---

## Task 2: 更新 Preload - 暴露新 API

**Files:**
- Modify: `monk/electron/preload.js`

**Step 1: 添加新 API**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 现有 API...
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  // 新增 API
  openFolder: () => ipcRenderer.invoke('open-folder'),
  readFolder: (folderPath) => ipcRenderer.invoke('read-folder', folderPath),

  // 事件监听
  onNewFile: (callback) => ipcRenderer.on('new-file', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (event, data) => callback(data)),
  onSaveFile: (callback) => ipcRenderer.on('save-file', callback),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', callback),
  onFolderOpened: (callback) => ipcRenderer.on('folder-opened', (event, data) => callback(data))
});
```

**Step 2: Commit**

```bash
cd monk
git add electron/preload.js
git commit -m "feat: expose folder APIs to renderer"
```

---

## Task 3: 创建 TabBar 组件

**Files:**
- Create: `monk/src/components/TabBar.jsx`
- Create: `monk/src/components/__tests__/TabBar.test.jsx`

**Step 1: Write failing test**

```jsx
// src/components/__tests__/TabBar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TabBar from '../TabBar';

describe('TabBar', () => {
  const mockFiles = [
    { id: '1', name: 'file1.md', isModified: false },
    { id: '2', name: 'file2.md', isModified: true }
  ];

  it('renders all tabs', () => {
    render(<TabBar files={mockFiles} activeFileId="1" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText('file1.md')).toBeInTheDocument();
    expect(screen.getByText('file2.md')).toBeInTheDocument();
  });

  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    render(<TabBar files={mockFiles} activeFileId="1" onSelect={onSelect} onClose={() => {}} />);
    fireEvent.click(screen.getByText('file2.md'));
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<TabBar files={mockFiles} activeFileId="1" onSelect={() => {}} onClose={onClose} />);
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(onClose).toHaveBeenCalledWith('1');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd monk
npm test -- --run src/components/__tests__/TabBar.test.jsx
```
Expected: FAIL - TabBar component not found

**Step 3: Write implementation**

```jsx
// src/components/TabBar.jsx
import React from 'react';
import './TabBar.css';

function TabBar({ files, activeFileId, onSelect, onClose }) {
  if (files.length === 0) {
    return <div className="tab-bar tab-bar-empty">No files open</div>;
  }

  return (
    <div className="tab-bar">
      {files.map(file => (
        <div
          key={file.id}
          className={`tab ${file.id === activeFileId ? 'tab-active' : ''} ${file.isModified ? 'tab-modified' : ''}`}
          onClick={() => onSelect(file.id)}
        >
          <span className="tab-name">
            {file.isModified && <span className="tab-dot">●</span>}
            {file.name}
          </span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(file.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default TabBar;
```

**Step 4: Create CSS**

```css
/* src/components/TabBar.css */
.tab-bar {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  height: 36px;
  overflow-x: auto;
  flex-shrink: 0;
}

.tab-bar::-webkit-scrollbar {
  height: 4px;
}

.tab-bar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.tab-bar-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 100%;
  cursor: pointer;
  border-right: 1px solid var(--border-color);
  min-width: 100px;
  max-width: 200px;
  color: var(--text-secondary);
  transition: background 0.15s;
}

.tab:hover {
  background: var(--bg-primary);
}

.tab-active {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom: 2px solid var(--accent-color);
}

.tab-modified .tab-name {
  font-style: italic;
}

.tab-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.tab-dot {
  color: var(--accent-color);
  margin-right: 4px;
}

.tab-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 3px;
  line-height: 1;
}

.tab-close:hover {
  background: var(--bg-toolbar);
  color: var(--text-primary);
}
```

**Step 5: Run test to verify it passes**

```bash
cd monk
npm test -- --run src/components/__tests__/TabBar.test.jsx
```
Expected: PASS

**Step 6: Commit**

```bash
cd monk
git add src/components/TabBar.jsx src/components/TabBar.css src/components/__tests__/TabBar.test.jsx
git commit -m "feat: add TabBar component"
```

---

## Task 4: 创建 FileSidebar 组件

**Files:**
- Create: `monk/src/components/FileSidebar.jsx`
- Create: `monk/src/components/FileTreeItem.jsx`
- Create: `monk/src/components/__tests__/FileSidebar.test.jsx`

**Step 1: Write failing test**

```jsx
// src/components/__tests__/FileSidebar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileSidebar from '../FileSidebar';

const mockTree = [
  { name: 'folder1', path: '/test/folder1', type: 'folder', children: [
    { name: 'file1.md', path: '/test/folder1/file1.md', type: 'file' }
  ]},
  { name: 'file2.md', path: '/test/file2.md', type: 'file' }
];

describe('FileSidebar', () => {
  it('renders folder tree', () => {
    render(<FileSidebar tree={mockTree} onFileClick={() => {}} onFileDoubleClick={() => {}} />);
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file1.md')).toBeInTheDocument();
    expect(screen.getByText('file2.md')).toBeInTheDocument();
  });

  it('calls onFileClick when file single clicked', () => {
    const onFileClick = vi.fn();
    render(<FileSidebar tree={mockTree} onFileClick={onFileClick} onFileDoubleClick={() => {}} />);
    fireEvent.click(screen.getByText('file2.md'));
    expect(onFileClick).toHaveBeenCalledWith('/test/file2.md');
  });

  it('calls onFileDoubleClick when file double clicked', () => {
    const onFileDoubleClick = vi.fn();
    render(<FileSidebar tree={mockTree} onFileClick={() => {}} onFileDoubleClick={onFileDoubleClick} />);
    fireEvent.doubleClick(screen.getByText('file2.md'));
    expect(onFileDoubleClick).toHaveBeenCalledWith('/test/file2.md');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd monk
npm test -- --run src/components/__tests__/FileSidebar.test.jsx
```
Expected: FAIL - FileSidebar not found

**Step 3: Write FileTreeItem component**

```jsx
// src/components/FileTreeItem.jsx
import React, { useState } from 'react';

function FileTreeItem({ item, level = 0, onFileClick, onFileDoubleClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (item.type === 'folder') {
    return (
      <div className="file-tree-item">
        <div
          className="file-tree-folder"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="file-tree-icon">{isExpanded ? '📂' : '📁'}</span>
          <span className="file-tree-name">{item.name}</span>
        </div>
        {isExpanded && item.children && (
          <div className="file-tree-children">
            {item.children.map(child => (
              <FileTreeItem
                key={child.path}
                item={child}
                level={level + 1}
                onFileClick={onFileClick}
                onFileDoubleClick={onFileDoubleClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="file-tree-file"
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onClick={() => onFileClick(item.path)}
      onDoubleClick={() => onFileDoubleClick(item.path)}
    >
      <span className="file-tree-icon">📄</span>
      <span className="file-tree-name">{item.name}</span>
    </div>
  );
}

export default FileTreeItem;
```

**Step 4: Write FileSidebar component**

```jsx
// src/components/FileSidebar.jsx
import React from 'react';
import FileTreeItem from './FileTreeItem';
import './FileSidebar.css';

function FileSidebar({ tree, folderPath, onFileClick, onFileDoubleClick, onOpenFolder }) {
  return (
    <div className="file-sidebar">
      <div className="file-sidebar-header">
        <span className="file-sidebar-title">Files</span>
        <button className="file-sidebar-open-btn" onClick={onOpenFolder} title="Open Folder">
          📂
        </button>
      </div>
      <div className="file-sidebar-content">
        {tree && tree.length > 0 ? (
          tree.map(item => (
            <FileTreeItem
              key={item.path}
              item={item}
              onFileClick={onFileClick}
              onFileDoubleClick={onFileDoubleClick}
            />
          ))
        ) : (
          <div className="file-sidebar-empty">
            <p>No folder opened</p>
            <button onClick={onOpenFolder}>Open Folder</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileSidebar;
```

**Step 5: Write CSS**

```css
/* src/components/FileSidebar.css */
.file-sidebar {
  width: 200px;
  min-width: 200px;
  height: 100%;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.file-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.file-sidebar-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.file-sidebar-open-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
}

.file-sidebar-open-btn:hover {
  background: var(--bg-toolbar);
}

.file-sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.file-sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 13px;
  gap: 12px;
}

.file-sidebar-empty button {
  padding: 6px 12px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-tree-item {
  font-size: 13px;
}

.file-tree-folder,
.file-tree-file {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--text-primary);
  transition: background 0.15s;
}

.file-tree-folder:hover,
.file-tree-file:hover {
  background: var(--bg-toolbar);
}

.file-tree-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.file-tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Step 6: Run test to verify it passes**

```bash
cd monk
npm test -- --run src/components/__tests__/FileSidebar.test.jsx
```
Expected: PASS

**Step 7: Commit**

```bash
cd monk
git add src/components/FileSidebar.jsx src/components/FileTreeItem.jsx src/components/FileSidebar.css src/components/__tests__/FileSidebar.test.jsx
git commit -m "feat: add FileSidebar component with tree view"
```

---

## Task 5: 重构 App.jsx - 多文件状态管理

**Files:**
- Modify: `monk/src/App.jsx:1-135`
- Modify: `monk/src/App.css`

**Step 1: Rewrite App.jsx**

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import TipTapEditor from './components/TipTapEditor';
import TableOfContents from './components/TableOfContents';
import TabBar from './components/TabBar';
import FileSidebar from './components/FileSidebar';
import { useHeadings } from './hooks/useHeadings';
import './App.css';

function App() {
  // 多文件状态
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [folderPath, setFolderPath] = useState(null);
  const [folderTree, setFolderTree] = useState([]);

  // UI 状态
  const [showFileSidebar, setShowFileSidebar] = useState(true);
  const [showToc, setShowToc] = useState(true);
  const [theme, setTheme] = useState('light');

  // 当前激活文件
  const activeFile = files.find(f => f.id === activeFileId);
  const content = activeFile?.content || '';

  // 解析当前文件标题
  const headings = useHeadings(content);

  // 生成唯一 ID
  const generateId = (path) => {
    return `${path}-${Date.now()}`;
  };

  // 打开文件
  const openFile = useCallback(async (filePath, forceNewTab = false) => {
    if (!window.electronAPI) return;

    // 检查是否已打开（除非 forceNewTab）
    if (!forceNewTab) {
      const existing = files.find(f => f.path === filePath);
      if (existing) {
        setActiveFileId(existing.id);
        return;
    }

    // 读取文件
    const result = await window.electronAPI.readFile(filePath);
    if (result.success) {
      const fileName = filePath.split('/').pop();
      const newFile = {
        id: generateId(filePath),
        path: filePath,
        name: fileName,
        content: result.content,
        isModified: false,
        isNew: false
      };
      setFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
    }
  }, [files]);

  // 关闭文件
  const closeFile = useCallback((fileId) => {
    const fileIndex = files.findIndex(f => f.id === fileId);
    const file = files.find(f => f.id === fileId);

    if (file?.isModified) {
      // TODO: 弹出确认对话框
      console.log('File has unsaved changes:', file.name);
    }

    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);

    // 如果关闭的是当前文件，切换到相邻 tab
    if (fileId === activeFileId && newFiles.length > 0) {
      const newIndex = Math.min(fileIndex, newFiles.length - 1);
      setActiveFileId(newFiles[newIndex].id);
    } else if (newFiles.length === 0) {
      setActiveFileId(null);
    }
  }, [files, activeFileId]);

  // 保存文件
  const saveFile = useCallback(async () => {
    if (!activeFile || !window.electronAPI) return;

    const result = await window.electronAPI.saveFile(activeFile.path, activeFile.content);
    if (result.success) {
      setFiles(prev => prev.map(f =>
        f.id === activeFileId ? { ...f, isModified: false, path: result.filePath } : f
      ));
    }
  }, [activeFile, activeFileId]);

  // 新建文件
  const handleNew = useCallback(() => {
    const newFile = {
      id: generateId('new-' + Date.now()),
      path: null,
      name: 'Untitled.md',
      content: '<h1>New Document</h1><p>Start writing...</p>',
      isModified: false,
      isNew: true
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  // 内容变化
  const handleContentChange = useCallback((newContent) => {
    if (activeFileId) {
      setFiles(prev => prev.map(f =>
        f.id === activeFileId ? { ...f, content: newContent, isModified: true } : f
      ));
    }
  }, [activeFileId]);

  // 打开文件夹
  const handleOpenFolder = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.openFolder();
    if (result.success) {
      const folderResult = await window.electronAPI.readFolder(result.folderPath);
      if (folderResult.success) {
        setFolderPath(folderResult.folderPath);
        setFolderTree(folderResult.tree);
        setShowFileSidebar(true);
      }
    }
  }, []);

  // 切换 Tab
  const handleTabSelect = useCallback((fileId) => {
    setActiveFileId(fileId);
  }, []);

  // Tab 关闭
  const handleTabClose = useCallback((fileId) => {
    closeFile(fileId);
  }, [closeFile]);

  // 监听 main process 事件
  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onNewFile(handleNew);
    window.electronAPI.onFileOpened(({ filePath, content }) => {
      openFile(filePath);
    });
    window.electronAPI.onSaveFile(saveFile);
    window.electronAPI.onSaveFileAs(saveFile);
    window.electronAPI.onFolderOpened(({ folderPath, tree }) => {
      setFolderPath(folderPath);
      setFolderTree(tree);
      setShowFileSidebar(true);
    });

    // 检查 initial file
    const loadInitialFile = () => {
      const initialFile = window.localStorage.getItem('monk_initial_file');
      const initialContent = window.localStorage.getItem('monk_initial_content');
      if (initialFile && initialContent) {
        const newFile = {
          id: generateId(initialFile),
          path: initialFile,
          name: initialFile.split('/').pop(),
          content: initialContent,
          isModified: false,
          isNew: false
        };
        setFiles([newFile]);
        setActiveFileId(newFile.id);
        window.localStorage.removeItem('monk_initial_file');
        window.localStorage.removeItem('monk_initial_content');
      }
    };

    loadInitialFile();
    const interval = setInterval(loadInitialFile, 500);
    setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
    };
  }, [handleNew, openFile, saveFile]);

  return (
    <div className={`app theme-${theme}`}>
      <TabBar
        files={files}
        activeFileId={activeFileId}
        onSelect={handleTabSelect}
        onClose={handleTabClose}
      />

      <div className="app-body">
        {showFileSidebar && (
          <FileSidebar
            tree={folderTree}
            folderPath={folderPath}
            onFileClick={(path) => openFile(path, false)}
            onFileDoubleClick={(path) => openFile(path, true)}
            onOpenFolder={handleOpenFolder}
          />
        )}

        <div className="editor-area">
          {activeFile ? (
            <TipTapEditor
              content={content}
              onChange={handleContentChange}
              theme={theme}
            />
          ) : (
            <div className="editor-empty">
              <p>No file open</p>
              <button onClick={handleNew}>New File</button>
              <button onClick={handleOpenFolder}>Open Folder</button>
            </div>
          )}
        </div>

        {showToc && activeFile && (
          <aside className="toc-sidebar">
            <TableOfContents headings={headings} onClick={() => {}} />
          </aside>
        )}
      </div>

      {/* 状态栏 */}
      <div className="status-bar">
        <span className="status-left">
          {activeFile && (
            <>
              {activeFile.path || activeFile.name}
              {activeFile.isModified && ' • Modified'}
            </>
          )}
        </span>
        <span className="status-right">
          <button onClick={() => setShowFileSidebar(v => !v)} title="Toggle File Sidebar">
            {showFileSidebar ? '◀' : '▶'} Files
          </button>
          <button onClick={() => setShowToc(v => !v)} title="Toggle TOC">
            {showToc ? '◀' : '▶'} TOC
          </button>
        </span>
      </div>
    </div>
  );
}

export default App;
```

**Step 2: Update App.css**

```css
/* 添加到 App.css 末尾 */

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
}

.editor-empty button {
  padding: 8px 16px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.editor-empty button:hover {
  opacity: 0.9;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
  height: 28px;
  flex-shrink: 0;
}

.status-left {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-right {
  display: flex;
  gap: 12px;
}

.status-right button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
}

.status-right button:hover {
  color: var(--text-primary);
}
```

**Step 3: Commit**

```bash
cd monk
git add src/App.jsx src/App.css
git commit -m "feat: implement multi-file state management with tabs"
```

---

## Task 6: 测试完整流程

**Step 1: 运行开发模式测试**

```bash
cd monk
npm run dev
```

**Step 2: 手动测试**

1. 点击 "Open Folder" - 选择一个包含 md 文件的文件夹
2. 确认左侧显示文件树
3. 单击文件 - 在当前 tab 打开
4. 双击文件 - 新建 tab 打开
5. 点击 Tab 切换文件
6. 点击 Tab × 关闭文件
7. 编辑内容 - 确认 Tab 显示修改状态
8. 保存 - 确认修改状态消失
9. 切换左右侧边栏显示

**Step 3: 运行测试**

```bash
cd monk
npm test -- --run
```

Expected: All tests pass

**Step 4: Commit**

```bash
cd monk
git add -A
git commit -m "test: verify multi-file and folder features"
```

---

## 执行顺序

1. Task 1: 更新 Main Process
2. Task 2: 更新 Preload
3. Task 3: 创建 TabBar
4. Task 4: 创建 FileSidebar
5. Task 5: 重构 App.jsx
6. Task 6: 测试

**Plan complete and saved to `docs/plans/2026-02-28-multi-file-tabs-design.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
