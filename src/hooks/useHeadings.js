import { useMemo } from 'react';

export function useHeadings(content) {
  return useMemo(() => {
    if (!content) return [];

    const headings = [];
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

    return headings;
  }, [content]);
}
