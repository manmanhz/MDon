import React from 'react';

function Preview({ html }) {
  return (
    <div
      className="preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default Preview;
