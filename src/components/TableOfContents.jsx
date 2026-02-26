import React from 'react';

function TableOfContents({ headings = [], onClick }) {
  return (
    <div className="toc">
      {headings.length > 0 ? (
        <ul>
          {headings.map((heading, index) => (
            <li
              key={index}
              className={`level-${heading.level}`}
              onClick={() => onClick && onClick(index)}
            >
              {heading.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="toc-empty">No headings</p>
      )}
    </div>
  );
}

export default TableOfContents;
