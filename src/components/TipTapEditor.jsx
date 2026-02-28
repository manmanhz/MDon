import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@tiptap/extension-emoji';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { parseMarkdown } from '../utils/parser';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function TipTapEditor({ content, onChange, onExport, theme = 'light' }) {
  const [isInitializing, setIsInitializing] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Emoji,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // Only trigger onChange if not initializing
      if (!isInitializing) {
        const html = editor.getHTML();
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor theme-${theme}`,
      },
    },
  });

  // Update content when external content changes
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();

      // Check if content looks like markdown
      const isMarkdown = content.trim().startsWith('#') ||
                         content.includes('**') ||
                         content.includes('```') ||
                         content.includes('$') ||
                         (!content.includes('<') && !content.includes('>'));

      let newContent = content;
      if (isMarkdown) {
        // Convert markdown to HTML first
        newContent = parseMarkdown(content);
      }

      if (newContent !== currentHtml) {
        editor.commands.setContent(newContent);
      }

      // Mark initialization as complete after first content load
      setIsInitializing(false);
    }
  }, [content, editor]);

  return (
    <div className="tiptap-container">
      <EditorContent editor={editor} />
    </div>
  );
}

export default TipTapEditor;
