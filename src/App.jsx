import React, { useState, useMemo } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { parseMarkdown } from './utils/parser';
import { useDebounce } from './hooks/useDebounce';
import './App.css';

function App() {
  const [content, setContent] = useState('# Hello Monk\n\nStart writing...');
  const debouncedContent = useDebounce(content, 150);
  const html = useMemo(() => parseMarkdown(debouncedContent), [debouncedContent]);

  return (
    <div className="app">
      <Editor content={content} onChange={setContent} />
      <Preview html={html} />
    </div>
  );
}

export default App;
