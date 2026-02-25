import React, { useRef } from 'react';

function Editor({ content, onChange }) {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      className="editor"
      value={content}
      onChange={handleChange}
      placeholder="Start writing Markdown..."
      spellCheck={false}
      role="textbox"
    />
  );
}

export default Editor;
