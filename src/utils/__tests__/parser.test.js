import { parseMarkdown } from '../parser';
import { describe, it, expect } from 'vitest';

describe('parseMarkdown', () => {
  it('should parse heading 1', () => {
    const input = '# Hello World';
    const output = parseMarkdown(input);
    expect(output).toContain('<h1>');
    expect(output).toContain('Hello World');
  });

  it('should parse heading 2', () => {
    const input = '## Subtitle';
    const output = parseMarkdown(input);
    expect(output).toContain('<h2>');
    expect(output).toContain('Subtitle');
  });

  it('should parse paragraph', () => {
    const input = 'This is a paragraph';
    const output = parseMarkdown(input);
    expect(output).toContain('<p>');
    expect(output).toContain('This is a paragraph');
  });

  it('should parse bold text', () => {
    const input = '**bold text**';
    const output = parseMarkdown(input);
    expect(output).toContain('<strong>');
    expect(output).toContain('bold text');
  });

  it('should parse italic text', () => {
    const input = '*italic text*';
    const output = parseMarkdown(input);
    expect(output).toContain('<em>');
    expect(output).toContain('italic text');
  });

  it('should parse code block', () => {
    const input = '```js\nconst x = 1;\n```';
    const output = parseMarkdown(input);
    expect(output).toContain('<pre>');
    expect(output).toContain('<code');
  });

  it('should parse inline code', () => {
    const input = 'Use `const` variable';
    const output = parseMarkdown(input);
    expect(output).toContain('<code>');
  });

  it('should parse link', () => {
    const input = '[Google](https://google.com)';
    const output = parseMarkdown(input);
    expect(output).toContain('<a href="https://google.com"');
    expect(output).toContain('Google');
  });

  it('should parse unordered list', () => {
    const input = '- item 1\n- item 2';
    const output = parseMarkdown(input);
    expect(output).toContain('<ul>');
    expect(output).toContain('<li>');
  });

  it('should parse ordered list', () => {
    const input = '1. first\n2. second';
    const output = parseMarkdown(input);
    expect(output).toContain('<ol>');
    expect(output).toContain('<li>');
  });

  it('should parse blockquote', () => {
    const input = '> This is a quote';
    const output = parseMarkdown(input);
    expect(output).toContain('<blockquote>');
  });

  it('should parse horizontal rule', () => {
    const input = '---';
    const output = parseMarkdown(input);
    expect(output).toContain('<hr');
  });

  it('should handle empty string', () => {
    const input = '';
    const output = parseMarkdown(input);
    expect(output).toBe('');
  });

  it('should handle multiple elements', () => {
    const input = '# Title\n\nParagraph with **bold** and *italic*.\n\n- list item';
    const output = parseMarkdown(input);
    expect(output).toContain('<h1>');
    expect(output).toContain('<p>');
    expect(output).toContain('<ul>');
  });
});
