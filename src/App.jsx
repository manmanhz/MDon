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
  const [showFileSidebar, setShowFileSidebar] = useState(false); // 默认隐藏，文件夹打开后显示
  const [showToc, setShowToc] = useState(true);
  const [theme, setTheme] = useState('light');

  // 文件夹是否已打开
  const isFolderOpened = folderTree.length > 0;

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

    // 如果不是强制新tab，先检查当前文件是否有未保存的修改
    if (!forceNewTab && activeFile && activeFile.isModified) {
      const confirm = window.confirm(`${activeFile.name} has unsaved changes. Replace anyway?`);
      if (!confirm) return;
    }

    // 检查是否已打开（防止重复打开）- 只有在非强制新tab时才检查
    const existing = files.find(f => f.path === filePath);
    if (!forceNewTab && existing) {
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

      if (forceNewTab) {
        // Command+click：新开 tab（即使已打开）
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
      } else {
        // 单击：替换当前文件
        setFiles(prev => {
          // 如果当前文件是新建未保存的，移除它
          const newFiles = prev.filter(f => f.id !== activeFileId);
          return [...newFiles, newFile];
        });
        setActiveFileId(newFile.id);
      }
    }
  }, [files, activeFile, activeFileId]);

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
    if (activeFileId && activeFile) {
      // 只有当内容与原文件内容不同时，才标记为已修改
      if (newContent !== activeFile.content) {
        setFiles(prev => prev.map(f =>
          f.id === activeFileId ? { ...f, content: newContent, isModified: true } : f
        ));
      }
    }
  }, [activeFileId, activeFile]);

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
        {showFileSidebar && isFolderOpened && (
          <FileSidebar
            tree={folderTree}
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
          {isFolderOpened && (
            <button onClick={() => setShowFileSidebar(v => !v)} title="Toggle File Sidebar">
              {showFileSidebar ? '◀' : '▶'} Files
            </button>
          )}
          <button onClick={() => setShowToc(v => !v)} title="Toggle TOC">
            {showToc ? '◀' : '▶'} TOC
          </button>
        </span>
      </div>
    </div>
  );
}

export default App;
