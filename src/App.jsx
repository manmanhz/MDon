import React, { useState } from 'react';
import Editor from './components/Editor';
import './App.css';

function App() {
  const [content, setContent] = useState('# Hello Monk\n\nStart writing...');

  return (
    <div className="app">
      <Editor content={content} onChange={setContent} />
    </div>
  );
}

export default App;
