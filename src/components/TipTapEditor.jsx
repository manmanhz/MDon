import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Get markdown-like content (TipTap stores as HTML, convert to text for saving)
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Update content when external content changes
  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="tiptap-container">
      <EditorContent editor={editor} />
    </div>
  );
}

export default TipTapEditor;
