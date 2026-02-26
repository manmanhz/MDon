import React, { useRef, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

function CodeMirrorEditor({ content, onChange }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          markdown({ codeLanguages: languages }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px',
            },
            '.cm-scroller': {
              fontFamily: "'SF Mono', Monaco, 'Courier New', monospace",
              lineHeight: '1.6',
            },
            '.cm-content': {
              padding: '40px 60px',
            },
          }),
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // Update content when external content changes
  useEffect(() => {
    if (viewRef.current) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== content) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
        });
      }
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className="codemirror-editor"
      style={{
        height: '100vh',
        overflow: 'hidden',
      }}
    />
  );
}

export default CodeMirrorEditor;
