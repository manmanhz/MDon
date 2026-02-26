import { render, screen, fireEvent } from '@testing-library/react';
import WysiwygEditor from '../WysiwygEditor';
import { describe, it, expect, vi } from 'vitest';

describe('WysiwygEditor', () => {
  it('should render editable div', () => {
    render(<WysiwygEditor content="" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('contenteditable', 'true');
  });

  it('should call onChange when input changes', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    fireEvent.input(editor, { target: { innerText: '# New Content' } });

    expect(onChange).toHaveBeenCalledWith('# New Content');
  });

  it('should have editor class', () => {
    render(<WysiwygEditor content="" onChange={() => {}} />);
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveClass('wysiwyg-editor');
  });

  it('should preserve content after typing and not revert', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="# Hello" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    // Type more content - set innerText directly (jsdom limitation)
    editor.innerText = '# Hello World';
    fireEvent.input(editor, { target: { innerText: '# Hello World' } });

    // Content should be preserved
    expect(editor.innerText).toBe('# Hello World');
    expect(onChange).toHaveBeenCalledWith('# Hello World');
  });

  it('should preserve content after pressing Enter', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="Line 1" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    // Simulate pressing Enter by adding newline
    editor.innerText = 'Line 1\nLine 2';
    fireEvent.input(editor, { target: { innerText: 'Line 1\nLine 2' } });

    // Content should be preserved with newline
    expect(editor.innerText).toBe('Line 1\nLine 2');
    expect(onChange).toHaveBeenCalledWith('Line 1\nLine 2');
  });

  it('should not revert content when typing continuously', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="# Title" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    // First input
    editor.innerText = '# Title\n';
    fireEvent.input(editor, { target: { innerText: '# Title\n' } });

    // Second input - add more content
    editor.innerText = '# Title\nParagraph';
    fireEvent.input(editor, { target: { innerText: '# Title\nParagraph' } });

    expect(editor.innerText).toBe('# Title\nParagraph');
  });

  it('should handle empty content', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="" onChange={onChange} />);
    const editor = screen.getByRole('textbox');

    editor.innerText = 'New text';
    fireEvent.input(editor, { target: { innerText: 'New text' } });

    expect(onChange).toHaveBeenCalledWith('New text');
  });
});
