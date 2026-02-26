import React, { useRef, useEffect, useState } from 'react';
import { parseMarkdown } from '../utils/parser';

function WysiwygEditor({ content, onChange }) {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const [html, setHtml] = useState('');

  // Parse markdown to HTML
  useEffect(() => {
    setHtml(parseMarkdown(content));
  }, [content]);

  // Sync scroll between textarea and preview
  const handleScroll = () => {
    if (containerRef.current) {
      const preview = containerRef.current.querySelector('.wysiwyg-preview');
      if (preview && textareaRef.current) {
        preview.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };

  // Handle textarea input
  const handleInput = (e) => {
    onChange(e.target.value);
  };

  return (
    <div ref={containerRef} className="wysiwyg-container">
      {/* Rendered preview layer */}
      <div
        className="wysiwyg-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* Transparent editing layer */}
      <textarea
        ref={textareaRef}
        className="wysiwyg-textarea"
        value={content}
        onChange={handleInput}
        onScroll={handleScroll}
        spellCheck={false}
      />
    </div>
  );
}

export default WysiwygEditor;
