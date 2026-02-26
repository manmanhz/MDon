import { useMemo } from 'react';

export function useHeadings(content) {
  return useMemo(() => {
    if (!content) return [];

    const headings = [];

    // Check if content looks like HTML (TipTap stores as HTML)
    if (content.includes('<') && content.includes('>')) {
      // Parse as HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

      headingElements.forEach((el) => {
        const level = parseInt(el.tagName.charAt(1), 10);
        headings.push({
          level,
          text: el.textContent,
        });
      });
    } else {
      // Parse as Markdown
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          headings.push({
            level: match[1].length,
            text: match[2].trim(),
          });
        }
      }
    }

    return headings;
  }, [content]);
}
