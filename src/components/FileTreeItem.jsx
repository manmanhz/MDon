import React, { useState } from 'react';

function FileTreeItem({ item, level = 0, onFileClick, onFileDoubleClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (item.type === 'folder') {
    return (
      <div className="file-tree-item">
        <div
          className="file-tree-folder"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="file-tree-icon">{isExpanded ? '📂' : '📁'}</span>
          <span className="file-tree-name">{item.name}</span>
        </div>
        {isExpanded && item.children && (
          <div className="file-tree-children">
            {item.children.map(child => (
              <FileTreeItem
                key={child.path}
                item={child}
                level={level + 1}
                onFileClick={onFileClick}
                onFileDoubleClick={onFileDoubleClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 使用 onMouseDown 而不是 onClick，因为 onClick 可能在 metaKey 检查前触发
  const handleMouseDown = (e) => {
    // Command+click (Mac) or Ctrl+click (Windows) opens in new tab
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      onFileDoubleClick(item.path);
    } else {
      onFileClick(item.path);
    }
  };

  return (
    <div
      className="file-tree-file"
      style={{ paddingLeft: `${level * 16 + 8}px` }}
      onMouseDown={handleMouseDown}
    >
      <span className="file-tree-icon">📄</span>
      <span className="file-tree-name">{item.name}</span>
    </div>
  );
}

export default FileTreeItem;
