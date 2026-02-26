import React, { useRef, useEffect } from 'react';
import { parseMarkdown } from '../utils/parser';

function WysiwygEditor({ content, onChange }) {
  const editorRef = useRef(null);

  const handleInput = (e) => {
    // Pass the plain text content back
    onChange(e.target.innerText);
  };

  // Parse markdown to HTML and set as innerHTML
  useEffect(() => {
    if (editorRef.current) {
      const html = parseMarkdown(content);
      editorRef.current.innerHTML = html;
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className="wysiwyg-editor"
      contentEditable={true}
      onInput={handleInput}
      suppressContentEditableWarning={true}
      role="textbox"
      spellCheck={false}
    />
  );
}

export default WysiwygEditor;
