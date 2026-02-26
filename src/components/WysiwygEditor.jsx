import React, { useRef, useEffect, useCallback } from 'react';
import { parseMarkdown } from '../utils/parser';

function WysiwygEditor({ content, onChange }) {
  const editorRef = useRef(null);
  const lastContentRef = useRef(content);

  // Initialize or update content only when external content changes
  useEffect(() => {
    if (!editorRef.current) return;

    const currentEditorText = editorRef.current.innerText || '';
    const newContent = content;

    // Only update if content actually changed externally
    if (newContent !== lastContentRef.current && newContent !== currentEditorText) {
      const html = parseMarkdown(newContent);
      editorRef.current.innerHTML = html;
      lastContentRef.current = newContent;
    }
  }, [content]);

  const handleInput = useCallback((e) => {
    // Pass the text content - no re-rendering during typing
    onChange(e.target.innerText);
    lastContentRef.current = e.target.innerText;
  }, [onChange]);

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
