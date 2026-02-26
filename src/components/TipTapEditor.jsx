import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@tiptap/extension-emoji';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

function TipTapEditor({ content, onChange, onExport }) {
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
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Update content when external content changes
  useEffect(() => {
    if (editor) {
      const currentHtml = editor.getHTML();
      if (content !== currentHtml) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addTaskList = () => {
    editor?.chain().focus().toggleTaskList().run();
  };

  return (
    <div className="tiptap-container">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'active' : ''}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'active' : ''}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? 'active' : ''}
          title="Ordered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={editor?.isActive('blockquote') ? 'active' : ''}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => {
            const emoji = prompt('Enter emoji:');
            if (emoji) {
              editor?.chain().focus().insertContent(emoji).run();
            }
          }}
          title="Insert Emoji"
        >
          😀
        </button>
        <button
          type="button"
          onClick={addImage}
          title="Insert Image"
        >
          🖼
        </button>
        <button
          type="button"
          onClick={addTable}
          title="Insert Table"
        >
          ⊞
        </button>
        <button
          type="button"
          onClick={addTaskList}
          className={editor?.isActive('taskList') ? 'active' : ''}
          title="Task List"
        >
          ☐
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => onExport && onExport('html')}
          title="Export HTML"
        >
          HTML
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default TipTapEditor;
