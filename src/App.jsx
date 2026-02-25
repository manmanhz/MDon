import React, { useState } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { parseMarkdown } from './utils/parser';
import './App.css';

function App() {
  const [content, setContent] = useState('# Hello Monk\n\nStart writing...');
  const html = parseMarkdown(content);

  return (
    <div className="app">
      <Editor content={content} onChange={setContent} />
      <Preview html={html} />
    </div>
  );
}

export default App;
