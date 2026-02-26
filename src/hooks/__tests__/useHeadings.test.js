import { renderHook } from '@testing-library/react';
import { useHeadings } from '../useHeadings';
import { describe, it, expect } from 'vitest';

describe('useHeadings', () => {
  it('should extract h1 headings', () => {
    const content = '# Title 1\n\n# Title 2';
    const { result } = renderHook(() => useHeadings(content));

    expect(result.current).toEqual([
      { level: 1, text: 'Title 1' },
      { level: 1, text: 'Title 2' },
    ]);
  });

  it('should extract h2 headings', () => {
    const content = '## Subtitle';
    const { result } = renderHook(() => useHeadings(content));

    expect(result.current).toEqual([
      { level: 2, text: 'Subtitle' },
    ]);
  });

  it('should extract mixed heading levels', () => {
    const content = '# H1\n## H2\n### H3';
    const { result } = renderHook(() => useHeadings(content));

    expect(result.current).toEqual([
      { level: 1, text: 'H1' },
      { level: 2, text: 'H2' },
      { level: 3, text: 'H3' },
    ]);
  });

  it('should return empty array for no headings', () => {
    const content = 'Just some text without headings';
    const { result } = renderHook(() => useHeadings(content));

    expect(result.current).toEqual([]);
  });

  it('should handle empty content', () => {
    const { result } = renderHook(() => useHeadings(''));

    expect(result.current).toEqual([]);
  });
});
