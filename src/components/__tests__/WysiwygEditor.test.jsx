import { render, screen, fireEvent } from '@testing-library/react';
import WysiwygEditor from '../WysiwygEditor';
import { describe, it, expect, vi } from 'vitest';

describe('WysiwygEditor', () => {
  it('should render container with textarea', () => {
    render(<WysiwygEditor content="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('spellcheck', 'false');
  });

  it('should display initial content in textarea', () => {
    const content = '# Hello Monk';
    render(<WysiwygEditor content={content} onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe(content);
  });

  it('should call onChange when input changes', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: '# New Content' } });

    expect(onChange).toHaveBeenCalledWith('# New Content');
  });

  it('should render preview layer', () => {
    render(<WysiwygEditor content="# Title" onChange={() => {}} />);
    const preview = document.querySelector('.wysiwyg-preview');
    expect(preview).toBeInTheDocument();
  });

  it('should have container class', () => {
    render(<WysiwygEditor content="" onChange={() => {}} />);
    const container = document.querySelector('.wysiwyg-container');
    expect(container).toBeInTheDocument();
  });

  it('should preserve content after typing', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="Line 1" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2' } });

    // Check that onChange was called with new content
    expect(onChange).toHaveBeenCalledWith('Line 1\nLine 2');
  });

  it('should handle empty content', () => {
    const onChange = vi.fn();
    render(<WysiwygEditor content="" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'New text' } });

    expect(onChange).toHaveBeenCalledWith('New text');
  });
});
