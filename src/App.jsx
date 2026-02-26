import React, { useState, useEffect, useCallback } from 'react';
import TipTapEditor from './components/TipTapEditor';
import TableOfContents from './components/TableOfContents';
import { useHeadings } from './hooks/useHeadings';
import './App.css';

function App() {
  const [content, setContent] = useState('# Hello Monk\n\nStart writing...');
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [showToc, setShowToc] = useState(true);

  const headings = useHeadings(content);

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

  const handleTocClick = (index) => {
    // TODO: scroll to heading in editor
    console.log('TOC clicked:', index);
  };

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
      {showToc && (
        <aside className="toc-sidebar">
          <TableOfContents headings={headings} onClick={handleTocClick} />
        </aside>
      )}
      <TipTapEditor content={content} onChange={setContent} />
    </div>
  );
}

export default App;
