import React, { useRef, useEffect } from 'react';
import { parseMarkdown } from '../utils/parser';

function WysiwygEditor({ content, onChange }) {
  const editorRef = useRef(null);
  const isRendering = useRef(false);

  // Initial render
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = parseMarkdown(content);
    }
  }, []);

  const handleInput = (e) => {
    const text = e.target.innerText;
    onChange(text);
  };

  // Re-render markdown periodically or on blur
  const handleBlur = () => {
    if (editorRef.current) {
      isRendering.current = true;
      editorRef.current.innerHTML = parseMarkdown(editorRef.current.innerText);
      isRendering.current = false;
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter key - add newline without re-rendering immediately
    if (e.key === 'Enter') {
      // Let the default behavior happen (add newline)
      // Don't re-render while typing
    }
  };

  return (
    <div
      ref={editorRef}
      className="wysiwyg-editor"
      contentEditable={true}
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
      spellCheck={false}
    />
  );
}

export default WysiwygEditor;
