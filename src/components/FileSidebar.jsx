import React from 'react';
import FileTreeItem from './FileTreeItem';
import './FileSidebar.css';

function FileSidebar({ tree, folderPath, onFileClick, onFileDoubleClick, onOpenFolder }) {
  return (
    <div className="file-sidebar">
      <div className="file-sidebar-header">
        <span className="file-sidebar-title">Files</span>
        <button className="file-sidebar-open-btn" onClick={onOpenFolder} title="Open Folder">
          📂
        </button>
      </div>
      <div className="file-sidebar-content">
        {tree && tree.length > 0 ? (
          tree.map(item => (
            <FileTreeItem
              key={item.path}
              item={item}
              onFileClick={onFileClick}
              onFileDoubleClick={onFileDoubleClick}
            />
          ))
        ) : (
          <div className="file-sidebar-empty">
            <p>No folder opened</p>
            <button onClick={onOpenFolder}>Open Folder</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileSidebar;
