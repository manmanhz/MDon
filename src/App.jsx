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

  const handleExport = useCallback(async (format) => {
    if (window.electronAPI) {
      let exportContent = content;
      let filePath = currentFilePath;

      if (format === 'html') {
        // Export as HTML file
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exported Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dfe2e5; padding: 8px; text-align: left; }
    th { background: #f6f8fa; }
  </style>
</head>
<body>
${content}
</body>
</html>`;
        exportContent = htmlContent;
      }

      const result = await window.electronAPI.saveFile(null, exportContent);
      if (result.success) {
        console.log('Exported to:', result.filePath);
      }
    }
  }, [content, currentFilePath]);

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
      <TipTapEditor content={content} onChange={setContent} onExport={handleExport} />
    </div>
  );
}

export default App;
