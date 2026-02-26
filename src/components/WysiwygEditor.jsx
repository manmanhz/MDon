import React, { useRef, useEffect, useCallback } from 'react';
import { parseMarkdown } from '../utils/parser';

function WysiwygEditor({ content, onChange }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerText) {
      editorRef.current.innerHTML = parseMarkdown(content);
    }
  }, []); // Only on mount

  // Update when external content changes (e.g., file opened)
  useEffect(() => {
    if (!editorRef.current) return;

    const currentText = editorRef.current.innerText || '';
    // Only update if content changed externally and we're not currently editing
    if (content !== currentText && !isInternalChange.current) {
      editorRef.current.innerHTML = parseMarkdown(content);
    }
  }, [content]);

  const handleInput = useCallback((e) => {
    isInternalChange.current = true;
    onChange(e.target.innerText);
    // Small delay to allow onChange to propagate, then re-render
    setTimeout(() => {
      isInternalChange.current = false;
    }, 0);
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
