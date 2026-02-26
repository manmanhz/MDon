import React, { useState, useEffect, useCallback } from 'react';
import WysiwygEditor from './components/WysiwygEditor';
import './App.css';

function App() {
  const [content, setContent] = useState('# Hello Monk\n\nStart writing...');
  const [currentFilePath, setCurrentFilePath] = useState(null);

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
      <WysiwygEditor content={content} onChange={setContent} />
    </div>
  );
}

export default App;
