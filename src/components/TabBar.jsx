import React from 'react';
import './TabBar.css';

function TabBar({ files, activeFileId, onSelect, onClose }) {
  if (files.length === 0) {
    return <div className="tab-bar tab-bar-empty">No files open</div>;
  }

  return (
    <div className="tab-bar">
      {files.map(file => (
        <div
          key={file.id}
          className={`tab ${file.id === activeFileId ? 'tab-active' : ''} ${file.isModified ? 'tab-modified' : ''}`}
          onClick={() => onSelect(file.id)}
        >
          <span className="tab-name">
            {file.isModified && <span className="tab-dot">●</span>}
            {file.name}
          </span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(file.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default TabBar;
