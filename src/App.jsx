import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { parseMarkdown } from './utils/parser';
import { useDebounce } from './hooks/useDebounce';
import './App.css';

function App() {
  const [content, setContent] = useState('# Hello Monk\n\nStart writing...');
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const debouncedContent = useDebounce(content, 150);
  const html = useMemo(() => parseMarkdown(debouncedContent), [debouncedContent]);

  const handleNew = useCallback(() => {
    setContent('# New Document\n\nStart writing...');
    setCurrentFilePath(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.saveFile(currentFilePath, content);
      if (result.success) {
        setCurrentFilePath(result.filePath);
      }
    }
  }, [currentFilePath, content]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onNewFile(() => handleNew());
      window.electronAPI.onFileOpened(({ filePath, content: fileContent }) => {
        setCurrentFilePath(filePath);
        setContent(fileContent);
      });
      window.electronAPI.onSaveFile(() => handleSave());
      window.electronAPI.onSaveFileAs(() => handleSave());
    }
  }, [handleNew, handleSave]);

  return (
    <div className="app">
      <Editor content={content} onChange={setContent} />
      <Preview html={html} />
    </div>
  );
}

export default App;
