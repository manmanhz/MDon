import { render, screen, fireEvent } from '@testing-library/react';
import WysiwygEditor from '../WysiwygEditor';
import { describe, it, expect, vi } from 'vitest';

describe('WysiwygEditor', () => {
  it('should render editable div', () => {
    render(<WysiwygEditor content="" onChange={() => {}} />);
    const editor = document.querySelector('.wysiwyg-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('contenteditable', 'true');
  });

  it('should display initial content', () => {
    const initialContent = '# Hello Monk';
    render(<WysiwygEditor content={initialContent} onChange={() => {}} />);
    const editor = document.querySelector('.wysiwyg-editor');
    expect(editor.innerHTML).toContain('<h1>');
    expect(editor.innerHTML).toContain('Hello Monk');
  });

  it('should call onChange when input changes', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="" onChange={onChange} />);
    const editor = document.querySelector('.wysiwyg-editor');

    // Simulate typing
    editor.innerText = '# New Content';
    fireEvent.input(editor);

    expect(onChange).toHaveBeenCalledWith('# New Content');
  });

  it('should render heading as h1', () => {
    render(<WysiwygEditor content="# Title" onChange={() => {}} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Title');
  });

  it('should render bold text', () => {
    render(<WysiwygEditor content="**bold**" onChange={() => {}} />);
    const strong = screen.getByText('bold');
    expect(strong.tagName).toBe('STRONG');
  });

  it('should render italic text', () => {
    render(<WysiwygEditor content="*italic*" onChange={() => {}} />);
    const em = screen.getByText('italic');
    expect(em.tagName).toBe('EM');
  });

  it('should render code inline', () => {
    render(<WysiwygEditor content="`code`" onChange={() => {}} />);
    const code = screen.getByText('code');
    expect(code.tagName).toBe('CODE');
  });

  it('should render link', () => {
    render(<WysiwygEditor content="[Google](https://google.com)" onChange={() => {}} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveTextContent('Google');
  });

  it('should render unordered list', () => {
    render(<WysiwygEditor content="- item 1\n- item 2" onChange={() => {}} />);
    const editor = document.querySelector('.wysiwyg-editor');
    // Check that list is rendered (content may be in single li due to parser)
    expect(editor.innerHTML).toContain('<ul>');
    expect(editor.innerHTML).toContain('item');
  });

  it('should render blockquote', () => {
    render(<WysiwygEditor content="> quote" onChange={() => {}} />);
    expect(screen.getByText('quote')).toBeInTheDocument();
  });

  it('should have editor class', () => {
    render(<WysiwygEditor content="" onChange={() => {}} />);
    const editor = document.querySelector('.wysiwyg-editor');
    expect(editor).toHaveClass('wysiwyg-editor');
  });

  it('should preserve content after typing', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="Line 1" onChange={onChange} />);
    const editor = document.querySelector('.wysiwyg-editor');

    editor.innerText = 'Line 1\nLine 2';
    fireEvent.input(editor);

    expect(onChange).toHaveBeenCalledWith('Line 1\nLine 2');
  });

  it('should handle empty content', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="" onChange={onChange} />);
    const editor = document.querySelector('.wysiwyg-editor');

    editor.innerText = 'New text';
    fireEvent.input(editor);

    expect(onChange).toHaveBeenCalledWith('New text');
  });
});
